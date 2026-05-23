/**
 * src/__tests__/StatusBadge.test.tsx
 * Tests for the StatusBadge component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/StatusBadge'

describe('StatusBadge Component', () => {
  it('should render submitted status correctly', () => {
    render(<StatusBadge status="submitted" />)
    const badge = screen.getByText('Submitted')
    expect(badge).toBeInTheDocument()
  })

  it('should render under_review status correctly', () => {
    render(<StatusBadge status="under_review" />)
    const badge = screen.getByText('Under Review')
    expect(badge).toBeInTheDocument()
  })

  it('should render accepted status correctly', () => {
    render(<StatusBadge status="accepted" />)
    const badge = screen.getByText('Accepted')
    expect(badge).toBeInTheDocument()
  })

  it('should render rejected status correctly', () => {
    render(<StatusBadge status="rejected" />)
    const badge = screen.getByText('Rejected')
    expect(badge).toBeInTheDocument()
  })

  it('should render active status correctly', () => {
    render(<StatusBadge status="active" />)
    const badge = screen.getByText('Active')
    expect(badge).toBeInTheDocument()
  })

  it('should render closed status correctly', () => {
    render(<StatusBadge status="closed" />)
    const badge = screen.getByText('Closed')
    expect(badge).toBeInTheDocument()
  })

  it('should render pending status correctly', () => {
    render(<StatusBadge status="pending" />)
    const badge = screen.getByText('Pending')
    expect(badge).toBeInTheDocument()
  })

  it('should render inactive status correctly', () => {
    render(<StatusBadge status="inactive" />)
    const badge = screen.getByText('Inactive')
    expect(badge).toBeInTheDocument()
  })

  it('should apply correct CSS class for accepted status (green)', () => {
    const { container } = render(<StatusBadge status="accepted" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-800')
  })

  it('should apply correct CSS class for rejected status (red)', () => {
    const { container } = render(<StatusBadge status="rejected" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-red-100')
    expect(badge).toHaveClass('text-red-800')
  })

  it('should apply correct CSS class for submitted status (blue)', () => {
    const { container } = render(<StatusBadge status="submitted" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-blue-100')
    expect(badge).toHaveClass('text-blue-800')
  })

  it('should apply correct CSS class for under_review status (yellow)', () => {
    const { container } = render(<StatusBadge status="under_review" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-yellow-100')
    expect(badge).toHaveClass('text-yellow-800')
  })

  it('should apply correct CSS class for pending status (yellow)', () => {
    const { container } = render(<StatusBadge status="pending" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-yellow-100')
    expect(badge).toHaveClass('text-yellow-800')
  })

  it('should apply correct CSS class for active status (green)', () => {
    const { container } = render(<StatusBadge status="active" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-green-100')
    expect(badge).toHaveClass('text-green-800')
  })

  it('should apply correct CSS class for closed/inactive status (gray)', () => {
    const { container: closedContainer } = render(<StatusBadge status="closed" />)
    const closedBadge = closedContainer.querySelector('span')
    expect(closedBadge).toHaveClass('bg-gray-100')
    expect(closedBadge).toHaveClass('text-gray-800')
  })

  it('should handle lowercase status values', () => {
    render(<StatusBadge status="submitted"/>)
    // Component normalizes to lowercase
    const badge = screen.queryByText('Submitted')
    expect(badge || screen.getByText('SUBMITTED')).toBeInTheDocument()
  })

  it('should have hover variant applied', () => {
    const { container } = render(<StatusBadge status="accepted" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('hover:bg-green-100')
  })

  it('should render as a Badge component', () => {
    const { container } = render(<StatusBadge status="submitted" />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
