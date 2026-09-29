# Portal / Railway 入口与“选中创建集合”施工回传（2026-09-29）

## 结论

这批接通了两条真实前端动作：画布节点近场“更多命令”可把当前现场外的已就绪工作现场作为 Portal 目标，并通过 Huabu 既有 `ADD_NODES` 命令插入 `canvasRef`；多选工具条可把所有已绑定 canonical 身份的选中项创建成 Collection，逐项写入成员并等待投影后定位。Railway 添加入口没有施工：现有 `/view-rail-order` 只接受已被 T2 明确废止的 V0 kind，原卡要求的 materialized long-term worksite identity 尚无当前可写类型，直接写会复活旧本体。

## 改动

- `huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx`：从当前项目 Core graph 读取实际 workspace；只展示有稳定 `canvasId` 且不是当前现场的目标。插入使用现有 `canvasStore.addNodes` → `ADD_NODES`，写入精确 `targetCanvasId`、真实 workspace 名称和用户创建来源，落点在选中节点右侧并选中新 Portal。列表失败、无目标、目标过期、当前现场目标均有诚实反馈；成功文案明确画布没有独立写入回执。
- `huabu/apps/web/src/components/Panels/Canvas/FloatingToolbars/MultiSelectToolbar.tsx`：仅在 LCOS 当前项目且全部所选节点均有可写 canonical 引用时提供“创建集合”入口。复用 `CoreCollectionClient.create/addMember`；逐项添加并区分部分失败，完成后触发既有 binding refresh、等待 Collection projection，再通过 Shell locate 定位。不把 `parentId`、Scope 兼容投影或未绑定节点当成员。

## 原件与采用

- `READ_SOURCE`：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T1\LCOS_T1_PhaseC1_Step2A_Collection_VisibleHost_ExactSource_Plan_20260906.md` §13（Selection → Create Collection → expand；只允许明确选中集的首次 fan-out）。`T2\T2_Patched_Navigation_Cards_20260905.md` Card T2-01–03、T2-22–23（REST/Hover/Drop/Manage；只有 materialized long-term worksite 可进入 Railway；Collection/Scope/temporary range 不自动进 Railway）。
- `ADOPTED`：Huabu `canvasStore.addNodes` → `ADD_NODES` resolver/executor → 当前 Canvas；Core `CoreProjectClient.getProjectGraph` → workspace.canvasId；Core `CoreCollectionClient.create/addMember` → 持久成员 API；Collection locate 复用 `waitForProjectedEntity` 与 `useLcosShellStore.requestLocate`。
- `VISUAL_SOURCE`：Figma Portal family `5348:1151`（`docs/construction/FIGMA_SOURCE_LEDGER.md`）；Action Arc `5388:311`；CollectionSurface `5333:96` / Main collection 与节点呈现。此次未改 Figma 形态，只在现有更多命令/多选工具条中落动作。
- `RETIRED`：没有替换旧 owner。Portal 目标 body/Drop registration 仍是 `PortalNodeBody`；Collection truth 仍归 Core canonical membership；Huabu 仍唯一拥有空间创建与布局。

## 证据与限制

- `VERIFIED`：Huabu web `tsc --noEmit -p huabu/apps/web/tsconfig.json` 通过；`git diff --check` 通过。`pnpm --dir huabu/apps/web typecheck` 被项目 pnpm 版本钉定（需要 10.34.3，本机 corepack 返回 11.5.2）拒绝，改用仓内 `tsc` 可执行文件完成同一 TypeScript 检查。
- 未跑浏览器：T3 当前占用共享浏览器。Portal 添加→节点出现→进入/移除、Core 回读；Collection 选择→成员投影→展开/折叠仍待共享浏览器实测。本次不声称实测或整条闭环通过。
- `UNRESOLVED — Railway add`：`apps/web-gen2/src/backend/railway.ts` 和 `packages/contracts/src/index.ts` 仍使用 `ProjectViewRailRefV0`；`T2_Patched_Navigation_Cards_20260905.md` Card T2-02/03 判旧 kinds `scene|collection|context|workflow` 为 `SUPERSEDED`，并明确当前 durable order mechanism 可复用、不能称最终 Gen2 contract。未新增按钮去写旧 kind；须待 canonical long-term worksite ref owner/schema 到位后接现有 CAS writer。
- `UNRESOLVED — Collection expand`：该工具链会定位刚创建的 Collection，不自动把成员重新布局或伪称已展开；T1 的 spatial host/fan-out/折叠恢复与 membership 是分开的既有后续动作，此处等待当前画布状态及浏览器验证。
