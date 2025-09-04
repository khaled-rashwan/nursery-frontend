// Simulating Firebase admin for testing purposes
const admin = {
  firestore: () => ({
    FieldValue: {
      serverTimestamp: () => '[SERVER_TIMESTAMP]'
    }
  })
};

async function testPaymentIssue() {
  console.log('🧪 Testing Payment Recording Issue...\n');

  try {
    // Test 1: Create a payment with paidAmount > 0
    console.log('📝 Test 1: Creating payment with paidAmount = 700');
    
    const testPayment = {
      studentId: 'TEST_STUDENT_123',
      academicYear: '2025-2026',
      totalFees: 1000,
      paidAmount: 700,
      paymentRecords: []
    };

    const paymentId = `${testPayment.academicYear}_${testPayment.studentId}`;
    
    // Simulate the current logic from createPayment endpoint
    const studentData = { parentUID: 'TEST_PARENT_123' }; // Mock student data
    const remainingBalance = testPayment.totalFees - testPayment.paidAmount;
    
    const paymentData = {
      studentId: testPayment.studentId,
      parentUID: studentData.parentUID,
      academicYear: testPayment.academicYear,
      totalFees: testPayment.totalFees,
      paidAmount: testPayment.paidAmount,
      remainingBalance,
      paymentRecords: testPayment.paymentRecords, // Empty array!
      createdAt: '[SERVER_TIMESTAMP]',
      updatedAt: '[SERVER_TIMESTAMP]',
      createdBy: 'TEST_ADMIN_123'
    };

    console.log('💾 Payment data to be saved:', {
      ...paymentData,
      createdAt: '[SERVER_TIMESTAMP]',
      updatedAt: '[SERVER_TIMESTAMP]'
    });

    // The issue: paymentRecords is empty but paidAmount is 700
    console.log('\n❌ ISSUE IDENTIFIED:');
    console.log(`   - paidAmount: ${paymentData.paidAmount}`);
    console.log(`   - paymentRecords: ${JSON.stringify(paymentData.paymentRecords)}`);
    console.log('   - Inconsistency: We have a paid amount but no payment records!\n');

    // Test 2: Try to add a payment record
    console.log('📝 Test 2: Trying to add payment record with amount = 99.98');
    
    const newPaymentRecord = {
      amount: 99.98,
      date: '2025-09-04',
      method: 'cash',
      notes: ''
    };

    console.log('💾 New payment record:', newPaymentRecord);

    // The issue with addPaymentRecord logic
    const existingPaidAmount = paymentData.paidAmount; // 700
    const newPaidAmount = existingPaidAmount + newPaymentRecord.amount; // 700 + 99.98 = 799.98
    const newRemainingBalance = paymentData.totalFees - newPaidAmount; // 1000 - 799.98 = 200.02

    console.log('\n📊 Results:');
    console.log(`   - Previous paidAmount: ${existingPaidAmount}`);
    console.log(`   - New payment amount: ${newPaymentRecord.amount}`);
    console.log(`   - Calculated new paidAmount: ${newPaidAmount}`);
    console.log(`   - Calculated new remainingBalance: ${newRemainingBalance}`);

    console.log('\n❌ ISSUE WITH CURRENT LOGIC:');
    console.log('   - The initial 700 paid amount has no corresponding payment record');
    console.log('   - We are double-counting: 700 (no record) + 99.98 (with record) = 799.98');
    console.log('   - The correct logic should be: sum of all payment records = total paid amount\n');

    // Test 3: Demonstrate correct logic
    console.log('📝 Test 3: Demonstrating correct logic');
    
    console.log('\n✅ CORRECT APPROACH:');
    console.log('   1. When creating payment with paidAmount > 0, create a payment record for that amount');
    console.log('   2. Always calculate paidAmount as sum of all payment records');
    console.log('   3. Never allow manual paidAmount that doesn\'t match payment records sum');

    // Corrected initial payment
    const correctedInitialPaymentRecord = {
      id: 'INITIAL_PAYMENT_001',
      amount: 700,
      date: new Date(), // Creation date
      method: 'cash',
      notes: 'Initial payment',
      recordedBy: 'TEST_ADMIN_123',
      recordedAt: new Date()
    };

    const correctedPaymentRecords = [correctedInitialPaymentRecord];
    const correctedPaidAmount = correctedPaymentRecords.reduce((sum, record) => sum + record.amount, 0);
    const correctedRemainingBalance = testPayment.totalFees - correctedPaidAmount;

    console.log('\n🔧 CORRECTED INITIAL PAYMENT:');
    console.log(`   - paymentRecords: [${correctedPaymentRecords.map(r => `{amount: ${r.amount}}`).join(', ')}]`);
    console.log(`   - paidAmount (calculated): ${correctedPaidAmount}`);
    console.log(`   - remainingBalance: ${correctedRemainingBalance}`);

    // Adding second payment to corrected data
    const secondPaymentRecord = {
      id: 'PAYMENT_002',
      amount: 99.98,
      date: new Date('2025-09-04'),
      method: 'cash',
      notes: '',
      recordedBy: 'TEST_ADMIN_123',
      recordedAt: new Date()
    };

    const finalPaymentRecords = [...correctedPaymentRecords, secondPaymentRecord];
    const finalPaidAmount = finalPaymentRecords.reduce((sum, record) => sum + record.amount, 0);
    const finalRemainingBalance = testPayment.totalFees - finalPaidAmount;

    console.log('\n🔧 AFTER ADDING SECOND PAYMENT:');
    console.log(`   - paymentRecords: [${finalPaymentRecords.map(r => `{amount: ${r.amount}}`).join(', ')}]`);
    console.log(`   - paidAmount (calculated): ${finalPaidAmount}`);
    console.log(`   - remainingBalance: ${finalRemainingBalance}`);

    console.log('\n✅ SOLUTION SUMMARY:');
    console.log('   1. Modify createPayment to auto-create payment record when paidAmount > 0');
    console.log('   2. Always calculate paidAmount from payment records sum');
    console.log('   3. Remove manual paidAmount from frontend forms');
    console.log('   4. Ensure data consistency between paidAmount and paymentRecords');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPaymentIssue();