# T4 分屏与窗口布局恢复施工记录（2026-09-29）

## 结果
Professional Window 的 split topology 已接入现有 Shell Store 与 Stage：显式 tab 组可选择左右分栏/上下分区，两个 pane 按稳定 group 顺序呈现各自 body；拖动分隔线只在 pointerup 提交比例，支持方向键、Home/End，pointercancel 与卸载会清理手势。关闭一侧后自动回收为单组并删除 split 属性；merge 同样清除 split 状态。

布局恢复只保存窗口实例身份/目标和 region groups/geometry 到项目级 localStorage；不保存 Composer 草稿、Core body 数据或 Canvas 相机/选择。项目同页切换沿用既有 session；刷新时解析布局，旧 flat region 读入后立即规范化为 groups 并回写，不同时保存两种成员关系。`clear()` 只清理当前项目布局，不清其他项目。

## 依据与复用
- 原 T4 卡：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T4\LCOS_Gen2_T4_C1-2_ProfessionalWindowTopology_Dockview_ProtectedCanvas_ExactSourcePlan_20260906.md`，明确 Float/Dock/Undock/Resize/Move、水平/垂直组合、关闭与恢复。
- 复用了主仓未提交 worktree `E:\OS开发\LCOS_GEN2\.worktrees\window-topology-persistence` 中项目级布局存储思路；没有改该源 worktree。

## 修改文件
- `huabu/apps/web/src/lcos/shell/windowRegionTopology.ts`：收拢空组、merge 时清理 split 字段。
- `huabu/apps/web/src/lcos/shell/lcosShellStore.ts`：成员所有权迁移到 groups；新增 split/merge/ratio；保存、项目切换读取及旧布局一次性归一。
- `huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.tsx`：双 pane、tab/body 切换、分隔线指针与键盘操作、close 后拓扑更新。
- `huabu/apps/web/src/lcos/professional/professionalWindowPersistence.ts`：项目级窗口目标与拓扑安全解析/存储。
- `huabu/apps/web/src/lcos/shell/lcosShellStore.test.ts`、`huabu/apps/web/src/lcos/shell/windowRegionTopology.test.ts`、`huabu/apps/web/src/lcos/professional/ProfessionalWindowStage.test.tsx`：更新 group shape 断言并覆盖 split/持久化/close 收拢。

## 验证
- Web TypeScript：`tsc --noEmit -p huabu/apps/web/tsconfig.json` 通过。
- 定向 Vitest：`windowRegionTopology.test.ts`、`lcosShellStore.test.ts`、`ProfessionalWindowStage.test.tsx`，50/50 通过。
- 真实浏览器分屏/刷新核验未完成：本机 Vite 页面请求 `/api/workspace` 返回连接拒绝；浏览器连接调用未完成，无法诚实记录真实页面截图或 reload 实测。没有安装新浏览器，也没有运行全量 E2E。

## 未完成
- 需要 Core/API 服务可用后，在真实页面确认双 pane 的实际尺寸、tab 切换、刷新恢复和 reader/assembly/portal body 行为。浏览器连接恢复后再实测；当前证据限类型检查和组件/Store 定向测试。
- 变更未 commit、未 merge、未 push。
