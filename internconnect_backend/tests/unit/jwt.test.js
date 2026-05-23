/**
 * tests/unit/jwt.test.js
 * Unit tests for JWT utility functions (no database, no network)
 */

const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../../src/utils/jwt')

describe('JWT Utilities', () => {
  const testPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'STUDENT',
  }

  describe('signAccessToken', () => {
    it('should return a valid JWT string', () => {
      const token = signAccessToken(testPayload)
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })

    it('should encode the payload correctly', () => {
      const token = signAccessToken(testPayload)
      const decoded = verifyAccessToken(token)
      expect(decoded.sub).toBe(testPayload.sub)
      expect(decoded.email).toBe(testPayload.email)
      expect(decoded.role).toBe(testPayload.role)
    })

    it('should create different tokens for different payloads', () => {
      const token1 = signAccessToken(testPayload)
      const token2 = signAccessToken({ ...testPayload, sub: 'user-456' })
      expect(token1).not.toBe(token2)
    })
  })

  describe('signRefreshToken', () => {
    it('should return a valid JWT string', () => {
      const token = signRefreshToken(testPayload)
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    it('should encode the payload correctly', () => {
      const token = signRefreshToken(testPayload)
      const decoded = verifyRefreshToken(token)
      expect(decoded.sub).toBe(testPayload.sub)
      expect(decoded.email).toBe(testPayload.email)
      expect(decoded.role).toBe(testPayload.role)
    })

    it('should use different secret than access token', () => {
      const accessToken = signAccessToken(testPayload)
      const refreshToken = signRefreshToken(testPayload)
      expect(accessToken).not.toBe(refreshToken)
    })
  })

  describe('verifyAccessToken', () => {
    it('should return the correct payload for a valid token', () => {
      const token = signAccessToken(testPayload)
      const decoded = verifyAccessToken(token)
      expect(decoded.sub).toBe(testPayload.sub)
      expect(decoded.email).toBe(testPayload.email)
      expect(decoded.role).toBe(testPayload.role)
    })

    it('should throw an error for an invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here')
      }).toThrow()
    })

    it('should throw an error for a malformed token', () => {
      expect(() => {
        verifyAccessToken('not-a-jwt')
      }).toThrow()
    })

    it('should throw an error when using wrong secret', () => {
      const token = signAccessToken(testPayload)
      // Temporarily change the secret
      const originalSecret = process.env.JWT_SECRET
      process.env.JWT_SECRET = 'wrong-secret'
      try {
        expect(() => {
          verifyAccessToken(token)
        }).toThrow()
      } finally {
        process.env.JWT_SECRET = originalSecret
      }
    })

    it('should reject a refresh token as access token', () => {
      const refreshToken = signRefreshToken(testPayload)
      expect(() => {
        verifyAccessToken(refreshToken)
      }).toThrow()
    })
  })

  describe('verifyRefreshToken', () => {
    it('should return the correct payload for a valid token', () => {
      const token = signRefreshToken(testPayload)
      const decoded = verifyRefreshToken(token)
      expect(decoded.sub).toBe(testPayload.sub)
      expect(decoded.email).toBe(testPayload.email)
      expect(decoded.role).toBe(testPayload.role)
    })

    it('should throw an error for an invalid token', () => {
      expect(() => {
        verifyRefreshToken('invalid.token.here')
      }).toThrow()
    })

    it('should reject an access token as refresh token', () => {
      const accessToken = signAccessToken(testPayload)
      expect(() => {
        verifyRefreshToken(accessToken)
      }).toThrow()
    })
  })

  describe('Token expiration', () => {
    it('should include exp claim in token', () => {
      const token = signAccessToken(testPayload)
      const decoded = verifyAccessToken(token)
      expect(decoded.exp).toBeDefined()
      expect(typeof decoded.exp).toBe('number')
    })

    it('should have different exp values for access and refresh tokens', () => {
      const accessToken = signAccessToken(testPayload)
      const refreshToken = signRefreshToken(testPayload)
      const decodedAccess = verifyAccessToken(accessToken)
      const decodedRefresh = verifyRefreshToken(refreshToken)
      // Refresh token should have later expiration
      expect(decodedRefresh.exp).toBeGreaterThan(decodedAccess.exp)
    })
  })
})
