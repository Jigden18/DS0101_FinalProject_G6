/**
 * tests/integration/application.routes.test.js
 * Application endpoints integration tests with mocked Prisma and Multer
 */

// Mock @prisma/client and Multer BEFORE importing app
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $transaction: jest.fn((queries) => Promise.all(queries)),
    $disconnect: jest.fn(),
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    listing: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

jest.mock('../../src/middleware/upload.middleware')

const request = require('supertest')
const app = require('../../src/app')
const { signAccessToken } = require('../../src/utils/jwt')

const prisma = require('../../src/utils/prisma')
const uploadMiddleware = require('../../src/middleware/upload.middleware')

describe('Application Routes', () => {
  const studentToken = signAccessToken({
    sub: 'student-123',
    email: 'student@example.com',
    role: 'STUDENT',
  })

  const employerToken = signAccessToken({
    sub: 'employer-123',
    email: 'employer@example.com',
    role: 'EMPLOYER',
  })

  const adminToken = signAccessToken({
    sub: 'admin-123',
    email: 'admin@example.com',
    role: 'ADMIN',
  })

  const mockApplication = {
    id: 'app-123',
    studentId: 'student-123',
    listingId: 'listing-123',
    coverLetter: 'I am interested in this position',
    resumeUrl: 'http://localhost:5000/uploads/resumes/resume-123.pdf',
    resumeFilename: 'resume.pdf',
    status: 'SUBMITTED',
    appliedDate: new Date(),
    reviewedDate: null,
    reviewNotes: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the upload middleware to set req.file and req.fileUrl
    uploadMiddleware.uploadResume.mockImplementation((req, res, next) => {
      req.file = {
        filename: 'resume-123.pdf',
        originalname: 'resume.pdf',
      }
      req.fileUrl = 'http://localhost:5000/uploads/resumes/resume-123.pdf'
      next()
    })
  })

  describe('POST /api/applications', () => {
    it('should submit application with STUDENT token', async () => {
      const mockListing = {
        id: 'listing-123',
        status: 'ACTIVE',
      }

      prisma.listing.findFirst.mockResolvedValueOnce(mockListing)
      prisma.application.create.mockResolvedValueOnce(mockApplication)

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          listing_id: 'listing-123',
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(201)
      expect(response.body.data.status).toBe('SUBMITTED')
      expect(response.body.data.message).toContain('successfully')
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          listing_id: 'listing-123',
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(401)
    })

    it('should return 403 with EMPLOYER token', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          listing_id: 'listing-123',
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('should return 400 when resume file is missing', async () => {
      // Override the middleware to not set req.file
      uploadMiddleware.uploadResume.mockImplementationOnce((req, res, next) => {
        next()
      })

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          listing_id: 'listing-123',
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when listing_id is missing', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 when cover_letter is empty', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          listing_id: 'listing-123',
          cover_letter: '',
        })

      expect(response.status).toBe(400)
    })

    it('should return 404 when listing does not exist or is inactive', async () => {
      prisma.listing.findFirst.mockResolvedValueOnce(null)

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          listing_id: 'nonexistent-id',
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })

    it('should return 409 when student already applied to listing', async () => {
      const mockListing = {
        id: 'listing-123',
        status: 'ACTIVE',
      }

      const duplicateError = new Error('Unique constraint failed')
      duplicateError.code = 'P2002'

      prisma.listing.findFirst.mockResolvedValueOnce(mockListing)
      prisma.application.create.mockRejectedValueOnce(duplicateError)

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          listing_id: 'listing-123',
          cover_letter: 'I am interested in this position',
        })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY')
    })

    it('should accept both snake_case and camelCase field names', async () => {
      const mockListing = {
        id: 'listing-123',
        status: 'ACTIVE',
      }

      prisma.listing.findFirst.mockResolvedValueOnce(mockListing)
      prisma.application.create.mockResolvedValueOnce(mockApplication)

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          listingId: 'listing-123', // camelCase
          coverLetter: 'I am interested in this position', // camelCase
        })

      expect(response.status).toBe(201)
    })
  })

  describe('GET /api/applications', () => {
    it('should return own applications for STUDENT', async () => {
      prisma.application.findMany.mockResolvedValueOnce([mockApplication])
      prisma.application.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('applications')
      expect(response.body.data).toHaveProperty('pagination')
    })

    it('should return applications from own listings for EMPLOYER', async () => {
      const mockEmployerApp = {
        ...mockApplication,
        listing: {
          id: 'listing-123',
          title: 'Junior Developer',
          jobField: 'Technology',
          employer: { companyName: 'Tech Corp' },
        },
        student: {
          fullName: 'John Doe',
          avatarUrl: null,
          user: { email: 'student@example.com' },
        },
      }

      prisma.application.findMany.mockResolvedValueOnce([mockEmployerApp])
      prisma.application.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${employerToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.applications).toHaveLength(1)
    })

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/applications')

      expect(response.status).toBe(401)
    })

    it('should filter by status if provided', async () => {
      prisma.application.findMany.mockResolvedValueOnce([mockApplication])
      prisma.application.count.mockResolvedValueOnce(1)

      await request(app)
        .get('/api/applications?status=SUBMITTED')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(prisma.application.findMany).toHaveBeenCalled()
    })
  })

  describe('GET /api/applications/:id', () => {
    it('should return application details', async () => {
      const mockAppWithDetails = {
        ...mockApplication,
        listing: {
          id: 'listing-123',
          title: 'Junior Developer',
          jobField: 'Technology',
        },
        student: {
          fullName: 'John Doe',
          avatarUrl: null,
        },
      }

      prisma.application.findUnique.mockResolvedValueOnce(mockAppWithDetails)

      const response = await request(app)
        .get('/api/applications/app-123')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe('app-123')
    })

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/applications/app-123')

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/applications/:id/status', () => {
    it('should update application status with EMPLOYER token', async () => {
      const updatedApp = { ...mockApplication, status: 'ACCEPTED' }
      prisma.application.findUnique.mockResolvedValueOnce({
        id: 'app-123',
        listing: { employerId: 'employer-123' },
      })
      prisma.application.update.mockResolvedValueOnce(updatedApp)

      const response = await request(app)
        .put('/api/applications/app-123/status')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          status: 'ACCEPTED',
        })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('ACCEPTED')
    })

    it('should update application status with ADMIN token', async () => {
      const updatedApp = { ...mockApplication, status: 'REJECTED' }
      prisma.application.findUnique.mockResolvedValueOnce({
        id: 'app-123',
        listing: { employerId: 'other-employer-123' },
      })
      prisma.application.update.mockResolvedValueOnce(updatedApp)

      const response = await request(app)
        .put('/api/applications/app-123/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'REJECTED',
          review_notes: 'Not a good fit',
        })

      expect(response.status).toBe(200)
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/applications/app-123/status')
        .send({ status: 'ACCEPTED' })

      expect(response.status).toBe(401)
    })

    it('should return 403 with STUDENT token', async () => {
      const response = await request(app)
        .put('/api/applications/app-123/status')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'ACCEPTED' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })
  })

  describe('DELETE /api/applications/:id', () => {
    it('should withdraw application with STUDENT token', async () => {
      prisma.application.findUnique.mockResolvedValueOnce(mockApplication)
      prisma.application.delete.mockResolvedValueOnce(mockApplication)

      const response = await request(app)
        .delete('/api/applications/app-123')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(200)
    })

    it('should return 401 without token', async () => {
      const response = await request(app).delete('/api/applications/app-123')

      expect(response.status).toBe(401)
    })

    it('should return 403 with EMPLOYER token', async () => {
      const response = await request(app)
        .delete('/api/applications/app-123')
        .set('Authorization', `Bearer ${employerToken}`)

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/applications/check', () => {
    it('should check if student already applied to listing', async () => {
      prisma.application.findFirst.mockResolvedValueOnce(mockApplication)

      const response = await request(app)
        .get('/api/applications/check?listing_id=listing-123')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.has_applied).toBe(true)
    })

    it('should return false if student has not applied', async () => {
      prisma.application.findFirst.mockResolvedValueOnce(null)

      const response = await request(app)
        .get('/api/applications/check?listing_id=listing-123')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(200)
      expect(response.body.data.has_applied).toBe(false)
    })

    it('should return 400 when listing_id is missing', async () => {
      const response = await request(app)
        .get('/api/applications/check')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(400)
    })
  })
})
