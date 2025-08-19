// Test script for Homework Management APIs
// Run this script to test the homework CRUD operations

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (replace with your config)
if (!admin.apps.length) {
  admin.initializeApp({
    // Your Firebase config here
  });
}

const BASE_URL = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net';

// Test data
const testHomework = {
  classId: 'class123',
  subjectId: 'math',
  title: 'Numbers 1-10 worksheet',
  description: 'Complete pages 5-6 in your math workbook. Practice writing numbers and simple addition.',
  dueDate: '2025-12-15',
  attachments: [
    'https://example.com/worksheet1.pdf',
    'https://example.com/instructions.pdf'
  ]
};

// Helper function to get auth token (replace with actual implementation)
async function getAuthToken() {
  // In a real application, you would get this from your authentication system
  // For testing, you might use Firebase Auth SDK or create a custom token
  const customToken = await admin.auth().createCustomToken('teacher123', {
    role: 'teacher'
  });
  return customToken; // Note: In real client, you'd exchange this for an ID token
}

// Test CREATE homework
async function testCreateHomework() {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${BASE_URL}/createHomework`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        homeworkData: testHomework
      })
    });
    
    const result = await response.json();
    console.log('CREATE Homework Result:', result);
    
    if (result.homework && result.homework.id) {
      return result.homework.id;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating homework:', error);
    return null;
  }
}

// Test GET homework by ID
async function testGetHomework(homeworkId) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${BASE_URL}/getHomework?homeworkId=${homeworkId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('GET Homework Result:', result);
    
    return result;
  } catch (error) {
    console.error('Error getting homework:', error);
    return null;
  }
}

// Test LIST homework by class
async function testListHomeworkByClass(classId) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${BASE_URL}/listHomeworkByClass?classId=${classId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('LIST Homework Result:', result);
    
    return result;
  } catch (error) {
    console.error('Error listing homework:', error);
    return null;
  }
}

// Test UPDATE homework
async function testUpdateHomework(homeworkId) {
  try {
    const token = await getAuthToken();
    
    const updatedHomework = {
      ...testHomework,
      title: 'Updated: Numbers 1-20 worksheet',
      description: 'Complete pages 5-8 in your math workbook. Practice writing numbers and simple addition and subtraction.',
      dueDate: '2025-12-20'
    };
    
    const response = await fetch(`${BASE_URL}/updateHomework`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        homeworkId: homeworkId,
        homeworkData: updatedHomework
      })
    });
    
    const result = await response.json();
    console.log('UPDATE Homework Result:', result);
    
    return result;
  } catch (error) {
    console.error('Error updating homework:', error);
    return null;
  }
}

// Test DELETE homework
async function testDeleteHomework(homeworkId) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${BASE_URL}/deleteHomework?homeworkId=${homeworkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    console.log('DELETE Homework Result:', result);
    
    return result;
  } catch (error) {
    console.error('Error deleting homework:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting Homework API Tests...\n');
  
  // Test CREATE
  console.log('1. Testing CREATE homework...');
  const homeworkId = await testCreateHomework();
  
  if (!homeworkId) {
    console.error('Failed to create homework. Stopping tests.');
    return;
  }
  
  console.log('\n2. Testing GET homework...');
  await testGetHomework(homeworkId);
  
  console.log('\n3. Testing LIST homework by class...');
  await testListHomeworkByClass(testHomework.classId);
  
  console.log('\n4. Testing UPDATE homework...');
  await testUpdateHomework(homeworkId);
  
  console.log('\n5. Testing GET homework after update...');
  await testGetHomework(homeworkId);
  
  console.log('\n6. Testing DELETE homework...');
  await testDeleteHomework(homeworkId);
  
  console.log('\n7. Testing GET homework after deletion (should fail)...');
  await testGetHomework(homeworkId);
  
  console.log('\nAll tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testCreateHomework,
  testGetHomework,
  testListHomeworkByClass,
  testUpdateHomework,
  testDeleteHomework,
  runAllTests
};
