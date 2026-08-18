# Requirement Traceability Matrix (70% Baseline Reference Specification)

| Requirement ID | PDF Requirement Description | Implementation Component(s) | Verification / Test Status |
|---|---|---|---|
| **REQ-01** | Backend written in Java using Spring Boot with clean architecture | `backend/src/main/java/com/aws/sbg/*` (Spring Boot 3.3.4, Java 21) | PASSED (`ClubMemberPortalApplicationTests`) |
| **REQ-02** | Frontend written in React, Vite, TypeScript | `frontend/src/*` (React 18, Vite 5, TypeScript 5) | PASSED (`npm run build`, zero TS errors) |
| **REQ-03** | Database using PostgreSQL (relational tables + foreign keys) | `database/schema.sql`, `docker-compose.yml`, JPA Entities | PASSED (`PostgreSQL 16` container schema) |
| **REQ-04** | Auth flow: Sign up, Login, Forgot Password, Reset Password | `AuthService.java`, `AuthController.java`, `AuthContext.tsx` | PASSED (`AuthServiceTest`, `PasswordResetTest`) |
| **REQ-05** | BCrypt password hashing & stateless JWT token validation | `SecurityConfig.java`, `JwtTokenProvider.java`, `JwtAuthenticationFilter.java` | PASSED (`SecurityTest`, 12 rounds BCrypt) |
| **REQ-06** | Zero-logging policy for passwords and sensitive tokens | All backend services, controllers, and exception handlers | PASSED (No passwords/tokens printed) |
| **REQ-07** | Member chat route protected (Guests strictly blocked with 401) | `SecurityConfig.java`, `ProtectedRoute.tsx` | PASSED (`SecurityTest.unauthenticatedRequestsAreBlocked`) |
| **REQ-08** | Ingestion of 8 approved starter markdown files | `DocumentIngestionService.java`, `MarkdownDocumentParser.java` | PASSED (`DocumentIngestionService` logs 8 docs) |
| **REQ-09** | Markdown chunking preserving section headings and content without summarization | `MarkdownDocumentParser.java`, `SectionChunk.java` | PASSED (`RAGRetrievalTest.testMarkdownParsingAndChunking`) |
| **REQ-10** | Hybrid semantic retrieval and ranking on documents | `DocumentRetriever.java`, `SemanticSimilarityScorer.java` | PASSED (`RAGRetrievalTest.testWorkshopRetrieval`) |
| **REQ-11** | Grounded answer generation with source citation (filename + section) | `LocalGroundedAiService.java`, `SourceCard.tsx` | PASSED (`GroundedAnswerTest.testGroundedAnswer`) |
| **REQ-12** | Safe directory fallback citing Shanmukha Sasi Sadineni | `LocalGroundedAiService.java`, `01-onboarding-faq.md` | PASSED (`FallbackTest.testFallbackMessage`) |
| **REQ-13** | AI service abstraction for local and Amazon Bedrock | `AiService.java`, `BedrockAiService.java`, `AiServiceFactory.java` | PASSED (`AiServiceFactory` wiring) |
| **REQ-14** | Human-crafted UI with light/dark modes and no fake metrics | `variables.css`, `main.css`, React components | PASSED (Clean, responsive layout) |
| **REQ-15** | Comprehensive documentation suite in `docs/` | 13 detailed markdown documents in `docs/` | COMPLETE |
