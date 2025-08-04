# 🏫 SMS API - School Management System Backend

A comprehensive NestJS + Prisma + PostgreSQL backend for the School Management System with JWT authentication and master account functionality.

## 🚀 Features

- **JWT Authentication** - Secure login/register with token-based auth
- **Master Account System** - Special account for testing all portals
- **Multi-Role Support** - Parent, Student, Teacher, School Admin, Creator, Master
- **Comprehensive Data Models** - Based on your frontend dummy data structure
- **Swagger Documentation** - Auto-generated API docs
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Robust relational database

## 📋 Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to the API directory:**

   ```bash
   cd sms_API
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   # Copy the .env file (already created)
   # Update DATABASE_URL with your PostgreSQL credentials
   ```

4. **Set up PostgreSQL database:**

   ```bash
   # Create database
   createdb sms_db

   # Or using psql
   psql -U postgres
   CREATE DATABASE sms_db;
   ```

5. **Generate Prisma client and run migrations:**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. **Start the development server:**
   ```bash
   npm run start:dev
   ```

## 🔐 Master Account Setup

The API includes a special master account for testing all portals:

```bash
# Create master account
POST /auth/create-master

# Master account credentials:
Email: master@sms.com
Password: master123
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:3001/api
- **API Base URL**: http://localhost:3001

## 🔑 Authentication Endpoints

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "type": "PARENT"
}
```

### Get Profile (Protected)

```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

## 👥 User Types

- **PARENT** - Can access parent dashboard, view children's progress
- **STUDENT** - Can access student dashboard, view grades/assignments
- **SCHOOL_ADMIN** - Can manage school, students, teachers
- **TEACHER** - Can manage classes, grades, assignments
- **CREATOR** - Can upload marketplace content
- **MASTER** - Special account for testing all portals

## 🗄️ Database Schema

The Prisma schema includes comprehensive models based on your frontend data:

### Core Models

- **User** - Base user with authentication
- **School** - School information and configuration
- **Student** - Comprehensive student profiles
- **Teacher** - Teacher profiles and assignments
- **Parent** - Parent accounts and relationships

### Academic Models

- **AcademicRecord** - Grades and performance
- **Assignment** - Homework, tests, projects
- **AttendanceRecord** - Student attendance tracking
- **AcademicTerm** - School terms and periods

### Supporting Models

- **StudentDocument** - Document management
- **TimelineEvent** - Student timeline
- **DisciplinaryRecord** - Behavioral records
- **FinancialRecord** - Fee management
- **HealthRecord** - Medical information

### Marketplace Models

- **Creator** - Content creator profiles
- **MarketplaceItem** - Educational content

## 🔧 Development

### Available Scripts

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database
npx prisma studio
npx prisma migrate dev
npx prisma generate

# Testing
npm run test
npm run test:e2e
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/sms_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Application
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Authentication guards
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # User management
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── prisma/              # Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Class-validator for request validation
- **CORS Protection** - Configurable cross-origin requests
- **Role-based Access** - Different permissions per user type

## 🚀 Next Steps

1. **Set up PostgreSQL** and update DATABASE_URL
2. **Run migrations** to create database tables
3. **Create master account** for testing
4. **Test authentication** endpoints
5. **Integrate with frontend** by updating API calls

## 📞 Support

For questions or issues:

1. Check the Swagger documentation at `/api`
2. Review the Prisma schema in `prisma/schema.prisma`
3. Check the authentication flow in `src/auth/`

---

**Happy Coding! 🎉**
