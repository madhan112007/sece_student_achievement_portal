# Sri Eshwar College Student Portal

A centralized web-based student record management system for tracking academic achievements, certifications, internships, projects, and other accomplishments.

## 🚀 Features

- **Role-based Authentication**: Student, Faculty, and Admin access levels
- **Achievement Submission**: Students can submit certifications, internships, projects, workshops, and hackathons
- **Document Upload**: Secure file upload for certificates and supporting documents
- **Review System**: Faculty/Admin can review, approve, or reject submissions
- **Real-time Updates**: Live dashboard updates using Firestore
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React (Create React App), Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Routing**: React Router v6
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Git

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>\ncd student-portal\n```

### 2. Install Dependencies

```bash\nnpm install\n```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication (Email/Password and Google)
4. Create Firestore database
5. Set up Firebase Storage
6. Get your Firebase configuration

### 4. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 5. Firebase Security Rules

Deploy the security rules to your Firebase project:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### 6. Run the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.js
│   ├── forms/
│   │   └── SubmissionForm.js
│   ├── layout/
│   │   └── Layout.js
│   └── ui/
├── contexts/
│   └── AuthContext.js
├── pages/
│   ├── auth/
│   │   ├── Login.js
│   │   ├── SignUp.js
│   │   └── Unauthorized.js
│   ├── dashboard/
│   │   └── Dashboard.js
│   ├── student/
│   │   └── StudentDashboard.js
│   └── admin/
│       └── AdminDashboard.js
├── config/
│   └── firebase.js
└── App.js
```

## 👥 User Roles

### Student
- Submit achievements and upload certificates
- View their submission history and status
- Edit pending submissions

### Faculty/Admin
- Review all student submissions
- Approve or reject submissions with comments
- Filter submissions by category and status
- View analytics and reports

## 🔐 Security Features

- Role-based access control
- Secure file upload with type and size validation
- Firebase Authentication integration
- Protected routes
- Firestore security rules

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Other Platforms

The built files in the `build/` directory can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## 🔄 Future Enhancements

1. **Mobile App**: React Native version
2. **ERP Integration**: Connect with existing college ERP systems
3. **Analytics Dashboard**: Advanced reporting and analytics
4. **Notification System**: Email/SMS notifications for status updates
5. **Bulk Import**: Excel/CSV import functionality
6. **API Integration**: RESTful API for third-party integrations

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Configuration Error**
   - Ensure all environment variables are set correctly
   - Check Firebase project settings

2. **Authentication Issues**
   - Verify Firebase Authentication is enabled
   - Check authorized domains in Firebase console

3. **File Upload Errors**
   - Ensure Firebase Storage is set up
   - Check storage security rules
   - Verify file size and type restrictions

4. **Permission Denied Errors**
   - Check Firestore security rules
   - Verify user roles are set correctly

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Sri Eshwar College of Engineering**  
*Empowering Education Through Technology*