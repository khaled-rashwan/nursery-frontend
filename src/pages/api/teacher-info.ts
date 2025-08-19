import type { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teacherId } = req.query;
  if (!teacherId || typeof teacherId !== 'string') return res.status(400).json({ error: 'Missing teacherId' });
  try {
    const doc = await admin.firestore().collection('teachers').doc(teacherId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    const data = doc.data();
    res.json({ displayName: data?.displayName || teacherId });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch teacher info' });
  }
}
