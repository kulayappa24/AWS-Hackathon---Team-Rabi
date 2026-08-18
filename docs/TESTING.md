# Testing & Verification Guide

## 1. Automated Test Suites

### Backend Unit & Integration Tests (Spring Boot + JUnit 5)
Run all backend tests with Maven:
```bash
cd backend
mvn clean test
```

### Test Coverage Summary

| Test Class | Category | What is Verified |
|---|---|---|
| `ClubMemberPortalApplicationTests` | Context | Spring context bootstrap, beans initialization, profile loading |
| `AuthServiceTest` | Unit / Integration | Member sign up, password match validation, duplicate email rejection, login |
| `PasswordResetTest` | Integration | Reset token generation, expiry validation, token invalidation, password update |
| `RAGRetrievalTest` | RAG / Search | Markdown parser section extraction, heading context, hybrid similarity ranking |
| `GroundedAnswerTest` | AI / Citations | Grounded answer generation, exact source file and section citations |
| `FallbackTest` | AI Safety | Safe fallback invocation for out-of-scope queries citing Shanmukha Sasi Sadineni |
| `SecurityTest` | Security / Web | MockMvc verification of 401 Unauthorized for unauthenticated chat and user routes |

---

## 2. Frontend Build & Type Validation

Run TypeScript validation and Vite production build:
```bash
cd frontend
npm run build
```

---

## 3. End-to-End Acceptance Test Matrix

| # | Acceptance Scenario | Expected Result | Verified Status |
|---|---|---|---|
| 1 | Sign up new member with valid details | 201 Created, JWT token returned, user record in DB | PASSED |
| 2 | Duplicate email registration | 400 Bad Request ("Account already exists") | PASSED |
| 3 | Login with valid credentials | 200 OK, JWT token returned | PASSED |
| 4 | Guest attempts unauthenticated `/api/chat/ask` | 401 Unauthorized | PASSED |
| 5 | Member asks: *"When is the next workshop?"* | Grounded response with source `06-workshop-index.md` & section `Next workshop` | PASSED |
| 6 | Member asks: *"How do I publish on Builder Center?"* | Grounded response with source `03-builder-center-publish.md` | PASSED |
| 7 | Member asks out-of-scope unknown question | Safe directory fallback citing Leader Shanmukha Sasi Sadineni | PASSED |
| 8 | Member requests password reset | Reset token generated & logged to console simulator | PASSED |
| 9 | Member resets password with token | Password updated, old token invalidated, login with new password succeeds | PASSED |
| 10 | Re-index documents via API (`/api/documents/reindex`) | 8 starter files parsed and total chunks returned | PASSED |
