/**
 * tests/integration/health.test.js
 * Health check endpoint test
 */

// Mock @prisma/client BEFORE importing app
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    listing: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn(), delete: jest.fn() },
    application: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn(), delete: jest.fn() },
  })),
}))

const request = require('supertest')
const app = require('../../src/app')

describe('Health Check', () => {
  it('GET /health should return 200 with status ok', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', 'ok')
    expect(response.body).toHaveProperty('timestamp')
  }, 10000)

  it('health endpoint should always be accessible without auth', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
  })

  it('should return timestamp in ISO format', async () => {
    const response = await request(app).get('/health')
    expect(response.body).toHaveProperty('timestamp')
    expect(typeof response.body.timestamp).toBe('string')
    // Verify it's a valid ISO date string
    expect(() => new Date(response.body.timestamp).toISOString()).not.toThrow()
  })
})

