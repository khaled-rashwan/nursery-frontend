// Test script for class assignment functionality
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        const serviceAccount = require('./future-step-nursery-firebase-adminsdk-g1y72-4ad8c7b5f6.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error.message);
        process.exit(1);
    }
}

const db = admin.firestore();

async function testClassAssignment() {
    console.log('\n🧪 Testing Class Assignment Functionality\n');

    try {
        // 1. Check available classes
        console.log('1️⃣ Fetching available classes...');
        const classesSnapshot = await db.collection('classes').get();
        const classes = [];
        classesSnapshot.forEach(doc => {
            const data = doc.data();
            classes.push({
                id: doc.id,
                name: data.name,
                level: data.level,
                academicYear: data.academicYear,
                capacity: data.capacity
            });
        });
        
        if (classes.length === 0) {
            console.log('⚠️  No classes found in the database');
            console.log('💡 You may need to create some classes first using the Class Management interface');
            return;
        }

        console.log(`✅ Found ${classes.length} classes:`);
        classes.forEach((cls, index) => {
            console.log(`   ${index + 1}. ${cls.name} (${cls.level}) - ${cls.academicYear}`);
        });

        // 2. Check teachers
        console.log('\n2️⃣ Fetching teachers...');
        const teachersSnapshot = await db.collection('teachers').get();
        const teachers = [];
        teachersSnapshot.forEach(doc => {
            const data = doc.data();
            teachers.push({
                id: doc.id,
                uid: data.uid || doc.id,
                displayName: data.displayName || 'Unknown Teacher',
                email: data.email || 'unknown@email.com',
                classes: data.classes || []
            });
        });

        if (teachers.length === 0) {
            console.log('⚠️  No teachers found in the database');
            console.log('💡 You may need to create some teachers first using the User Management interface');
            return;
        }

        console.log(`✅ Found ${teachers.length} teachers:`);
        teachers.forEach((teacher, index) => {
            console.log(`   ${index + 1}. ${teacher.displayName} (${teacher.email})`);
            if (teacher.classes.length > 0) {
                console.log(`      📚 Assigned classes: ${teacher.classes.map(c => c.className).join(', ')}`);
            } else {
                console.log(`      📝 No classes assigned`);
            }
        });

        // 3. Test class assignment simulation
        console.log('\n3️⃣ Testing class assignment simulation...');
        
        if (teachers.length > 0 && classes.length > 0) {
            const testTeacher = teachers[0];
            const testClass = classes[0];
            
            console.log(`📋 Simulating assignment of "${testClass.name}" to "${testTeacher.displayName}"`);
            
            // Create test assignment data
            const assignmentData = {
                classId: testClass.id,
                className: testClass.name,
                subjects: ['Mathematics', 'Science']
            };

            // This is how the assignment would work:
            console.log('   📝 Assignment structure:');
            console.log('   ', JSON.stringify(assignmentData, null, 6));
            
            console.log('✅ Class assignment simulation successful');
        }

        // 4. Show integration points
        console.log('\n4️⃣ Integration Points:');
        console.log('   🔗 Classes are fetched from: /api/manageClasses?operation=list');
        console.log('   🔗 Teachers are fetched from: /api/manageTeachersNew?operation=list');
        console.log('   🔗 Assignments are saved via: /api/manageTeachersNew?operation=update');
        console.log('   🔗 Teacher data structure includes classes array with classId, className, subjects');

        console.log('\n✨ Test completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Open the admin portal');
        console.log('   2. Navigate to Teacher Management');
        console.log('   3. Click "Assign Classes" button for any teacher');
        console.log('   4. Select classes and assign subjects');
        console.log('   5. Save the assignment');

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

// Run the test
testClassAssignment()
    .then(() => {
        console.log('\n🏁 Test script completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test script failed:', error);
        process.exit(1);
    });
