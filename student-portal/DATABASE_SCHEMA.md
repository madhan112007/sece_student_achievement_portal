# Firestore Database Schema

## Collections Structure

### 1. users
Stores user profile information and roles.

```javascript
{
  uid: "user_unique_id", // Document ID
  email: "student@sece.ac.in",
  name: "John Doe",
  role: "student", // "student" | "faculty" | "admin"
  rollNumber: "20CS001", // Optional, for students
  department: "Computer Science",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

### 2. submissions
Stores student achievement submissions.

```javascript
{
  id: "submission_unique_id", // Auto-generated document ID
  userId: "user_unique_id", // Reference to users collection
  userEmail: "student@sece.ac.in",
  category: "Certification", // "Certification" | "Internship" | "Project" | "Workshop" | "Hackathon"
  title: "AWS Cloud Practitioner",
  organization: "Amazon Web Services",
  duration: "3 months", // Optional
  description: "Completed AWS Cloud Practitioner certification...",
  fileURL: "https://firebasestorage.googleapis.com/...", // Optional
  fileName: "certificate.pdf", // Optional
  status: "pending", // "pending" | "approved" | "rejected"
  reviewedBy: "reviewer_user_id", // Optional, reference to users
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

### 3. reviews
Stores review comments and history.

```javascript
{
  id: "review_unique_id", // Auto-generated document ID
  submissionId: "submission_unique_id", // Reference to submissions
  reviewerId: "reviewer_user_id", // Reference to users
  comment: "Great achievement! Certificate verified.",
  status: "approved", // "approved" | "rejected"
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

## Indexing Suggestions

### Composite Indexes
1. **submissions**: `userId` (Ascending) + `createdAt` (Descending)
2. **submissions**: `status` (Ascending) + `createdAt` (Descending)
3. **submissions**: `category` (Ascending) + `status` (Ascending)
4. **reviews**: `submissionId` (Ascending) + `createdAt` (Descending)

### Single Field Indexes (Auto-created)
- `users.email`
- `users.role`
- `submissions.userId`
- `submissions.status`
- `submissions.category`
- `reviews.submissionId`

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'faculty'];
    }
    
    // Submissions rules
    match /submissions/{submissionId} {
      // Students can create and read their own submissions
      allow create, read: if request.auth != null && request.auth.uid == resource.data.userId;
      // Admin/Faculty can read all submissions and update status
      allow read, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'faculty'];
    }
    
    // Reviews rules
    match /reviews/{reviewId} {
      // Only admin/faculty can create reviews
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'faculty'];
      // Students can read reviews of their submissions
      allow read: if request.auth != null;
    }
  }
}
```

## Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /submissions/{userId}/{fileName} {
      // Only authenticated users can upload to their own folder
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admin/Faculty can read all files
      allow read: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role in ['admin', 'faculty'];
    }
  }
}
```

## Future ERP Integration Considerations

1. **User ID Mapping**: Add `erpId` field to users collection for future integration
2. **Department Codes**: Standardize department names/codes for consistency
3. **Academic Year**: Add `academicYear` field to submissions for better organization
4. **Batch Information**: Include `batch` or `graduationYear` in user profiles
5. **Course Mapping**: Add course/subject associations for academic submissions

## Data Migration Strategy

1. **Phase 1**: Import existing Excel data into Firestore
2. **Phase 2**: Validate and clean data
3. **Phase 3**: Set up proper indexes and security rules
4. **Phase 4**: Train users and migrate to new system
5. **Phase 5**: Integrate with existing ERP systems