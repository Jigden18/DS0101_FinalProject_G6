/**
 * tests/unit/pagination.test.js
 * Unit tests for pagination utility function
 */

const { paginate } = require('../../src/utils/pagination')

describe('Pagination Utility', () => {
  describe('paginate function', () => {
    it('should return correct shape with all required fields', () => {
      const result = paginate(1, 10, 100)
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('limit')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('total_pages')
      expect(result).toHaveProperty('has_next')
      expect(result).toHaveProperty('has_prev')
    })

    it('should handle basic pagination correctly', () => {
      const result = paginate(1, 10, 100)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.total).toBe(100)
      expect(result.total_pages).toBe(10)
      expect(result.has_next).toBe(true)
      expect(result.has_prev).toBe(false)
    })

    it('should calculate has_next correctly', () => {
      const lastPageResult = paginate(10, 10, 100)
      expect(lastPageResult.has_next).toBe(false)

      const midPageResult = paginate(5, 10, 100)
      expect(midPageResult.has_next).toBe(true)
    })

    it('should calculate has_prev correctly', () => {
      const firstPageResult = paginate(1, 10, 100)
      expect(firstPageResult.has_prev).toBe(false)

      const secondPageResult = paginate(2, 10, 100)
      expect(secondPageResult.has_prev).toBe(true)
    })

    it('should handle page 0 by converting to 1', () => {
      const result = paginate(0, 10, 100)
      expect(result.page).toBe(1)
    })

    it('should handle negative page by converting to 1', () => {
      const result = paginate(-5, 10, 100)
      expect(result.page).toBe(1)
    })

    it('should cap limit at 100', () => {
      const result = paginate(1, 200, 100)
      expect(result.limit).toBe(100)
    })

    it('should handle limit 0 by using default limit of 20', () => {
      const result = paginate(1, 0, 100)
      // When limit is 0 (falsy), it defaults to 20
      expect(result.limit).toBe(20)
    })

    it('should handle single page correctly', () => {
      const result = paginate(1, 100, 50)
      expect(result.total_pages).toBe(1)
      expect(result.has_next).toBe(false)
      expect(result.has_prev).toBe(false)
    })

    it('should calculate total_pages correctly for non-exact division', () => {
      const result = paginate(1, 10, 105)
      expect(result.total_pages).toBe(11)
    })

    it('should handle zero total items', () => {
      const result = paginate(1, 10, 0)
      expect(result.total_pages).toBe(0)
      expect(result.has_next).toBe(false)
    })

    it('should parse string numbers correctly', () => {
      const result = paginate('2', '20', '100')
      expect(result.page).toBe(2)
      expect(result.limit).toBe(20)
      expect(result.total).toBe(100)
      // All numeric values should be numbers, not strings
      expect(typeof result.page).toBe('number')
      expect(typeof result.limit).toBe('number')
      expect(typeof result.total).toBe('number')
    })

    it('should handle undefined values gracefully', () => {
      const result = paginate(undefined, undefined, 100)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20) // Default limit
    })

    it('should use default limit of 20 when not provided', () => {
      const result = paginate(1, undefined, 100)
      expect(result.limit).toBe(20)
    })

    it('should return all values as numbers', () => {
      const result = paginate('1', '10', 100)
      expect(typeof result.page).toBe('number')
      expect(typeof result.limit).toBe('number')
      expect(typeof result.total).toBe('number')
      expect(typeof result.total_pages).toBe('number')
    })

    it('should return boolean for has_next and has_prev', () => {
      const result = paginate(1, 10, 100)
      expect(typeof result.has_next).toBe('boolean')
      expect(typeof result.has_prev).toBe('boolean')
    })
  })
})
