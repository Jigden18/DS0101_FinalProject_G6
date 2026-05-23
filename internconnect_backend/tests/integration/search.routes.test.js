/**
 * tests/integration/search.routes.test.js
 * Search endpoints integration tests with mocked Prisma
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
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  })),
}))

const request = require('supertest')
const app = require('../../src/app')

const prisma = require('../../src/utils/prisma')

describe('Search Routes', () => {
  const mockListing = {
    id: 'listing-123',
    title: 'Software Engineer',
    description: 'We are looking for a software engineer',
    jobField: 'Technology',
    location: 'San Francisco, CA',
    workHours: 'Full-time',
    stipend: '$5000/month',
    requirements: ['JavaScript', 'React'],
    deadline: new Date('2026-12-31'),
    status: 'ACTIVE',
    postedDate: new Date(),
    closedDate: null,
    viewCount: 10,
    employer: {
      companyName: 'Tech Corp',
      logoUrl: 'https://example.com/logo.png',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/search/listings', () => {
    it('should return listings matching search query', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'Software Engineer',
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('results')
      expect(response.body.data).toHaveProperty('pagination')
      expect(response.body.data.results).toHaveLength(1)
    })

    it('should apply filters when provided', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          filters: {
            location: ['San Francisco, CA'],
            jobField: ['Technology'],
            workHours: ['Full-time'],
          },
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      expect(prisma.listing.findMany).toHaveBeenCalled()
      const callArgs = prisma.listing.findMany.mock.calls[0][0]
      expect(callArgs.where.location).toBeDefined()
      expect(callArgs.where.jobField).toBeDefined()
    })

    it('should support deadline_after filter', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          filters: {
            deadline_after: '2026-06-01',
          },
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      const callArgs = prisma.listing.findMany.mock.calls[0][0]
      expect(callArgs.where.deadline).toBeDefined()
    })

    it('should support sorting', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          sort: 'deadline',
          order: 'asc',
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      const callArgs = prisma.listing.findMany.mock.calls[0][0]
      expect(callArgs.orderBy).toEqual({ deadline: 'asc' })
    })

    it('should support pagination', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(50)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          page: 2,
          limit: 20,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.page).toBe(2)
      expect(response.body.data.limit).toBe(20)
      const callArgs = prisma.listing.findMany.mock.calls[0][0]
      expect(callArgs.skip).toBe(20) // (page - 1) * limit
    })

    it('should default to page 1 and limit 20', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
        })

      expect(response.status).toBe(200)
      expect(response.body.data.page).toBe(1)
      expect(response.body.data.limit).toBe(20)
    })

    it('should cap limit at 100', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          page: 1,
          limit: 200,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.limit).toBe(100)
    })

    it('should return empty results when no matches', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([])
      prisma.listing.count.mockResolvedValueOnce(0)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'nonexistent-job-title',
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.results).toHaveLength(0)
      expect(response.body.data.total).toBe(0)
    })

    it('should include employer details in results', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.results[0].employer).toBeDefined()
      expect(response.body.data.results[0].employer.companyName).toBe('Tech Corp')
    })

    it('should use safe sort values (default to postedDate)', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(1)

      await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          sort: 'invalid_sort_field',
          page: 1,
          limit: 20,
        })

      const callArgs = prisma.listing.findMany.mock.calls[0][0]
      expect(callArgs.orderBy).toEqual({ postedDate: 'desc' })
    })

    it('should return pagination info', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([mockListing])
      prisma.listing.count.mockResolvedValueOnce(50)

      const response = await request(app)
        .post('/api/search/listings')
        .send({
          q: 'engineer',
          page: 1,
          limit: 20,
        })

      expect(response.status).toBe(200)
      expect(response.body.data.pagination).toHaveProperty('total_pages', 3)
      expect(response.body.data.pagination).toHaveProperty('has_next', true)
    })
  })

  describe('GET /api/search/suggestions', () => {
    it('should return title suggestions for query', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([
        { title: 'Junior Software Engineer' },
        { title: 'Senior Software Engineer' },
        { title: 'Software Engineer Manager' },
      ])

      const response = await request(app)
        .get('/api/search/suggestions?q=software')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('suggestions')
      expect(Array.isArray(response.body.data.suggestions)).toBe(true)
    })

    it('should deduplicate suggestions', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([
        { title: 'Software Engineer' },
        { title: 'Software Engineer' },
        { title: 'Software Engineer Manager' },
      ])

      const response = await request(app)
        .get('/api/search/suggestions?q=software')

      expect(response.status).toBe(200)
      expect(response.body.data.suggestions).toHaveLength(2)
    })

    it('should limit to 5 suggestions', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([
        { title: 'Suggestion 1' },
        { title: 'Suggestion 2' },
        { title: 'Suggestion 3' },
        { title: 'Suggestion 4' },
        { title: 'Suggestion 5' },
      ])

      const response = await request(app)
        .get('/api/search/suggestions?q=suggestion')

      expect(response.status).toBe(200)
      expect(response.body.data.suggestions.length).toBeLessThanOrEqual(5)
      expect(prisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      )
    })

    it('should return 400 when q parameter is missing', async () => {
      const response = await request(app).get('/api/search/suggestions')

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 400 when q parameter is empty', async () => {
      const response = await request(app).get('/api/search/suggestions?q=')

      expect(response.status).toBe(400)
    })

    it('should return empty array when no suggestions found', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([])

      const response = await request(app)
        .get('/api/search/suggestions?q=nonexistent')

      expect(response.status).toBe(200)
      expect(response.body.data.suggestions).toHaveLength(0)
    })

    it('should trim query parameter', async () => {
      prisma.listing.findMany.mockResolvedValueOnce([
        { title: 'Junior Software Engineer' },
      ])

      const response = await request(app)
        .get('/api/search/suggestions?q=%20software%20')

      expect(response.status).toBe(200)
      const callArgs = prisma.listing.findMany.mock.calls[0][0]
      expect(callArgs.where.title.contains).toBe('software')
    })
  })
})
