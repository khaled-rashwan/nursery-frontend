# Firebase Functions Documentation

## Project Structure

```
functions/
├── index.js                 // Main exports file
├── src/
│   ├── utils/
│   │   ├── cors.js         // CORS utilities
│   │   ├── auth.js         // Authentication middleware
│   │   ├── permissions.js  // Role-based permissions
│   │   └── validation.js   // Data validation utilities
│   ├── auth/
│   │   └── userManagement.js  // User CRUD functions
│   ├── students/
│   │   └── studentCrud.js     // Student CRUD functions
│   └── enrollments/
│       └── enrollmentCrud.js  // Enrollment CRUD functions
└── package.json
```

## Authentication & Permissions

All functions require JWT authentication via Bearer token in Authorization header.
- **Admin/Superadmin**: Can manage users, students, and enrollments
- **Superadmin**: Can create/edit/delete admin users
- **Admin**: Can create/edit/delete teacher/parent users

## Complete Function List

### User Management Functions (Auth Module)

#### 1. `listUsers`
- **Method**: GET
- **URL**: `/listUsers`
- **Permission**: Admin/Superadmin only
- **Query Parameters**:
  - `maxResults` (optional): Number of users to return (default: 100)
  - `pageToken` (optional): Pagination token
- **Response**: List of users with metadata

#### 2. `createUser`
- **Method**: POST
- **URL**: `/createUser`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "userData": {
      "email": "user@example.com",
      "password": "password123",
      "displayName": "User Name",
      "phoneNumber": "+966501234567",
      "role": "teacher|parent|admin"
    }
  }
  ```
- **Response**: Created user data

#### 3. `editUser`
- **Method**: POST
- **URL**: `/editUser`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "uid": "user-uid",
    "userData": {
      "email": "new@example.com",
      "displayName": "New Name",
      "phoneNumber": "+966501234567",
      "role": "teacher|parent|admin",
      "disabled": false,
      "emailVerified": true
    }
  }
  ```
- **Response**: Updated user data

#### 4. `deleteUser`
- **Method**: POST
- **URL**: `/deleteUser`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "uid": "user-uid"
  }
  ```
- **Response**: Deleted user confirmation

### Student Management Functions

#### 5. `createStudent`
- **Method**: POST
- **URL**: `/createStudent`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "studentData": {
      "fullName": "Ahmed Mohamed",
      "dateOfBirth": "2020-10-20",
      "gender": "Male|Female",
      "parentUID": "parent-uid"
    }
  }
  ```
- **Response**: Created student data

#### 6. `listStudents`
- **Method**: GET
- **URL**: `/listStudents`
- **Permission**: Admin/Superadmin only
- **Query Parameters**:
  - `limit` (optional): Number of students to return (default: 50)
  - `parentUID` (optional): Filter by parent UID
  - `search` (optional): Search by name or parent UID
- **Response**: List of students with metadata

#### 7. `getStudent`
- **Method**: GET
- **URL**: `/getStudent`
- **Permission**: Admin/Superadmin only
- **Query Parameters**:
  - `studentId` (required): Student document ID
- **Response**: Student details

#### 8. `updateStudent`
- **Method**: POST
- **URL**: `/updateStudent`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "studentId": "student-id",
    "studentData": {
      "fullName": "Updated Name",
      "dateOfBirth": "2020-10-20",
      "gender": "Male|Female",
      "parentUID": "parent-uid"
    }
  }
  ```
- **Response**: Updated student data

#### 9. `deleteStudent`
- **Method**: POST
- **URL**: `/deleteStudent`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "studentId": "student-id"
  }
  ```
- **Response**: Deleted student confirmation
- **Note**: Cannot delete students with active enrollments

### Enrollment Management Functions

#### 10. `createEnrollment`
- **Method**: POST
- **URL**: `/createEnrollment`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "enrollmentData": {
      "studentUID": "student-id",
      "academicYear": "2025-2026",
      "class": "KG1-A|KG1-B|KG2-A|KG2-B|Pre-KG",
      "teacherUID": "teacher-uid",
      "status": "enrolled|withdrawn|graduated|pending"
    }
  }
  ```
- **Response**: Created enrollment data
- **Note**: Uses composite ID format: `{academicYear}_{studentUID}`

#### 11. `listEnrollments`
- **Method**: GET
- **URL**: `/listEnrollments`
- **Permission**: Admin/Superadmin only
- **Query Parameters**:
  - `limit` (optional): Number of enrollments to return (default: 50)
  - `academicYear` (optional): Filter by academic year
  - `class` (optional): Filter by class
  - `teacherUID` (optional): Filter by teacher
  - `studentUID` (optional): Filter by student
  - `status` (optional): Filter by enrollment status
- **Response**: List of enrollments with student data

#### 12. `getEnrollment`
- **Method**: GET
- **URL**: `/getEnrollment`
- **Permission**: Admin/Superadmin only
- **Query Parameters**:
  - `enrollmentId` (required): Enrollment document ID
- **Response**: Enrollment details with student data

#### 13. `updateEnrollment`
- **Method**: POST
- **URL**: `/updateEnrollment`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "enrollmentId": "2025-2026_student-id",
    "enrollmentData": {
      "class": "KG2-A",
      "teacherUID": "new-teacher-uid",
      "status": "enrolled|withdrawn|graduated|pending"
    }
  }
  ```
- **Response**: Updated enrollment data

#### 14. `deleteEnrollment`
- **Method**: POST
- **URL**: `/deleteEnrollment`
- **Permission**: Admin/Superadmin only
- **Body**:
  ```json
  {
    "enrollmentId": "2025-2026_student-id"
  }
  ```
- **Response**: Deleted enrollment confirmation

#### 15. `getEnrollmentsByYear`
- **Method**: GET
- **URL**: `/getEnrollmentsByYear`
- **Permission**: Admin/Superadmin only
- **Query Parameters**:
  - `academicYear` (required): Academic year (e.g., "2025-2026")
- **Response**: Enrollments grouped by class for the academic year

## Data Models

### Student Model
```json
{
  "id": "auto-generated-id",
  "fullName": "Ahmed Mohamed",
  "dateOfBirth": "2020-10-20",
  "gender": "Male",
  "parentUID": "parent-uid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "createdBy": "admin-uid"
}
```

### Enrollment Model
```json
{
  "id": "2025-2026_student-id",
  "studentUID": "student-id",
  "academicYear": "2025-2026",
  "class": "KG1-A",
  "teacherUID": "teacher-uid",
  "status": "enrolled",
  "enrollmentDate": "2025-01-01T00:00:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "createdBy": "admin-uid"
}
```

## Error Handling

All functions return standardized error responses:
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **400**: Bad Request (validation errors)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

## Validation Rules

### Student Validation
- `fullName`: Required, min 2 characters
- `dateOfBirth`: Required, age must be 2-6 years
- `gender`: Required, must be "Male" or "Female"
- `parentUID`: Required, must exist in Firebase Auth

### Enrollment Validation
- `studentUID`: Required, must exist in students collection
- `academicYear`: Required, format "YYYY-YYYY"
- `class`: Required, must be one of valid classes
- `teacherUID`: Required, must exist in Firebase Auth with teacher role
- `status`: Optional, must be valid status value
- No duplicate enrollments per student per academic year

## CORS Support
All functions include CORS headers for web client access:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, DELETE`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
