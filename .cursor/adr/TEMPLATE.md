# ADR XXXX: [Title in Title Case]

## Status

[Proposed | Accepted | Deprecated | Superseded] — YYYY-MM-DD

> **Note**: Update status when the decision changes. Include the date of status change.
>
> - **Proposed**: Under discussion, not yet implemented
> - **Accepted**: Approved and being/has been implemented
> - **Deprecated**: No longer recommended, but still in use (include deprecation date)
> - **Superseded**: Replaced by another ADR (link to replacement ADR)

## Context

> **What problem are we trying to solve?**
>
> Describe the forces at play:
>
> - Technical constraints or limitations
> - Business requirements
> - User needs
> - Team capabilities
> - Timeline pressures
> - Technical debt
>
> Provide enough context so someone reading this in 2 years understands:
>
> - Why we needed to make this decision
> - What was happening in the project at the time
> - What options were available

[Describe the issue or challenge that requires a decision. Include relevant background, technical constraints, and why this decision is necessary now.]

Example:

```
User interactions must feel instantaneous even when network latency is high
or connectivity is unreliable. Persisting writes directly to the homeserver
blocks the UI on round-trip times and introduces brittle error handling paths
for intermittent failures.
```

## Decision

> **What did we decide to do?**
>
> Be specific and concrete:
>
> - What approach are we taking?
> - What are the key technical details?
> - How will this be implemented?
> - What patterns should developers follow?
>
> Include code examples or diagrams if helpful.

[Describe the decision and the rationale behind it. Explain what you've decided to do and why this solution was chosen over alternatives.]

Example:

```
Write operations commit to the local Dexie store first, updating UI-observable
state immediately. A background synchronizer propagates mutations to the
homeserver and reconciles server acknowledgements or conflicts.
```

## Consequences

> **What are the impacts of this decision?**
>
> Be honest about trade-offs:
>
> - ✅ Positive consequences (benefits gained)
> - ❌ Negative consequences (costs incurred)
> - ⚠️ Neutral consequences (trade-offs, complexity added)
>
> Consider impacts on:
>
> - Development velocity
> - Code maintainability
> - System performance
> - Testing complexity
> - Operational overhead
> - Team knowledge requirements

### Positive ✅

- [Benefit 1]
- [Benefit 2]

### Negative ❌

- [Cost 1]
- [Cost 2]

### Neutral ⚠️

- [Trade-off 1: requires X but enables Y]
- [Complexity added: needs Z to manage]

Example:

```
✅ Perceived responsiveness stays high; UI reflects the local intent instantly.
✅ Offline edits and intermittent connectivity are supported without special UI flows.
⚠️ Requires reconciliation logic for conflicts, retries, and TTL/expiry management.
⚠️ Local data can momentarily diverge from server truth until synchronization completes.
```

## Alternatives Considered

> **What else did we evaluate?**
>
> For each alternative:
>
> - Describe the approach
> - Explain why it wasn't chosen
> - Note if it might be relevant in different circumstances
>
> This section helps future developers understand the decision space
> and might reveal when this ADR should be reconsidered.

### Alternative 1: [Name]

**Description**: [How this alternative would work]

**Pros**:

- [Advantage 1]
- [Advantage 2]

**Cons**:

- [Disadvantage 1]
- [Disadvantage 2]

**Why not chosen**: [Reason this wasn't selected]

### Alternative 2: [Name]

[Same structure as Alternative 1]

Example:

```
### Server-first writes
Simpler consistency model but unacceptable latency and offline behaviour.

### Optimistic server writes
Still depends on network success before local state stabilizes, defeating
the purpose of local-first design.
```

## Implementation Notes

> **Optional section**: Include if there are important implementation details
>
> - Key code locations
> - Migration strategy
> - Rollout plan
> - Feature flags
> - Monitoring/metrics
> - Testing approach

[Optional: Add specific implementation guidance, code references, or migration steps]

Example:

```
- Local writes implemented in `LocalPostService.upsertPost()`
- Background sync handled by `PostSyncApplication.syncPendingWrites()`
- Conflict resolution uses last-write-wins with server timestamp authority
- Monitor metric: `sync.conflict_rate` (alert if > 1% of writes)
```

## Related Decisions

> **Optional section**: Link to related ADRs
>
> - Which ADRs does this depend on?
> - Which ADRs does this supersede?
> - Which ADRs are related?

- [ADR-XXXX: Related Decision Title](./XXXX-related-decision.md)
- Supersedes: [ADR-YYYY: Old Decision](./YYYY-old-decision.md)
- Depends on: [ADR-ZZZZ: Foundation Decision](./ZZZZ-foundation.md)

## References

> **Optional section**: External resources
>
> - Research papers
> - Blog posts
> - Documentation
> - Related issues/PRs

- [Link to relevant documentation]
- [Link to research/article that influenced decision]
- [Link to GitHub issue or PR that prompted this ADR]

---

## Guidelines for Writing ADRs

### Numbering

- Use sequential 4-digit numbering: 0001, 0002, etc.
- Check `docs/adr/` for the next available number
- Don't reuse numbers even if an ADR is deleted

### File Naming

- Format: `NNNN-title-in-kebab-case.md`
- Example: `0008-event-sourcing-for-posts.md`
- Keep titles concise but descriptive

### When to Create an ADR

Create an ADR when:

- ✅ Decision has significant architectural impact
- ✅ Decision affects multiple teams or systems
- ✅ Decision involves trade-offs that need documentation
- ✅ Decision might be questioned or revisited
- ✅ Decision establishes a pattern others should follow

Don't create an ADR for:

- ❌ Implementation details within a single module
- ❌ Routine technology choices (e.g., which logging library)
- ❌ Decisions that can be easily reversed
- ❌ Personal preferences without broader impact

### Writing Tips

1. **Write for future readers**: Assume they have no context about the current situation
2. **Be specific**: Vague ADRs are useless ADRs
3. **Include examples**: Code snippets, diagrams, or scenarios help understanding
4. **Be honest about trade-offs**: Don't sugarcoat negative consequences
5. **Keep it concise**: Aim for clarity, not length (most ADRs are 1-2 pages)
6. **Update status**: ADRs are living documents in the status field only

### Review Process

Before merging an ADR:

- [ ] Title is clear and descriptive
- [ ] Context explains the problem adequately
- [ ] Decision is specific and actionable
- [ ] Consequences are honest and complete
- [ ] Alternatives are documented with rationale
- [ ] ADR number is sequential and unique
- [ ] File name follows naming convention
- [ ] Status is set appropriately
- [ ] Date is included
- [ ] Linked from `AGENTS.md` and `.cursor/core-context.md`

### Updating Existing ADRs

ADRs are mostly immutable once accepted. Changes should be:

- **Status updates**: When deprecated or superseded
- **Typo fixes**: Grammar and spelling only
- **Clarifications**: Adding examples or details without changing the decision
- **Links**: Adding references to new related ADRs

If the decision itself needs to change:

- Don't modify the original ADR's Decision or Alternatives sections
- Create a new ADR that supersedes the old one
- Update the old ADR's status to "Superseded" with a link to the new one

---

**Delete this guidelines section when creating a new ADR from this template.**
