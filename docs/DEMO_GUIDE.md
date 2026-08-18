# Hackathon Demo Guide & Script

This guide provides an optimized, step-by-step presentation script to demonstrate the 70% Baseline Club Member Portal to hackathon judges.

---

## Demo Script (Time: ~3 to 5 minutes)

### Step 1: Introduction & Landing Page (0:00 - 0:45)
- **Action**: Open browser at `http://localhost:5173/`.
- **Talking Points**:
  - *"Welcome judges. We built the Student Builder Groups Club Member Portal to serve as the single source of truth and digital mentor for campus Student Builders."*
  - *"Our system features a Java 21 Spring Boot backend, a React frontend, and a strict RAG engine grounded exclusively in our 8 approved club documents."*

### Step 2: Sign Up & Authentication (0:45 - 1:30)
- **Action**: Click **Join the Club** (`/signup`).
- **Input**:
  - Name: `Demo Builder`
  - Email: `demo@campus.edu`
  - Password: `Password123!`
  - Confirm: `Password123!`
- **Talking Points**:
  - *"Registration enforces BCrypt password hashing, email format validation, and stateless JWT authentication."*
  - *"Guests cannot access member chat routes—Spring Security blocks all unauthenticated requests."*

### Step 3: Member Dashboard (1:30 - 2:00)
- **Action**: View `/dashboard`.
- **Talking Points**:
  - *"The dashboard gives members immediate visibility into all 8 approved club documents, upcoming workshop shortcuts, and previous conversation sessions."*
  - *"There are no fake statistics or mock graphs—every element serves a functional purpose."*

### Step 4: Grounded AI Chat with Citations (2:00 - 3:15)
- **Action 1**: Click **Launch AI Chat** (`/chat`).
- **Action 2**: Click suggested question: *"When is the next workshop?"*
  - **Show**: Grounded answer (`Feb 12: RAG chatbots on Bedrock in CS 204`) + Source Badge (`06-workshop-index.md`, Section `Next workshop`).
- **Action 3**: Ask: *"How do I publish on Builder Center?"*
  - **Show**: Step-by-step instructions + Source Badge (`03-builder-center-publish.md`, Section `Why publish?` / `Steps`).
- **Action 4**: Demonstrate Copy response & Thumbs Up feedback.

### Step 5: Safe Directory Fallback Demo (3:15 - 3:50)
- **Action**: Ask: *"What is the exact discount on AWS Quantum Processing in year 2045?"*
- **Show**: Immediate safe fallback message:
  > *"I couldn't find that information in the club documents. Please contact Shanmukha Sasi Sadineni, AWS Student Builder Group Leader, at sadinenisasi@gmail.com or 7396025334."*
- **Talking Points**:
  - *"Our AI safety rules strictly forbid hallucinations, pricing guessing, or policy invention. When information is unavailable in approved club files, it immediately routes the student to campus leadership from 01-onboarding-faq.md."*

### Step 6: Forgot Password & AWS Architecture Pitch (3:50 - 4:45)
- **Action**: Show `/forgot-password` flow and explain cloud mapping:
  - *Authentication -> Amazon Cognito*
  - *Reset Emails -> Amazon SES*
  - *Document Ingestion -> Amazon S3 + Bedrock Knowledge Bases*
  - *API Runtime -> Spring Boot on AWS App Runner / ECS Fargate*
  - *Database -> Amazon Aurora PostgreSQL Serverless*
