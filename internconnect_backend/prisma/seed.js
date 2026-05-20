require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Admin ────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@internconnect.com" },
    update: {},
    create: {
      email: "admin@internconnect.com",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      admin: {
        create: {
          fullName: "Super Admin",
          permissions: ["view", "approve", "deactivate"],
        },
      },
    },
  });
  console.log("✅ Admin created:", admin.email);

  // ── Students ─────────────────────────────────────────────
  const s1Hash = await bcrypt.hash("Student1234!", 12);
  const student1 = await prisma.user.upsert({
    where: { email: "student1@test.com" },
    update: {},
    create: {
      email: "student1@test.com",
      passwordHash: s1Hash,
      role: "STUDENT",
      status: "ACTIVE",
      student: {
        create: {
          fullName: "Alex Chen",
          university: "Stanford University",
          course: "Computer Science",
          graduationYear: 2026,
          bio: "Passionate about AI and full-stack development.",
          skills: ["JavaScript", "Python", "React", "Node.js"],
        },
      },
    },
  });
  console.log("✅ Student 1 created:", student1.email);

  const s2Hash = await bcrypt.hash("Student1234!", 12);
  const student2 = await prisma.user.upsert({
    where: { email: "student2@test.com" },
    update: {},
    create: {
      email: "student2@test.com",
      passwordHash: s2Hash,
      role: "STUDENT",
      status: "ACTIVE",
      student: {
        create: {
          fullName: "Priya Sharma",
          university: "MIT",
          course: "Data Science",
          graduationYear: 2027,
          bio: "Aspiring data scientist with a love for visualisation.",
          skills: ["Python", "SQL", "Machine Learning", "Tableau"],
        },
      },
    },
  });
  console.log("✅ Student 2 created:", student2.email);

  // ── Employers ─────────────────────────────────────────────
  const e1Hash = await bcrypt.hash("Employer1234!", 12);
  const employer1 = await prisma.user.upsert({
    where: { email: "employer1@test.com" },
    update: {},
    create: {
      email: "employer1@test.com",
      passwordHash: e1Hash,
      role: "EMPLOYER",
      status: "ACTIVE", // bypass PENDING for seed
      employer: {
        create: {
          companyName: "TechCorp Solutions",
          contactPerson: "Sarah Mitchell",
          industry: "Technology",
          location: "San Francisco, CA",
          companyBio:
            "A leading software solutions company building the future of cloud infrastructure.",
          websiteUrl: "https://techcorp.example.com",
          companySize: "200-500",
        },
      },
    },
  });
  console.log("✅ Employer 1 created:", employer1.email);

  const e2Hash = await bcrypt.hash("Employer1234!", 12);
  const employer2 = await prisma.user.upsert({
    where: { email: "employer2@test.com" },
    update: {},
    create: {
      email: "employer2@test.com",
      passwordHash: e2Hash,
      role: "EMPLOYER",
      status: "ACTIVE",
      employer: {
        create: {
          companyName: "DataVision Analytics",
          contactPerson: "James Okafor",
          industry: "Data & Analytics",
          location: "New York, NY",
          companyBio:
            "We turn raw data into strategic insights for Fortune 500 companies.",
          websiteUrl: "https://datavision.example.com",
          companySize: "50-200",
        },
      },
    },
  });
  console.log("✅ Employer 2 created:", employer2.email);

  // ── Listings ──────────────────────────────────────────────
  const emp1Profile = await prisma.employer.findUnique({
    where: { id: employer1.id },
  });
  const emp2Profile = await prisma.employer.findUnique({
    where: { id: employer2.id },
  });

  const listing1 = await prisma.listing.create({
    data: {
      employerId: emp1Profile.id,
      title: "Software Engineering Intern",
      description:
        "Join our backend team to build scalable APIs and microservices using Node.js and PostgreSQL. You will work alongside senior engineers on real production systems.",
      jobField: "Technology",
      location: "San Francisco, CA",
      workHours: "Full-time",
      stipend: "$25/hour",
      requirements: ["Node.js", "PostgreSQL", "REST APIs", "Git"],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });
  console.log("✅ Listing 1 created:", listing1.title);

  const listing2 = await prisma.listing.create({
    data: {
      employerId: emp1Profile.id,
      title: "Frontend Developer Intern",
      description:
        "Work on our consumer-facing React application, improving performance and building new features. Strong attention to UX is a must.",
      jobField: "Technology",
      location: "San Francisco, CA",
      workHours: "Part-time",
      stipend: "$20/hour",
      requirements: ["React", "TypeScript", "CSS", "Git"],
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Listing 2 created:", listing2.title);

  const listing3 = await prisma.listing.create({
    data: {
      employerId: emp2Profile.id,
      title: "Data Science Intern",
      description:
        "Analyse large datasets, build predictive models, and present insights to stakeholders. You will use Python, SQL, and our internal BI tools.",
      jobField: "Data Science",
      location: "New York, NY",
      workHours: "Full-time",
      stipend: "$22/hour",
      requirements: ["Python", "SQL", "Pandas", "Statistics"],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Listing 3 created:", listing3.title);

  const listing4 = await prisma.listing.create({
    data: {
      employerId: emp2Profile.id,
      title: "Business Intelligence Analyst Intern",
      description:
        "Support the BI team in building dashboards, writing complex SQL queries, and automating reporting pipelines.",
      jobField: "Data Science",
      location: "Remote",
      workHours: "Part-time",
      stipend: "$18/hour",
      requirements: ["SQL", "Tableau", "Excel", "Data Modelling"],
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Listing 4 created:", listing4.title);

  const listing5 = await prisma.listing.create({
    data: {
      employerId: emp1Profile.id,
      title: "DevOps & Cloud Intern",
      description:
        "Help our infrastructure team manage CI/CD pipelines, container orchestration with Kubernetes, and cloud deployments on AWS.",
      jobField: "Technology",
      location: "San Francisco, CA",
      workHours: "Full-time",
      stipend: "$28/hour",
      requirements: ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD"],
      deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✅ Listing 5 created:", listing5.title);

  // ── Applications ──────────────────────────────────────────
  const student1Profile = await prisma.student.findUnique({
    where: { id: student1.id },
  });
  const student2Profile = await prisma.student.findUnique({
    where: { id: student2.id },
  });

  const app1 = await prisma.application.create({
    data: {
      studentId: student1Profile.id,
      listingId: listing1.id,
      coverLetter:
        "I am excited to apply for the Software Engineering Intern role at TechCorp Solutions. With hands-on experience in Node.js and PostgreSQL from my university projects, I am confident I can contribute meaningfully to your backend team from day one.",
      resumeUrl: "http://localhost:5000/uploads/resumes/sample-resume-alex.pdf",
      resumeFilename: "sample-resume-alex.pdf",
      status: "UNDER_REVIEW",
      reviewedDate: new Date(),
      reviewNotes: "Strong candidate — schedule technical interview.",
    },
  });
  console.log("✅ Application 1 created: Alex → Software Engineering Intern");

  const app2 = await prisma.application.create({
    data: {
      studentId: student1Profile.id,
      listingId: listing2.id,
      coverLetter:
        "React is my strongest skill and I have built several production-grade SPAs during my studies. I would love to bring my frontend experience to TechCorp.",
      resumeUrl: "http://localhost:5000/uploads/resumes/sample-resume-alex.pdf",
      resumeFilename: "sample-resume-alex.pdf",
      status: "SUBMITTED",
    },
  });
  console.log("✅ Application 2 created: Alex → Frontend Developer Intern");

  const app3 = await prisma.application.create({
    data: {
      studentId: student2Profile.id,
      listingId: listing3.id,
      coverLetter:
        "Data Science is my passion. I have completed several Kaggle competitions and built end-to-end ML pipelines using Python and SQL. I am eager to bring this experience to DataVision Analytics.",
      resumeUrl:
        "http://localhost:5000/uploads/resumes/sample-resume-priya.pdf",
      resumeFilename: "sample-resume-priya.pdf",
      status: "ACCEPTED",
      reviewedDate: new Date(),
      reviewNotes: "Excellent candidate. Offer extended.",
    },
  });
  console.log("✅ Application 3 created: Priya → Data Science Intern");

  console.log("\n🎉 Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("  Test credentials:");
  console.log("  Admin    → admin@internconnect.com    / Admin1234!");
  console.log("  Student  → student1@test.com          / Student1234!");
  console.log("  Student  → student2@test.com          / Student1234!");
  console.log("  Employer → employer1@test.com         / Employer1234!");
  console.log("  Employer → employer2@test.com         / Employer1234!");
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
