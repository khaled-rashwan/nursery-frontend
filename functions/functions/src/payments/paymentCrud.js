const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');

const app = express();
const db = admin.firestore();

// Global CORS middleware
app.use((req, res, next) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) {
    return;
  }
  next();
});

// Helper function to verify admin role
const verifyAdminRole = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return { success: false, error: 'Authorization token required' };
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const customClaims = decodedToken.role;
    
    if (!['admin', 'superadmin'].includes(customClaims)) {
      return { success: false, error: 'Admin privileges required' };
    }

    return { success: true, decodedToken };
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Helper function to verify parent role and check access
const verifyParentAccess = async (req, res, studentId) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return { success: false, error: 'Authorization token required' };
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRole = decodedToken.role;
    
    if (userRole !== 'parent') {
      return { success: false, error: 'Parent privileges required' };
    }

    // Check if parent has access to this student
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return { success: false, error: 'Student not found' };
    }

    const studentData = studentDoc.data();
    if (studentData.parentUID !== decodedToken.uid) {
      return { success: false, error: 'Access denied - not your child' };
    }

    return { success: true, decodedToken };
  } catch (error) {
    console.error('Error verifying parent access:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

// Validation helper
const validatePaymentData = (data) => {
  const errors = [];
  
  if (!data.studentId || typeof data.studentId !== 'string') {
    errors.push('Valid studentId is required');
  }
  
  if (!data.academicYear || typeof data.academicYear !== 'string') {
    errors.push('Valid academicYear is required');
  }
  
  if (typeof data.totalFees !== 'number' || data.totalFees < 0) {
    errors.push('totalFees must be a non-negative number');
  }
  
  if (typeof data.paidAmount !== 'number' || data.paidAmount < 0) {
    errors.push('paidAmount must be a non-negative number');
  }
  
  if (data.paidAmount > data.totalFees) {
    errors.push('paidAmount cannot exceed totalFees');
  }
  
  return errors;
};

// Create or update payment record
app.post('/createPayment', async (req, res) => {
  try {
    const authResult = await verifyAdminRole(req, res);
    if (!authResult.success) {
      return res.status(403).json({ error: authResult.error });
    }

    const { studentId, academicYear, totalFees, paidAmount, paymentRecords = [] } = req.body;
    
    // Validate required fields
    const validationErrors = validatePaymentData({ studentId, academicYear, totalFees, paidAmount });
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }

    // Get student info to include parent UID
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = studentDoc.data();
    const remainingBalance = totalFees - paidAmount;
    
    const paymentData = {
      studentId,
      parentUID: studentData.parentUID,
      academicYear,
      totalFees,
      paidAmount,
      remainingBalance,
      paymentRecords: paymentRecords.map(record => ({
        id: record.id || admin.firestore().collection('_').doc().id,
        amount: record.amount,
        date: admin.firestore.Timestamp.fromDate(new Date(record.date)),
        method: record.method || 'cash',
        notes: record.notes || '',
        recordedBy: authResult.decodedToken.uid,
        recordedAt: admin.firestore.FieldValue.serverTimestamp()
      })),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.decodedToken.uid
    };

    const paymentId = `${academicYear}_${studentId}`;
    await db.collection('payments').doc(paymentId).set(paymentData);
    
    res.status(201).json({
      success: true,
      paymentId,
      data: paymentData
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment records
app.get('/getPayments', async (req, res) => {
  try {
    const { studentId, academicYear, parentUID } = req.query;
    
    // Check authorization
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRole = decodedToken.role;
    
    let query = db.collection('payments');
    
    // Role-based filtering
    if (['admin', 'superadmin'].includes(userRole)) {
      // Admins can see all payments, apply optional filters
      if (studentId) query = query.where('studentId', '==', studentId);
      if (academicYear) query = query.where('academicYear', '==', academicYear);
      if (parentUID) query = query.where('parentUID', '==', parentUID);
    } else if (userRole === 'parent') {
      // Parents can only see their own children's payments
      query = query.where('parentUID', '==', decodedToken.uid);
      if (studentId) {
        // Verify parent has access to this student
        const studentDoc = await db.collection('students').doc(studentId).get();
        if (!studentDoc.exists || studentDoc.data().parentUID !== decodedToken.uid) {
          return res.status(403).json({ error: 'Access denied' });
        }
        query = query.where('studentId', '==', studentId);
      }
      if (academicYear) query = query.where('academicYear', '==', academicYear);
    } else {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }
    
    const snapshot = await query.get();
    const payments = [];
    
    for (const doc of snapshot.docs) {
      const paymentData = doc.data();
      
      // Enrich with student information
      const studentDoc = await db.collection('students').doc(paymentData.studentId).get();
      const studentInfo = studentDoc.exists ? {
        name: studentDoc.data().name,
        nameEn: studentDoc.data().nameEn
      } : null;
      
      payments.push({
        id: doc.id,
        ...paymentData,
        studentInfo
      });
    }
    
    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment record
app.put('/updatePayment/:paymentId', async (req, res) => {
  try {
    const authResult = await verifyAdminRole(req, res);
    if (!authResult.success) {
      return res.status(403).json({ error: authResult.error });
    }

    const { paymentId } = req.params;
    const { totalFees, paidAmount, paymentRecords } = req.body;
    
    // Get existing payment
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const existingData = paymentDoc.data();
    
    // Validate updates
    if (typeof totalFees === 'number' && totalFees < 0) {
      return res.status(400).json({ error: 'totalFees must be non-negative' });
    }
    
    if (typeof paidAmount === 'number' && paidAmount < 0) {
      return res.status(400).json({ error: 'paidAmount must be non-negative' });
    }
    
    const newTotalFees = totalFees !== undefined ? totalFees : existingData.totalFees;
    const newPaidAmount = paidAmount !== undefined ? paidAmount : existingData.paidAmount;
    
    if (newPaidAmount > newTotalFees) {
      return res.status(400).json({ error: 'paidAmount cannot exceed totalFees' });
    }
    
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (totalFees !== undefined) updateData.totalFees = totalFees;
    if (paidAmount !== undefined) updateData.paidAmount = paidAmount;
    
    updateData.remainingBalance = newTotalFees - newPaidAmount;
    
    if (paymentRecords) {
      updateData.paymentRecords = paymentRecords.map(record => ({
        id: record.id || admin.firestore().collection('_').doc().id,
        amount: record.amount,
        date: admin.firestore.Timestamp.fromDate(new Date(record.date)),
        method: record.method || 'cash',
        notes: record.notes || '',
        recordedBy: record.recordedBy || authResult.decodedToken.uid,
        recordedAt: record.recordedAt || admin.firestore.FieldValue.serverTimestamp()
      }));
    }
    
    await db.collection('payments').doc(paymentId).update(updateData);
    
    res.json({
      success: true,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add payment record
app.post('/addPaymentRecord/:paymentId', async (req, res) => {
  try {
    const authResult = await verifyAdminRole(req, res);
    if (!authResult.success) {
      return res.status(403).json({ error: authResult.error });
    }

    const { paymentId } = req.params;
    const { amount, date, method = 'cash', notes = '' } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }
    
    if (!date) {
      return res.status(400).json({ error: 'Payment date is required' });
    }
    
    // Get existing payment
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const existingData = paymentDoc.data();
    const newPaymentRecord = {
      id: admin.firestore().collection('_').doc().id,
      amount,
      date: admin.firestore.Timestamp.fromDate(new Date(date)),
      method,
      notes,
      recordedBy: authResult.decodedToken.uid,
      recordedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const updatedPaymentRecords = [...(existingData.paymentRecords || []), newPaymentRecord];
    const newPaidAmount = existingData.paidAmount + amount;
    const newRemainingBalance = existingData.totalFees - newPaidAmount;
    
    await db.collection('payments').doc(paymentId).update({
      paymentRecords: updatedPaymentRecords,
      paidAmount: newPaidAmount,
      remainingBalance: newRemainingBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      message: 'Payment record added successfully',
      newRecord: newPaymentRecord
    });
  } catch (error) {
    console.error('Error adding payment record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment record
app.delete('/deletePayment/:paymentId', async (req, res) => {
  try {
    const authResult = await verifyAdminRole(req, res);
    if (!authResult.success) {
      return res.status(403).json({ error: authResult.error });
    }

    const { paymentId } = req.params;
    
    const paymentDoc = await db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    
    await db.collection('payments').doc(paymentId).delete();
    
    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment summary by parent
app.get('/getPaymentSummaryByParent', async (req, res) => {
  try {
    const authResult = await verifyAdminRole(req, res);
    if (!authResult.success) {
      return res.status(403).json({ error: authResult.error });
    }

    const { academicYear } = req.query;
    
    let query = db.collection('payments');
    if (academicYear) {
      query = query.where('academicYear', '==', academicYear);
    }
    
    const paymentsSnapshot = await query.get();
    const parentSummary = {};
    
    for (const doc of paymentsSnapshot.docs) {
      const paymentData = doc.data();
      const parentUID = paymentData.parentUID;
      
      if (!parentSummary[parentUID]) {
        // Get parent info
        const parentDoc = await admin.auth().getUser(parentUID);
        parentSummary[parentUID] = {
          parentInfo: {
            uid: parentUID,
            email: parentDoc.email,
            displayName: parentDoc.displayName || parentDoc.email
          },
          children: []
        };
      }
      
      // Get student info
      const studentDoc = await db.collection('students').doc(paymentData.studentId).get();
      const studentInfo = studentDoc.exists ? studentDoc.data() : null;
      
      parentSummary[parentUID].children.push({
        ...paymentData,
        studentInfo,
        paymentId: doc.id
      });
    }
    
    res.json({
      success: true,
      parentSummary: Object.values(parentSummary)
    });
  } catch (error) {
    console.error('Error getting payment summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the Express app wrapped as a Firebase Cloud Function
exports.managePayments = functions.https.onRequest(app);