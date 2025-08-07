import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { academicYear, classId, date, attendanceRecords } = await request.json();
    
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }
    
    const idToken = authHeader.substring(7);
    
    // Call Firebase Function
    const firebaseFunctionUrl = process.env.FIREBASE_FUNCTIONS_URL || 'https://us-central1-future-step-nursery.cloudfunctions.net';
    console.log('Calling Firebase Function:', `${firebaseFunctionUrl}/saveAttendanceCentralized`);
    console.log('Request payload:', { academicYear, classId, date, attendanceRecords: attendanceRecords?.length || 0 });
    
    const response = await fetch(`${firebaseFunctionUrl}/saveAttendanceCentralized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        academicYear,
        classId,
        date,
        attendanceRecords
      })
    });
    
    console.log('Firebase Function response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firebase Function error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      return NextResponse.json({ error: errorData.error || 'Failed to save attendance' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in saveAttendanceCentralized API route:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
