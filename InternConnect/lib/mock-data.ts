// Types
export type UserRole = "student" | "employer" | "admin"

export interface Student {
  id: string
  email: string
  password: string
  name: string
  university: string
  course: string
  graduationYear: number
  avatar: string
  joinedDate: string
  status: "active" | "inactive"
}

export interface Employer {
  id: string
  email: string
  password: string
  companyName: string
  contactPerson: string
  industry: string
  location: string
  bio: string
  logo: string
  joinedDate: string
  status: "active" | "inactive" | "pending"
}

export interface Admin {
  id: string
  email: string
  password: string
  name: string
}

export interface Listing {
  id: string
  employerId: string
  title: string
  description: string
  location: string
  workHours: string
  stipend: string
  deadline: string
  jobField: string
  requirements: string[]
  postedDate: string
  status: "active" | "closed" | "pending"
}

export interface Application {
  id: string
  studentId: string
  listingId: string
  coverLetter: string
  resumeFileName: string
  appliedDate: string
  status: "submitted" | "under_review" | "accepted" | "rejected"
}

// Mock Students
export const students: Student[] = [
  {
    id: "student-1",
    email: "alex.chen@university.edu",
    password: "student123",
    name: "Alex Chen",
    university: "Stanford University",
    course: "Computer Science",
    graduationYear: 2025,
    avatar: "https://i.pravatar.cc/150?u=alex",
    joinedDate: "2024-01-15",
    status: "active",
  },
  {
    id: "student-2",
    email: "jamie.rodriguez@college.edu",
    password: "student123",
    name: "Jamie Rodriguez",
    university: "MIT",
    course: "Data Science",
    graduationYear: 2024,
    avatar: "https://i.pravatar.cc/150?u=jamie",
    joinedDate: "2024-02-20",
    status: "active",
  },
  {
    id: "student-3",
    email: "taylor.kim@school.edu",
    password: "student123",
    name: "Taylor Kim",
    university: "UC Berkeley",
    course: "Business Administration",
    graduationYear: 2026,
    avatar: "https://i.pravatar.cc/150?u=taylor",
    joinedDate: "2024-03-10",
    status: "active",
  },
]

// Mock Employers
export const employers: Employer[] = [
  {
    id: "employer-1",
    email: "hr@techcorp.com",
    password: "employer123",
    companyName: "TechCorp Solutions",
    contactPerson: "Sarah Mitchell",
    industry: "Technology",
    location: "San Francisco, CA",
    bio: "Leading technology company specializing in cloud solutions and AI development.",
    logo: "https://placehold.co/150x150/0066cc/ffffff?text=TC",
    joinedDate: "2023-11-01",
    status: "active",
  },
  {
    id: "employer-2",
    email: "careers@greenleaf.com",
    password: "employer123",
    companyName: "GreenLeaf Marketing",
    contactPerson: "Michael Park",
    industry: "Marketing",
    location: "New York, NY",
    bio: "Award-winning marketing agency focused on sustainable brands and digital innovation.",
    logo: "https://placehold.co/150x150/228b22/ffffff?text=GL",
    joinedDate: "2023-12-15",
    status: "active",
  },
  {
    id: "employer-3",
    email: "jobs@financeplus.com",
    password: "employer123",
    companyName: "FinancePlus Inc",
    contactPerson: "Emily Watson",
    industry: "Finance",
    location: "Chicago, IL",
    bio: "Modern fintech company revolutionizing personal finance management.",
    logo: "https://placehold.co/150x150/4a4a4a/ffffff?text=FP",
    joinedDate: "2024-01-05",
    status: "active",
  },
]

// Pending Employer Approvals
export const pendingEmployers: Employer[] = [
  {
    id: "employer-4",
    email: "info@startupxyz.com",
    password: "employer123",
    companyName: "StartupXYZ",
    contactPerson: "David Lee",
    industry: "Technology",
    location: "Austin, TX",
    bio: "Early-stage startup building innovative IoT solutions.",
    logo: "https://placehold.co/150x150/ff6600/ffffff?text=SX",
    joinedDate: "2024-03-20",
    status: "pending",
  },
  {
    id: "employer-5",
    email: "recruit@mediahub.com",
    password: "employer123",
    companyName: "MediaHub Agency",
    contactPerson: "Lisa Thompson",
    industry: "Media",
    location: "Los Angeles, CA",
    bio: "Creative media agency specializing in content production.",
    logo: "https://placehold.co/150x150/9933cc/ffffff?text=MH",
    joinedDate: "2024-03-22",
    status: "pending",
  },
]

// Mock Admin
export const admins: Admin[] = [
  {
    id: "admin-1",
    email: "admin@internconnect.com",
    password: "admin123",
    name: "System Admin",
  },
]

// Mock Listings
export const listings: Listing[] = [
  {
    id: "listing-1",
    employerId: "employer-1",
    title: "Software Engineering Intern",
    description: "Join our engineering team to work on cutting-edge cloud solutions. You will collaborate with senior engineers on real projects, participate in code reviews, and contribute to our product development cycle. This is a great opportunity to gain hands-on experience with modern technologies like React, Node.js, and AWS.",
    location: "San Francisco, CA",
    workHours: "8 hrs",
    stipend: "$3,000/month",
    deadline: "2024-05-15",
    jobField: "Software Engineering",
    requirements: ["Resume / CV required", "Cover letter required", "GitHub profile required"],
    postedDate: "2024-03-01",
    status: "active",
  },
  {
    id: "listing-2",
    employerId: "employer-1",
    title: "Data Science Intern",
    description: "Work with our data team to analyze large datasets and build machine learning models. You will help develop predictive analytics solutions and create visualizations to communicate insights to stakeholders.",
    location: "San Francisco, CA",
    workHours: "6 hrs",
    stipend: "$2,800/month",
    deadline: "2024-05-20",
    jobField: "Data Science",
    requirements: ["Resume / CV required", "Transcript required", "Portfolio link required"],
    postedDate: "2024-03-05",
    status: "active",
  },
  {
    id: "listing-3",
    employerId: "employer-2",
    title: "Marketing Intern",
    description: "Support our marketing campaigns for sustainable brands. You will assist with social media management, content creation, and market research. Great opportunity to learn digital marketing strategies.",
    location: "New York, NY",
    workHours: "Flexible",
    stipend: "$2,200/month",
    deadline: "2024-04-30",
    jobField: "Marketing",
    requirements: ["Resume / CV required", "Cover letter required", "LinkedIn profile required"],
    postedDate: "2024-03-08",
    status: "active",
  },
  {
    id: "listing-4",
    employerId: "employer-2",
    title: "UI/UX Design Intern",
    description: "Join our creative team to design user interfaces for web and mobile applications. You will work on wireframes, prototypes, and visual designs using Figma and other design tools.",
    location: "New York, NY",
    workHours: "6 hrs",
    stipend: "$2,500/month",
    deadline: "2024-05-10",
    jobField: "Design",
    requirements: ["Resume / CV required", "Portfolio link required"],
    postedDate: "2024-03-10",
    status: "active",
  },
  {
    id: "listing-5",
    employerId: "employer-3",
    title: "Finance Analyst Intern",
    description: "Support our finance team with financial modeling, data analysis, and reporting. You will gain exposure to fintech operations and help develop insights for business decisions.",
    location: "Chicago, IL",
    workHours: "8 hrs",
    stipend: "$3,200/month",
    deadline: "2024-05-25",
    jobField: "Finance",
    requirements: ["Resume / CV required", "Transcript required", "Cover letter required"],
    postedDate: "2024-03-12",
    status: "active",
  },
  {
    id: "listing-6",
    employerId: "employer-3",
    title: "Operations Intern",
    description: "Help streamline our operations and improve business processes. You will work on process optimization, documentation, and cross-functional projects.",
    location: "Chicago, IL",
    workHours: "4 hrs",
    stipend: "$1,800/month",
    deadline: "2024-06-01",
    jobField: "Operations",
    requirements: ["Resume / CV required", "Available to work on-site"],
    postedDate: "2024-03-15",
    status: "active",
  },
]

// Mock Applications
export const applications: Application[] = [
  {
    id: "app-1",
    studentId: "student-1",
    listingId: "listing-1",
    coverLetter: "I am excited to apply for the Software Engineering Intern position at TechCorp Solutions. With my background in Computer Science at Stanford and experience building web applications, I believe I would be a great fit for your team.",
    resumeFileName: "alex_chen_resume.pdf",
    appliedDate: "2024-03-10",
    status: "under_review",
  },
  {
    id: "app-2",
    studentId: "student-1",
    listingId: "listing-2",
    coverLetter: "I am passionate about data science and would love to contribute to your data team. My coursework in machine learning and statistics has prepared me well for this role.",
    resumeFileName: "alex_chen_resume.pdf",
    appliedDate: "2024-03-12",
    status: "accepted",
  },
  {
    id: "app-3",
    studentId: "student-2",
    listingId: "listing-3",
    coverLetter: "As a marketing enthusiast with a focus on sustainability, I am thrilled to apply for this position at GreenLeaf Marketing. I have experience managing social media accounts and creating engaging content.",
    resumeFileName: "jamie_rodriguez_resume.pdf",
    appliedDate: "2024-03-14",
    status: "submitted",
  },
  {
    id: "app-4",
    studentId: "student-2",
    listingId: "listing-5",
    coverLetter: "I am interested in transitioning into finance and believe this internship would be a great opportunity to apply my analytical skills in a fintech environment.",
    resumeFileName: "jamie_rodriguez_resume.pdf",
    appliedDate: "2024-03-16",
    status: "rejected",
  },
  {
    id: "app-5",
    studentId: "student-3",
    listingId: "listing-4",
    coverLetter: "With my background in business and passion for design, I am excited to apply for the UI/UX Design Intern position. I have been learning Figma and have completed several personal design projects.",
    resumeFileName: "taylor_kim_resume.pdf",
    appliedDate: "2024-03-18",
    status: "under_review",
  },
]

// Helper functions
export function getStudentById(id: string): Student | undefined {
  return students.find((s) => s.id === id)
}

export function getEmployerById(id: string): Employer | undefined {
  return [...employers, ...pendingEmployers].find((e) => e.id === id)
}

export function getListingById(id: string): Listing | undefined {
  return listings.find((l) => l.id === id)
}

export function getListingsByEmployer(employerId: string): Listing[] {
  return listings.filter((l) => l.employerId === employerId)
}

export function getApplicationsByStudent(studentId: string): Application[] {
  return applications.filter((a) => a.studentId === studentId)
}

export function getApplicationsByListing(listingId: string): Application[] {
  return applications.filter((a) => a.listingId === listingId)
}

export function getEmployerForListing(listingId: string): Employer | undefined {
  const listing = getListingById(listingId)
  if (!listing) return undefined
  return getEmployerById(listing.employerId)
}

// Auth helpers
export function findUserByCredentials(email: string, password: string): { user: Student | Employer | Admin; role: UserRole } | null {
  const student = students.find((s) => s.email === email && s.password === password)
  if (student) return { user: student, role: "student" }

  const employer = employers.find((e) => e.email === email && e.password === password)
  if (employer) return { user: employer, role: "employer" }

  const admin = admins.find((a) => a.email === email && a.password === password)
  if (admin) return { user: admin, role: "admin" }

  return null
}

// Job fields for filtering
export const jobFields = [
  "Software Engineering",
  "Data Science",
  "Design",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
  "Research",
]

// Locations for filtering
export const locations = [
  "San Francisco, CA",
  "New York, NY",
  "Chicago, IL",
  "Austin, TX",
  "Los Angeles, CA",
  "Seattle, WA",
  "Boston, MA",
  "Remote",
]

// Work hours options
export const workHoursOptions = ["4 hrs", "6 hrs", "8 hrs", "Flexible"]

// Default requirements options for employers
export const defaultRequirements = [
  "Resume / CV required",
  "Cover letter required",
  "Portfolio link required",
  "Transcript required",
  "Recommendation letter required",
  "GitHub profile required",
  "LinkedIn profile required",
  "Available to work on-site",
]
