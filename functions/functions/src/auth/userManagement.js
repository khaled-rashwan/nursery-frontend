const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { setCorsHeaders, handleCorsOptions } = require('../utils/cors');
const { authenticate, requireAdmin } = require('../utils/auth');
const { canEditUser, canDeleteUser, canCreateRole, canAssignRole } = require('../utils/permissions');

const db = admin.firestore();

/**
 * Helper function to handle teacher collection changes when user role changes
 */
const handleTeacherRoleChange = async (uid, oldRole, newRole) => {
  try {
    // If user became a teacher
    if (newRole === 'teacher' && oldRole !== 'teacher') {
      console.log(`Creating teacher record for newly assigned teacher: ${uid}`);
      
      // Check if teacher record already exists
      const teacherDoc = await db.collection('teachers').doc(uid).get();
      
      if (!teacherDoc.exists) {
        await db.collection('teachers').doc(uid).set({
          classes: [],
          assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: 'user_management'
        });
        console.log(`Teacher record created for user: ${uid}`);
      }
    }
    
    // If user is no longer a teacher
    if (oldRole === 'teacher' && newRole !== 'teacher') {
      console.log(`Archiving teacher record for user no longer a teacher: ${uid}`);
      
      const teacherDoc = await db.collection('teachers').doc(uid).get();
      
      if (teacherDoc.exists) {
        // Archive the record instead of deleting to preserve history
        await db.collection('teachers_archived').doc(uid).set({
          ...teacherDoc.data(),
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
          archivedReason: 'role_removed'
        });
        
        // Remove from active teachers collection
        await db.collection('teachers').doc(uid).delete();
        console.log(`Teacher record archived for user: ${uid}`);
      }
    }
  } catch (error) {
    console.error(`Error handling teacher role change for user ${uid}:`, error);
    // Don't throw to avoid failing the main operation
  }
};

// HTTPS function to list users
const listUsers = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  try {
    const maxResults = parseInt(req.query.maxResults) || 100;
    const pageToken = req.query.pageToken || undefined;
    const roleFilter = req.query.role || null;
    
    const listResult = await admin.auth().listUsers(maxResults, pageToken);
    
    let users = listResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
      customClaims: userRecord.customClaims || {},
      role: (userRecord.customClaims && userRecord.customClaims.role) || 'user',
    }));
    
    // Filter by role if specified
    if (roleFilter) {
      users = users.filter(user => user.role === roleFilter);
    }
    
    res.json({ users, nextPageToken: listResult.pageToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HTTPS function to edit users
const editUser = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  const editorRole = roleResult.role;

  try {
    const { uid, userData } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    // Get the target user's current role
    const targetUser = await admin.auth().getUser(uid);
    const targetRole = targetUser.customClaims?.role || 'user';

    // Apply permission matrix
    if (!canEditUser(editorRole, targetRole)) {
      return res.status(403).json({ 
        error: targetRole === 'superadmin' 
          ? 'Forbidden: Superadmin users cannot be edited'
          : 'Forbidden: Only superadmin can edit admin users'
      });
    }

    // Prepare update data
    const updateData = {};
    
    // Update basic profile fields if provided
    if (userData.email) updateData.email = userData.email;
    if (userData.displayName) updateData.displayName = userData.displayName;
    if (userData.phoneNumber) updateData.phoneNumber = userData.phoneNumber;
    if (userData.photoURL) updateData.photoURL = userData.photoURL;
    if (typeof userData.disabled === 'boolean') updateData.disabled = userData.disabled;
    if (typeof userData.emailVerified === 'boolean') updateData.emailVerified = userData.emailVerified;

    // Update the user
    await admin.auth().updateUser(uid, updateData);

    // Update custom claims if role is provided and editor has permission
    if (userData.role && userData.role !== targetRole) {
      if (!canAssignRole(editorRole, userData.role)) {
        return res.status(403).json({ 
          error: userData.role === 'superadmin'
            ? 'Forbidden: Cannot assign superadmin role'
            : 'Forbidden: Only superadmin can assign admin role'
        });
      }

      await admin.auth().setCustomUserClaims(uid, { role: userData.role });
      
      // Handle teacher collection creation/removal when role changes
      await handleTeacherRoleChange(uid, targetRole, userData.role);
    }

    // Return updated user data
    const updatedUser = await admin.auth().getUser(uid);
    const responseUser = {
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      phoneNumber: updatedUser.phoneNumber,
      photoURL: updatedUser.photoURL,
      disabled: updatedUser.disabled,
      emailVerified: updatedUser.emailVerified,
      createdAt: updatedUser.metadata.creationTime,
      lastSignIn: updatedUser.metadata.lastSignInTime,
      customClaims: updatedUser.customClaims || {},
    };

    res.json({ 
      message: 'User updated successfully',
      user: responseUser 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HTTPS function to create users
const createUser = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  const creatorRole = roleResult.role;

  try {
    const { userData } = req.body;
    if (!userData || !userData.email || !userData.password || !userData.role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Apply creation permission matrix
    if (!canCreateRole(creatorRole, userData.role)) {
      return res.status(403).json({ 
        error: userData.role === 'superadmin'
          ? 'Forbidden: Cannot create superadmin users'
          : 'Forbidden: Only superadmin can create admin users'
      });
    }

    // Prepare user creation data
    const createData = {
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName || userData.email.split('@')[0],
      emailVerified: false,
      disabled: false
    };

    // Add optional fields if provided
    if (userData.phoneNumber) createData.phoneNumber = userData.phoneNumber;
    if (userData.photoURL) createData.photoURL = userData.photoURL;

    // Create the user
    const userRecord = await admin.auth().createUser(createData);

    // Set custom claims for role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: userData.role });
    
    // If creating a teacher, also create teacher collection record
    if (userData.role === 'teacher') {
      await db.collection('teachers').doc(userRecord.uid).set({
        classes: [],
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'user_creation'
      });
      console.log(`Teacher record created for new user: ${userRecord.uid}`);
    }

    // Return created user data
    const responseUser = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
      customClaims: { role: userData.role },
    };

    res.json({ 
      message: 'User created successfully',
      user: responseUser 
    });

  } catch (error) {
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email address is already in use' });
    }
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email address format' });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak. Must be at least 6 characters' });
    }
    res.status(500).json({ error: error.message });
  }
});

// HTTPS function to delete users
const deleteUser = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (handleCorsOptions(req, res)) return;

  // Authentication and role check
  const authResult = await authenticate(req, res);
  if (authResult.error) {
    return res.status(authResult.error.status).json({ error: authResult.error.message });
  }

  const roleResult = requireAdmin(authResult.decodedToken);
  if (roleResult.error) {
    return res.status(roleResult.error.status).json({ error: roleResult.error.message });
  }

  const deleterRole = roleResult.role;

  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    // Prevent self-deletion
    if (uid === authResult.decodedToken.uid) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete your own account' });
    }

    // Get the target user's current role
    const targetUser = await admin.auth().getUser(uid);
    const targetRole = targetUser.customClaims?.role || 'user';

    // Apply deletion permission matrix
    if (!canDeleteUser(deleterRole, targetRole)) {
      return res.status(403).json({ 
        error: targetRole === 'superadmin'
          ? 'Forbidden: Superadmin users cannot be deleted'
          : 'Forbidden: Only superadmin can delete admin users'
      });
    }

    // Store user info for response before deletion
    const deletedUserInfo = {
      uid: targetUser.uid,
      email: targetUser.email,
      displayName: targetUser.displayName,
      role: targetRole
    };

    // Delete the user
    await admin.auth().deleteUser(uid);

    res.json({ 
      message: 'User deleted successfully',
      deletedUser: deletedUserInfo 
    });

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  listUsers,
  editUser,
  createUser,
  deleteUser
};
