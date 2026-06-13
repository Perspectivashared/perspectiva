# AI-Powered Survey Recommendations — Implementation Plan

**Status:** Future implementation  
**Depends on:** Categorizer data being fully collected and stored (categorizer backend endpoint must be built first)  
**Estimated complexity:** High — spans backend schema changes, an AI embedding pipeline, and a new recommendation API endpoint

---

## Problem Statement

The current "Top Matches" section in ForYou.tsx does a naive client-side string comparison:

```ts
published.filter((s) => s.category === userCategory)
```

This only works if a survey's `category` exactly matches the user's `category` field — which depends entirely on the categorizer having been completed and the category field having been set. It produces no results for the majority of users, and even when it does, it ignores the 35+ rich profiling signals collected by the categorizer (interests, survey habits, personality, platform usage, etc.).

The goal is to replace this with vector similarity search: embed both user profiles and surveys as vectors, then recommend surveys whose vectors are closest to the user's profile vector.

---

## Prerequisites (must be done before this plan)

1. **Categorizer backend endpoint** — `PUT /users/me/categorizer` must exist and store user profiling data
2. **Categorizer data normalized into typed columns** — the data must be in queryable SQL columns, not a JSONB blob (see Step 1 below)
3. **Survey publish flow calls an embedding job** — new surveys must get embedded on publish
4. **pgvector extension** installed on the PostgreSQL instance

---

## Architecture Overview

```
Categorizer Form
      │
      ▼
┌─────────────────────────────────┐
│  user_profiles (normalized SQL) │  ← typed columns, indexable, queryable
└─────────────────────────────────┘
      │
      │  background job (on profile save)
      ▼
┌─────────────────────────────────┐
│  build_profile_text()           │  ← structured text representation
│  → OpenAI text-embedding-3-small│  ← embedding model (~$0.00002 per call)
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  user_profile_embeddings        │  ← vector(1536), pgvector
│  IVFFlat cosine index           │
└─────────────────────────────────┘
      │
      │  at recommendation time
      ▼
┌─────────────────────────────────┐
│  survey_embeddings              │  ← vector(1536) per published survey
│  <=> cosine similarity query    │
└─────────────────────────────────┘
      │
      ▼
 GET /surveys/recommended  →  ForYou.tsx "Top Matches" section
```

---

## Step 1: Replace JSONB With Normalized Typed Columns

The JSONB blob (`data JSONB` in `user_categorizer_profiles`) must be replaced with individual typed columns. This is the essential prerequisite for everything else.

**New schema for `user_categorizer_profiles`:**

```python
# app/categorizer/models.py

from sqlalchemy import Boolean, Float, SmallInteger, Text, ARRAY, ForeignKey, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

class UserCategorizerProfile(Base):
    __tablename__ = "user_categorizer_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )

    # ── Demographics ────────────────────────────────────────────────────────
    age: Mapped[int | None]                      = mapped_column(SmallInteger)
    country: Mapped[str | None]                  = mapped_column(Text)
    city: Mapped[str | None]                     = mapped_column(Text)
    gender: Mapped[str | None]                   = mapped_column(Text)
    living_situation: Mapped[str | None]         = mapped_column(Text)
    spoken_languages: Mapped[list[str] | None]   = mapped_column(ARRAY(Text))

    # ── Professional ─────────────────────────────────────────────────────────
    primary_status: Mapped[str | None]           = mapped_column(Text)
    profession_text: Mapped[str | None]          = mapped_column(Text)
    industry: Mapped[str | None]                 = mapped_column(Text)

    # ── Financial ────────────────────────────────────────────────────────────
    monthly_income_sgd: Mapped[float | None]     = mapped_column(Float)
    monthly_allowance_sgd: Mapped[float | None]  = mapped_column(Float)
    income_sources: Mapped[list[str] | None]     = mapped_column(ARRAY(Text))

    # ── Spending ─────────────────────────────────────────────────────────────
    major_expenditures: Mapped[list[str] | None]      = mapped_column(ARRAY(Text))
    online_purchase_frequency: Mapped[str | None]     = mapped_column(Text)
    purchase_channels: Mapped[list[str] | None]       = mapped_column(ARRAY(Text))
    price_sensitivity: Mapped[str | None]              = mapped_column(Text)

    # ── Digital life ─────────────────────────────────────────────────────────
    avg_daily_screen_time_hours: Mapped[float | None]       = mapped_column(Float)
    daily_platforms: Mapped[list[str] | None]               = mapped_column(ARRAY(Text))
    app_usage_pattern: Mapped[str | None]                   = mapped_column(Text)
    favourite_engagement_features: Mapped[list[str] | None] = mapped_column(ARRAY(Text))

    # ── Payments ─────────────────────────────────────────────────────────────
    has_paid_digital_content: Mapped[bool | None]          = mapped_column(Boolean)
    payment_convincing_factors: Mapped[list[str] | None]   = mapped_column(ARRAY(Text))
    comfortable_subscription_price: Mapped[str | None]     = mapped_column(Text)
    preferred_payment_frequency: Mapped[str | None]        = mapped_column(Text)

    # ── Interests & personality ──────────────────────────────────────────────
    interests: Mapped[list[str] | None]           = mapped_column(ARRAY(Text))
    topics_of_interest: Mapped[list[str] | None]  = mapped_column(ARRAY(Text))
    personality_type: Mapped[str | None]          = mapped_column(Text)

    # ── Community ────────────────────────────────────────────────────────────
    community_participation_style: Mapped[str | None]      = mapped_column(Text)
    preferred_community_size: Mapped[str | None]           = mapped_column(Text)
    community_motivations: Mapped[list[str] | None]        = mapped_column(ARRAY(Text))

    # ── Survey behaviour (meta-signal for survey matching) ───────────────────
    survey_frequency: Mapped[str | None]                    = mapped_column(Text)
    max_survey_time: Mapped[str | None]                     = mapped_column(Text)
    survey_completion_motivators: Mapped[list[str] | None]  = mapped_column(ARRAY(Text))
    survey_turn_offs: Mapped[list[str] | None]              = mapped_column(ARRAY(Text))

    # ── Technology ───────────────────────────────────────────────────────────
    primary_device: Mapped[str | None]   = mapped_column(Text)
    tech_savviness: Mapped[str | None]   = mapped_column(Text)
    ai_tools_usage: Mapped[str | None]   = mapped_column(Text)

    # ── Values ───────────────────────────────────────────────────────────────
    purchase_decision_factor: Mapped[str | None]          = mapped_column(Text)
    product_discovery_channels: Mapped[list[str] | None]  = mapped_column(ARRAY(Text))
    sustainability_importance: Mapped[str | None]          = mapped_column(Text)

    # ── Goals & feedback ─────────────────────────────────────────────────────
    primary_reason_for_joining: Mapped[str | None]  = mapped_column(Text)
    loyalty_factors: Mapped[list[str] | None]       = mapped_column(ARRAY(Text))
    preferred_feedback_format: Mapped[str | None]   = mapped_column(Text)
    gamified_rewards_preference: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), ...)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), ...)
```

**Why typed columns over JSONB:**
- Direct SQL filtering: `WHERE interests @> ARRAY['Technology']` with a GIN index
- Demographic targeting: `WHERE age BETWEEN 18 AND 25 AND industry = 'Education'`
- No JSON parsing overhead at feature-extraction time
- Aggregate analytics: `AVG(avg_daily_screen_time_hours)` across respondent cohorts

**Migration from existing JSONB:**
Write a one-time migration script that reads each `data` JSONB row and populates the new typed columns, then drops the JSONB column.

---

## Step 2: Add pgvector to PostgreSQL

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

pgvector is available on Supabase, Neon, Railway, and self-hosted Postgres. No external vector database (Pinecone, Weaviate, Qdrant) is needed — pgvector inside the existing Postgres instance handles this use case.

---

## Step 3: Embedding Tables

Create two new tables: one for user profile vectors, one for survey vectors.

```python
# app/embeddings/models.py

from pgvector.sqlalchemy import Vector   # pip install pgvector

EMBEDDING_DIM = 1536  # OpenAI text-embedding-3-small output dimension

class UserProfileEmbedding(Base):
    __tablename__ = "user_profile_embeddings"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    embedding: Mapped[list[float]] = mapped_column(Vector(EMBEDDING_DIM), nullable=False)
    model_version: Mapped[str]     = mapped_column(Text, nullable=False)  # e.g. "text-embedding-3-small"
    profile_hash: Mapped[str]      = mapped_column(Text, nullable=False)  # SHA-256 of source text
    computed_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), ...)


class SurveyEmbedding(Base):
    __tablename__ = "survey_embeddings"

    survey_id: Mapped[int] = mapped_column(
        ForeignKey("surveys.id", ondelete="CASCADE"), primary_key=True
    )
    embedding: Mapped[list[float]] = mapped_column(Vector(EMBEDDING_DIM), nullable=False)
    model_version: Mapped[str]     = mapped_column(Text, nullable=False)
    computed_at: Mapped[datetime]  = mapped_column(DateTime(timezone=True), ...)
```

**Indexes (in the Alembic migration):**

```sql
-- IVFFlat — approximate nearest-neighbour, fast for > 10k vectors
-- lists = sqrt(number of rows) is a reasonable starting value
CREATE INDEX user_profile_embeddings_cosine_idx
    ON user_profile_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX survey_embeddings_cosine_idx
    ON survey_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

---

## Step 4: Profile Text Builder

Convert the structured profile into a natural-language description for embedding. The quality of this text directly determines embedding quality.

```python
# app/embeddings/profile_builder.py

def build_profile_text(profile: UserCategorizerProfile, user: User) -> str:
    parts: list[str] = []

    if profile.age and profile.country:
        parts.append(f"{profile.age}-year-old from {profile.city or profile.country}.")
    if profile.primary_status:
        parts.append(f"Currently: {profile.primary_status}.")
    if profile.profession_text and profile.industry:
        parts.append(f"Works as {profile.profession_text} in {profile.industry}.")
    elif profile.industry:
        parts.append(f"Works in {profile.industry}.")

    if profile.interests:
        parts.append(f"Interests: {', '.join(profile.interests)}.")
    if profile.topics_of_interest:
        parts.append(f"Wants to share opinions on: {', '.join(profile.topics_of_interest)}.")

    if profile.personality_type:
        parts.append(f"Personality: {profile.personality_type}.")
    if profile.community_participation_style:
        parts.append(f"Community style: {profile.community_participation_style}.")

    if profile.survey_frequency:
        parts.append(f"Takes surveys: {profile.survey_frequency}.")
    if profile.max_survey_time:
        parts.append(f"Max survey time: {profile.max_survey_time}.")
    if profile.survey_completion_motivators:
        parts.append(f"Survey motivators: {', '.join(profile.survey_completion_motivators)}.")
    if profile.survey_turn_offs:
        parts.append(f"Survey turn-offs: {', '.join(profile.survey_turn_offs)}.")

    if profile.sustainability_importance:
        parts.append(f"Sustainability: {profile.sustainability_importance}.")
    if profile.purchase_decision_factor:
        parts.append(f"Buys based on: {profile.purchase_decision_factor}.")
    if profile.tech_savviness:
        parts.append(f"Tech level: {profile.tech_savviness}.")
    if profile.daily_platforms:
        parts.append(f"Daily platforms: {', '.join(profile.daily_platforms[:5])}.")

    return " ".join(parts)
```

**Survey text builder:**

```python
def build_survey_text(survey: Survey) -> str:
    parts = [f"Survey: {survey.title}.", f"Description: {survey.description}."]
    if survey.category:
        parts.append(f"Category: {survey.category}.")
    question_sample = [q.question_text for q in survey.questions[:8]]
    if question_sample:
        parts.append(f"Asks about: {'; '.join(question_sample)}.")
    return " ".join(parts)
```

---

## Step 5: Embedding Service

```python
# app/embeddings/service.py

import hashlib
import openai

client = openai.AsyncOpenAI()  # OPENAI_API_KEY env var
MODEL  = "text-embedding-3-small"
DIM    = 1536

async def embed_text(text: str) -> list[float]:
    response = await client.embeddings.create(input=text, model=MODEL)
    return response.data[0].embedding


async def upsert_user_embedding(
    db: AsyncSession, user: User, profile: UserCategorizerProfile
) -> None:
    text         = build_profile_text(profile, user)
    profile_hash = hashlib.sha256(text.encode()).hexdigest()

    existing = await db.get(UserProfileEmbedding, user.id)
    if existing and existing.profile_hash == profile_hash:
        return  # profile unchanged — skip the OpenAI call

    vector = await embed_text(text)

    if existing:
        existing.embedding    = vector
        existing.profile_hash = profile_hash
        existing.computed_at  = datetime.now(timezone.utc)
    else:
        db.add(UserProfileEmbedding(
            user_id=user.id, embedding=vector,
            model_version=MODEL, profile_hash=profile_hash,
        ))
    await db.commit()


async def upsert_survey_embedding(db: AsyncSession, survey: Survey) -> None:
    text   = build_survey_text(survey)
    vector = await embed_text(text)

    existing = await db.get(SurveyEmbedding, survey.id)
    if existing:
        existing.embedding   = vector
        existing.computed_at = datetime.now(timezone.utc)
    else:
        db.add(SurveyEmbedding(
            survey_id=survey.id, embedding=vector, model_version=MODEL
        ))
    await db.commit()
```

**Where to call these:**
- `upsert_user_embedding()` — inside `PUT /users/me/categorizer` after saving the profile
- `upsert_survey_embedding()` — inside `POST /surveys/{id}/publish` after the survey goes live

---

## Step 6: Recommendation Endpoint

**New endpoint:** `GET /surveys/recommended`  
**Replaces:** Client-side category string match in ForYou.tsx

```python
# app/surveys/router.py (add alongside existing endpoints)

from sqlalchemy import text as sql_text

@router.get("/surveys/recommended", response_model=list[SurveySummary])
async def get_recommended_surveys(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=10, le=30),
):
    user_embedding = await db.get(UserProfileEmbedding, current_user.id)
    if not user_embedding:
        # Fall back to category match if user has no profile embedding yet
        return await _category_fallback(db, current_user, limit)

    result = await db.execute(
        sql_text("""
            SELECT s.id, s.title, s.description, s.category, s.status,
                   s.target_responses, s.deadline, s.created_at,
                   s.published_at, s.community_id,
                   COUNT(sr.id) AS response_count,
                   (upe.embedding <=> se.embedding) AS distance
            FROM survey_embeddings se
            JOIN surveys s ON s.id = se.survey_id
            JOIN user_profile_embeddings upe ON upe.user_id = :user_id
            LEFT JOIN survey_responses sr ON sr.survey_id = s.id
            WHERE s.status = 'published'
              AND (s.deadline IS NULL OR s.deadline > NOW())
              AND s.id NOT IN (
                  SELECT survey_id FROM survey_responses
                  WHERE respondent_id = :user_id
              )
            GROUP BY s.id, upe.embedding, se.embedding
            ORDER BY distance
            LIMIT :limit
        """),
        {"user_id": current_user.id, "limit": limit},
    )
    rows = result.mappings().all()
    return [SurveySummary(**dict(row)) for row in rows]
```

The `<=>` operator is pgvector's cosine distance. Smaller = more similar. The IVFFlat index makes this fast even with tens of thousands of surveys.

---

## Step 7: Blend Behavioural Signals Over Time (Phase 2)

The profile embedding is a static onboarding snapshot. Over time, what the user *actually does* becomes a stronger signal. Blend the profile vector with a behaviour vector derived from their survey history:

```python
async def get_blended_user_vector(
    db: AsyncSession, user_id: int, profile_weight: float = 0.6
) -> list[float] | None:
    profile_emb = await db.get(UserProfileEmbedding, user_id)
    if not profile_emb:
        return None

    # Build a text description of the user's recent activity
    completed = await db.execute(
        select(Survey.title, Survey.category)
        .join(SurveyResponse, SurveyResponse.survey_id == Survey.id)
        .where(SurveyResponse.respondent_id == user_id)
        .order_by(SurveyResponse.submitted_at.desc())
        .limit(20)
    )
    history_text = "Previously completed: " + "; ".join(
        f"{s.title} ({s.category})" for s in completed
    )
    behaviour_vector = await embed_text(history_text)

    # Weighted blend
    b = 1.0 - profile_weight
    blended = [
        profile_weight * p + b * bv
        for p, bv in zip(profile_emb.embedding, behaviour_vector)
    ]
    # Normalise back to unit vector for cosine distance
    magnitude = sum(x ** 2 for x in blended) ** 0.5
    return [x / magnitude for x in blended] if magnitude > 0 else blended
```

---

## Frontend Changes Required

In `ForYou.tsx`, replace the "Top Matches" section's query:

```ts
// BEFORE (naive string match, client-side)
const topMatches = published.filter((s) => s.category === userCategory);

// AFTER (server-side vector similarity)
const topMatchesQ = useQuery({
  queryKey: ["recommended-surveys"],
  queryFn: () => api.get<ApiSurveySummary[]>("/surveys/recommended?limit=10"),
  staleTime: 5 * 60 * 1000,  // 5 min — recommendations don't change per-second
});
const topMatches = topMatchesQ.data ?? [];
```

Also add `GET /surveys/recommended` to `queryKeys.ts`:
```ts
recommendedSurveys: () => ["recommended-surveys"] as const,
```

---

## Additional Features Unlocked by This Architecture

Once user and survey vectors exist in pgvector, these features become single SQL queries:

| Feature | Implementation |
|---------|---------------|
| "Users like you also completed…" | Find N nearest user neighbours → aggregate their completions |
| "Similar surveys" on survey page | `survey_embedding <=> this_survey_embedding ORDER BY dist LIMIT 5` |
| Community matching | Embed community descriptions → recommend communities near user vector |
| Response quality flagging | Users with similar profiles should answer scale questions similarly — outliers flag suspicious responses |
| Re-engagement targeting | Find users whose profile vector is far from all recent survey embeddings → they've had nothing relevant lately |
| Creator analytics | "Your survey appeals to users aged 18–25 in Tech" — filter `user_categorizer_profiles` by respondent IDs |

---

## Migration Sequence (Zero Downtime)

1. **Install pgvector** — `CREATE EXTENSION IF NOT EXISTS vector;` — one command, no downtime
2. **Add typed columns** to `user_categorizer_profiles` alongside the existing JSONB column
3. **Backfill typed columns** from JSONB via a migration script
4. **Drop JSONB column** once verified
5. **Create embedding tables** — new tables, no risk
6. **Backfill embeddings** — one-time job to embed all existing profiles and published surveys
7. **Deploy recommendation endpoint** — feature-flag it in ForYou.tsx, A/B test against the current filter
8. **Remove the old client-side category filter** once recommendation quality is verified

---

## Environment Variables Needed

```
OPENAI_API_KEY=sk-...          # for text-embedding-3-small
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIM=1536
```

Approximate cost: `text-embedding-3-small` costs $0.00002 per 1K tokens. A typical profile text is ~100 tokens. Embedding 10,000 user profiles costs ~$0.02.

---

## Dependencies to Add

**Backend (`requirements.txt` / `pyproject.toml`):**
```
pgvector>=0.3.0
openai>=1.0.0
```

**Database:**
```
postgresql-16 with pgvector extension
```
