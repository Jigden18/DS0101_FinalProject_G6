/**
 * src/__tests__/ListingsPage.test.tsx
 * Tests for the real ListingsPage component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingsPage from '@/app/listings/page'
import * as apiClient from '@/lib/api-client'

// ── Mock all dependencies BEFORE component import ──────────────────────────

jest.mock('@/lib/api-client', () => ({
  getListings: jest.fn(),
  getConstants: jest.fn(),
  searchListings: jest.fn(),
  getSuggestions: jest.fn(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

jest.mock('@/components/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state">No listings found</div>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, variant }: any) => (
    <button onClick={onClick} type={type}>{children}</button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, className }: any) => (
    <h2 className={className}>{children}</h2>
  ),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarImage: ({ alt }: any) => <img alt={alt} />,
  AvatarFallback: ({ children }: any) => <span>{children}</span>,
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: any) => <div>{children}</div>,
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <h2>{children}</h2>,
  SheetDescription: ({ children }: any) => <p>{children}</p>,
  SheetTrigger: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('@/components/ui/calendar', () => ({
  Calendar: () => <div data-testid="calendar" />,
}))

jest.mock('lucide-react', () => ({
  Search: () => <span>Search</span>,
  MapPin: () => <span>MapPin</span>,
  CalendarIcon: () => <span>CalendarIcon</span>,
  Clock: () => <span>Clock</span>,
  DollarSign: () => <span>DollarSign</span>,
  SlidersHorizontal: () => <span>SlidersHorizontal</span>,
  X: () => <span>X</span>,
  Loader2: () => <span data-testid="loader">Loading...</span>,
}))

jest.mock('date-fns', () => ({
  format: jest.fn(() => 'January 1, 2026'),
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

// ── Shared test data ───────────────────────────────────────────────────────

const mockListing = {
  id: 'listing-1',
  title: 'Junior Software Engineer',
  description: 'We are looking for a junior software engineer',
  location: 'San Francisco, CA',
  workHours: 'Full-time',
  stipend: '$5000/month',
  deadline: '2026-12-31T00:00:00.000Z',
  jobField: 'Technology',
  employerId: 'employer-123',
  status: 'ACTIVE',
  employer: {
    id: 'employer-123',
    companyName: 'Tech Corp',
    logo: null,
  },
}

const mockConstants = {
  job_fields: ['Technology', 'Finance', 'Marketing'],
  locations: ['San Francisco, CA', 'New York, NY'],
  work_hours: ['Full-time', 'Part-time'],
}

const defaultSearchResult = {
  data: { results: [mockListing], total: 1 },
  error: null,
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ListingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiClient.getConstants as jest.Mock).mockResolvedValue({
      data: mockConstants,
      error: null,
    })
    ;(apiClient.searchListings as jest.Mock).mockResolvedValue(
      defaultSearchResult
    )
    ;(apiClient.getSuggestions as jest.Mock).mockResolvedValue({
      data: { suggestions: [] },
    })
  })

  // ── Initial Render ───────────────────────────────────────────────────────

  describe('Initial Render', () => {
    it('should render page heading', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Browse Listings')).toBeInTheDocument()
      })
    })

    it('should render page subheading', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(
          screen.getByText(/Find internships and job opportunities/i)
        ).toBeInTheDocument()
      })
    })

    it('should show loading spinner on initial load', () => {
      ;(apiClient.searchListings as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(defaultSearchResult), 200)
          )
      )

      render(<ListingsPage />)
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should call getConstants on mount', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(apiClient.getConstants).toHaveBeenCalled()
      })
    })

    it('should call searchListings on mount', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(apiClient.searchListings).toHaveBeenCalled()
      })
    })
  })

  // ── Listing Cards ────────────────────────────────────────────────────────

  describe('Listing Cards', () => {
    it('should render listing title', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Junior Software Engineer')).toBeInTheDocument()
      })
    })

    it('should render company name', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      })
    })

    it('should render location', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        // appears in both listing card and location filter dropdown
        const locations = screen.getAllByText('San Francisco, CA')
        expect(locations.length).toBeGreaterThan(0)
      })
    })

    it('should render work hours', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        // appears in both listing card and work hours filter dropdown
        const workHours = screen.getAllByText('Full-time')
        expect(workHours.length).toBeGreaterThan(0)
      })
    })

    it('should render stipend', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('$5000/month')).toBeInTheDocument()
      })
    })

    it('should render listing as a link to detail page', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        const link = screen.getByRole('link', {
          name: /Junior Software Engineer/i,
        })
        expect(link).toHaveAttribute('href', '/listings/listing-1')
      })
    })

    it('should render multiple listings', async () => {
      ;(apiClient.searchListings as jest.Mock).mockResolvedValue({
        data: {
          results: [
            mockListing,
            { ...mockListing, id: 'listing-2', title: 'Senior Developer' },
            { ...mockListing, id: 'listing-3', title: 'DevOps Engineer' },
          ],
          total: 3,
        },
        error: null,
      })

      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Junior Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Senior Developer')).toBeInTheDocument()
        expect(screen.getByText('DevOps Engineer')).toBeInTheDocument()
      })
    })

    it('should show company initials in avatar when no logo', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('TE')).toBeInTheDocument()
      })
    })

    it('should fallback to "Company" when employer is missing', async () => {
      ;(apiClient.searchListings as jest.Mock).mockResolvedValue({
        data: {
          results: [{ ...mockListing, employer: undefined }],
          total: 1,
        },
        error: null,
      })

      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText('Company')).toBeInTheDocument()
      })
    })
  })

  // ── Results Count ────────────────────────────────────────────────────────

  describe('Results Count', () => {
    it('should show correct singular listing count', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 listing/)).toBeInTheDocument()
      })
    })

    it('should show correct plural listings count', async () => {
      ;(apiClient.searchListings as jest.Mock).mockResolvedValue({
        data: {
          results: [
            mockListing,
            { ...mockListing, id: 'listing-2', title: 'Senior Developer' },
          ],
          total: 2,
        },
        error: null,
      })

      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByText(/Showing 2 listings/)).toBeInTheDocument()
      })
    })

    it('should show empty state when no listings', async () => {
      ;(apiClient.searchListings as jest.Mock).mockResolvedValue({
        data: { results: [], total: 0 },
        error: null,
      })

      render(<ListingsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      })
    })
  })

  // ── Search ───────────────────────────────────────────────────────────────

  describe('Search', () => {
    it('should render search input', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search by title or description...')
        ).toBeInTheDocument()
      })
    })

    it('should call searchListings when search form is submitted', async () => {
      render(<ListingsPage />)

      await waitFor(() =>
        screen.getByPlaceholderText('Search by title or description...')
      )

      const input = screen.getByPlaceholderText(
        'Search by title or description...'
      )
      await userEvent.type(input, 'engineer')

      const searchButton = screen.getByRole('button', { name: /^search$/i })
      fireEvent.click(searchButton)

      await waitFor(() => {
        expect(apiClient.searchListings).toHaveBeenCalledWith(
          expect.objectContaining({ q: 'engineer' })
        )
      })
    })

    it('should show autocomplete suggestions when typing', async () => {
      ;(apiClient.getSuggestions as jest.Mock).mockResolvedValue({
        data: { suggestions: ['Software Engineer', 'Senior Engineer'] },
      })

      render(<ListingsPage />)

      await waitFor(() =>
        screen.getByPlaceholderText('Search by title or description...')
      )

      const input = screen.getByPlaceholderText(
        'Search by title or description...'
      )
      await userEvent.type(input, 'eng')

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
      })
    })

    it('should fill search input when suggestion is clicked', async () => {
      ;(apiClient.getSuggestions as jest.Mock).mockResolvedValue({
        data: { suggestions: ['Software Engineer'] },
      })

      render(<ListingsPage />)

      await waitFor(() =>
        screen.getByPlaceholderText('Search by title or description...')
      )

      const input = screen.getByPlaceholderText(
        'Search by title or description...'
      )
      await userEvent.type(input, 'soft')

      await waitFor(() => screen.getByText('Software Engineer'))
      fireEvent.click(screen.getByText('Software Engineer'))

      await waitFor(() => {
        expect(
          (
            screen.getByPlaceholderText(
              'Search by title or description...'
            ) as HTMLInputElement
          ).value
        ).toBe('Software Engineer')
      })
    })
  })

  // ── Filters ──────────────────────────────────────────────────────────────

  describe('Filters', () => {
    it('should render Filters heading', async () => {
      render(<ListingsPage />)

      await waitFor(() => {
        // appears in both desktop sidebar and mobile sheet
        const filterHeadings = screen.getAllByText('Filters')
        expect(filterHeadings.length).toBeGreaterThan(0)
      })
    })

    it('should show clear filters button when filters are active', async () => {
      render(<ListingsPage />)

      await waitFor(() =>
        screen.getByPlaceholderText('Search by title or description...')
      )

      const input = screen.getByPlaceholderText(
        'Search by title or description...'
      )
      await userEvent.type(input, 'developer')

      await waitFor(() => {
        // FilterContent renders in both sidebar and mobile sheet
        const clearButtons = screen.getAllByText(/Clear All Filters/i)
        expect(clearButtons.length).toBeGreaterThan(0)
      })
    })

    it('should clear all filters when clear button clicked', async () => {
      render(<ListingsPage />)

      await waitFor(() =>
        screen.getByPlaceholderText('Search by title or description...')
      )

      const input = screen.getByPlaceholderText(
        'Search by title or description...'
      )
      await userEvent.type(input, 'developer')

      await waitFor(() => {
        const clearButtons = screen.getAllByText(/Clear All Filters/i)
        expect(clearButtons.length).toBeGreaterThan(0)
      })

      // Click the first instance (desktop sidebar)
      fireEvent.click(screen.getAllByText(/Clear All Filters/i)[0])

      await waitFor(() => {
        expect(
          (
            screen.getByPlaceholderText(
              'Search by title or description...'
            ) as HTMLInputElement
          ).value
        ).toBe('')
      })
    })
  })

  // ── Error Handling ───────────────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should display error message when search fails', async () => {
      ;(apiClient.searchListings as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed to fetch listings',
      })

      render(<ListingsPage />)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to fetch listings')
        ).toBeInTheDocument()
      })
    })

    it('should handle searchListings throwing an exception', async () => {
      ;(apiClient.searchListings as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      render(<ListingsPage />)

      await waitFor(() => {
        expect(
          screen.getByText('Failed to execute search')
        ).toBeInTheDocument()
      })
    })
  })
})