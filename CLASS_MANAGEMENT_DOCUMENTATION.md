# Class Management System Documentation

## Overview
The Class Management System provides a comprehensive solution for managing nursery classes with a single CRUD function approach.

## Database Structure

### Classes Collection
```json
{
  "id": "auto-generated-document-id",
  "name": "KG1-A",
  "level": "KG1",
  "academicYear": "2025-2026",
  "teacherUID": "teacher-firebase-uid",
  "capacity": 25,
  "notes": "Morning group",
  "createdAt": "2025-08-01T12:00:00Z",
  "updatedAt": "2025-08-01T12:00:00Z",
  "createdBy": "admin-uid",
  "updatedBy": "admin-uid",
  "deleted": false,        // For soft delete
  "deletedAt": null,       // Timestamp when deleted
  "deletedBy": null        // Who deleted it
}
```

## API Endpoints

### Single Endpoint: `manageClasses`
**URL**: `https://us-central1-{project-id}.cloudfunctions.net/manageClasses`

#### List Classes
- **Method**: GET
- **Query Parameters**:
  - `operation=list` (required)
  - `academicYear` (optional): Filter by academic year
  - `level` (optional): Filter by level (Pre-KG, KG1, KG2)
- **Response**: Array of classes with teacher information

#### Get Single Class
- **Method**: GET
- **Query Parameters**:
  - `operation=get` (required)
  - `classId` (required): Class document ID
- **Response**: Single class object with teacher information

#### Create Class
- **Method**: POST
- **Query Parameters**:
  - `operation=create` (required)
- **Body**:
```json
{
  "classData": {
    "name": "KG1-A",
    "level": "KG1",
    "academicYear": "2025-2026",
    "teacherUID": "teacher-firebase-uid",
    "capacity": 25,
    "notes": "Morning group"
  }
}
```

#### Update Class
- **Method**: POST
- **Query Parameters**:
  - `operation=update` (required)
- **Body**:
```json
{
  "classId": "class-document-id",
  "classData": {
    "name": "KG1-A",
    "level": "KG1",
    "academicYear": "2025-2026",
    "teacherUID": "teacher-firebase-uid",
    "capacity": 25,
    "notes": "Updated notes"
  }
}
```

#### Delete Class
- **Method**: POST
- **Query Parameters**:
  - `operation=delete` (required)
- **Body**:
```json
{
  "classId": "class-document-id"
}
```

## Features

### 1. Comprehensive Validation
- Class name uniqueness per academic year
- Teacher role verification
- Capacity limits (1-50)
- Academic year format validation
- Level validation (Pre-KG, KG1, KG2)

### 2. Smart Deletion
- **Soft Delete**: Classes with historical enrollments are marked as deleted
- **Hard Delete**: Classes without any enrollment history are permanently removed
- Prevents deletion of classes with active enrollments

### 3. Teacher Integration
- Fetches and displays teacher information with each class
- Validates teacher role before assignment
- Supports teacher reassignment

### 4. Academic Year Support
- Flexible academic year generation (current year ± 3 years)
- Year-based filtering
- Automatic validation of reasonable year ranges

### 5. Enrollment Integration
- Classes are dynamically loaded in enrollment forms
- Filters classes by academic year
- Supports previous class selection from all available classes

## Frontend Components

### ClassManagement.tsx
Main management interface with:
- **List View**: Displays all classes in a responsive table
- **Filters**: Academic year and level filtering
- **Actions**: Create, edit, delete operations
- **Real-time Updates**: Automatic refresh after operations

### ClassForm Modal
Form for creating/editing classes with:
- **Validation**: Client-side and server-side validation
- **Teacher Selection**: Dropdown with all available teachers
- **Capacity Management**: Number input with min/max limits
- **Notes**: Optional text area for additional information

## Integration with Enrollment System

The class management system is integrated with the enrollment system:

1. **Dynamic Class Loading**: Enrollment forms fetch classes from the database
2. **Academic Year Filtering**: Only shows classes for the selected academic year
3. **Previous Class Options**: Includes all historical classes plus "External"
4. **Teacher Assignment**: Classes maintain teacher assignments for easy enrollment processing

## Permissions

All class management operations require:
- **Authentication**: Valid Firebase JWT token
- **Authorization**: Admin or Superadmin role
- **Permissions**: `canManageEnrollments` permission check

## Error Handling

The system includes comprehensive error handling:
- **Validation Errors**: Detailed field-specific error messages
- **Database Errors**: Proper error codes and messages
- **Network Errors**: Graceful degradation with user feedback
- **Permission Errors**: Clear access denied messages

## Best Practices

1. **Naming Convention**: Use format like "KG1-A", "KG2-B", "Pre-KG"
2. **Capacity Planning**: Set realistic capacity based on classroom size
3. **Teacher Assignment**: Ensure teachers are properly assigned before enrollment
4. **Academic Years**: Follow standard academic year format (YYYY-YYYY)
5. **Regular Cleanup**: Archive old classes that are no longer needed

## Future Enhancements

Potential improvements for the class management system:
1. **Bulk Operations**: Import/export classes in bulk
2. **Capacity Tracking**: Real-time enrollment vs capacity monitoring
3. **Schedule Integration**: Link classes with timetable/schedule system
4. **Room Assignment**: Add classroom/room assignment to classes
5. **Multi-year Planning**: Template system for creating classes across multiple years
