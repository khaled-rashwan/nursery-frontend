# Attendance Management System Documentation

⚠️ **DEPRECATED: This documentation describes the old enrollment-based attendance system. Please refer to `ATTENDANCE_CENTRALIZED_DOCUMENTATION.md` for the new centralized attendance system.**

## Overview

The Attendance Management System provides comprehensive CRUD operations for managing student attendance records using the `/enrollments/{id}/attendance` structure. This follows the recommended approach of treating attendance as a subcollection of enrollments.

**Note**: This system has been replaced by a centralized approach that stores attendance in `attendance/{academicYear_classId_date}` format, which better matches real-world kindergarten attendance workflows.

## API Endpoints

All endpoints are available at: `https://us-central1-{PROJECT_ID}.cloudfunctions.net/`

### Authentication

All endpoints require Firebase Authentication token in the Authorization header:
```
Authorization: Bearer {firebase_id_token}
```

### Role-Based Access Control

- **Superadmin/Admin**: Full access to all attendance records
- **Teacher**: Can manage attendance for their own classes only
- **Parent**: Read-only access to their child's attendance records
- **Content Manager**: No attendance access

## API Functions

### 1. Save Attendance (`saveAttendance`)

Create or update attendance records for a specific enrollment and date.

**Method**: `POST`
**Endpoint**: `/saveAttendance`

**Request Body**:
```json
{
  "enrollmentId": "2025-2026_ST2025001",
  "date": "2025-01-15",
  "attendanceRecords": [
    {
      "studentId": "ST2025001",
      "studentName": "أحمد محمد",
      "status": "present",
      "notes": "Arrived on time"
    },
    {
      "studentId": "ST2025002", 
      "studentName": "فاطمة علي",
      "status": "late",
      "notes": "Arrived 15 minutes late"
    },
    {
      "studentId": "ST2025003",
      "studentName": "عمر خالد", 
      "status": "absent",
      "notes": "Sick leave"
    }
  ]
}
```

**Valid Status Values**: `present`, `absent`, `late`

**Response**:
```json
{
  "success": true,
  "message": "Attendance saved successfully",
  "data": {
    "enrollmentId": "2025-2026_ST2025001",
    "date": "2025-01-15",
    "totalStudents": 3,
    "presentCount": 1,
    "absentCount": 1,
    "lateCount": 1
  }
}
```

### 2. Get Attendance (`getAttendance`)

Retrieve attendance records for a specific enrollment.

**Method**: `GET`
**Endpoint**: `/getAttendance`

**Query Parameters**:
- `enrollmentId` (required): The enrollment ID
- `date` (optional): Specific date (YYYY-MM-DD) to retrieve
- `startDate` (optional): Start date for range query
- `endDate` (optional): End date for range query  
- `limit` (optional): Maximum number of records (default: 50)

**Examples**:

1. Get specific date:
```
GET /getAttendance?enrollmentId=2025-2026_ST2025001&date=2025-01-15
```

2. Get date range:
```
GET /getAttendance?enrollmentId=2025-2026_ST2025001&startDate=2025-01-01&endDate=2025-01-31&limit=100
```

3. Get recent records:
```
GET /getAttendance?enrollmentId=2025-2026_ST2025001&limit=30
```

**Response** (Single Date):
```json
{
  "success": true,
  "data": {
    "id": "2025-01-15",
    "date": "2025-01-15",
    "enrollmentId": "2025-2026_ST2025001",
    "academicYear": "2025-2026",
    "className": "KG1-A",
    "teacherUID": "teacher123",
    "records": [
      {
        "studentId": "ST2025001",
        "studentName": "أحمد محمد",
        "status": "present",
        "notes": "Arrived on time",
        "recordedAt": "2025-01-15T08:30:00Z"
      }
    ],
    "totalStudents": 25,
    "presentCount": 22,
    "absentCount": 2,
    "lateCount": 1,
    "createdAt": "2025-01-15T08:30:00Z",
    "updatedAt": "2025-01-15T08:30:00Z",
    "createdBy": "teacher123"
  }
}
```

**Response** (Multiple Records):
```json
{
  "success": true,
  "data": [
    {
      "id": "2025-01-15",
      "date": "2025-01-15",
      // ... attendance data
    },
    {
      "id": "2025-01-14", 
      "date": "2025-01-14",
      // ... attendance data
    }
  ],
  "meta": {
    "count": 2,
    "enrollmentId": "2025-2026_ST2025001",
    "hasFilters": true
  }
}
```

### 3. Get Attendance Statistics (`getAttendanceStats`)

Generate comprehensive attendance statistics for an enrollment.

**Method**: `GET`
**Endpoint**: `/getAttendanceStats`

**Query Parameters**:
- `enrollmentId` (required): The enrollment ID
- `startDate` (optional): Start date for statistics calculation
- `endDate` (optional): End date for statistics calculation

**Example**:
```
GET /getAttendanceStats?enrollmentId=2025-2026_ST2025001&startDate=2025-01-01&endDate=2025-01-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "enrollmentId": "2025-2026_ST2025001",
    "totalDays": 20,
    "totalPresent": 450,
    "totalAbsent": 30,
    "totalLate": 20,
    "overallAttendanceRate": "94.0",
    "studentStats": [
      {
        "studentId": "ST2025001",
        "studentName": "أحمد محمد",
        "present": 18,
        "absent": 1,
        "late": 1,
        "total": 20,
        "attendanceRate": "95.0"
      }
    ],
    "dateRange": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    }
  }
}
```

### 4. Delete Attendance (`deleteAttendance`)

Delete attendance records (Admin/Superadmin only).

**Method**: `DELETE` or `POST`
**Endpoint**: `/deleteAttendance`

**Query Parameters** (for DELETE):
- `enrollmentId` (required): The enrollment ID
- `date` (required): The date to delete

**Request Body** (for POST):
```json
{
  "enrollmentId": "2025-2026_ST2025001",
  "date": "2025-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Attendance record deleted successfully",
  "data": {
    "enrollmentId": "2025-2026_ST2025001",
    "date": "2025-01-15",
    "deletedBy": "admin123",
    "deletedAt": "2025-01-15T10:30:00Z"
  }
}
```

## Data Structure

### Firestore Collection Structure
```
enrollments/{enrollmentId}/attendance/{date}
```

### Attendance Document Schema
```javascript
{
  date: "2025-01-15",                    // YYYY-MM-DD format
  enrollmentId: "2025-2026_ST2025001",   // Reference to parent enrollment
  academicYear: "2025-2026",             // Academic year
  className: "KG1-A",                    // Class name
  teacherUID: "teacher123",              // Teacher who recorded attendance
  records: [                             // Array of individual student records
    {
      studentId: "ST2025001",
      studentName: "أحمد محمد",
      status: "present",                 // present|absent|late
      notes: "Arrived on time",
      recordedAt: Timestamp
    }
  ],
  totalStudents: 25,                     // Total students in attendance
  presentCount: 22,                      // Count of present students
  absentCount: 2,                        // Count of absent students  
  lateCount: 1,                          // Count of late students
  createdAt: Timestamp,                  // When record was created
  updatedAt: Timestamp,                  // When record was last updated
  createdBy: "teacher123"                // User who created the record
}
```

## Error Handling

### Common Error Responses

**401 Unauthorized**:
```json
{
  "error": "Unauthorized: No token provided"
}
```

**403 Forbidden**:
```json
{
  "error": "Teachers can only manage attendance for their own classes"
}
```

**400 Bad Request**:
```json
{
  "error": "Invalid status: invalid_status. Must be one of: present, absent, late"
}
```

**404 Not Found**:
```json
{
  "error": "Attendance record not found for the specified date"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "details": "Detailed error message"
}
```

## Validation Rules

### Date Validation
- Must be valid date format (YYYY-MM-DD)
- Cannot be future dates
- Cannot be older than one year
- Must be reasonable academic dates

### Attendance Records Validation
- Each record must have `studentId` and `status`
- Status must be one of: `present`, `absent`, `late`
- Notes field is optional, max 500 characters
- Student names are optional but recommended

### Role-Based Validation
- Teachers can only manage attendance for enrollments where they are the assigned teacher
- Parents have read-only access to their child's records
- Admin/Superadmin have full access to all records

## Security Features

### Authentication
- All endpoints require valid Firebase ID token
- Token verification includes custom claims validation
- Session management through Firebase Auth

### Authorization  
- Role-based access control (RBAC)
- Enrollment-level permissions checking
- Teacher-class association validation

### Data Protection
- Input sanitization and validation
- SQL injection prevention (NoSQL)
- XSS protection through proper data handling

## Best Practices

### Frontend Integration
1. Always validate attendance data before sending to API
2. Implement proper loading states during API calls
3. Handle network errors gracefully
4. Cache attendance data appropriately
5. Use optimistic updates where possible

### Backend Usage
1. Use batch operations for better performance
2. Implement proper error logging
3. Monitor API usage and performance
4. Set up proper indexes for queries
5. Regular backup of attendance data

### Data Management
1. Archive old attendance data annually
2. Implement data retention policies
3. Regular audit of attendance records
4. Backup critical attendance data
5. Monitor for data inconsistencies

## Integration Examples

### Frontend API Call (JavaScript)
```javascript
const saveAttendance = async (enrollmentId, date, attendanceRecords, userToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/saveAttendance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        enrollmentId,
        date,
        attendanceRecords
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save attendance');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving attendance:', error);
    throw error;
  }
};
```

### React Hook Usage
```javascript
const useAttendance = (enrollmentId) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveAttendance = async (date, records) => {
    setLoading(true);
    try {
      const result = await attendanceAPI.save(enrollmentId, date, records);
      // Update local state
      setAttendance(prev => [...prev, result.data]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { attendance, loading, error, saveAttendance };
};
```

## Monitoring and Analytics

### Key Metrics to Track
- API response times
- Error rates by endpoint
- User activity patterns
- Data consistency checks
- Performance bottlenecks

### Recommended Monitoring
- Firebase Functions monitoring
- Firestore usage tracking
- Error logging and alerting
- Performance metrics dashboard
- User access auditing

This documentation provides a complete reference for implementing and using the Attendance Management System in your nursery management application.
