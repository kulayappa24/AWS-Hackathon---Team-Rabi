# AWS Cloud Deployment Architecture

## 1. Cloud Architecture Overview

For production deployment on Amazon Web Services, the Club Member Portal maps each local module to a fully managed AWS cloud service:

```mermaid
graph TD
    User([Club Member Browser])

    subgraph AWSCloud ["Amazon Web Services (AWS)"]
        CF[Amazon CloudFront CDN]
        S3Static[Amazon S3 (React Static Assets)]
        Cognito[Amazon Cognito User Pool]
        SES[Amazon SES (Password Reset Emails)]
        
        ALB[Application Load Balancer]
        AppRunner[AWS App Runner / ECS Fargate (Spring Boot Java 21)]
        
        S3Docs[Amazon S3 (Club Documents)]
        Bedrock[Amazon Bedrock Knowledge Bases / Claude 3]
        RDS[(Amazon Aurora PostgreSQL + pgvector)]
    end

    User -->|HTTPS :443| CF
    CF --> S3Static
    CF -->|/api/*| ALB
    ALB --> AppRunner

    AppRunner -->|JWT / OAuth2| Cognito
    AppRunner -->|Trigger Reset Email| SES
    AppRunner -->|Fetch Raw Docs| S3Docs
    AppRunner -->|Vector Search & Foundation Model| Bedrock
    AppRunner -->|User & Session Data| RDS
```

## 2. AWS Service Mapping

| Local Component | Production AWS Service | Purpose & Advantages |
|---|---|---|
| Frontend (React + Vite) | **Amazon S3 + CloudFront** | Globally distributed, sub-50ms static site delivery with custom SSL. |
| User Authentication | **Amazon Cognito** | Secure student directory with MFA, password policies, and OAuth2/OIDC token issuance. |
| Password Reset & Emails | **Amazon SES** | High deliverability transactional emails for password resets and announcements. |
| Backend API | **AWS App Runner / Amazon ECS** | Fully managed containerized Java 21 runtime with automatic scaling and load balancing. |
| Document Storage | **Amazon S3** | Durable storage for approved club markdown guides, versioning, and event-driven ingestion. |
| AI Foundation Model | **Amazon Bedrock** | Serverless foundation model APIs (Anthropic Claude 3 Haiku / Titan Text G1) with strict prompt grounding. |
| Relational & Vector DB | **Amazon Aurora PostgreSQL** | High availability managed database supporting pgvector for semantic vector embeddings. |

## 3. Step-by-Step Production Deployment Guide

### Step 1: Database Setup
1. Provision an **Amazon Aurora PostgreSQL Serverless v2** cluster.
2. Enable the `vector` extension in the database: `CREATE EXTENSION IF NOT EXISTS vector;`.

### Step 2: Document Ingestion with Bedrock Knowledge Bases
1. Create an Amazon S3 bucket (e.g. `sbg-approved-documents-prod`).
2. Upload the 8 starter markdown files.
3. Configure **Amazon Bedrock Knowledge Bases** pointing to the S3 bucket using OpenSearch Serverless as the vector index.

### Step 3: Containerize and Deploy Spring Boot API
1. Build the production Docker image for the Spring Boot backend:
   ```bash
   docker build -t club-member-portal-backend ./backend
   ```
2. Push the image to **Amazon ECR** (Elastic Container Registry).
3. Deploy to **AWS App Runner** or **Amazon ECS (Fargate)** with environment variables configured from AWS Secrets Manager.

### Step 4: Deploy Frontend to S3 & CloudFront
1. Build the production bundle:
   ```bash
   cd frontend && npm run build
   ```
2. Sync the `/dist` directory to the frontend S3 bucket:
   ```bash
   aws s3 sync ./dist s3://sbg-club-portal-frontend/
   ```
3. Invalidate the Amazon CloudFront distribution cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
   ```
