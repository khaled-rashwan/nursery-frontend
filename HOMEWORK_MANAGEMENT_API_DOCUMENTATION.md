# Homework Management API Documentation

## Overview
This document describes the Homework Management API endpoints that allow teachers to create, read, update, and delete homework assignments for their assigned classes.

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Permissions Summary
- **Teachers**: Can create, read, update, and delete homework for their assigned classes only
- **Admins/Superadmins**: Can perform all operations on any homework
- **Parents**: Can read homework for classes their children are enrolled in

## Data Model

### Homework Document Structure
```javascript
{
  id: "homework123",                    // Auto-generated document ID
  classId: "class123",                  // Reference to class
  subjectId: "math",                    // Subject identifier
  teacherUID: "teacher123",             // UID of the teacher who created it
  title: "Numbers 1–10 worksheet",      // Homework title (3-200 chars)
  description: "Complete pages 5–6",    // Detailed description (5-1000 chars)
  dueDate: "2025-10-15",               // Due date (ISO date string, must be future)
  attachments: ["url1", "url2"],       // Array of attachment URLs (max 10)
  createdAt: Timestamp,                // Auto-generated creation timestamp
  updatedAt: Timestamp                 // Auto-generated update timestamp
}
```

## API Endpoints

### 1. Create Homework
**Endpoint**: `POST /createHomework`

**Description**: Creates a new homework assignment

**Request Body**:
```javascript
{
  "homeworkData": {
    "classId": "class123",
    "subjectId": "math",
    "title": "Numbers 1–10 worksheet",
    "description": "Complete pages 5–6 in your math workbook",
    "dueDate": "2025-12-15",
    "attachments": [
      "https://example.com/worksheet.pdf",
      "https://example.com/instructions.pdf"
    ]
  }
}
```

**Notes**:
- For teachers: `teacherUID` is automatically set to the authenticated user's UID
- For admins: `teacherUID` must be explicitly provided and the teacher must be assigned to the class
- `attachments` is optional and can be an empty array

**Success Response** (201):
```javascript
{
  "message": "Homework created successfully",
  "homework": {
    "id": "homework123",
    "classId": "class123",
    "subjectId": "math",
    "teacherUID": "teacher123",
    "title": "Numbers 1–10 worksheet",
    "description": "Complete pages 5–6 in your math workbook",
    "dueDate": "2025-12-15",
    "attachments": ["https://example.com/worksheet.pdf"],
    "createdAt": "2025-08-11T10:30:00.000Z",
    "updatedAt": "2025-08-11T10:30:00.000Z",
    "teacherInfo": {
      "uid": "teacher123",
      "email": "teacher@example.com",
      "displayName": "Jane Smith",
      "phoneNumber": "+1234567890"
    }
  }
}
```

### 2. Get Homework by ID
**Endpoint**: `GET /getHomework?homeworkId=<homework-id>`

**Description**: Retrieves a specific homework assignment by its ID

**Query Parameters**:
- `homeworkId` (required): The ID of the homework to retrieve

**Success Response** (200):
```javascript
{
  "homework": {
    "id": "homework123",
    "classId": "class123",
    "subjectId": "math",
    "teacherUID": "teacher123",
    "title": "Numbers 1–10 worksheet",
    "description": "Complete pages 5–6 in your math workbook",
    "dueDate": "2025-12-15",
    "attachments": ["https://example.com/worksheet.pdf"],
    "createdAt": "2025-08-11T10:30:00.000Z",
    "updatedAt": "2025-08-11T10:30:00.000Z",
    "teacherInfo": {
      "uid": "teacher123",
      "email": "teacher@example.com",
      "displayName": "Jane Smith",
      "phoneNumber": "+1234567890"
    }
  }
}
```

### 3. List Homework by Class
**Endpoint**: `GET /listHomeworkByClass?classId=<class-id>&teacherUID=<teacher-uid>`

**Description**: Retrieves all homework assignments for a specific class

**Query Parameters**:
- `classId` (required): The ID of the class
- `teacherUID` (optional): Filter by specific teacher (admin/superadmin only)

**Notes**:
- Results are ordered by due date (ascending)
- Teachers automatically see only their own homework
- Parents see homework only for classes their children are enrolled in
- Admins can optionally filter by teacher using the `teacherUID` parameter

**Success Response** (200):
```javascript
{
  "homework": [
    {
      "id": "homework123",
      "classId": "class123",
      "subjectId": "math",
      "teacherUID": "teacher123",
      "title": "Numbers 1–10 worksheet",
      "description": "Complete pages 5–6",
      "dueDate": "2025-12-15",
      "attachments": ["https://example.com/worksheet.pdf"],
      "createdAt": "2025-08-11T10:30:00.000Z",
      "updatedAt": "2025-08-11T10:30:00.000Z",
      "teacherInfo": {
        "uid": "teacher123",
        "email": "teacher@example.com",
        "displayName": "Jane Smith",
        "phoneNumber": "+1234567890"
      }
    }
  ]
}
```

### 4. Update Homework
**Endpoint**: `PUT /updateHomework`

**Description**: Updates an existing homework assignment

**Request Body**:
```javascript
{
  "homeworkId": "homework123",
  "homeworkData": {
    "classId": "class123",
    "subjectId": "math",
    "title": "Updated: Numbers 1–20 worksheet",
    "description": "Complete pages 5–8 in your math workbook",
    "dueDate": "2025-12-20",
    "attachments": [
      "https://example.com/worksheet.pdf",
      "https://example.com/answer-key.pdf"
    ]
  }
}
```

**Notes**:
- Teachers can only update their own homework
- Admins can update any homework
- If changing class or teacher assignment, proper validations are performed

**Success Response** (200):
```javascript
{
  "message": "Homework updated successfully",
  "homework": {
    "id": "homework123",
    "classId": "class123",
    "subjectId": "math",
    "teacherUID": "teacher123",
    "title": "Updated: Numbers 1–20 worksheet",
    "description": "Complete pages 5–8 in your math workbook",
    "dueDate": "2025-12-20",
    "attachments": ["https://example.com/worksheet.pdf", "https://example.com/answer-key.pdf"],
    "createdAt": "2025-08-11T10:30:00.000Z",
    "updatedAt": "2025-08-11T11:45:00.000Z",
    "teacherInfo": {
      "uid": "teacher123",
      "email": "teacher@example.com",
      "displayName": "Jane Smith",
      "phoneNumber": "+1234567890"
    }
  }
}
```

### 5. Delete Homework
**Endpoint**: `DELETE /deleteHomework?homeworkId=<homework-id>`

**Description**: Deletes a homework assignment

**Query Parameters**:
- `homeworkId` (required): The ID of the homework to delete

**Notes**:
- Teachers can only delete their own homework
- Admins can delete any homework
- This operation is permanent and cannot be undone

**Success Response** (200):
```javascript
{
  "message": "Homework deleted successfully",
  "deletedHomeworkId": "homework123"
}
```

## Error Responses

### Common Error Responses

**401 Unauthorized**:
```javascript
{
  "error": "Unauthorized: No token provided"
}
```

**403 Forbidden**:
```javascript
{
  "error": "Teachers can only access their own homework"
}
```

**404 Not Found**:
```javascript
{
  "error": "Homework not found"
}
```

**400 Bad Request**:
```javascript
{
  "error": "Validation failed",
  "details": [
    "Title is required and must be at least 3 characters",
    "Due date must be in the future"
  ]
}
```

**500 Internal Server Error**:
```javascript
{
  "error": "Internal server error"
}
```

## Validation Rules

### Homework Data Validation
- **classId**: Required, non-empty string
- **subjectId**: Required, non-empty string, must exist in the class subjects
- **teacherUID**: Required, non-empty string, teacher must be assigned to the class
- **title**: Required, 3-200 characters
- **description**: Required, 5-1000 characters
- **dueDate**: Required, valid ISO date string, must be in the future
- **attachments**: Optional array, max 10 items, each must be a valid URL

### Access Control Rules
1. **Teachers**: 
   - Can only access homework for classes they are assigned to
   - Can only modify homework they created
   - Cannot change the teacherUID of homework

2. **Admins/Superadmins**:
   - Can access and modify any homework
   - Can assign homework to any teacher (if teacher is assigned to the class)
   - Can change teacher assignments

3. **Parents**:
   - Can only view homework for classes their children are enrolled in
   - Cannot create, update, or delete homework

## Implementation Notes

### Database Collections Used
- `homework`: Main collection for homework documents
- `classes`: For class validation and subject verification
- `teachers`: For teacher-class assignment verification
- `students`: For parent-child relationship verification
- `enrollments`: For student enrollment verification

### Security Features
- JWT token validation on all endpoints
- Role-based access control
- Teacher-class assignment verification
- Parent-child enrollment verification
- Input validation and sanitization
- CORS protection

### Performance Considerations
- Homework lists are ordered by due date for better UX
- Teacher info is cached and populated for client convenience
- Queries are optimized with proper indexes
- Error handling prevents information leakage

## Frontend Integration Examples

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useHomework = (classId) => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const token = await getIdToken(); // Your auth function
        const response = await fetch(
          `${API_BASE_URL}/listHomeworkByClass?classId=${classId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        setHomework(data.homework || []);
      } catch (error) {
        console.error('Error fetching homework:', error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchHomework();
    }
  }, [classId]);

  return { homework, loading };
};
```

### Create Homework Form Example
```javascript
const CreateHomeworkForm = ({ classId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    attachments: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = await getIdToken();
      const response = await fetch(`${API_BASE_URL}/createHomework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeworkData: {
            ...formData,
            classId
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result.homework);
        setFormData({ title: '', description: '', subjectId: '', dueDate: '', attachments: [] });
      } else {
        const error = await response.json();
        console.error('Error creating homework:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

This API provides a complete homework management system with proper authentication, authorization, validation, and error handling suitable for a nursery school management system.
