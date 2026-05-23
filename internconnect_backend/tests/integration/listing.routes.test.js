/**
 * tests/integration/listing.routes.test.js
 * Listing endpoints integration tests with mocked Prisma
 */

// Mock @prisma/client BEFORE importing app
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
      groupBy: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

const request = require('supertest')
const app = require('../../src/app')
const { signAccessToken } = require('../../src/utils/jwt')

const prisma = require('../../src/utils/prisma')

describe('Listing Routes', () => {
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

  const mockListing = {
    id: 'listing-123',
    employerId: 'employer-123',
    title: 'Junior Developer',
    description: 'We are looking for a junior developer',
    jobField: 'Technology',
    location: 'San Francisco, CA',
    workHours: 'Full-time',
    stipend: '$5000/month',
    requirements: ['JavaScript', 'React'],
    deadline: new Date('2026-12-31'),
    status: 'ACTIVE',
    postedDate: new Date(),
    closedDate: null,
    viewCount: 0,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/listings', () => {
    it('should return paginated listings', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app).get('/api/listings')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('listings')
      expect(response.body.data).toHaveProperty('pagination')
      expect(Array.isArray(response.body.data.listings)).toBe(true)
    })

    it('should filter listings by location', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app).get('/api/listings?location=San%20Francisco')

      expect(response.status).toBe(200)
      expect(prisma.listing.findMany).toHaveBeenCalled()
    })

    it('should return 404 for non-existent listing', async () => {
      prisma.listing.findUnique.mockResolvedValueOnce(null)

      const response = await request(app).get('/api/listings/nonexistent-id')

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('GET /api/listings/:id', () => {
    it('should return a single listing with employer details', async () => {
      const mockListingWithEmployer = {
        ...mockListing,
        employer: {
          companyName: 'Tech Corp',
          contactPerson: 'Jane Smith',
          industry: 'Technology',
          location: 'San Francisco, CA',
          websiteUrl: 'https://techcorp.com',
          companyBio: 'We build great software',
          logoUrl: 'https://example.com/logo.png',
        },
        _count: { applications: 5 },
      }

      prisma.listing.findUnique.mockResolvedValueOnce(mockListingWithEmployer)

      const response = await request(app).get('/api/listings/listing-123')

      expect(response.status).toBe(200)
      expect(response.body.data.title).toBe('Junior Developer')
      expect(response.body.data.employer).toBeDefined()
    })

    it('should increment view count when listing is viewed', async () => {
      const mockListingWithEmployer = {
        ...mockListing,
        employer: {
          companyName: 'Tech Corp',
          contactPerson: 'Jane Smith',
          industry: 'Technology',
          location: 'San Francisco, CA',
          websiteUrl: 'https://techcorp.com',
          companyBio: 'We build great software',
          logoUrl: 'https://example.com/logo.png',
        },
        _count: { applications: 5 },
      }

      prisma.listing.findUnique.mockResolvedValueOnce(mockListingWithEmployer)
      prisma.listing.update.mockResolvedValueOnce({ ...mockListing, viewCount: 1 })

      await request(app).get('/api/listings/listing-123')

      // Update should be called to increment viewCount
      expect(prisma.listing.update).toHaveBeenCalled()
    })
  })

  describe('POST /api/listings', () => {
    it('should create a listing with EMPLOYER token', async () => {
      const newListing = { ...mockListing, id: 'new-listing-123' }
      prisma.listing.create.mockResolvedValueOnce(newListing)

      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Junior Developer',
          description: 'We are looking for a junior developer',
          job_field: 'Technology',
          location: 'San Francisco, CA',
          work_hours: 'Full-time',
          stipend: '$5000/month',
          requirements: ['JavaScript', 'React'],
          deadline: '2026-12-31',
        })

      expect(response.status).toBe(201)
      expect(response.body.data.title).toBe('Junior Developer')
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/listings')
        .send({
          title: 'Junior Developer',
          description: 'We are looking for a junior developer',
          job_field: 'Technology',
          location: 'San Francisco, CA',
          work_hours: 'Full-time',
          stipend: '$5000/month',
          requirements: ['JavaScript', 'React'],
          deadline: '2026-12-31',
        })

      expect(response.status).toBe(401)
    })

    it('should return 403 with STUDENT token', async () => {
      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Junior Developer',
          description: 'We are looking for a junior developer',
          job_field: 'Technology',
          location: 'San Francisco, CA',
          work_hours: 'Full-time',
          stipend: '$5000/month',
          requirements: ['JavaScript', 'React'],
          deadline: '2026-12-31',
        })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('should reject deadline in the past', async () => {
      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Junior Developer',
          description: 'We are looking for a junior developer',
          job_field: 'Technology',
          location: 'San Francisco, CA',
          work_hours: 'Full-time',
          stipend: '$5000/month',
          requirements: ['JavaScript', 'React'],
          deadline: '2020-01-01',
        })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PUT /api/listings/:id', () => {
    it('should update listing with EMPLOYER token (owner)', async () => {
      prisma.listing.findUnique.mockResolvedValueOnce(mockListing)
      prisma.listing.update.mockResolvedValueOnce({
        ...mockListing,
        title: 'Senior Developer',
      })

      const response = await request(app)
        .put('/api/listings/listing-123')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Senior Developer',
          description: 'We are looking for a senior developer',
        })

      expect(response.status).toBe(200)
    })

    it('should return 403 when updating someone else\'s listing', async () => {
      const otherEmployerListing = { ...mockListing, employerId: 'other-employer-123' }
      prisma.listing.findUnique.mockResolvedValueOnce(otherEmployerListing)

      const response = await request(app)
        .put('/api/listings/listing-123')
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Senior Developer',
        })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/listings/:id', () => {
    it('should delete listing with ADMIN token', async () => {
      prisma.listing.findUnique.mockResolvedValueOnce(mockListing)
      prisma.listing.delete.mockResolvedValueOnce(mockListing)

      const response = await request(app)
        .delete('/api/listings/listing-123')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
    })

    it('should return 404 when deleting non-existent listing', async () => {
      const error = new Error('Record to delete does not exist')
      error.code = 'P2025'
      prisma.listing.delete.mockRejectedValueOnce(error)

      const response = await request(app)
        .delete('/api/listings/nonexistent-id')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(404)
    })

    it('should return 401 without token', async () => {
      const response = await request(app).delete('/api/listings/listing-123')

      expect(response.status).toBe(401)
    })
  })

  describe('PUT /api/listings/:id/close', () => {
    it('should close a listing', async () => {
      prisma.listing.findUnique.mockResolvedValueOnce(mockListing)
      prisma.listing.update.mockResolvedValueOnce({
        ...mockListing,
        status: 'CLOSED',
        closedDate: new Date(),
      })

      const response = await request(app)
        .put('/api/listings/listing-123/close')
        .set('Authorization', `Bearer ${employerToken}`)

      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/listings/:id/applicants', () => {
    it('should return applicants for EMPLOYER (owner)', async () => {
      prisma.listing.findUnique.mockResolvedValueOnce({ employerId: 'employer-123' })
      prisma.application.findMany.mockResolvedValueOnce([
        {
          id: 'app-123',
          studentId: 'student-123',
          listingId: 'listing-123',
          status: 'SUBMITTED',
          student: {
            fullName: 'John Doe',
            avatarUrl: null,
            user: { email: 'student@example.com' },
          },
        },
      ])
      prisma.application.groupBy.mockResolvedValueOnce([
        { status: 'SUBMITTED', _count: { status: 1 } },
      ])

      const response = await request(app)
        .get('/api/listings/listing-123/applicants')
        .set('Authorization', `Bearer ${employerToken}`)

      expect(response.status).toBe(200)
    })

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/listings/listing-123/applicants')

      expect(response.status).toBe(401)
    })
  })
})
