# FIX07 Follow-up Implementation Report

Date: 2026-10-23 (Asia/Saigon). Scope: frontend only. Review target: fail-closed token cache revalidation.

## A. Git Baseline

Repository: `D:\vs code\task-management\fe-task-management`; branch: `feat/ui`.

| State | Tracked modified | Untracked | `git diff --check` |
|---|---:|---:|---|
| Before edits | 28 | 30 | PASS, exit 0 |
| Final | 28 | 33 | PASS, exit 0 |

The original dirty tree was retained. Before production edits, SHA-256 hashes of all 58 pre-existing WIP files were recorded outside the repository. Final comparison shows changes only to the four intended existing files listed in D; all other pre-existing WIP files remain byte-identical. Three files were added: the verification helper, follow-up tests, and this report. No commits, pushes, resets, stashes, cleans, dependency changes, backend edits, migrations, services or live mutations were performed.

## B. Root Cause

`verifiedTokenQuery()` treated fetching and 403/404 errors as the visibility barrier. A new observer can receive cached success while its refetch has `fetchStatus: "paused"`, `isFetching: false`, and `isSuccess: true`. The old response therefore escaped without a current server decision.

On HTTP 500, timeout or network failure, Query retains the old data. The old barrier stopped hiding it once fetching ended, because these errors are not authorization denials. `useAiChat` then flattened conversation-list data despite the failed refresh. Retained Zustand messages could also bypass the query result unless the UI used an explicit visibility result.

A successful cache write is also insufficient evidence: replaying an earlier response after a failed revalidation resets Query's error/status. The implementation therefore tracks the latest first-page request attempt in addition to the observer entry. A previously successful request cannot authorize that later attempt.

Production `AppProviders` disables focus refetch but otherwise uses normal Query defaults. Regression clients deliberately use `staleTime: Infinity` to ensure the token policy overrides cached freshness.

## C. RED Evidence

Test file created before any production edits:

`tests/components/ai-fix07-followup-revalidation.test.tsx`

Command:

```powershell
node node_modules/vitest/vitest.mjs run --cache=false tests/components/ai-fix07-followup-revalidation.test.tsx --reporter=dot
```

Recorded original-implementation result: **17 failed, 8 passed, 25 total; 1 failed file; exit 1**.

Failing cases comprised four offline-remount surfaces; A/B/A offline re-entry; three transient errors; reconnect; successful explicit Retry after a transient failure; two multi-page re-entry cases; disabled/enabled transition; StrictMode remount; Zustand consumer gating; and two real Chat/History visibility cases.

Representative actual failing output:

```text
R01/R13 cached detail offline remount exposes no protected data
AssertionError: expected { ... } to be undefined
Received: { title: "OLD_PROTECTED_TITLE", ... }

R01/R13 cached messages offline remount exposes no protected data
AssertionError: expected { pages: [ ... ], ... } to be undefined
Received pages included content: "OLD_PROTECTED_MESSAGE"

R03/R04/R16 re-entry 500 retains raw cache but hides it without denial
AssertionError: expected { pages: [ ... ], ... } to be undefined

R15/R18 real Chat and History hide retained protected content/actions on offline re-entry
AssertionError: expected <span ...>OLD_PROTECTED_TITLE</span> to be null

Test Files  1 failed (1)
Tests       17 failed | 8 passed (25)
```

Before the visibility assertions, R01 verifies real underlying Query state: success, paused, cached data present. R03/R04 verify real error state with retained cached data. Only API/network and surrounding authentication/navigation boundaries are mocked; production query hooks, QueryClient, Zustand, Chat and History run normally.

Additional tests were added during implementation. Two further gaps were reproduced before their corrections:

- Active-session generation overlay: **1 failed, 38 passed, 39 total**, exit 1. `visibleMessages` still contained the prior protected generation after a transient history failure; the assertion expected an empty list.
- Cached-success replay after failed active revalidation: filtered run **1 failed, 39 skipped**, exit 1. Actual failure: expected data to be undefined, received pages containing `OLD_PROTECTED_TITLE`. This filtered result is not counted as 39 passing tests.

The final expanded file contains 40 cases. The initial 17/8 RED result is evidence from the original production implementation, not inferred from the final test run.

## D. Implementation

| File | Follow-up change |
|---|---|
| `src/entities/ai-assistant/model/ai-token-query-verification.ts` | New small shared helper for entry identity, server-response provenance, latest first-page verification attempts, result projection and safe imperative result handling. |
| `src/entities/ai-assistant/model/ai-assistant.queries.ts` | Apply the barrier to detail, conversations, messages and generations; stamp only successful non-aborted API responses; preserve existing list-denial epochs and explicit Retry. |
| `src/widgets/ai-chat/model/use-ai-chat.ts` | Gate retained messages and generation actions; preserve fresh non-persisted feedback before a conversation exists; force a fresh token owner-preflight GET rather than joining an obsolete request. |
| `src/widgets/ai-chat/ui/AiChat.tsx` | Render the hook's guarded token messages; token mode has no fallback to raw retained thread messages. Direct access keeps its previous thread behavior. |
| `src/widgets/ai-chat/ui/AiChatHistory.tsx` | Offer existing Retry callback for transient list errors as well as authorization denial. |
| `tests/components/ai-fix07-followup-revalidation.test.tsx` | 40 focused integration regressions, including R01-R18 and lifecycle/replay edge cases. |
| `FIX07-FOLLOWUP-IMPLEMENTATION-REPORT.md` | This handoff report. |

`beginAiTokenResponse()` records a request's sequence before the API call. A successful response receives volatile WeakMap provenance bound to the exact query object, QueryClient, opaque query key, request sequence and AbortSignal. First-page attempts supersede all earlier proofs for that query, including after errors. Query-object binding also prevents a removed/recreated cache entry from adopting the previous entry's proof.

`useAiTokenQueryEntry()` captures the sequence at the current query/access/enabled entry. A token result is visible only when every exposed response/page has current provenance and is compatible with the latest verification attempt. Ordinary cache writes, status resets and timestamps cannot issue proofs. Structural sharing is disabled only for token queries so a byte-identical fresh response retains its new response identity.

Pending and paused token results expose no data or success and use a coherent pending status. Failed verification exposes a recoverable error without old data. The real fetch status is retained. Both reactive results and awaited `refetch`/`fetchNextPage` results pass the barrier. An unverified load-more request performs first-page revalidation. Verified pages remain available during normal next-page loading, with existing cursor semantics.

A new observer that joins an older deduplicated GET cannot accept that response as current-entry verification. After it settles, an ordinary GET obtains current proof. This recovery effect respects denial markers and never automatically retries a denied list. Existing query GET retry policy is retained; no mutation replay was added.

403/404 cancellation, removal, denial markers, epochs, content cleanup and stale-response protection remain in the existing FIX06 paths. HTTP 500, timeout and network errors create no denial tombstones and clear no unrelated partitions. Direct access does not receive token-style revalidation.

Consumer inspection covered the four history hooks, `useAiChat`, `AiChat`, `AiChatHistory`, saved-preview/action paths, history hydration, Unified Ask owner verification and operation context, store cleanup, Dashboard Home and workspace header title queries. The latter two use direct access. Protected raw-cache reads in the denial helper serve scoped cleanup, not rendering. No store schema, API signature, route, token identity function or share-token parameter contract changed.

## E. GREEN Evidence

Final focused command:

```powershell
node node_modules/vitest/vitest.mjs run --cache=false tests/components/ai-fix07-followup-revalidation.test.tsx
```

Actual result: **40/40 PASS, 1 file PASS, exit 0**.

This includes paused-to-online recovery; successful server Retry after a transient failure; all four surfaces; retained raw cache remaining hidden; denied Retry; pagination/cursors; joined obsolete GETs; obsolete pagination; cache-success replay; disabled/enabled transitions; StrictMode; retained messages/generations; real History Retry; raw-token absence; and preserved direct-access Infinity semantics.

## F. Broader Regression

Affected suite command:

```powershell
$affected = @(rg --files tests -g '*fix06*.test.ts' -g '*fix06*.test.tsx' -g '*fix07*.test.ts' -g '*fix07*.test.tsx' -g '*unified*.test.ts' -g '*unified*.test.tsx')
node node_modules/vitest/vitest.mjs run --cache=false $affected
```

Actual final result: **357/357 PASS, 13 files PASS, exit 0**. This includes the existing FIX06 authorization-denial and conversation-list-denial suites; FIX07 access/API/mutations/dialog/saved-preview suites; Unified Ask hook/UI guards/composer/integration; and follow-up regressions. Existing stale 403/404 versus successful Retry cases pass.

Broader AI command:

```powershell
$aiTests = @(rg --files tests -g 'ai*.test.ts' -g 'ai*.test.tsx')
node node_modules/vitest/vitest.mjs run --cache=false $aiTests
```

Actual final result: **526/526 PASS, 34 files PASS, exit 0**.

## G. TypeScript / ESLint / Git

| Command | Exit | Actual result |
|---|---:|---|
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | 2 | 13 pre-existing fixture diagnostics; no new diagnostics. The final shell wrapper explicitly propagates the compiler's exit code. |
| Explicit scoped ESLint command below | 0 | PASS, no diagnostics, no fixes applied. |
| `git diff --check` | 0 | PASS before and after edits. |
| `git status --short` | 0 | Dirty tree preserved: 28 tracked modified, 33 untracked after this report. |
| `git diff --stat` | 0 | Includes the pre-existing 28-file tracked WIP, not only this follow-up; untracked additions are omitted by Git. |

The compiler was run before production changes and reproduced the known 13 diagnostics. Final diagnostic signatures match the same baseline: zero production errors and zero new test errors. Unrelated fixtures were not changed.

| Existing fixture | Diagnostics |
|---|---|
| `tests/components/ai-phase4-preview-only.test.tsx:7` | TS2352 incomplete generation fixture |
| `tests/components/ai-phase4-restore-hook.test.tsx:53` | TS2352 incomplete generation fixture |
| `tests/components/ai-phase5-confirm-dialog.test.tsx:10` | TS2352 incomplete generation fixture |
| `tests/components/page-publish.test.tsx:32,47,62` | 3 x TS2741 missing `allow_updates` |
| `tests/components/page-publish.test.tsx:112` | TS2322 optional boolean |
| `tests/components/public-navigation-sidebar.test.tsx:19` | TS2741 missing `capabilities` |
| `tests/components/public-page.test.tsx:8` | TS2741 missing `capabilities` |
| `tests/unit/ai-phase5-modification-action.test.ts:5` | TS2352 incomplete generation fixture |
| `tests/unit/lib/get-current-page-publication.test.ts:5,20,35` | 3 x TS2741 missing `allow_updates` |

Scoped lint, with every changed source/test file explicitly named:

```powershell
node node_modules/eslint/bin/eslint.js src/entities/ai-assistant/model/ai-token-query-verification.ts src/entities/ai-assistant/model/ai-assistant.queries.ts src/widgets/ai-chat/model/use-ai-chat.ts src/widgets/ai-chat/ui/AiChat.tsx src/widgets/ai-chat/ui/AiChatHistory.tsx tests/components/ai-fix07-followup-revalidation.test.tsx --no-fix
```

Final tracked working-tree stat (including prior WIP):

```text
 src/entities/ai-assistant/api/ai-assistant.api.ts  |  57 ++-
 .../ai-assistant/model/ai-assistant.mutations.ts   |  47 ++-
 .../ai-assistant/model/ai-assistant.queries.ts     | 173 ++++++--
 .../ai-assistant/model/ai-assistant.types.ts       |  77 +++-
 src/widgets/ai-chat/model/ai-chat-error.ts         |  15 +
 .../ai-chat/model/ai-history-conversations.ts      |  53 ++-
 src/widgets/ai-chat/model/ai-history-mapper.ts     |  25 +-
 src/widgets/ai-chat/model/ai-history-selection.ts  |  32 +-
 .../ai-chat/model/page-instruction-feedback.ts     |   2 +
 src/widgets/ai-chat/model/types.ts                 |  90 ++++-
 src/widgets/ai-chat/model/use-ai-chat-store.ts     | 297 ++++++++++++--
 src/widgets/ai-chat/model/use-ai-chat.ts           | 450 ++++++++++++++++-----
 src/widgets/ai-chat/ui/AiChat.tsx                  | 102 +++--
 src/widgets/ai-chat/ui/AiChatComposer.tsx          | 255 ++----------
 src/widgets/ai-chat/ui/AiChatEmptyState.tsx        |  15 +-
 src/widgets/ai-chat/ui/AiChatHistory.tsx           |  11 +-
 src/widgets/ai-chat/ui/AiChatHome.tsx              |  55 ++-
 src/widgets/ai-chat/ui/AiMessageItem.tsx           |  64 ++-
 src/widgets/ai-chat/ui/AiMessageList.tsx           |   9 +
 .../ai-chat/ui/AiModificationActionDialog.tsx      |  30 +-
 .../ai-chat/ui/AiModificationPlanPreview.tsx       |   2 +-
 .../ai-chat/ui/AiPageCompositionPreview.tsx        |  33 +-
 .../ui/header-workspace-container.tsx              |  10 +-
 tests/components/ai-chat-home.test.tsx             |  12 +-
 .../components/ai-phase4-header-new-chat.test.tsx  |  14 +
 .../components/ai-phase4-open-draft-race.test.tsx  |  10 +-
 tests/components/ai-phase4-restore-hook.test.tsx   |  40 ++
 tests/unit/ai-page-instruction-feedback.test.ts    |   8 +-
 28 files changed, 1466 insertions(+), 522 deletions(-)
```

Git emitted LF-to-CRLF normalization notices for the four intentionally edited tracked files; `diff --check` found no whitespace errors. No repository-wide formatter or automatic lint fix was used.

## H. Security Matrix

All PASS results below are from the offline Vitest/source scope; they do not assert live backend or reachable-route verification.

| ID | Result | Evidence |
|---|---|---|
| R01 | PASS | Real cached success + paused offline remount, all four surfaces hidden. |
| R02 | PASS | A to B to offline A hides A until verification. |
| R03 | PASS | HTTP 500 retains raw cache but guarded data is absent. |
| R04 | PASS | Timeout/network failure retains no visible protected data. |
| R05 | PASS | Pending-entry render snapshots contain no cached protected data. |
| R06 | PASS | Reconnect unlocks only after successful current GET. |
| R07 | PASS | Explicit query and real History UI Retry obtain fresh data; no mutation replay. |
| R08 | PASS | Revalidation 403/404 hides and empties A; FIX06 scoped cleanup, epochs and Retry regressions pass. |
| R09 | PASS | Denied/failed A leaves B, direct, other-user, workspace and page partitions unchanged. |
| R10 | PASS | Late obsolete A success/403/404 cannot affect verified B. |
| R11 | PASS | Verified first page stays visible during next-page loading; cursor and final hasNextPage remain correct. |
| R12 | PASS | Multiple cached pages remain hidden while first-page verification is paused/failed; unverified load-more cannot bypass it. |
| R13 | PASS | Detail/list/messages/generations gate paused/failed responses and awaited Retry results. |
| R14 | PASS | Unverified remount does not hydrate Zustand; retained messages and active-session generation overlays cannot bypass the guard. |
| R15 | PASS | Real Chat/History hide old titles, protected plan content and previously enabled draft actions on remount/failure. |
| R16 | PASS | 500/timeout/network retain recoverable errors and create no permanent authorization-denial tombstone. |
| R17 | PASS | Direct/no-token Infinity cache behavior and Dashboard/Page regressions preserved. |
| R18 | PASS | Opaque query keys, thread state, storage, toast/console output and UI contain no raw test credential; existing token propagation suites pass. |

## I. Limitations

**NOT VERIFIED — NO REACHABLE TOKEN AI UI**

Route/source inspection confirms that no route passes the optional token access context into AI Chat. Dashboard Chat and Home use direct access. `/share/[token]` renders page blocks and does not mount AI Chat. This limitation was preserved.

Tests use real production hooks/components and TanStack Query in jsdom with mocked API boundaries. No live revoke/regrant, live HTTP/backend authorization, browser E2E, public token AI flow or deployment was verified. No live Ask/Confirm/Apply/Discard calls were executed.

Provenance is intentionally session memory only. Retained protected cache data remains inaccessible through these guarded surfaces until verification; consumers must continue using the guarded hooks rather than raw Query cache reads. A newly joined observer may require one additional GET when it inherited an obsolete in-flight request. Token queries trade structural sharing for reliable response provenance; direct queries retain existing structural sharing.

## J. Final Handoff

**FIX07 FOLLOW-UP READY FOR INDEPENDENT REVIEW**

The exact follow-up change scope is the seven files listed in D. The original WIP remains intact outside the four intended existing-file edits. Independent review should assess the request/entry provenance gate, transient-error replay regression, Query observer reuse, pagination and retained-store visibility against the R01-R18 evidence.

The remaining verification limits are listed in I, and the 13 pre-existing fixture diagnostics remain. This handoff does not certify F-07 as CLOSED, mark Phase 5.3.3.3B.1 ACCEPTED, begin FIX08/Phase B.2, or claim full end-to-end token UI verification. Closure belongs to the next independent review.
