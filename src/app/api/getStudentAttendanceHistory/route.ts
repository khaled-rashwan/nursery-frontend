import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }
    
    const idToken = authHeader.substring(7);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const academicYear = searchParams.get('academicYear');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Validate required parameters
    if (!studentId) {
      return NextResponse.json({ 
        error: 'Student ID is required' 
      }, { status: 400 });
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('studentId', studentId);
    if (academicYear) queryParams.append('academicYear', academicYear);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    // Call Firebase Function
    const firebaseFunctionUrl = process.env.FIREBASE_FUNCTIONS_URL || 'https://us-central1-future-step-nursery.cloudfunctions.net';
    const response = await fetch(`${firebaseFunctionUrl}/getStudentAttendanceHistory?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ 
        error: errorData.error || 'Failed to get student attendance history' 
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in getStudentAttendanceHistory API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
