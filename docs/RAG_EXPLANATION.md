# RAG & Grounded AI Assistant Explanation

## 1. Document Ingestion Pipeline

The portal loads the 8 authoritative club documents from `/documents` at application startup:

```
01-onboarding-faq.md           # New member FAQ + directory
02-aws-account-setup.md         # AWS account, Free Tier, and billing alerts
03-builder-center-publish.md    # Steps & guidelines for Builder Center
04-bedrock-starter.md           # Amazon Bedrock and RAG concepts
05-hackathon-rules.md           # Hackathon rule book
06-workshop-index.md            # Schedule of upcoming & past workshops
07-lambda-patterns.md           # Serverless API routes & notes
08-sbg-community.md             # About Student Builder Groups
```

### Ingestion Rules
1. **Zero Summarization During Ingestion**: Real file contents are ingested with 100% integrity.
2. **Heading & Section Extraction**: The `MarkdownDocumentParser` extracts sections based on `#`, `##`, and `###` markdown syntax.
3. **Metadata Preservation**: Every chunk retains its source `filename`, `title`, `sectionHeading`, and `chunkIndex`.
4. **SHA-256 Checksums**: Document contents are hashed with SHA-256 to avoid redundant indexing on restart.

## 2. Hybrid Retrieval & Semantic Scoring

When a member asks a question:
1. The `SemanticSimilarityScorer` tokenizes the query, removes non-informational stop words, and computes a multi-tiered relevance score:
   - **Exact phrase match boost**: +0.50 for phrase occurrences in content/headings.
   - **BM25 frequency saturation**: Non-linear term saturation on significant query tokens.
   - **Section heading match boost**: Multiplied by 2.5x.
   - **Document filename match boost**: Multiplied by 3.0x.
   - **Token coverage ratio**: Damps scores if key query terms are missing.
2. The `DocumentRetriever` selects the top matching chunks that exceed the configurable similarity threshold (`0.25`).

## 3. Grounded Synthesis & Citations

- The `LocalGroundedAiService` or `BedrockAiService` synthesizes the final answer strictly from the retrieved chunk content.
- Every response attaches:
  - **Primary Source**: Filename (e.g. `06-workshop-index.md`) and Section (e.g. `Next workshop`).
  - **Relevance Confidence**: Numerical similarity score.
  - **All Contributing Sources**: Full list of relevant sections.

## 4. Safe Directory Fallback

If the query has no matching documents in the starter pack (or retrieval score is below threshold):
- The model **never guesses**, **never invents**, and **never hallucinates**.
- It returns the verified contact message from `01-onboarding-faq.md`:
  > *"I couldn't find that information in the club documents. Please contact Shanmukha Sasi Sadineni, AWS Student Builder Group Leader, at sadinenisasi@gmail.com or 7396025334."*
