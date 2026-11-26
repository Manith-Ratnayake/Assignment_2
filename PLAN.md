# Plan

> Added late: this should have been the first commit, and I missed it.

## What I'm building
A Python (FastAPI) backend and one Next.js page: pick one of the four users, type a
question, and get an answer with the entities it cites. OpenAI does the language work;
the access rules are enforced in code, not by the model.

For every question:
1. Look up the user in `users.json` by id. Scope comes only from that record.
2. Filter entities by scope (`region` / `id` fields only). Unknown scope returns nothing.
3. Mask `bank_account` and `treasury_balance_usd` as `[RESTRICTED]`.
4. Compute treasury aggregates in code over the user's whole scope (3+ entities only).
5. Send only the scoped, masked records to the model; it returns JSON with citations.
6. Check the output: one fixed not-found reply, citations limited to the user's scope, no
   numbers that weren't in the data sent to the model.

## Assumptions
- `clearance: elevated` does not unlock sensitive fields; requirement 3 has no exception.
- The user dropdown stands in for login; the server trusts only the user id.
- Treasury figures are withheld for scopes under 3 entities (see CONFLICTS.md).

## Leaving out
- Real authentication, chat history, streaming, styling.
- Retrieval/embeddings: 24 records fit in one prompt.
- Aggregates over user-chosen subsets or thresholds.
