const admin = require('firebase-admin');
const serviceAccount = require('./future-step-nursery-firebase-adminsdk-g1y72-4ad8c7b5f6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const teachersData = [
  {
    _id: 'teacher1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    classes: [
      {
        classId: 'class1',
        className: 'KG1-A',
        subjects: ['English', 'Math']
      }
    ]
  },
  {
    _id: 'teacher2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    classes: [
      {
        classId: 'class1',
        className: 'KG1-A',
        subjects: ['Science']
      },
      {
        classId: 'class2',
        className: 'KG1-B',
        subjects: ['English']
      }
    ]
  }
];

const createTeachersCollection = async () => {
  console.log('Creating teachers collection...');
  const batch = db.batch();
  teachersData.forEach(teacher => {
    const docRef = db.collection('teachers').doc(teacher._id);
    const { _id, ...data } = teacher;
    batch.set(docRef, data);
  });
  await batch.commit();
  console.log('Teachers collection created successfully.');
};

createTeachersCollection().catch(console.error);
