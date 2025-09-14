# Campus Bulletin Board Web App

A comprehensive notice board application for educational institutions with role-based access control (Admin, Staff, and Students).

## Features

### 🔐 Authentication & Authorization
- **Single Login Page**: Users select their role and sign in
- **Student Registration**: Students can create accounts
- **Predefined Accounts**: Staff and admin accounts are created by administrators
- **JWT-based Authentication**: Secure token-based authentication

### 👥 Role-Based Access Control
- **Admin**: Full system access - manage notices, approve/reject submissions, manage staff accounts
- **Staff**: Create and edit notices, submit for approval
- **Students**: View approved notices, search and filter, download attachments

### 📢 Notice Management
- **Create & Edit**: Staff can create and edit notices
- **Approval Workflow**: All staff submissions require admin approval
- **File Attachments**: Support for PDF and other file types via Cloudinary
- **Categories**: Organized notice categories (Academic, Events, Sports, etc.)
- **Search & Filter**: Advanced search and filtering capabilities

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Cloudinary** for file storage
- **Multer** for file uploads
- **bcrypt** for password hashing

### Frontend
- **Next.js 14** with **TypeScript**
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Context** for state management

## Database Schema

### Users Collection
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  studentId: String (optional, unique),
  department: String (optional),
  roles: [String] (enum: ['admin', 'staff', 'student']),
  timestamps: true
}
```

### Notices Collection
```javascript
{
  title: String (required),
  description: String (required),
  category: String (enum: predefined categories),
  fileUrl: String (Cloudinary URL),
  filePublicId: String (Cloudinary public ID),
  status: String (enum: ['draft', 'pending_approval', 'published', 'rejected']),
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User, optional),
  approvedAt: Date (optional),
  rejectionReason: String (optional),
  timestamps: true
}
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd campusBulletin
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start the development server
npm run dev
```

### 4. Database Setup
```bash
cd backend

# Seed initial users (admin, staff, test student)
npm run seed
```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/campusBulletin
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Default Login Credentials

After running the seed script, you can use these test accounts:

- **Admin**: admin@campus.edu / admin123
- **Staff**: staff@campus.edu / staff123  
- **Student**: student@campus.edu / student123

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/staff/login` - Staff login
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/student/register` - Student registration
- `GET /api/auth/me` - Get current user profile

### Notices
- `GET /api/notices` - Get notices (with role-based filtering)
- `GET /api/notices/:id` - Get specific notice
- `POST /api/notices` - Create notice (Staff/Admin only)
- `PUT /api/notices/:id` - Update notice (Staff own/Admin)
- `DELETE /api/notices/:id` - Delete notice (Admin only)
- `PATCH /api/notices/:id/submit` - Submit for approval (Staff)
- `PATCH /api/notices/:id/approve` - Approve notice (Admin)
- `PATCH /api/notices/:id/reject` - Reject notice (Admin)

## Workflow

1. **Staff creates notice** → Status: DRAFT
2. **Staff submits for approval** → Status: PENDING_APPROVAL
3. **Admin reviews** → Status: PUBLISHED or REJECTED
4. **Students view** → Only PUBLISHED notices are visible

## File Structure

```
campusBulletin/
├── backend/
│   ├── auth/           # Role definitions and permissions
│   ├── config/         # Database and Cloudinary config
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth and role middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── scripts/        # Database seeding
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── app/        # Next.js app router
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts
│   │   ├── lib/        # Utilities and API
│   │   └── types/      # TypeScript types
│   └── package.json
└── README.md
```

## Development

### Running in Development Mode
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Database Seeding
```bash
cd backend
npm run seed
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Role-Based Access**: Granular permissions
- **Input Validation**: Server-side validation
- **File Upload Security**: Type and size restrictions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
