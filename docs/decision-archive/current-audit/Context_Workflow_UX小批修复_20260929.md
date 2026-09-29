# Context / Workflow UX 小批修复回传

**结论：** 本批只修一处确定的近场视觉问题：Workflow 卡片轻预览的动作列会被底层 Worksite 连线穿过。改动只在现有预览态加深轻幕，不改三动作语义、target owner 或 Worksite 状态。

## 依据与源码对照

- 原施工卡：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\original_route_cards\T5\LCOS_Gen2_T5_ContextWorkflow交互专项_前端施工正本_V3_20260910.md` §9.1–9.3（卡片轻预览；双击/Enter 解析真实 Workflow target）、§10（Card Pool）、§16 P6（Light hand + image/material + Card Pool）。V3 在最新语义裁决中仍属覆盖索引，不据此引入未定 producer 或布局数值。
- 9/14 后续裁决：`E:\TRAE项目\LCOS0.1收口\_cabin\03_审计包与返工\LCOS_Gen2_UX施工卡与Figma审计包_20260915_ef4c214\03_HANDOFF\GEN2_ContextWorkflow_UX纠偏_20260914.md`：Workflow 卡池仅显示真实 workflow；取用加入草稿、打开走现场、续接需真实来源；未接通状态须诚实呈现。
- 产品语义裁决：`E:\TRAE项目\LCOS0.1收口\_cabin\06_Figma\LCOS_GEN2_Figma设计合同轻包_仅MD_20260914__unzipped\03_ContextWorkflow产品语义裁决.md` §3.4：卡牌为轻预览/选择层，真实 Workflow Worksite 保留在下方；卡多时 Card Pool/Search。
- Figma 采用清单：`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\figma-master\LCOS_Figma_前端施工完整采用清单_20260913.md`：Context 主稿 5388:21602 / spec 5392:4840；Workflow 主稿 5388:22998 / spec 5392:4882；Page 13 B03 `5344:752` 明确三个动作各有独立按钮（用于当前会话、打开工作流现场、续接原会话），且无来源时续接不可用。`VISUAL_SOURCE` 另有 Page 6 workflow hand 5140:3012、工作流封面手牌 5140:4300。
- 当前生产路径：`WorkflowWorksite` → `WorkflowHandOverlay` → `WorkflowHandView` → `WorkflowCardPool` → `WorkflowTaskCardView`。预览由已有 `data-preview="true"` 表达，动作列仍调用现有取用/现场导航回调；手牌底层 `LightCurtainBackdrop` fog 原值为 0.12。浏览器证据 `workflow-preview-after.png` 显示预览按钮背后连线与节点文字仍有较强对比；该视觉问题也记于 `workflow-near-preview-spatial-fix.md` 的未闭环项。

## 主仓与相关工作树核对

- 主仓 `E:\OS开发\LCOS_GEN2` 的 `frontend-reconstruction-v2` 与修复区基线同为 `7dd479c`；所以主仓没有另一个可直接复用、已进入主线的新增 Preview Backdrop 状态。
- `LCOS_Gen2_Wave_WorkflowCollection` 的 `7707722` 增补 collection node/Assembly caller 接线；不解决 B03 动作区与连线的视觉竞争。本批未移植其生产接线。
- `LCOS_GEN2_WORKFLOW_CARD_VERTICAL_20260920` 的 `9f9ec26` 变体会内联卡面并删除独立 `WorkflowTaskCardFace`、重写现有手牌层级/样式；它不是可安全叠加的小修复，也会覆盖当前已验证行为，本批不采用。
- Temporal hover / window tiers / multi-target focus 位于隔离 worktree，基线比较显示尚未整合进主线；其数据聚类与多目标行为不是本批的视觉问题，不复制到 Context producer。

## 修改

- 文件：`huabu/apps/web/src/lcos/ui/workflow/workflow-hand.css`
- 复用现有 `data-preview` presentation state：`.lcos-workflow-hand-stage:has(.lcos-workflow-task-card[data-preview='true'])` 时，将同一个手牌 backdrop fog opacity 从默认 0.12 调为 0.30。
- 仅近卡预览态受影响；闭合/普通手牌保持原值。没有新增 store、state、事件或 API，也没有改底层 Canvas/连线/节点几何。没有用 blur 冒充 Figma GLASS 材质。

## 六字段回传

- **READ_SOURCE：** T5 V3 §9–10、§16 P6；9/14 ContextWorkflow UX 纠偏；Figma Context/Workflow 主稿与 B03 `5344:752`；具体来源如上。
- **ADOPTED：** 复用 `WorkflowTaskCardView` 已有 `data-preview` → `WorkflowHandView` 的轻幕层；真实用户入口仍为 `WorkflowWorksite` / Main 复用的 `WorkflowHandOverlay`。无 donor 移植。
- **VISUAL_SOURCE：** Figma 5388:22998、5140:3012、5140:4300、5344:752；轻幕底层保持在真实 Worksite 上方，操作仍分列。
- **RETIRED：** 无新增组件退役。只替换近卡预览时 0.12 的全屏轻幕强度规则。
- **VERIFIED：** `git diff --check -- huabu/apps/web/src/lcos/ui/workflow/workflow-hand.css` 通过；在现有真实开发页 `http://127.0.0.1:5286/projects/lcos-gen2-dev/main` 呼出 Workflow 手牌并单击首张真实卡，检查到 `data-preview=true` 为 1、fog computed opacity 为 `0.3`、pageerror 为 0。截图：[workflow-preview-curtain-after.png](workflow-preview-curtain-after.png)。没有跑测试套件。
- **UNRESOLVED：** 真正 workflow 封面与 region/child 目标映射缺口继续保留；无来源续接仍禁用。动作按钮之间仍可见底层关系线/标签；当前截图确认动作文案可读、底层现场保留，但未声称彻底隔绝所有背景线。Context 时间/性质组织和 Temporal producer 未因样式调整而改变或宣称完成。

本批只改 `workflow-hand.css`；无 Core 修改，无新增测试，无 commit / merge / push。

