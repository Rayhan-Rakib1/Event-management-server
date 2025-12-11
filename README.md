# 🎯 Events & Activities Platform - Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-316192?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)

**Scalable RESTful API for Events & Activities Platform**

[API Documentation](#api-documentation) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About The Project

This is the backend API for the **Events & Activities Platform** - a comprehensive RESTful service built with Node.js, Express, and Prisma ORM. The API handles user authentication, event management, payment processing, and real-time notifications.

### Key Capabilities

- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 🎫 **Event Management** - Full CRUD operations for events and activities
- 💳 **Payment Integration** - Secure payment processing with multiple gateways
- ⭐ **Review System** - Ratings and reviews for hosts and events
- 📊 **Analytics** - Comprehensive dashboard metrics and reporting
- 🔍 **Advanced Search** - Powerful filtering and search capabilities
- 📧 **Email Notifications** - Automated email system for events
- 🛡️ **Security** - Input validation, rate limiting, and SQL injection protection

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         API Gateway/Router          │
│  (Express.js + Middleware Layer)    │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴─────────┬─────────────────┬──────────────┐
    ▼                   ▼                 ▼              ▼
┌─────────┐      ┌──────────┐     ┌──────────┐   ┌──────────┐
│  Auth   │      │  Events  │     │ Payments │   │  Users   │
│ Service │      │ Service  │     │ Service  │   │ Service  │
└────┬────┘      └─────┬────┘     └─────┬────┘   └────┬─────┘
     │                 │                │             │
     └─────────────────┴────────────────┴─────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Prisma ORM    │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │   PostgreSQL   │
              └────────────────┘
```

---

## 🛠️ Tech Stack

### Core Framework
- **Runtime** - [Node.js](https://nodejs.org/) v18+
- **Framework** - [Express.js](https://expressjs.com/) v4.x
- **Language** - [TypeScript](https://www.typescriptlang.org/) v5.x
- **ORM** - [Prisma](https://www.prisma.io/) v5.x

### Database
- **Primary Database** - [PostgreSQL](https://www.postgresql.org/) v15+
- **Caching** - Redis (Optional)
- **File Storage** - Cloudinary / AWS S3

### Authentication & Security
- **Authentication** - JWT (jsonwebtoken)
- **Password Hashing** - bcryptjs
- **Validation** - Zod / Joi
- **Rate Limiting** - express-rate-limit
- **CORS** - cors
- **Helmet** - Security headers

### Payment Integration
- **Stripe** - International payments
- **SSLCommerz** - Bangladesh payments
- **AmarPay** - Alternative payment gateway

### Developer Tools
- **API Documentation** - Swagger / Postman
- **Testing** - Jest / Supertest
- **Linting** - ESLint + Prettier
- **Logger** - Winston / Morgan
- **Process Manager** - PM2

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 15.0
```

Optional but recommended:
```bash
redis >= 7.0.0  # For caching
docker >= 24.0.0  # For containerization
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/events-activities-backend.git
cd events-activities-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Set up the database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npm run seed
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/events_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (using Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@eventsplatform.com

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# SSLCommerz Payment Gateway
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_LIVE=false

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Database Setup

**Using Docker (Recommended for Development)**

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Run migrations
npx prisma migrate dev

# Open Prisma Studio to view database
npx prisma studio
```

**Manual Setup**

```bash
# Create database
createdb events_db

# Update DATABASE_URL in .env
# Run migrations
npx prisma migrate dev
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # Prisma client configuration
│   │   ├── cloudinary.ts         # Cloudinary setup
│   │   └── payment.ts            # Payment gateway configs
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.interface.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.routes.ts
│   │   │   └── users.validation.ts
│   │   ├── events/
│   │   │   ├── events.controller.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.routes.ts
│   │   │   └── events.validation.ts
│   │   ├── participants/
│   │   │   ├── participants.controller.ts
│   │   │   ├── participants.service.ts
│   │   │   └── participants.routes.ts
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── stripe.service.ts
│   │   │   └── sslcommerz.service.ts
│   │   ├── reviews/
│   │   │   ├── reviews.controller.ts
│   │   │   ├── reviews.service.ts
│   │   │   └── reviews.routes.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # JWT verification
│   │   ├── role.middleware.ts     # Role-based access
│   │   ├── validate.middleware.ts # Request validation
│   │   ├── error.middleware.ts    # Error handling
│   │   ├── upload.middleware.ts   # File upload
│   │   └── rateLimiter.middleware.ts
│   ├── utils/
│   │   ├── ApiError.ts            # Custom error class
│   │   ├── ApiResponse.ts         # Standard response
│   │   ├── asyncHandler.ts        # Async wrapper
│   │   ├── catchAsync.ts          # Error catcher
│   │   ├── email.service.ts       # Email sender
│   │   ├── logger.ts              # Winston logger
│   │   └── helpers.ts             # Helper functions
│   ├── types/
│   │   ├── express.d.ts           # Express type extensions
│   │   └── index.ts               # Common types
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Server entry point
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration files
│   └── seed.ts                    # Database seeder
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| POST | `/auth/refresh-token` | Refresh access token | ✅ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users (Admin) | ✅ Admin |
| GET | `/users/:id` | Get user by ID | ✅ |
| PUT | `/users/:id` | Update user profile | ✅ Owner |
| DELETE | `/users/:id` | Delete user | ✅ Admin |
| PATCH | `/users/:id/role` | Update user role | ✅ Admin |
| GET | `/users/:id/events` | Get user's events | ✅ |
| GET | `/users/:id/reviews` | Get user's reviews | ✅ |

### Event Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/events` | Get all events (with filters) | ❌ |
| POST | `/events` | Create new event | ✅ Host |
| GET | `/events/:id` | Get event details | ❌ |
| PUT | `/events/:id` | Update event | ✅ Owner/Admin |
| DELETE | `/events/:id` | Delete event | ✅ Owner/Admin |
| GET | `/events/category/:category` | Get events by category | ❌ |
| GET | `/events/search` | Search events | ❌ |
| POST | `/events/:id/join` | Join an event | ✅ User |
| POST | `/events/:id/leave` | Leave an event | ✅ User |
| GET | `/events/:id/participants` | Get event participants | ✅ |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/create-intent` | Create payment intent | ✅ |
| POST | `/payments/stripe/webhook` | Stripe webhook handler | ❌ |
| POST | `/payments/sslcommerz/success` | SSLCommerz success | ❌ |
| POST | `/payments/sslcommerz/fail` | SSLCommerz failure | ❌ |
| GET | `/payments/user/:userId` | Get user payments | ✅ |
| GET | `/payments/event/:eventId` | Get event payments | ✅ Host |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reviews` | Create review | ✅ User |
| GET | `/reviews/host/:hostId` | Get host reviews | ❌ |
| GET | `/reviews/event/:eventId` | Get event reviews | ❌ |
| PUT | `/reviews/:id` | Update review | ✅ Owner |
| DELETE | `/reviews/:id` | Delete review | ✅ Owner/Admin |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/dashboard` | Get dashboard stats | ✅ Admin |
| GET | `/admin/users` | Manage users | ✅ Admin |
| GET | `/admin/events` | Manage events | ✅ Admin |
| PATCH | `/admin/events/:id/status` | Update event status | ✅ Admin |
| GET | `/admin/payments` | View all payments | ✅ Admin |

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow

```typescript
// 1. User Registration
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

// 2. User Login - Receives JWT Token
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}

// 3. Use Token in Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Role-Based Access Control

```typescript
enum Role {
  USER = 'USER',
  HOST = 'HOST', 
  ADMIN = 'ADMIN'
}

// Middleware usage
router.post('/events', 
  authenticate,
  authorize([Role.HOST, Role.ADMIN]),
  createEvent
);
```

---

## 🗄️ Database Schema

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(USER)
  profileImage  String?
  bio           String?
  location      String?
  interests     String[]
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  hostedEvents  Event[]   @relation("HostedEvents")
  participants  Participant[]
  reviews       Review[]
  payments      Payment[]
}

model Event {
  id              String      @id @default(cuid())
  title           String
  description     String
  category        String
  date            DateTime
  location        String
  minParticipants Int
  maxParticipants Int
  joiningFee      Float       @default(0)
  status          EventStatus @default(OPEN)
  image           String?
  hostId          String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  host         User          @relation("HostedEvents", fields: [hostId], references: [id])
  participants Participant[]
  reviews      Review[]
  payments     Payment[]
}

model Participant {
  id            String          @id @default(cuid())
  userId        String
  eventId       String
  status        ParticipantStatus @default(JOINED)
  paymentStatus PaymentStatus   @default(PENDING)
  paidAmount    Float?
  paymentDate   DateTime?
  joinedAt      DateTime        @default(now())

  user  User  @relation(fields: [userId], references: [id])
  event Event @relation(fields: [eventId], references: [id])

  @@unique([userId, eventId])
}

model Payment {
  id              String        @id @default(cuid())
  userId          String
  eventId         String
  amount          Float
  status          PaymentStatus @default(PENDING)
  paymentMethod   String
  transactionId   String?       @unique
  createdAt       DateTime      @default(now())

  user  User  @relation(fields: [userId], references: [id])
  event Event @relation(fields: [eventId], references: [id])
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  eventId   String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  event Event @relation(fields: [eventId], references: [id])

  @@unique([userId, eventId])
}

enum Role {
  USER
  HOST
  ADMIN
}

enum EventStatus {
  OPEN
  FULL
  CANCELLED
  COMPLETED
}

enum ParticipantStatus {
  JOINED
  CANCELLED
  ATTENDED
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIAL
  REFUNDED
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```typescript
{
  "success": false,
  "message": "Error message here",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "stack": "Error stack trace (development only)"
}
```

### Custom Error Classes

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    stack = ''
  ) {
    super(message);
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Usage
throw new ApiError(404, 'Event not found');
throw new ApiError(401, 'Unauthorized access');
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- users.test.ts

# Run in watch mode
npm run test:watch
```

### Test Structure

```typescript
describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test123456'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
```

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run migrate` | Run database migrations |
| `npm run migrate:reset` | Reset database |
| `npm run seed` | Seed database with sample data |
| `npm run studio` | Open Prisma Studio |

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build image
docker build -t events-api .

# Run container
docker run -p 5000:5000 --env-file .env events-api
```

### Using Docker Compose

```bash
docker-compose up -d
```

### Environment-Specific Configs

**Production Checklist:**
- ✅ Set `NODE_ENV=production`
- ✅ Use strong JWT secrets
- ✅ Enable HTTPS
- ✅ Set up proper CORS policies
- ✅ Configure rate limiting
- ✅ Set up monitoring and logging
- ✅ Use environment variables for secrets
- ✅ Enable database connection pooling

---

## 📊 Monitoring & Logging

### Winston Logger

```typescript
import logger from './utils/logger';

logger.info('User registered successfully');
logger.error('Database connection failed', { error });
logger.warn('Rate limit exceeded');
```

### Health Check Endpoint

```
GET /api/v1/health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write unit tests for new features
- Update API documentation
- Use meaningful commit messages
- Follow the existing code structure

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**API Maintainer** - [@yourname](https://twitter.com/yourname)

**Project Link** - [https://github.com/yourusername/events-activities-backend](https://github.com/yourusername/events-activities-backend)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Stripe](https://stripe.com/)

---

<div align="center">

**Built with 💙 by Your Team**

⭐ Star this repo if you find it helpful!

</div>