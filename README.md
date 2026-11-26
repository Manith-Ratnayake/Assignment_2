# Meridian Group Entity Assistant

Ask questions in plain English about Meridian Group's legal entities. Each user only gets
answers from the entities they're allowed to see.

## Run it

### Backend (Python 3.11+)

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env        # then set OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

Optional: `OPENAI_MODEL` (default `gpt-4.1-mini`).

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local     # set AUTH_SECRET and POSTGRES_URL, then:
pnpm db:migrate
pnpm dev
```

Add `NEXT_PUBLIC_API_URL=http://localhost:8000` to `.env.local`.

**The assistant is at http://localhost:3000/meridian.** The rest of the frontend is the
Vercel chatbot template I started from. Its built-in chat calls the model directly and
would bypass the access rules, so it is not part of this submission.

### Tests (proof of requirement 1)

```bash
cd backend
pytest -q
```

## Approach

Access is enforced **before** the LLM is called, in `backend/main.py`:

1. **Scope from the user record only.** The request carries only `user_id` and
   `question`; any other field is rejected. The scope is looked up in `users.json`.
2. **Filter by structured fields.** `region` / `id`, never entity names. Some names are
   misleading: "Europa Freight Lanka" is Asia Pacific, "Pacific Rim Logistics (Europe)"
   is Europe. Unknown or malformed scopes return nothing.
3. **Mask sensitive fields.** `bank_account` and `treasury_balance_usd` become
   `[RESTRICTED]`, so the model can say the value exists without knowing it.
4. **The model only sees what the user may see.** It cannot leak what it was never given.
   That includes the prompt injection planted in `ap-005`'s `notes`: even if the model
   obeys it, it has nothing out of scope to reveal.
5. **Output guard.** One fixed not-found reply that never echoes the question; citations
   limited to the user's scope; any number not in the data sent to the model is blocked;
   IBAN-shaped strings are blocked.

### Decisions

- **Out-of-scope = not-found.** The prompt context depends only on the user, not the
  question, so the model's view of a real out-of-scope entity and a made-up one is
  identical. The guard deliberately uses only in-scope data: a filter that checked answers
  against the full dataset would react to real entity names but not fake ones, and would
  itself leak which entities exist.
- **Treasury aggregates** (total, average, count above 2,000,000 USD) are computed in code,
  over the user's whole scope only, with the threshold fixed, and only for 3+ entities.
  See CONFLICTS.md for why.
- **`clearance: elevated`** does not unlock sensitive fields. Requirement 3 has no
  exception.
- **No retrieval.** 24 records fit in one prompt, so each user's whole scope is sent.

### How requirement 1 is shown

`backend/test_access.py` (22 tests, no API key needed) replaces the model with fakes:

- each user's scope matches their record, including the misleading names;
- for every user and several attack questions, the prompt contains no out-of-scope ids,
  names, registration numbers or notes, and no bank account or balance anywhere;
- a "compromised" model that dumps its whole prompt and cites every id still leaks
  nothing to the user;
- asking about a real out-of-scope entity and a made-up one returns identical responses;
- the guard responds the same to a real out-of-scope balance and a made-up number;
- the Cold Chain account gets no treasury figures;
- a request that sends its own `scope` is rejected.

## With more time

- Real authentication instead of the user dropdown.
- Transcripts from the live model committed alongside the tests.
- Dominance rule for aggregates: `ap-002` is about 56% of the Asia Pacific total.
- Protection against differencing totals across users with overlapping scopes.
- Audit logging of questions and refusals.
- Strip the unused template code from the frontend.

## Noticed but not handled

- Dormant entities hold zero balances. A model could infer "zero" from the notes; the
  prompt forbids it, but the guard cannot catch it in words.
- `PLAN.md` was committed late, not first as the brief asked.
