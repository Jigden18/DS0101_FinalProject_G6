const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export interface ApiResponse<T = any> {
  status: number
  data?: T
  message?: string
  error?: string
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

// Get token from localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

// Set token in localStorage
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
  }
}

// Remove token from localStorage
export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token")
  }
}

// Make API request with automatic token attachment
// Safely extract a string error message from potentially nested error objects
function extractErrorMessage(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj.message === "string") return obj.message
    if (typeof obj.error === "string") return obj.error
    try { return JSON.stringify(value) } catch { return "An error occurred" }
  }
  return "An error occurred"
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Attach token if available and not a multipart request
  if (token && !headers["Content-Type"]?.includes("multipart")) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const responseData = await response.json()

    if (!response.ok) {
      const errorMessage = extractErrorMessage(
        responseData.message || 
        responseData.error || 
        "An error occurred"
      )
      return {
        data: null,
        error: errorMessage,
        status: response.status,
      }
    }

    return {
      data: responseData.data || responseData,
      error: null,
      status: response.status,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error occurred"
    return {
      data: null,
      error: errorMessage,
      status: 0,
    }
  }
}

// ============ AUTH ENDPOINTS ============

export async function registerStudent(data: {
  email: string
  password: string
  name: string
  university: string
  course: string
  graduationYear: number
}) {
  return apiRequest("/auth/register/student", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      full_name: data.name,
      university: data.university,
      course: data.course,
      graduation_year: data.graduationYear,
    }),
  })
}

export async function registerEmployer(data: {
  email: string
  password: string
  companyName: string
  contactPerson: string
  industry: string
  location: string
}) {
  return apiRequest("/auth/register/employer", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function login(email: string, password: string) {
  const { data, error, status } = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (data && data.token) {
    setToken(data.token)
  }

  return { data, error, status }
}

export async function logout() {
  removeToken()
  return apiRequest("/auth/logout", {
    method: "POST",
  })
}

export async function refreshToken() {
  const { data, error, status } = await apiRequest("/auth/refresh-token", {
    method: "POST",
  })

  if (data && data.token) {
    setToken(data.token)
  }

  return { data, error, status }
}

export async function forgotPassword(email: string) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  })
}

// ============ USER ENDPOINTS ============

export async function getUser(userId: string) {
  return apiRequest(`/users/${userId}`, {
    method: "GET",
  })
}

export async function updateUser(
  userId: string,
  data: Record<string, any>
) {
  return apiRequest(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function uploadAvatar(userId: string, file: File) {
  const formData = new FormData()
  formData.append("avatar", file)

  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: "POST",
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.message || data.error || "Failed to upload avatar",
        status: response.status,
      }
    }

    return {
      data: data.data || data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error occurred"
    return {
      data: null,
      error: errorMessage,
      status: 0,
    }
  }
}

export async function deleteUser(userId: string) {
  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
  })
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  return apiRequest(`/users/${userId}/change-password`, {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}

// ============ LISTING ENDPOINTS ============

export async function getListings(filters?: Record<string, any>) {
  const params = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value))
      }
    })
  }

  const query = params.toString() ? `?${params.toString()}` : ""
  return apiRequest(`/listings${query}`, {
    method: "GET",
  })
}

export async function getMyListings() {
  return apiRequest("/listings/my", {
    method: "GET",
  })
}

export async function getListing(listingId: string) {
  return apiRequest(`/listings/${listingId}`, {
    method: "GET",
  })
}

export async function getRelatedListings(listingId: string) {
  return apiRequest(`/listings/${listingId}/related`, {
    method: "GET",
  })
}

export async function getApplicants(listingId: string) {
  return apiRequest(`/listings/${listingId}/applicants`, {
    method: "GET",
  })
}

export async function createListing(data: Record<string, any>) {
  return apiRequest("/listings", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateListing(listingId: string, data: Record<string, any>) {
  return apiRequest(`/listings/${listingId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function closeListing(listingId: string) {
  return apiRequest(`/listings/${listingId}/close`, {
    method: "PUT",
    body: JSON.stringify({}),
  })
}

export async function deleteListing(listingId: string) {
  return apiRequest(`/listings/${listingId}`, {
    method: "DELETE",
  })
}

// ============ APPLICATION ENDPOINTS ============

export async function submitApplication(
  listingId: string,
  coverLetter: string,
  resumeFile: File
) {
  const formData = new FormData()
  formData.append("listingId", listingId)
  formData.append("coverLetter", coverLetter)
  formData.append("resume", resumeFile)

  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.message || data.error || "Failed to submit application",
        status: response.status,
      }
    }

    return {
      data: data.data || data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error occurred"
    return {
      data: null,
      error: errorMessage,
      status: 0,
    }
  }
}

export async function checkApplication(listingId: string) {
  return apiRequest(`/applications/check?listing_id=${listingId}`, {
    method: "GET",
  })
}

export async function getApplications() {
  return apiRequest("/applications", {
    method: "GET",
  })
}

export async function getApplication(applicationId: string) {
  return apiRequest(`/applications/${applicationId}`, {
    method: "GET",
  })
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  return apiRequest(`/applications/${applicationId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function withdrawApplication(applicationId: string) {
  return apiRequest(`/applications/${applicationId}`, {
    method: "DELETE",
  })
}

// ============ SEARCH ENDPOINTS ============

export async function searchListings(filters: Record<string, any>) {
  return apiRequest("/search/listings", {
    method: "POST",
    body: JSON.stringify(filters),
  })
}

export async function getSuggestions(q: string) {
  return apiRequest(`/search/suggestions?q=${encodeURIComponent(q)}`, {
    method: "GET",
  })
}

// ============ CONSTANTS ENDPOINTS ============

export async function getConstants() {
  return apiRequest("/constants", {
    method: "GET",
  })
}

// ============ ADMIN ENDPOINTS ============

export async function getUsers() {
  return apiRequest("/admin/users", {
    method: "GET",
  })
}

export async function getUserById(userId: string) {
  return apiRequest(`/admin/users/${userId}`, {
    method: "GET",
  })
}

export async function getPendingEmployers() {
  return apiRequest("/admin/employers/pending", {
    method: "GET",
  })
}

export async function approveEmployer(employerId: string) {
  return apiRequest(`/admin/employers/${employerId}/approve`, {
    method: "PUT",
    body: JSON.stringify({}),
  })
}

export async function rejectEmployer(employerId: string) {
  return apiRequest(`/admin/employers/${employerId}/reject`, {
    method: "PUT",
    body: JSON.stringify({}),
  })
}

export async function deactivateUser(userId: string) {
  return apiRequest(`/admin/users/${userId}/deactivate`, {
    method: "PUT",
    body: JSON.stringify({}),
  })
}

export async function reactivateUser(userId: string) {
  return apiRequest(`/admin/users/${userId}/reactivate`, {
    method: "PUT",
    body: JSON.stringify({}),
  })
}

export async function getAnalytics() {
  return apiRequest("/admin/analytics", {
    method: "GET",
  })
}

export async function getAuditLogs() {
  return apiRequest("/admin/audit-logs", {
    method: "GET",
  })
}
