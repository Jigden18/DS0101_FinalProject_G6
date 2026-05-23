// ============================================
// Jest Setup File — Configure Test Environment
// ============================================

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-do-not-use-in-production'
process.env.JWT_EXPIRES_IN = '24h'
process.env.JWT_REFRESH_EXPIRES_IN = '7d'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/internconnect_test'
process.env.CORS_ORIGIN = '*'
process.env.PORT = 5000
process.env.MAX_RESUME_SIZE_MB = 5
process.env.MAX_AVATAR_SIZE_MB = 2

