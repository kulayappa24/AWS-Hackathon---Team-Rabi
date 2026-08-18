# Student Builder Groups — Club Member Portal (70% Baseline)

A production-grade web application and grounded AI assistant for campus **AWS Student Builder Groups (SBGs)**. Built with **Java 21 (Spring Boot 3.3+)**, **React 18 + Vite + TypeScript**, **PostgreSQL 16**, and a strict **RAG (Retrieval-Augmented Generation)** architecture grounded in 8 approved club starter documents.

---

## Quick Start (Run Locally in 2 Minutes)

### Prerequisites
- **Java 21 JDK** & **Maven 3.9+**
- **Node.js 18+** & **npm**
- **Docker & Docker Compose** (Optional for PostgreSQL container; application includes embedded PostgreSQL-compatible mode)

---

### Step 1: Start Backend (Spring Boot 3.3.4)

```bash
cd backend
mvn spring-boot:run
```
*The backend will automatically start on `http://localhost:8080` and ingest all 8 starter documents from `documents/` at startup.*

---

### Step 2: Start Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
*The frontend will start on `http://localhost:5173/`.*

---

### Step 3: Open in Browser

Navigate to **`http://localhost:5173/`** to explore the portal:
1. Click **Join the Club** to register a new member account.
2. Visit **Member Dashboard** or click **Launch AI Chat**.
3. Ask questions like:
   - *"When is the next workshop?"*
   - *"How do I publish an article on Builder Center?"*
   - *"What are the hackathon rules?"*
4. Ask an out-of-scope question to test the safe directory fallback.

---

## Running Automated Tests

Run the full Spring Boot integration and unit test suite:
```bash
cd backend
mvn clean test
```
*Result: 16 Tests run, 0 Failures, 0 Errors, BUILD SUCCESS.*

Run frontend TypeScript and build checks:
```bash
cd frontend
npm run build
```

---

## Directory Structure

```
club-member-portal/
├── backend/                  # Java 21 Spring Boot 3.3+ REST API & RAG Engine
│   ├── src/main/java/com/aws/sbg/
│   │   ├── config/           # Security, CORS & App configs
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Request / Response DTOs
│   │   ├── entity/           # JPA Database Entities
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── service/          # Business logic & Orchestration
│   │   ├── security/         # JWT Provider, Auth Filter & BCrypt
│   │   ├── rag/              # Markdown Parser, Section Chunker, Retriever
│   │   ├── ai/               # Local Grounded & Bedrock AI abstractions
│   │   └── exception/        # Global Exception Handling
│   └── src/test/java/        # 16 Automated Integration & Unit Tests
├── frontend/                 # React 18, Vite, TypeScript, Vanilla CSS
│   ├── src/components/       # SourceCard, SuggestedQuestions, ChatMessageItem, etc.
│   ├── src/pages/            # Landing, Sign Up, Login, Forgot/Reset, Dashboard, Chat, Profile
│   ├── src/services/         # API Client & Services
│   ├── src/context/          # AuthContext & ToastContext
│   └── src/styles/           # Design tokens (variables.css, main.css)
├── documents/                # 8 Authoritative Club Markdown Files
├── database/                 # PostgreSQL DDL & Init Scripts
├── docs/                     # 13 Comprehensive Documentation Files
├── docker-compose.yml        # PostgreSQL 16 + pgvector container
└── README.md
```

---

## Documentation Suite in `docs/`

1. [Project Overview](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/PROJECT_OVERVIEW.md)
2. [Project Explanation](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/PROJECT_EXPLANATION.md)
3. [Architecture](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/ARCHITECTURE.md)
4. [Database Design](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/DATABASE_DESIGN.md)
5. [Authentication](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/AUTHENTICATION.md)
6. [RAG Explanation](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/RAG_EXPLANATION.md)
7. [API Documentation](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/API_DOCUMENTATION.md)
8. [Security](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/SECURITY.md)
9. [AWS Deployment](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/AWS_DEPLOYMENT.md)
10. [Testing Guide](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/TESTING.md)
11. [Hackathon Demo Guide](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/DEMO_GUIDE.md)
12. [AWS Builder Center Article Draft](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/BUILDER_CENTER_ARTICLE.md)
13. [Requirement Traceability Matrix](file:///home/kulayappa/.gemini/antigravity/scratch/club-member-portal/docs/REQUIREMENT_TRACEABILITY.md)

---

## Primary Campus Contact

- **Leader**: Shanmukha Sasi Sadineni · `sadinenisasi@gmail.com` · `7396025334`
- **Technical Lead**: Revan Kumar Goud Bommagoni
- **Weekly Meetings**: Wednesdays at 6:00 PM · CS Building, Room 101
