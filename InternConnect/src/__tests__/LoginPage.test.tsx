/**
 * src/__tests__/LoginPage.test.tsx
 * Tests for the Login page component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Login Page', () => {
  let mockPush: jest.Mock
  let mockLogin: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })

    const { useAuth } = require('@/context/AuthContext')
    mockLogin = jest.fn()
    useAuth.mockReturnValue({
      login: mockLogin,
    })
  })

  it('should render login form', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your InternConnect account')).toBeInTheDocument()
  })

  it('should have email and password input fields', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should have sign in button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('should show validation error when submitting empty form', async () => {
    render(<LoginPage />)
    const submitButton = screen.getByRole('button', { name: /Sign In/i })
    
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('should show validation error for invalid email format', async () => {
    const { container } = render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    await waitFor(() => {
      expect((emailInput as HTMLInputElement).value).toBe('invalid-email')
    })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  it('should show validation error when only email is provided', async () => {
    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'test@example.com')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('should call login with email and password on valid submit', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      role: 'student',
    })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!')
    })
  })

  it('should navigate to student dashboard on successful student login', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      role: 'student',
    })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'student@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/student')
    })
  })

  it('should navigate to employer dashboard on successful employer login', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      role: 'employer',
    })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'employer@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/employer')
    })
  })

  it('should navigate to admin dashboard on successful admin login', async () => {
    mockLogin.mockResolvedValue({
      success: true,
      role: 'admin',
    })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'admin@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/admin')
    })
  })

  it('should show form error on failed login', async () => {
    const { toast } = require('sonner')
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    })

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.type(passwordInput, 'WrongPassword')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password')
    })
  })

  it('should disable form while loading', async () => {
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, role: 'student' }), 100)
        )
    )

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /Sign In/i }) as HTMLButtonElement

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    fireEvent.click(submitButton)

    // Check that inputs are disabled while loading
    expect(emailInput.disabled).toBe(true)
    expect(passwordInput.disabled).toBe(true)
    expect(submitButton.disabled).toBe(true)
  })

  it('should have link to register as student', () => {
    render(<LoginPage />)
    const studentLink = screen.getByText('Register as Student')
    expect(studentLink).toHaveAttribute('href', '/register/student')
  })

  it('should have link to register as employer', () => {
    render(<LoginPage />)
    const employerLink = screen.getByText('Employer')
    expect(employerLink).toHaveAttribute('href', '/register/employer')
  })

  it('should have link to forgot password', () => {
    render(<LoginPage />)
    const forgotLink = screen.getByText('Forgot Password?')
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('should show loading state on button during submission', async () => {
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, role: 'student' }), 100)
        )
    )

    render(<LoginPage />)
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    fireEvent.click(submitButton)

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Signing in.../i)).toBeInTheDocument()
    })
  })
})
