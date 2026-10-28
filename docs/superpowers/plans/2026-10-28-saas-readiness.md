# SaaS Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SSKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform TokoKu dashboard from a UI demo into a production-ready SaaS admin panel with proper authentication, API security, data persistence, and observability.

**Architecture:** 
- Move from in-memory state to PostgreSQL with Prisma ORM
- Implement server-side authentication using SvelteKit sessions
- Add rate limiting, CORS, and CSRF protection
- Add logging, monitoring, and error handling
- Add pagination, virtualization, and performance optimizations

**Tech Stack:** 
- PostgreSQL + Prisma ORM
- SvelteKit 3 sessions (`@sveltejs/kit/session`)
- Rate limiting (`@upstash/ratelimit` + Redis)
- Logging (`pino`)
- Virtualization (`svelte-virtual-scroller`)
- Caching (`@sveltejs/kit@adapter-node` static optimization)

**Spec:** Based on audit findings from `docs/superpowers/plans/2026-10-28-saas-readiness-audit.md`

## Global Constraints

- **Svelte 5 Runes:** All components must use `$props()`, `$state`, `$derived`, `$effect` (enforced in `vite.config.ts`)
- **TypeScript Strict:** No `any` without explicit comment; use typed interfaces
- **Indonesian Domain Identifiers:** Domain terms stay Indonesian (`bergabung`, `totalBelanja`, `anggota`); technical terms stay English (`filterMembers`, `sortMembers`)
- **UI Copy:** English only, including errors and API messages
- **Rupiah Format:** `Rp` prefix with Indonesian digit grouping (`toLocaleString('id-ID')`)
- **Date Format:** English month names (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec)
- **File Structure:** Internal imports use `#lib/...`, `#lib/server/*` is server-only, `src/lib/server/**` excluded from Vitest
- **Testing:** Every non-trivial logic branch needs a test; tests are colocated with the code they test
- **Accessibility:** Icon-only buttons need `aria-label`; dropdowns need `aria-haspopup`, `aria-expanded`, `role="menu"`; form fields need `aria-label` and `role="alert"` for errors

## Review Focus

1. **Auth bypass:** A user can access any page by disabling JavaScript or inspecting the client store → Test: Attempt to access `/member` without a valid session
2. **API security:** An attacker can read, create, or modify members without authentication → Test: Call `/api/members` without a session token
3. **Data loss:** Server restart wipes all member data → Test: Restart the server and verify data is gone
4. **CSRF attack:** A malicious site can trick a user into submitting a form → Test: Submit a form from a different origin
5. **XSS attack:** Malicious markdown can inject scripts → Test: Submit markdown with `<script>` tags and verify preview renders safely

## Plan Overview

This plan is divided into 6 phases. Each phase has its own sub-plan for detailed implementation.

### Phase 1: Authentication & Authorization
- Implement server-side sessions
- Move auth from client store to server
- Add session middleware
- Add CSRF protection
- Tests for authentication flow

### Phase 2: Data Persistence & Integrity
- Set up PostgreSQL + Prisma
- Migrate memberStore to database
- Add transaction support
- Add backup/restore mechanism
- Add audit log
- Tests for persistence and integrity

### Phase 3: API Scalability & Security
- Add pagination to all API endpoints
- Implement rate limiting
- Add CORS configuration
- Add request validation at server level
- Tests for API security and performance

### Phase 4: Security Hardening
- Add file upload MIME type validation
- Sanitize markdown input
- Add input length limits
- Improve phone and email validation
- Tests for security vulnerabilities

### Phase 5: Observability
- Add comprehensive logging
- Add error boundaries
- Add monitoring hooks
- Tests for logging and error handling

### Phase 6: Performance Optimization
- Add virtualization for large lists
- Add debouncing for search/filter
- Add caching strategy
- Tests for performance

---

## Phase 1: Authentication & Authorization

See `docs/superpowers/plans/2026-10-28-phase1-auth.md` for detailed implementation.

## Phase 2: Data Persistence & Integrity

See `docs/superpowers/plans/2026-10-28-phase2-persistence.md` for detailed implementation.

## Phase 3: API Scalability & Security

See `docs/superpowers/plans/2026-10-28-phase3-api.md` for detailed implementation.

## Phase 4: Security Hardening

See `docs/superpowers/plans/2026-10-28-phase4-security.md` for detailed implementation.

## Phase 5: Observability

See `docs/superpowers/plans/2026-10-28-phase5-observability.md` for detailed implementation.

## Phase 6: Performance Optimization

See `docs/superpowers/plans/2026-10-28-phase6-performance.md` for detailed implementation.

---

## Execution

### Recommended Approach: Subagent-Driven Development

This plan has 6 phases with many interconnected dependencies. Each phase builds on the previous one, and the APIs change significantly as we move from in-memory to database-backed sessions.

**Why subagent-driven:**
- Phase 1 (auth) changes the entire authentication flow; Phase 2 (persistence) requires a completely new data layer
- API contracts change after Phase 1 (sessions, CSRF tokens)
- Each phase can be reviewed independently before moving to the next
- A fresh context per phase ensures no regression from previous phases

**Required Sub-Skill:** Use superpowers:subagent-driven-development

**Execution Flow:**
1. Review and approve Phase 1 sub-plan
2. Run Phase 1 implementation with subagent
3. Review and approve Phase 1 results
4. Review and approve Phase 2 sub-plan
5. Run Phase 2 implementation with subagent
6. Review and approve Phase 2 results
7. Repeat for all 6 phases
8. Final review of all changes

### Alternative: Native Execution

If you prefer to implement all phases yourself in this session:

**Required Sub-Skill:** Use superpowers:executing-plans

**Flow:**
1. Review and approve all 6 phase sub-plans
2. Implement each phase yourself, one by one
3. Run all tests after each phase
4. Final review of all changes

---

## Success Criteria

- All tests pass (`npm test` and `npm run check`)
- Auth works with server-side sessions
- API endpoints are authenticated and rate-limited
- Data persists across server restarts
- No security vulnerabilities (no XSS, CSRF, or unauthorized access)
- Performance is acceptable with large datasets (virtualization + pagination)
- Logging and monitoring are in place
- Code follows project conventions (Svelte 5 runes, TypeScript strict, Indonesian domain terms)
