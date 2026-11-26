# Conflicts

**1. Treasury totals for single-entity users (req 6 vs reqs 1 and 3).**
The Treasurer asks for totals for every user, including the Cold Chain pilot. That scope is
one entity, so its "total" and "average" equal ap-004's restricted balance, and "count above
2M" reveals whether it exceeds the trigger. Affects: ap-004 and any entity-scoped user.
Did: aggregates are only returned for scopes of 3+ entities; the pilot gets a refusal
explaining why. Needs a decision from Treasury and Corporate Planning.

**2. "A group total identifies no one" fails if users choose the group or threshold.**
A region's total minus the total excluding one entity gives that entity's balance; varying
the threshold recovers individual balances. Affects: every entity in a regional scope.
Did: aggregates cover the user's whole scope only, with no filters, and the threshold is
fixed at 2,000,000 USD.

**3. User switcher vs "scope comes from the user record" (req 2).**
The required screen lets anyone pick any user, including Corporate Planning, so the
client effectively chooses its own scope. Affects: all data. Did: the server takes only a
user id, looks the scope up in users.json and rejects any other fields; production
needs real authentication.