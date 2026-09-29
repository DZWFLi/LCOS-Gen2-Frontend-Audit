# T5 全范围跨线程蓝图索取矩阵 v2

日期：2026-09-07  
请求方：T5 / 55  
统一基线：LCOS Gen2 `232b2ca5` + Huabu `a3c411e1f655191344285141f08c4738fa6015f7`

## 目的

停止依靠 T5 单方从审计摘要反推所有细节。首轮从内容节点开始，但本矩阵现已升级为 T5 后续全部视觉施工的长期上游蓝图闸门。

## 请求矩阵

| 路线 | 对话/任务 | Owner 范围 | 本次必须回传 | 状态 |
|---|---|---|---|---|
| T1 | `11` | Node world、LOD、layout、projection presentation | Image/Note/Markdown anatomy；全微状态；Gen1 富文本与正文↔导图源码恢复；promotion/restore；Spatial choreography；验收板 | `RECEIVED / READY_FOR_MERGE` · `LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md` |
| T2 | `222` | Focus / Where / Locator / camera request | worldRect→safeRect→camera transform；occupied window 场景；arrival/settle/return；调试读数；acceptance | `RECEIVED / READY_FOR_MERGE` · `LCOS_Gen2_T2_TO_T5_NavigationPresentation_BlueprintIndex_20260907.md` |
| T4 | `442` | Professional Window / Preview / Work View | default-right + movable；dock/float/split/tab/resize；camera freeze；scroll/caret/identity restore；Huabu PreviewWorkspace exact reuse | `RECEIVED / READY_FOR_MERGE` · `45_T4_to_T5_ProfessionalWindow_and_ProfessionalBodies_ExactBlueprint_v1.md` |
| T3 | `113` | Pointer、selection、edit、drop、overlay | double-click edit；screen-rect overlay；selection/reference边界；format portal/caret；Assembly→Focus；drop state machine | `RECEIVED / READY_FOR_MERGE` · `LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md` |
| T6 | `663` | Canonical entity、revision、draft/current | Markdown唯一真相；Text/Outline/MindMap presentation边界；WYSIWYG/raw写回；AI provenance；Accept/Reject/Restore；stale/conflict | `PARTIAL_RECEIVED` · Railway only；全 species contract 仍待回传 |
| Huabu current | 本地源码 | 真实 renderer/editor/window mechanics | 由 T5 直接读取 `NoteNode`、`NotePreview`、`MilkdownFloatingToolbar`、`NodeWrapper`、`PreviewWorkspace`，不向 Huabu 重造需求 | `SOURCE_READ_IN_PROGRESS` |

## 所有回传的统一格式

每个 owner 必须提供：

1. `CURRENT / REUSE / PLANNED / GAP` 状态；
2. exact file、symbol、type、state shape；
3. before / during / after / failure / reduced-motion；
4. 当前可直接复用与必须新接 thin seam；
5. 浏览器验收；
6. 有来源才给尺寸/时序数值；
7. 不重新讨论已冻结产品语义；
8. 不用 Mock 冒充 production 已接通。

## 后续全范围索取（已补发）

| Owner | 除当前内容节点外，必须提前覆盖的后续范围 | 状态 |
|---|---|---|
| T1 | Collection、Colony、LOD、fixed-screen identity、local settle/layout、Archive/Restore arrival、HUD/Pin/Locator/Minimap、Glyth takeover host constraints | `RECEIVED / VERIFIED_STRUCTURE` |
| T2 | Project Search、Color Pin、Locator/Arrival、Spatial Navigator、Railway、Worksite enter/back、远距 marker/identity | `RECEIVED / VERIFIED_STRUCTURE` |
| T3 | 完整 selection/reference、relation、semantic give、全部 drop destination、Action Arc、Composer、Voice、Run/review、Esc ladder、overlay arbitration | `RECEIVED / VERIFIED_STRUCTURE` |
| T4 | ProfessionalWindow 全拓扑、Assembly、Workflow/Skill/Run 专业身体、Conversation Scene、Archive browser、Audio/Media 区域、响应式 dock/float/split/restore | `RECEIVED / VERIFIED_STRUCTURE` |
| T6 | 全 species canonical contract：媒体、文档、Collection、Conversation/Glyth、Skill/Workflow、Run/Result、Decision/Checkpoint、Archive、Context、Assembly | `PARTIAL_RECEIVED` · Railway destination/transaction 已核验；其余仍 `WAITING` |

## 永久闸门

以后每一张 T5 construction card 必须先具备：

```text
canonical owner response
+ gesture/state owner response
+ spatial/presentation owner response
+ window/navigation owner response（若涉及）
+ Huabu current-source evidence
+ Gen1 completeness evidence
+ donor visual evidence
```

缺任一项时，只允许做 `EVIDENCE_GAP` 记录和低成本问题探针；不允许冻结视觉、不允许宣称可施工、不允许用通用 UI 填补。

## T5 收到后的合并顺序

```text
T6 canonical invariant
  → T3 gesture/state boundary
  → T1 node presentation/LOD
  → T2 focus/camera framing
  → T4 professional-window topology
  → Huabu exact reusable body/mechanics
  → Gen1 completeness and visual behavior
  → Spatial choreography calibration
  → unified construction board
  → interactive prototype
```

## 当前冻结动作

在五路蓝图回传并完成冲突表以前：

- 暂停继续美化当前 HTML；
- 当前 HTML 只保留为问题探针；
- 不将其升级为 Gate A 证据；
- 不修改 Gen2/Huabu production source。

## 已合并边界与当前缺口（2026-09-07）

### T2 × T4 × Huabu 已对齐

| 责任 | 唯一 owner | T5 消费方式 |
|---|---|---|
| `safeRect / occupiedRects` | T4 `ProfessionalWindowEnvironment` | Focus、Search HUD、Locator 和 edge cue 只消费，不另算一套 |
| Camera / viewport / bounds / tween | Huabu | T2 发出导航意图，T5 只定义视觉反馈和 motion 参数，不创建第二 Camera |
| Search / Focus / Pin / Locator / Railway presentation orchestration | T2 | T5 回填形态、状态可读性、碰撞呈现和验收 fixture |
| canonical identity / lifecycle / destination | Core、ProjectSession、T6 | T2/T5 均不得以 presentation state 替代 canonical state |

### 尚不能封板的接口

- T1：仍缺支持 T4 `safeRect` 的 node-world spatial focus port，以及内容节点/Collection/LOD 的 exact presentation blueprint；
- T3：仍缺 remote drop target、drop state machine、selection/edit/overlay arbitration 的 exact gesture contract；
- T6：Railway destination/transaction 已收到，但 `surface_root → ProjectSession/Worksite` 映射和全 species canonical contract 仍是 GAP；
- 因此 Search、Focus HUD、Locator 的视觉可以准备，Camera 执行、remote drop、Worksite arrival 暂不能标记为 production-ready。

## 验收条件

- 五路回传齐全或明确标出无法回传的 GAP；
- 同一内容实体在 Text / Outline / MindMap / Preview / WorkView 之间的 truth owner 无冲突；
- Focus 与 passive WorkView resize 的 camera 行为无冲突；
- T3 edit/selection contract 与 Huabu NodeWrapper/Milkdown 不冲突；
- 能生成一张逐状态、逐来源、逐 host seam 的最终 construction matrix。

## 回滚

本轮只新增桌面 Markdown 并向现有任务发送请求；未改 production code。无需源码回滚。
