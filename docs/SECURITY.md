# Security Architecture & Hardening Guide

## 1. Threat Modeling & Protections

| Threat Vector | Mitigation Strategy | Implementation File |
|---|---|---|
| Plaintext Password Exposure | BCrypt hashing with work factor 12 | `SecurityConfig.java`, `AuthService.java` |
| Token Hijacking & Tampering | HMAC-SHA signing on JWT with 24-hr expiry | `JwtTokenProvider.java` |
| Unauthenticated Resource Access | Spring Security filter chain requiring authentication | `SecurityConfig.java`, `JwtAuthenticationFilter.java` |
| Account Enumeration on Password Reset | Uniform success response for known & unknown emails | `AuthService.java` |
| Password Reset Token Brute Force | Cryptographically random UUID tokens with 30-min TTL | `AuthService.java`, `PasswordResetToken.java` |
| Sensitive Credential Logging | Strict exclusion of passwords/tokens from logger calls | All Services & Controllers |
| Cross-Origin Resource Sharing (CORS) | Explicit allowed origins whitelist | `CorsConfig.java` |

## 2. Secrets Management

- Zero production secrets are committed to the codebase.
- Development configurations use fallback mock parameters, while cloud production requires environment variables via `.env` or AWS Secrets Manager.
- An example template is provided in `.env.example`.
