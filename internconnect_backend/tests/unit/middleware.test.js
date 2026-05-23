/**
 * tests/unit/middleware.test.js
 * Unit tests for middleware functions (no database, no network)
 */

const { asyncHandler } = require('../../src/middleware/error.middleware')
const { requireRole } = require('../../src/middleware/role.middleware')
const { authenticate } = require('../../src/middleware/auth.middleware')
const { signAccessToken } = require('../../src/utils/jwt')

describe('Middleware Functions', () => {
  describe('asyncHandler', () => {
    it('should call the wrapped function with req, res, next', (done) => {
      const next = jest.fn()
      const req = {}
      const res = {}
      const fn = jest.fn(async () => {
        return undefined
      })

      const wrapped = asyncHandler(fn)
      wrapped(req, res, next)

      // Allow microtask to complete
      setImmediate(() => {
        expect(fn).toHaveBeenCalledWith(req, res, next)
        done()
      })
    })

    it('should catch promise rejection and pass to next()', async () => {
      const next = jest.fn()
      const req = {}
      const res = {}
      const error = new Error('Test error')
      const fn = jest.fn(async () => {
        throw error
      })

      const wrapped = asyncHandler(fn)
      await wrapped(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should handle sync functions that return promises', (done) => {
      const next = jest.fn()
      const req = {}
      const res = {}
      const fn = () => Promise.resolve()

      const wrapped = asyncHandler(fn)
      wrapped(req, res, next)

      // Allow microtask to complete
      setImmediate(() => {
        expect(next).not.toHaveBeenCalled() // next only called on error
        done()
      })
    })

    it('should handle sync functions that return rejected promises', async () => {
      const next = jest.fn()
      const req = {}
      const res = {}
      const error = new Error('Rejected')
      const fn = () => Promise.reject(error)

      const wrapped = asyncHandler(fn)
      await wrapped(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('requireRole', () => {
    it('should allow user with matching role', () => {
      const next = jest.fn()
      const res = {}
      const req = {
        user: { role: 'STUDENT' },
      }

      const middleware = requireRole('STUDENT')
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should block user without matching role', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        user: { role: 'STUDENT' },
      }

      const middleware = requireRole('ADMIN')
      middleware(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: expect.objectContaining({
            code: 'FORBIDDEN',
          }),
        })
      )
    })

    it('should allow any role when multiple roles provided', () => {
      const next = jest.fn()
      const res = {}
      const req = {
        user: { role: 'EMPLOYER' },
      }

      const middleware = requireRole('ADMIN', 'EMPLOYER', 'STUDENT')
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should block when user has different role from multiple options', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        user: { role: 'STUDENT' },
      }

      const middleware = requireRole('ADMIN', 'EMPLOYER')
      middleware(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should block when req.user is undefined', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {}

      const middleware = requireRole('ADMIN')
      middleware(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('should block when req.user.role is undefined', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        user: {},
      }

      const middleware = requireRole('ADMIN')
      middleware(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })
  })

  describe('authenticate', () => {
    it('should set req.user when valid token provided', () => {
      const next = jest.fn()
      const res = {}
      const payload = { sub: 'user-123', email: 'test@example.com', role: 'STUDENT' }
      const token = signAccessToken(payload)

      const req = {
        headers: { authorization: `Bearer ${token}` },
      }

      authenticate(req, res, next)

      expect(next).toHaveBeenCalled()
      expect(req.user).toBeDefined()
      expect(req.user.sub).toBe(payload.sub)
      expect(req.user.email).toBe(payload.email)
      expect(req.user.role).toBe(payload.role)
    })

    it('should return 401 when Authorization header is missing', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        headers: {},
      }

      authenticate(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'No token provided',
          }),
        })
      )
    })

    it('should return 401 when Authorization header does not start with Bearer', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        headers: { authorization: 'Basic xyz' },
      }

      authenticate(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('should return 401 for malformed token', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        headers: { authorization: 'Bearer invalid.token.here' },
      }

      authenticate(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          }),
        })
      )
    })

    it('should return 401 for expired token', (done) => {
      // Create an expired token by manually setting an old exp time
      const jwt = require('jsonwebtoken')
      const expiredToken = jwt.sign(
        { sub: 'user-123', email: 'test@example.com', role: 'STUDENT', exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET
      )

      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        headers: { authorization: `Bearer ${expiredToken}` },
      }

      authenticate(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
      done()
    })

    it('should handle empty Bearer token', () => {
      const next = jest.fn()
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      }
      const req = {
        headers: { authorization: 'Bearer ' },
      }

      authenticate(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })
})
