# REST API Documentation

Base URL: `http://localhost:8080/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/signup`
Creates a new student member account.
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "alex@campus.edu",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "campusId": "CS-2026-88"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "token": "eyJhbGciOiJIUzM4NCJ9...",
      "type": "Bearer",
      "id": 1,
      "name": "Alex Rivera",
      "email": "alex@campus.edu",
      "role": "ROLE_MEMBER",
      "campusId": "CS-2026-88"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates an existing member.
- **Request Body**:
  ```json
  {
    "email": "alex@campus.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzM4NCJ9...",
      "type": "Bearer",
      "id": 1,
      "name": "Alex Rivera",
      "email": "alex@campus.edu",
      "role": "ROLE_MEMBER"
    }
  }
  ```

### `POST /api/auth/forgot-password`
Requests a password reset token.
- **Request Body**:
  ```json
  {
    "email": "alex@campus.edu"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "If an account exists with that email, a password reset link has been dispatched."
  }
  ```

### `POST /api/auth/reset-password`
Resets member password using reset token.
- **Request Body**:
  ```json
  {
    "token": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "newPassword": "NewSecurePassword456!",
    "confirmPassword": "NewSecurePassword456!"
  }
  ```

---

## 2. Member Chat & RAG Endpoints (`/api/chat` - Protected)

### `POST /api/chat/ask`
Submits a query to the grounded RAG assistant.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "question": "When is the next workshop?",
    "sessionUuid": "optional-uuid"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      "messageId": 42,
      "sessionUuid": "a8f341b2-1087-4632-95f2-9018c14a2f8b",
      "answer": "The next scheduled workshop is **RAG chatbots on Bedrock**...",
      "primarySource": {
        "filename": "06-workshop-index.md",
        "section": "Next workshop",
        "relevanceScore": 0.58
      },
      "allSources": [
        {
          "filename": "06-workshop-index.md",
          "section": "Next workshop",
          "relevanceScore": 0.58
        }
      ],
      "confidence": 0.58,
      "isFallback": false
    }
  }
  ```

### `GET /api/chat/sessions`
Retrieves chat session history for current authenticated member.

### `POST /api/chat/messages/{messageId}/feedback`
Records thumbs up (`UP`) or thumbs down (`DOWN`) feedback.

---

## 3. Documents & System Endpoints (`/api/documents`, `/api/health`)

### `GET /api/documents`
Lists all indexed approved club documents.

### `POST /api/documents/reindex`
Triggers an immediate re-index of documents in `/documents`.

### `GET /api/health`
Health check status endpoint.
