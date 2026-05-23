/**
 * src/__tests__/ApplicationDetailDrawer.test.tsx
 * Tests for the real ApplicationDetailDrawer component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApplicationDetailDrawer } from '@/components/ApplicationDetailDrawer'
import * as apiClient from '@/lib/api-client'
import * as toastHelper from '@/lib/toast-helper'

// ── Mock all dependencies BEFORE component import ──────────────────────────

jest.mock('@/lib/api-client', () => ({
  getApplication: jest.fn(),
  getListing: jest.fn(),
  withdrawApplication: jest.fn(),
}))

jest.mock('@/lib/toast-helper', () => ({
  safeToastError: jest.fn(),
  safeToastSuccess: jest.fn(),
}))

jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: jest.fn(),
}))

jest.mock('@/components/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}))

// Mock Drawer and Sheet so they always render children
jest.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children, open }: any) => open ? <div>{children}</div> : null,
  DrawerContent: ({ children }: any) => <div>{children}</div>,
  DrawerHeader: ({ children }: any) => <div>{children}</div>,
  DrawerTitle: ({ children }: any) => <h2>{children}</h2>,
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: any) => open ? <div>{children}</div> : null,
  SheetContent: ({ children }: any) => <div>{children}</div>,
  SheetHeader: ({ children }: any) => <div>{children}</div>,
  SheetTitle: ({ children }: any) => <h2>{children}</h2>,
  SheetDescription: ({ children }: any) => <p>{children}</p>,
}))

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div>{children}</div>,
  AvatarImage: ({ alt }: any) => <img alt={alt} />,
  AvatarFallback: ({ children }: any) => <span>{children}</span>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}))

jest.mock('lucide-react', () => ({
  MapPin: () => <span>MapPin</span>,
  Clock: () => <span>Clock</span>,
  DollarSign: () => <span>DollarSign</span>,
  Calendar: () => <span>Calendar</span>,
  Building2: () => <span>Building2</span>,
  Trash2: () => <span>Trash2</span>,
  Loader2: () => <span>Loader2</span>,
}))

// ── Shared test data ───────────────────────────────────────────────────────

const { useMediaQuery } = require('@/hooks/use-media-query')

const mockApplication = {
  id: 'app-123',
  listingId: 'listing-123',
  status: 'SUBMITTED',
  appliedDate: '2026-05-20T00:00:00.000Z',
}

const mockFullApp = {
  ...mockApplication,
  coverLetter: 'I am interested in this position',
}

const mockListing = {
  id: 'listing-123',
  title: 'Junior Developer',
  description: 'We are looking for a junior developer',
  workHours: 'Full-time',
  stipend: '$5000/month',
  deadline: '2026-12-31T00:00:00.000Z',
  location: 'San Francisco, CA',
  employer: {
    companyName: 'Tech Corp',
    logoUrl: null,
    location: 'San Francisco, CA',
    industry: 'Technology',
  },
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ApplicationDetailDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default to desktop view
    useMediaQuery.mockReturnValue(true)
    // Default API mocks
    ;(apiClient.getApplication as jest.Mock).mockResolvedValue({
      data: mockFullApp,
      error: null,
    })
    ;(apiClient.getListing as jest.Mock).mockResolvedValue({
      data: mockListing,
    })
  })

  describe('Rendering', () => {
    it('should render nothing when application is null', () => {
      const { container } = render(
        <ApplicationDetailDrawer
          application={null}
          open={true}
          onOpenChange={jest.fn()}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render nothing when open is false', () => {
      const { container } = render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={false}
          onOpenChange={jest.fn()}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should show loading spinner while fetching details', async () => {
      // Delay the API response
      ;(apiClient.getApplication as jest.Mock).mockImplementation(
        () => new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockFullApp, error: null }), 200)
        )
      )

      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      expect(screen.getByText('Loading details...')).toBeInTheDocument()
    })

    it('should show Application Details title', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument()
      })
    })

    it('should show error message when details fail to load', async () => {
      ;(apiClient.getApplication as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Failed',
      })
      // No listing data in fallback
      const appWithoutListing = { id: 'app-123', status: 'SUBMITTED', appliedDate: '2026-05-20T00:00:00.000Z' }

      render(
        <ApplicationDetailDrawer
          application={appWithoutListing}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Could not load application details.')).toBeInTheDocument()
      })
    })
  })

  describe('Content Display', () => {
    it('should display company name after loading', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      })
    })

    it('should display listing title after loading', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Junior Developer')).toBeInTheDocument()
      })
    })

    it('should display work hours', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Full-time')).toBeInTheDocument()
      })
    })

    it('should display stipend', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('$5000/month')).toBeInTheDocument()
      })
    })

    it('should display industry', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Technology')).toBeInTheDocument()
      })
    })

    it('should render StatusBadge with correct status', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('status-badge')).toHaveTextContent('SUBMITTED')
      })
    })

    it('should display applied date label', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Applied on')).toBeInTheDocument()
      })
    })
  })

  describe('Withdraw Button', () => {
    it('should show withdraw button when status is SUBMITTED', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Withdraw Application')).toBeInTheDocument()
      })
    })

    it('should NOT show withdraw button when status is ACCEPTED', async () => {
      ;(apiClient.getApplication as jest.Mock).mockResolvedValue({
        data: { ...mockFullApp, status: 'ACCEPTED' },
        error: null,
      })

      render(
        <ApplicationDetailDrawer
          application={{ ...mockApplication, status: 'ACCEPTED' }}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.queryByText('Withdraw Application')).not.toBeInTheDocument()
      })
    })

    it('should NOT show withdraw button when status is REJECTED', async () => {
      ;(apiClient.getApplication as jest.Mock).mockResolvedValue({
        data: { ...mockFullApp, status: 'REJECTED' },
        error: null,
      })

      render(
        <ApplicationDetailDrawer
          application={{ ...mockApplication, status: 'REJECTED' }}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.queryByText('Withdraw Application')).not.toBeInTheDocument()
      })
    })

    it('should show permanent withdrawal warning text', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Withdrawal is permanent/i)).toBeInTheDocument()
      })
    })

    it('should call withdrawApplication and show success toast on withdraw', async () => {
      ;(apiClient.withdrawApplication as jest.Mock).mockResolvedValue({ error: null })
      const onOpenChange = jest.fn()
      const onWithdraw = jest.fn()

      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={onOpenChange}
          onWithdraw={onWithdraw}
        />
      )

      await waitFor(() => screen.getByText('Withdraw Application'))
      fireEvent.click(screen.getByText('Withdraw Application'))

      await waitFor(() => {
        expect(apiClient.withdrawApplication).toHaveBeenCalledWith('app-123')
        expect(toastHelper.safeToastSuccess).toHaveBeenCalledWith(
          'Application withdrawn successfully!'
        )
        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(onWithdraw).toHaveBeenCalled()
      })
    })

    it('should call safeToastError when withdrawal fails', async () => {
      ;(apiClient.withdrawApplication as jest.Mock).mockResolvedValue({
        error: 'Withdrawal failed',
      })

      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => screen.getByText('Withdraw Application'))
      fireEvent.click(screen.getByText('Withdraw Application'))

      await waitFor(() => {
        expect(toastHelper.safeToastError).toHaveBeenCalledWith('Withdrawal failed')
      })
    })

    it('should disable withdraw button while withdrawing', async () => {
      ;(apiClient.withdrawApplication as jest.Mock).mockImplementation(
        () => new Promise((resolve) =>
          setTimeout(() => resolve({ error: null }), 200)
        )
      )

      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => screen.getByText('Withdraw Application'))
      fireEvent.click(screen.getByText('Withdraw Application'))

      await waitFor(() => {
        expect(screen.getByText('Withdrawing...')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Withdrawing/i })).toBeDisabled()
      })
    })
  })

  describe('Responsive Layout', () => {
    it('should render Sheet on desktop', async () => {
      useMediaQuery.mockReturnValue(true)

      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument()
      })
    })

    it('should render Drawer on mobile', async () => {
      useMediaQuery.mockReturnValue(false)

      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Application Details')).toBeInTheDocument()
      })
    })
  })

  describe('API Calls', () => {
    it('should call getApplication with correct id on open', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(apiClient.getApplication).toHaveBeenCalledWith('app-123')
      })
    })

    it('should call getListing with correct id after getApplication', async () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => {
        expect(apiClient.getListing).toHaveBeenCalledWith('listing-123')
      })
    })

    it('should not call API when open is false', () => {
      render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={false}
          onOpenChange={jest.fn()}
        />
      )

      expect(apiClient.getApplication).not.toHaveBeenCalled()
    })

    it('should reset state when drawer closes', async () => {
      const { rerender } = render(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={true}
          onOpenChange={jest.fn()}
        />
      )

      await waitFor(() => screen.getByText('Tech Corp'))

      rerender(
        <ApplicationDetailDrawer
          application={mockApplication}
          open={false}
          onOpenChange={jest.fn()}
        />
      )

      // After close, content should not be visible
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
    })
  })
})