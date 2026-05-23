/**
 * tests/integration/auth.routes.test.js
 * Authentication endpoints integration tests with mocked Prisma
 */

// Mock @prisma/client BEFORE importing app
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    listing: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

const request = require('supertest')
const app = require('../../src/app')
const bcrypt = require('bcryptjs')
const { signAccessToken } = require('../../src/utils/jwt')

const prisma = require('../../src/utils/prisma')

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register/student', () => {
    it('should register a student with valid data', async () => {
      const mockUser = {
        id: 'student-123',
        email: 'student@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
      }

      prisma.user.create.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/register/student')
        .send({
          full_name: 'John Doe',
          email: 'student@example.com',
          password: 'SecurePass123!',
          university: 'University of Testing',
          course: 'Computer Science',
          graduation_year: 2025,
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('status', 201)
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data.user.email).toBe('student@example.com')
      expect(response.body.data.user.role).toBe('STUDENT')
    })

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register/student')
        .send({
          email: 'student@example.com',
          password: 'SecurePass123!',
          // Missing: full_name, university, course, graduation_year
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBeDefined()
    })

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register/student')
        .send({
          full_name: 'John Doe',
          password: 'SecurePass123!',
          university: 'University of Testing',
          course: 'Computer Science',
          graduation_year: 2025,
        })

      expect(response.status).toBe(400)
    })

    it('should hash password before storing', async () => {
      const password = 'SecurePass123!'
      const mockUser = {
        id: 'student-123',
        email: 'student@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
      }

      prisma.user.create.mockResolvedValueOnce(mockUser)

      await request(app)
        .post('/api/auth/register/student')
        .send({
          full_name: 'John Doe',
          email: 'student@example.com',
          password,
          university: 'University of Testing',
          course: 'Computer Science',
          graduation_year: 2025,
        })

      expect(prisma.user.create).toHaveBeenCalled()
      const callData = prisma.user.create.mock.calls[0][0].data
      expect(callData.passwordHash).not.toBe(password)
    })

    it('should set status to ACTIVE for student', async () => {
      const mockUser = {
        id: 'student-123',
        email: 'student@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
      }

      prisma.user.create.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/register/student')
        .send({
          full_name: 'John Doe',
          email: 'student@example.com',
          password: 'SecurePass123!',
          university: 'University of Testing',
          course: 'Computer Science',
          graduation_year: 2025,
        })

      expect(response.body.data.user.status).toBe('ACTIVE')
    })

    it('should return 409 if email already exists', async () => {
      const error = new Error('Unique constraint failed on the fields: (`email`)')
      error.code = 'P2002'
      error.meta = { target: ['email'] }

      prisma.user.create.mockRejectedValueOnce(error)

      const response = await request(app)
        .post('/api/auth/register/student')
        .send({
          full_name: 'John Doe',
          email: 'existing@example.com',
          password: 'SecurePass123!',
          university: 'University of Testing',
          course: 'Computer Science',
          graduation_year: 2025,
        })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY')
    })
  })

  describe('POST /api/auth/register/employer', () => {
    it('should register an employer with valid data', async () => {
      const mockUser = {
        id: 'employer-123',
        email: 'employer@company.com',
        role: 'EMPLOYER',
        status: 'PENDING',
      }

      prisma.user.create.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/register/employer')
        .send({
          company_name: 'Tech Corp',
          contact_person: 'Jane Smith',
          email: 'employer@company.com',
          password: 'SecurePass123!',
          industry: 'Technology',
          location: 'San Francisco, CA',
        })

      expect(response.status).toBe(201)
      expect(response.body.data.email).toBe('employer@company.com')
      expect(response.body.data.role).toBe('EMPLOYER')
      expect(response.body.data.status).toBe('PENDING')
    })

    it('should set status to PENDING for employer', async () => {
      const mockUser = {
        id: 'employer-123',
        email: 'employer@company.com',
        role: 'EMPLOYER',
        status: 'PENDING',
      }

      prisma.user.create.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/register/employer')
        .send({
          company_name: 'Tech Corp',
          contact_person: 'Jane Smith',
          email: 'employer@company.com',
          password: 'SecurePass123!',
          industry: 'Technology',
          location: 'San Francisco, CA',
        })

      expect(response.body.data.status).toBe('PENDING')
      expect(response.body.data.message).toContain('pending')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await bcrypt.hash(password, 12)
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        student: { fullName: 'Test User' },
        employer: null,
        admin: null,
      }

      prisma.user.findUnique.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password,
        })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('refreshToken')
    })

    it('should return 401 with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPass123!', 12)
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        student: { fullName: 'Test User' },
        employer: null,
        admin: null,
      }

      prisma.user.findUnique.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 401 when user not found', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 403 if account is pending approval', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await bcrypt.hash(password, 12)
      const mockUser = {
        id: 'user-123',
        email: 'employer@example.com',
        passwordHash: hashedPassword,
        role: 'EMPLOYER',
        status: 'PENDING',
        student: null,
        employer: { companyName: 'Test Corp' },
        admin: null,
      }

      prisma.user.findUnique.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'employer@example.com',
          password,
        })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
      expect(response.body.error.message).toContain('pending')
    })

    it('should return 403 if account is deactivated', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await bcrypt.hash(password, 12)
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        status: 'INACTIVE',
        student: { fullName: 'Test User' },
        employer: null,
        admin: null,
      }

      prisma.user.findUnique.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password,
        })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
      expect(response.body.error.message).toContain('deactivated')
    })

    it('should return tokens with correct payload', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await bcrypt.hash(password, 12)
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        status: 'ACTIVE',
        student: { fullName: 'Test User' },
        employer: null,
        admin: null,
      }

      prisma.user.findUnique.mockResolvedValueOnce(mockUser)

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password,
        })

      expect(response.body.data.user.id).toBe('user-123')
      expect(response.body.data.user.email).toBe('test@example.com')
      expect(response.body.data.user.role).toBe('STUDENT')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const token = signAccessToken({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT',
      })

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.message).toContain('successfully')
    })

    it('should return 401 without token', async () => {
      const response = await request(app).post('/api/auth/logout')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh-token', () => {
    it('should return new access token with valid refresh token', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT',
      }
      const { signRefreshToken } = require('../../src/utils/jwt')
      const refreshToken = signRefreshToken(payload)
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
      })

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refresh_token: refreshToken,
        })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('token')
    })

    it('should return 400 when refresh_token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })
})
