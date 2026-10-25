# FIX07 — Frontend AI shareToken Propagation

Ngày thực hiện: 23/10/2026. Repository: `fe-task-management`, nhánh `feat/ui`.

## A. Root Cause

Backend đã nhận `shareToken` qua query parameter, nhưng 13 AI wrappers hiện có chưa khai báo/truyền tham số này. Mutation variables, history query functions và các GET trực tiếp trong Unified Ask, saved preview, dialog, Confirm/Discard cũng không mang token.

Cache keys, thread scope, persisted selection và FIX06 denial markers trước FIX07 chỉ phân biệt user/resource/filter. Thay token không tạo access partition mới, nên cached success, verification hoặc response cũ có thể được dùng trong context khác.

## B. Actual Token Source & Reachability

- `/share/[token]`: `SharedPageDetail` lấy token bằng `useParams()`, resolve link rồi truyền token vào `useSharedPage`, `useSharedPageBlocks`, `PageBlockList`. Page/Block APIs dùng `X-Page-Share-Token`; AI backend dùng query parameter, nên FIX07 giữ đúng từng contract.
- Route share hiện không mount `AiChat`. Các mount thực tế là `/dashboard/ai` (`AiChatHome`) và `/dashboard/ai/chat` (`AiChat`), đều không truyền token. Không tìm thấy mount Page AI đang nhận token.
- Đã hoàn thiện optional interface `AiChat.pageAccess` / `useAiChat(currentPageId, pageAccess)`, với `{ userId, workspaceId, pageId, shareToken }`. Chỉ dùng credential khi binding khớp context hiện tại. Caller hợp lệ phải cung cấp context từ Page đã resolve, không lấy từ model output.
- Với context được caller truyền rõ ràng, không dùng lỗi của direct-only Page query để phủ định quyền đọc qua token. Backend AI vẫn quyết định quyền thực tế.
- Component tests dựng optional context này bằng mocks và chạy hook/query/mutation/UI thực. Đây là kiểm tra đường truyền interface, không phải bằng chứng route production đã có token-enabled UI.
- **NOT VERIFIED — NO REACHABLE TOKEN AI UI.** Không thêm AI Chat lên `/share/[token]`; không tuyên bố anonymous/token-only user journey hoạt động.

## C. Changed Files

Danh sách dưới đây là thay đổi FIX07 so với snapshot ngay trước khi thực hiện, không phải toàn bộ dirty tree.

| File | FIX07 changes | Reason |
|---|---|---|
| `src/entities/ai-assistant/api/ai-assistant.api.ts` | Optional token cho cả 13 wrappers; query params có điều kiện | Khớp backend; giữ body, signal, pagination, timeout và no-token shape |
| `src/entities/ai-assistant/model/ai-assistant.access.ts` | File mới: bound Page context và opaque session identity | Không đưa raw token vào cache/thread/selection keys |
| `src/entities/ai-assistant/model/ai-assistant.queries.ts` | Access-partitioned keys, token query functions, fresh verification và visibility guard | Không reuse A/B/direct; giữ FIX06 list marker, epoch, Retry |
| `src/entities/ai-assistant/model/ai-assistant.mutations.ts` | Token trong operation variables, tách khỏi business body; `retry: false` | Capture theo operation, không tự lặp side effects |
| `src/widgets/ai-chat/model/types.ts` | Optional opaque `accessId` trong binding/denial | Phân vùng quyền trong state, không giữ raw credential |
| `src/widgets/ai-chat/model/use-ai-chat-store.ts` | Access-scoped threads/denials; clear thread tăng epoch khi đổi token | Vô hiệu writers cũ và giữ thread khác độc lập |
| `src/widgets/ai-chat/model/ai-history-selection.ts` | Optional opaque suffix cho selection key | Token contexts không dùng chung selected conversation |
| `src/widgets/ai-chat/model/ai-history-reconciliation.ts` | So sánh thêm access identity | Không reconcile overlay/recovery khác context |
| `src/widgets/ai-chat/model/ai-unified-ask-context.ts` | Operation binding có identity; credential chỉ trong closure/view | Snapshot token, revision và selection của operation |
| `src/widgets/ai-chat/model/ai-unified-ask-orchestrator.ts` | Chặn late denial và candidate khác Page; identity trong continuation | Không để A overwrite/deny B hoặc dùng token sai Page |
| `src/widgets/ai-chat/model/ai-authorization-denial.ts` | Cleanup đúng identity cho cache/list/thread | A denial không purge dữ liệu B/direct |
| `src/widgets/ai-chat/model/use-ai-chat.ts` | Bound context, tất cả query/mutation/direct GET, legacy flows, exact invalidation, preflight/late guards | Truyền cùng token suốt operation; giữ ownership/context/lock checks |
| `src/widgets/ai-chat/ui/AiChat.tsx` | Optional Page context, saved GET có token, action scope và preview cleanup | Không giữ preview/dialog của token trước |
| `src/widgets/ai-chat/ui/AiModificationActionDialog.tsx` | GET có token/signal, synchronous verification binding, abort và cancelled-error guard | Dialog phải xác minh lại khi đổi/bỏ token |
| `tests/unit/ai-fix07-api.test.ts` | 30 tests mới | 13 endpoint contracts, no-token compatibility, cache keys, logging |
| `tests/unit/ai-fix07-mutations.test.tsx` | 2 tests mới, mỗi test chạy đủ 8 mutation hooks | Token/body separation và chống automatic retry |
| `tests/components/ai-fix07-access.test.tsx` | 33 tests mới | Query/token races, revoke, direct permission, denial isolation, permission-boundary harness |
| `tests/components/ai-fix07-dialog.test.tsx` | 2 tests mới | Dialog token switching và stale rejection |
| `tests/components/ai-fix07-saved-preview.test.tsx` | 5 tests mới | Real hook/UI saved GET → dialog GET → Confirm/Discard, removal/switch cleanup |
| `FIX07-IMPLEMENTATION-REPORT.md` | Báo cáo này | Evidence, validation, giới hạn và scope |

Không có wrapper Archive/Page Resolve/Extract Intent trong source frontend hiện tại. Không tự thêm endpoint/capability mới; không gửi token vào `pages/extract-intent`.

## D. RED Evidence

Trước mọi production edit, đã viết 3 focused regression files và chạy:

```powershell
node node_modules/vitest/vitest.mjs run --cache=false tests/unit/ai-fix07-api.test.ts tests/components/ai-fix07-access.test.tsx tests/components/ai-fix07-dialog.test.tsx
```

**Exit 1: 3 files failed; 29 tests failed, 17 passed, tổng 46.**

| Assertion | Expected | Received trước FIX07 |
|---|---|---|
| 13 wrapper token cases | Axios config có `params.shareToken` chính xác | Config chỉ có timeout/signal/pagination hoặc không có config |
| 4 cache-key cases | A khác B và direct | Keys giống hệt nhau |
| Ask/verification/history | Token đi riêng qua operation và GETs | API mock nhận request không có token argument |
| Confirm/Discard preflight | GET và mutation nhận token A | Chỉ nhận generation ID |
| Token removal/switch | Scope/preview/verification mới | Scope cũ không đổi |
| Late A 403/404 sau B | B độc lập, không bị deny/clear | Context chung bị tác động |
| PAGE/GLOBAL list switch | Partition/marker B riêng | B kế thừa denial A |
| Dialog | GET có token, đổi token phải verify lại | GET không token, effect không chạy lại |

Đây là tests gọi production wrappers với Axios spies hoặc chạy hook/store/Query/mutation/dialog thật, không mock kết quả của implementation cần kiểm tra. Sau khi transport assertions qua được mới thấy một assertion phụ dùng `JSON.stringify(undefined)` chưa hợp lệ; đã sửa thành chuỗi rỗng, không hạ yêu cầu token assertion. Các test có observer updates dùng `waitFor` để chờ notification thay vì đọc state quá sớm.

RED bổ sung cho cached-token re-entry sau khi hoàn thiện transport:

```powershell
node node_modules/vitest/vitest.mjs run --cache=false tests/components/ai-fix07-access.test.tsx -t 'revalidates an earlier token'
```

**Exit 1: 1 failed, 14 không được chọn bởi filter.** Expected `data === undefined` và chưa successful khi quay lại A; received cached pages của A với QueryClient `staleTime: Infinity`. Sau đó thêm fresh verification/visibility guard; test chuyển GREEN và được chạy lại không filter trong toàn bộ suites. Final run không skip tests.

## E. Implementation Design

**Transport và mutations.** Token là optional argument cuối của wrappers. Config chỉ có `params.shareToken` khi token thực sự tồn tại; requestId và JSON business payload không đổi. Các mutation nhận token trong variables của từng lần gọi, tách nó trước khi chuyển business input vào wrapper. Discard vẫn chấp nhận string ID cũ, thêm object variant khi có token. Tất cả AI mutation hooks đặt `retry: false`, kể cả QueryClient defaults bật retry. Interceptor authentication hiện có không bị sửa.

**Identity.** Map trong module memory ánh xạ toàn bộ token bằng exact string equality sang một số thứ tự opaque tăng dần trong session. Không dùng raw token, token substring, weak hash, `Math.random()` hoặc identity mới mỗi render. Counter không collision trong phạm vi session thực tế; identity không phải credential và không mang quyền. Map chỉ phục vụ identity; không phải global current-token store và không được persist. User/resource/filter vẫn nằm trong key; chat context còn ràng buộc workspace/Page rõ ràng.

**Cache và token switching.** Keys cũ giữ nguyên cho direct access; token keys có suffix identity. Vì direct keys là prefix của token keys, internal AI invalidation dùng `exact: true`. FIX06 cleanup lọc identity khi quét list/detail và dùng exact keys khi cancel/remove/filter history. Khi đổi/bỏ token, thread cũ tăng epoch, bỏ pending state/protected messages; cache của resource/context cũ được cancel/remove, không quét nhầm toàn bộ user/workspace. List access markers được giữ theo từng identity để không mất denial evidence.

Token queries phải revalidate khi re-enter dù QueryClient mặc định `staleTime: Infinity`; cached output không được hiển thị trong lúc quyết định mới hoặc sau 403/404. Pagination giữ các page đã verified trong khi fetchNextPage. List denial recovery vẫn bắt đầu page một; cancelled response/epoch cũ không được clear marker của request mới. Direct-access FIX06 late-history cleanup vẫn giữ semantics cũ.

**Unified Ask và legacy.** View/operation closure capture token đầu operation; raw token không được copy vào operation token trong Zustand, recovery request hoặc message provenance. Ask, conversation verification và generation GET dùng cùng closure. Context/selection revision/epoch checks vẫn chạy. Late results và late denial từ operation không còn current bị bỏ. Candidate khác bound Page bị chặn trước khi dispatch. Legacy create/submit/planner/preview cũng dùng token thuộc render bắt đầu operation và bỏ late generation errors nếu request đã hết hiệu lực.

**Saved preview, Confirm/Discard.** Saved GET, dialog GET và action preflight/mutation có cùng token. Scope và opaque identity ràng buộc preview/action; dialog có AbortSignal, bỏ callback của request đã cancelled và không cho confirm bằng verification cũ. Generation/conversation/workspace/Page/status validation và operation lock vẫn được giữ. Backend vẫn quyết định ownership, read/write/create permissions và trạng thái cuối cùng.

**Sensitive-token handling.** Token không được đưa vào body, requestId, title, feedback, messages, generation output, Query keys, Zustand history hoặc persisted selection. localStorage chỉ lưu conversation ID dưới key có user/workspace/Page/opaque identity; selected ID luôn phải được backend xác minh lại, kể cả F5. Token chỉ có trong optional credential context, request closure/variables và Axios query config trong memory. Không thêm logging, analytics hay toast chứa token; không sửa shared HTTP interceptor hoặc gắn token cho unrelated requests.

Theo contract backend, query token có nguy cơ xuất hiện trong URL/access logs của browser, proxy hoặc server. FIX07 không đổi sang header không được backend hỗ trợ. Log redaction phía hạ tầng chưa được kiểm chứng trong phạm vi không-live này.

## F. Security Regression Matrix

| Gate | Kết quả | Evidence |
|---|---|---|
| GATE-01 API propagation | PASS | 13 real wrapper cases; 8 mutation hooks; real Ask/preflight/saved-preview component paths |
| GATE-02 No-token compatibility | PASS | 13 no-token cases và toàn bộ suites cũ |
| GATE-03 Token A vs B | PASS | Distinct keys; độc lập detail/history/list; A denial giữ cache và thread B cho cùng resource |
| GATE-04 Token removal | PASS | A → direct không giữ thread/preview/dialog; không dùng token verification cũ |
| GATE-05 Token revocation | PASS (mocked server) | 403/404 xóa protected output/recovery, chặn mutation, không replay success |
| GATE-06 Token switch race | PASS | Deferred A success/403/404 sau B; đổi token trong preflight; cancelled dialog/saved GET |
| GATE-07 GLOBAL/PAGE history | PASS | Token list markers/Retry riêng cho cả hai scope; existing pagination/merged-list regressions qua |
| GATE-08 Saved preview | PASS | GET saved draft, GET dialog, explicit Confirm/Discard có token; removal/switch đóng preview/dialog |
| GATE-09 Direct permission | PASS (mocked server) | Token nhìn như expired vẫn được chấp nhận khi server trả success; frontend không đoán validity |
| GATE-10 Backend boundaries | PARTIAL | Đọc controller/access/Ask/Confirm/Discard/Page authorization; harness giữ WORKSPACE_READ 403, owner 404, destination PAGE_CREATE 403; chưa chạy backend thật |
| GATE-11 Non-auth errors | PASS | 400/401/409/429/500/502/network không kích hoạt token-denial cleanup; không auto retry side effects |
| GATE-12 Existing FIX06 | PASS | Cả hai FIX06 component suites và unit suites; late old denial, epoch/cancel, Retry, protected-preview/F5/request-scope regressions trong broader run |
| GATE-13 Token hygiene | PASS trong code paths được test | Không raw token trong Query keys/store/localStorage/UI/toast/log calls/body; API chỉ gửi query token tới supported AI endpoints |
| GATE-14 Reachability | NOT VERIFIED | **NO REACHABLE TOKEN AI UI**; optional-context component path có mocks, route production chưa nhận token |

Backend policy được đọc: `AiAskService` gọi WORKSPACE_READ trước classification; `AiConversationAccessService` kiểm tra owner trước Page access; composition destination kiểm tra PAGE_CREATE riêng; Page authorization ưu tiên membership/direct access trước link token. Không sửa backend để bỏ bất kỳ check nào. Frontend tests mô phỏng response của các boundary này, không được hiểu là đã kiểm thử enforcement phía server.

## G. Validation Results

| Validation | Passed | Failed | Exit |
|---|---:|---:|---:|
| Targeted Vitest | 310 tests / 13 files | 0 | 0 |
| Broader AI Vitest | 486 tests / 33 files | 0 | 0 |
| TypeScript | Không có diagnostics production/test mới | 13 diagnostics fixture có sẵn | 1 |
| Scoped ESLint | 19 source/test files; 0 errors, 0 warnings | 0 | 0 |
| `git diff --check` | Sạch | 0 | 0 |

Targeted command:

```powershell
node node_modules/vitest/vitest.mjs run --cache=false tests/unit/ai-fix07-api.test.ts tests/unit/ai-fix07-mutations.test.tsx tests/components/ai-fix07-access.test.tsx tests/components/ai-fix07-dialog.test.tsx tests/components/ai-fix07-saved-preview.test.tsx tests/unit/ai-ask-api.test.ts tests/unit/ai-ask-mutation.test.tsx tests/components/ai-unified-ask-hook.test.tsx tests/components/ai-fix06-authorization-denial.test.tsx tests/components/ai-fix06-conversation-list-denial.test.tsx tests/components/ai-unified-ui-integration.test.tsx tests/components/ai-phase4-open-draft-race.test.tsx tests/components/ai-phase5-confirm-dialog.test.tsx
```

Sau tinh chỉnh bỏ cached direct-Page error khỏi quyết định denial của token context, đã chạy lại hai suites affected: **73/73 PASS, exit 0**. Broader AI và TypeScript được chạy lại trên source cuối.

Broader/TypeScript commands:

```powershell
$aiTests = @(rg --files tests -g 'ai*.test.ts' -g 'ai*.test.tsx')
node node_modules/vitest/vitest.mjs run --cache=false $aiTests
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

Scoped ESLint dùng manifest chính xác 19 file source/test tại mục C (không gồm Markdown report), được tạo bằng so sánh byte với snapshot trước sửa:

```powershell
$fix07Files = @(Get-Content -LiteralPath (Join-Path $env:TEMP 'taskmanly-fix07-baseline/fix07-files.txt'))
node node_modules/eslint/bin/eslint.js $fix07Files --no-fix
git diff --check
```

Một lần xây manifest ban đầu nhầm tính cả JSON fixture chưa được snapshot; ESLint chỉ cảnh báo ignored JSON. Đã loại entry giả, xác nhận fixture không thay đổi trong Git và chạy lại trên đúng 19 file: 0 warnings/errors. Không dùng auto-fix.

TypeScript baseline được chạy trực tiếp trước production edits và đối chiếu sau sửa. Cả hai giữ đúng 13 diagnostics ở 8 files: `ai-phase4-preview-only.test.tsx`, `ai-phase4-restore-hook.test.tsx`, `ai-phase5-confirm-dialog.test.tsx`, `page-publish.test.tsx` (4), `public-navigation-sidebar.test.tsx`, `public-page.test.tsx`, `ai-phase5-modification-action.test.ts`, `get-current-page-publication.test.ts` (3). Không sửa fixture ngoài scope; full TypeScript command chưa PASS.

## H. Git Scope Integrity

- Branch: `feat/ui`.
- Trước: **28 modified tracked files, 23 untracked entries**. `git diff --check`: exit 0. Tracked diff baseline: 1,286 insertions / 483 deletions; đây là WIP/FIX06 đã có.
- Sau: **28 modified tracked files, 30 untracked entries**, gồm report này. Không thêm modified tracked file ngoài danh sách baseline.
- FIX07 tác động **13 source files đã tồn tại** (9 tracked WIP + 4 untracked WIP), thêm **1 access helper + 5 tests + 1 report**. Exact paths ở mục C.
- So sánh snapshot xác nhận **112 source/test files trong vùng snapshot còn nguyên byte**, bao gồm toàn bộ tests cũ; không chỉnh FIX06 regression tests để ép PASS. Những WIP khác ở sidebar, composer, preview renderers, types entity và các files ngoài FIX07 không bị quy thành FIX07.
- `git diff --stat` cuối là thống kê WIP + FIX06 + FIX07 cho tracked files; không bao gồm các untracked files. Không dùng nó như thống kê riêng FIX07.
- Không commit/push/merge/rebase/reset/stash/clean; không sửa backend/FastAPI/`.env`, không cài dependency, không truy cập DB, không migration/seed và không live HTTP/model execution.

## I. Remaining Limitations

- Chưa tồn tại actual route/entrypoint đưa token vào AI Chat; token-only UX **chưa được kiểm chứng**. Không dựng UI public share mới.
- Chưa browser E2E, live revoke/regrant hoặc thử token expired thật; evidence hiện tại dùng Vitest/jsdom và mocks server.
- WORKSPACE_READ, PAGE_CREATE, owner-scoped access và direct-permission precedence được đối chiếu source backend và mô phỏng response; chưa chạy integration với server thật.
- Full TypeScript còn 13 fixture diagnostics baseline; không có diagnostics mới.
- Session identities không cần/promise giữ nguyên sau F5. Conversation ID persisted chỉ là lookup input; credential không persist và access phải được server xác minh lại khi context được caller cung cấp lại.
- Không kiểm chứng URL-log redaction hoặc vận hành cache persistence bên ngoài cấu hình app hiện có. Không thêm persistence cho credentials hoặc protected query results.

## J. Final Verdict

**FIX07 READY FOR INDEPENDENT REVIEW**

Có RED thực tế trước production edits, regression đã GREEN, wrappers/contracts/query partitions và operation propagation đã triển khai, FIX06 giữ PASS, không thêm TypeScript/lint errors và không đổi backend policy. Giới hạn reachability được ghi riêng; không tuyên bố token-only user journey hoàn chỉnh.

Chưa đánh dấu F-07 CLOSED hoặc Phase 5.3.3.3B.1 ACCEPTED. Dừng tại implementation/validation/report; không tự thực hiện independent review, commit/push hoặc Phase B.2.
