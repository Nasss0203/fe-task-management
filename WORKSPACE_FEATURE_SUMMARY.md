# Tong hop chuc nang da lam

File nay tong hop cac thay doi chinh da lam trong phan workspace/page block, database view, Sprint feature flag, Backlog va workspace settings.

## 1. Mo hinh hien tai

Flow chinh cua app:

```text
Workspace
-> Page
-> PageBlock[]
-> DATABASE_VIEW block
-> Project
-> Board/View
-> Task
```

Mot `Page` co nhieu `PageBlock`.

Mot `PageBlock` co the la:

- `DATABASE_VIEW`: block hien thi project/board/task.
- `TEXT`: block van ban.
- `HEADER`: block tieu de.
- `TODO`: block checkbox/todo.
- `QUOTE`: block quote.
- `DIVIDER`: block phan cach.
- `CODE`: block code.

`DATABASE_VIEW` co `data_config` rieng de link toi project/board/view:

```ts
{
  workspace_id: string;
  project_id: string;
  default_board_id: string | null;
  default_view_type: BoardViewType;
}
```

## 2. Page block UI

Da lam cac phan:

- Render danh sach page blocks theo `order_index`.
- Tao block dau tien khi page rong.
- Tao block sau mot block khac bang `insert_after_block_id`.
- Update order index khi drag/drop page block.
- Tach renderer block don gian thanh component rieng.
- Ho tro render/edit cac block co ban:
  - Text
  - Heading
  - Todo
  - Quote
  - Divider
  - Code
- Todo block co the bam `Enter` de tao TODO block moi ben duoi.

## 3. DATABASE_VIEW va Board/View

`DATABASE_VIEW` block hien thi cac board view cua project.

Board view hien tai duoc giu lai trong menu them view:

- `BOARD`: Theo trang thai
- `TABLE`: Bang tinh
- `LIST`: Danh sach
- `CALENDAR`: Lich
- `BACKLOG`: Backlog

Da an bot cac view chua lam that:

- Timeline
- Chart
- Dashboard
- Feed
- Map
- Form
- Gallery

Ly do: neu chua co component/logic that thi khong nen hien trong menu, tranh user nghi la da dung duoc.

## 4. Sprint feature flag

Feature key hien tai:

```ts
sprint:enabled
```

Y nghia:

- Plan co cho dung Sprint hay khong.
- Workspace co bat/tat Sprint hay khong.

Ket qua cuoi:

```ts
enabled = planEnabled === true && workspaceEnabled !== false
```

Vi du:

| Plan | planEnabled | workspaceEnabled | enabled |
| --- | --- | --- | --- |
| Pro | true | null | true |
| Pro | true | true | true |
| Pro | true | false | false |
| Free khong co Sprint | false | true | false |

## 5. Backend feature/subscription da co

Backend da co cac lop:

- `features`
- `plan_features`
- `workspace_feature_settings`

Da co API workspace feature:

```http
GET /workspaces/:workspaceId/features
```

Dung de lay danh sach feature cua workspace.

Response mau:

```json
{
  "statusCode": 200,
  "message": "Find feature workspace",
  "data": [
    {
      "code": "sprint:enabled",
      "name": "Sprint",
      "description": "Enable sprint planning and backlog workflows.",
      "category": "agile",
      "planEnabled": true,
      "workspaceEnabled": null,
      "enabled": true,
      "metadata": null
    }
  ]
}
```

Da co API bat/tat feature trong workspace:

```http
PATCH /workspaces/:workspaceId/features/:featureCode
```

Body:

```json
{
  "enabled": true
}
```

Hoac:

```json
{
  "enabled": false
}
```

## 6. Backend guard

Da them `FeatureGuard` de doc metadata tu:

```ts
@RequireFeature(FeatureKey.SPRINT_ENABLED)
```

Thu tu logic mong muon:

```text
Auth
-> Workspace/Membership
-> Feature
-> Permission
-> Service
```

Da guard cac API Sprint/task lien quan Sprint:

- Tao sprint.
- Start sprint.
- Complete sprint.
- Cancel sprint.
- Update sprint.
- Lay backlog tasks.
- Move task vao sprint.
- Remove task khoi sprint.
- Move task sprint-to-sprint.

Luu y can lam tiep neu muon chan bypass API:

- Khi tao board `BACKLOG`, backend cung nen check `sprint:enabled`.
- Hien tai FE da an Backlog khi Sprint off, nhung backend nen co guard rieng de chac chan user khong goi API truc tiep.

## 7. Frontend workspace feature hook

Da them service/hook:

```text
src/services/workspace-feature/type.ts
src/services/workspace-feature/workspace-feature.service.ts
src/features/workspace-feature/hooks/useWorkspaceFeatures.ts
```

Hook tra ve:

```ts
const {
  workspaceFeaturesQuery,
  updateWorkspaceFeature,
  features,
  canUseSprint,
  shouldShowSprintFeature,
} = useWorkspaceFeatures(workspaceId);
```

Trong do:

- `canUseSprint`: Sprint that su enabled theo API.
- `shouldShowSprintFeature`: dung cho cac UI tam thoi khi loading/error neu can.

Hien tai Backlog dung `canUseSprint`, de Sprint off thi Backlog an that.

## 8. Backlog behavior

Neu Sprint feature bat:

- Hien Sprint trong sidebar.
- Hien Backlog tab neu project co board Backlog.
- Hien Backlog trong menu them board/view.
- Cho dung Sprint/Backlog workflow.

Neu Sprint feature tat:

- An Sprint trong sidebar.
- An Backlog tab.
- An Backlog trong menu `+ Them che do xem moi`.
- Neu dang o Backlog thi UI fallback sang tab view hop le dau tien.

## 9. Workspace settings page

Da chuyen tu dialog sang settings page kieu Jira.

Route moi:

```text
/dashboard/:workspaceSlug/settings
```

Dropdown workspace co item:

```text
Cai dat workspace
```

Click vao se di toi settings page.

Layout settings hien tai:

```text
App sidebar | Settings sidebar | Settings content
```

Settings sidebar hien co:

- Details
- Access
- Features
- Board
- Danger zone

Trong `Features` co toggle:

```text
Sprint [On/Off]
```

Toggle nay goi API:

```http
PATCH /workspaces/:workspaceId/features/sprint:enabled
```

Sau khi update thanh cong:

- Invalidate query workspace features.
- Sidebar/Backlog UI cap nhat lai theo `enabled`.

## 10. Plan hien thi trong settings

Ban dau dialog lay plan tu:

```ts
workspace.planType
```

Nhung field nay co the cu va van la `free`.

Da doi sang lay plan tu billing API:

```http
GET /billing/current-subscription
```

Thong qua hook:

```ts
usePlan()
```

Neu billing chua load thi moi fallback ve `workspace.planType`.

## 11. Cac file frontend chinh da sua

```text
src/app/(dashboard)/dashboard/[slug]/settings/page.tsx
src/components/workspaces/DropdownWorkspace.tsx
src/components/nav/user/nav-main.tsx
src/components/board/AddBoard.tsx
src/components/block/ProjectBlockContainer.tsx
src/components/block/ProjectBlock.tsx
src/components/sidebar/user/ProjectSidebarItem.tsx
src/features/workspace-feature/hooks/useWorkspaceFeatures.ts
src/features/sprint/hooks/useSprint.ts
src/services/workspace-feature/type.ts
src/services/workspace-feature/workspace-feature.service.ts
```

## 12. Cac rule UI hien tai

### Add board/view menu

Chi hien view da co logic that:

```text
Bang tinh
Theo trang thai
Danh sach
Lich
Backlog
```

Neu Sprint off:

```text
Backlog bi an
```

### Backlog tab

Neu Sprint off:

```text
Backlog tab bi an
```

### Sprint sidebar

Neu Sprint off:

```text
Khong fetch/render sprint list
```

## 13. Kiem tra da chay

Da chay typecheck/lint scoped sau cac thay doi:

```bash
npx.cmd tsc --noEmit --pretty false
npx.cmd eslint ...
```

Luu y:

- Typecheck pass.
- Lint scoped cac file vua sua pass.
- `npm run lint` toan repo co the van fail do mot so loi cu o file khac, khong thuoc phan nay.

## 14. Viec nen lam tiep

Nen lam tiep theo thu tu:

1. Backend guard tao `BACKLOG` board khi Sprint off.
2. Settings page: bo cac section chua co logic that neu muon gon hon.
3. Access/Members settings dung API that.
4. Danger zone dung API trash/delete workspace that.
5. Neu can Jira-style day du, tach settings thanh nested routes:

```text
/dashboard/:slug/settings/details
/dashboard/:slug/settings/access
/dashboard/:slug/settings/features
/dashboard/:slug/settings/board
/dashboard/:slug/settings/danger
```

