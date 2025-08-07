import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!academicYear || !classId) {
      return NextResponse.json({ error: 'Academic year and class ID are required' }, { status: 400 });
    }
    
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }
    
    const idToken = authHeader.substring(7);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      academicYear,
      classId,
      ...(date && { date }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    
    // Call Firebase Function
    const firebaseFunctionUrl = process.env.FIREBASE_FUNCTIONS_URL || 'https://us-central1-future-step-nursery.cloudfunctions.net';
    const response = await fetch(`${firebaseFunctionUrl}/getAttendanceCentralized?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || 'Failed to get attendance' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in getAttendanceCentralized API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
