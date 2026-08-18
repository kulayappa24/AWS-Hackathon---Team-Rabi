# Student Builder Groups — Club Member Portal (70% Baseline)

## 1. Executive Summary

The **Student Builder Groups Club Member Portal** is a production-grade web application and grounded AI assistant built specifically for campus AWS Student Builder Groups. It enables club members to seamlessly register, log in, explore club events, and interact with a Retrieval-Augmented Generation (RAG) AI assistant grounded strictly in 8 approved club starter documents.

## 2. Core Problem & Solution

### The Challenge
New members joining the campus AWS Student Builder Group frequently have recurring questions about workshop schedules, AWS account configuration, Free Tier billing safety, publishing on AWS Builder Center, Amazon Bedrock foundation models, and hackathon guidelines. Manually answering these questions strains chapter leadership and creates friction for onboarding students.

### The Solution
A dedicated member portal featuring:
1. **Self-Service Member Portal**: Secure sign up, login, and self-service password reset flows.
2. **Grounded RAG Assistant**: A conversational AI engine that searches only approved club documentation, providing exact source filenames and section citations on every answer.
3. **Strict Fallback Guarantee**: If a member asks an out-of-scope question or inquires about unknown AWS policies/limits/pricing, the system refuses to hallucinate and immediately provides the contact information of chapter leadership (*Shanmukha Sasi Sadineni · sadinenisasi@gmail.com · 7396025334*).
4. **Human-Crafted Experience**: High-contrast, intuitive, responsive user interface designed specifically for university students without AI-generated slop or fake metrics.

## 3. Technology Stack

- **Backend**: Java 21, Spring Boot 3.3.x, Spring Web, Spring Security, Spring Data JPA, Hibernate, Maven.
- **Frontend**: React 18, Vite, TypeScript, Modern CSS (Design Tokens, Dark/Light Mode).
- **Database**: PostgreSQL 16+ (with pgvector and H2-PostgreSQL local development profile).
- **RAG Engine**: Markdown Section Parser, Hybrid BM25 & Semantic Similarity Scorer, Chunk Repository, Dynamic Re-indexing.
- **AI Abstraction**: Modular `AiService` interface with `LocalGroundedAiService` and `BedrockAiService` (Amazon Bedrock integration).

## 4. Key Metrics & Status

- **PDF Requirement Coverage**: 100% of 70% Baseline Reference Specification.
- **Automated Tests**: 16/16 Spring Boot integration and unit tests passing.
- **Frontend Type Safety**: 100% clean TypeScript build with zero errors.
- **Startup Ingestion**: 8 starter markdown files ingested and chunked automatically at startup.
