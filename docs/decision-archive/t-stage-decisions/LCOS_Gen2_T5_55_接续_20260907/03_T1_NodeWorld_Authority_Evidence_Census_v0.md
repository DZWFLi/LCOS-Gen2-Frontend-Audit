# T1 Node World Authority Evidence Census v0

## 1. Authority 层级

| 层级 | 回答的问题 | 当前输入 |
|---|---|---|
| 用户当前口径 / 最新冻结 | 能做什么、语义是什么 | README、T1–T6 handoff、用户最新裁决 |
| Current mechanics | 系统现在怎样承载 | Huabu / Gen2 renderer、projection、LOD、overlay、resize |
| Gen1 completeness | 至少不能漏什么 | Gen1 node lifecycle 与专业预览能力 |
| Mature visual donor | 应该长什么样、怎么动 | Spatial、Grok/Bloub、TapNow、Lovart |
| Mature implementation donor | 怎样低风险实现 | Huabu、Milkdown、Orbit、Amicro 等 |
| T5 | 组合、裁决、下压施工规格 | exact visual/state/motion/acceptance contract |

## 2. 当前 mechanics census

| 能力 | 候选文件/模块 | 证据状态 | 下一动作 |
|---|---|---|---|
| authoritative projection | LCOS `ProjectionBinding`（非 Huabu current 文件） | `HISTORICAL_DOCUMENTED` | 在 LCOS Gen2 分支/施工稿定位 |
| canonical → spatial | LCOS adapter（非 Huabu current 文件） | `HISTORICAL_DOCUMENTED` | 在 LCOS Gen2 分支/施工稿定位 |
| resize / selection / toolbar / overlay / LOD | Huabu `apps/web/src/components/Nodes/NodeWrapper.tsx` | `CURRENT_SOURCE_VERIFIED` | 对齐 LCOS renderer |
| semantic zoom | Huabu `apps/web/src/config/semanticZoom.ts`, `apps/web/src/hooks/useNodeLOD.ts` | `CURRENT_SOURCE_VERIFIED` | 已核 150px / 10px / 32-52-76 |
| takeover | Huabu `apps/web/src/config/nodeTakeover.ts`, `NodeTakeoverLayer.tsx` | `CURRENT_SOURCE_VERIFIED` | 已核 64→24、6px hysteresis、200ms glide、6→30 mark |
| container mechanics | Huabu `apps/web/src/components/Nodes/frame/FrameNode.tsx` | `CURRENT_SOURCE_VERIFIED` | 对齐 Collection expanded |
| visual family pending seam | `visualFamily.ts` | `CURRENT_SOURCE_VERIFIED`（RC/baseline 副本） | 确认正式 current root |
| Text renderer | Huabu `apps/web/src/components/Nodes/shared/TextNodeBody.tsx` | `CURRENT_SOURCE_VERIFIED` | 历史“404”结论已被 current main 推翻 |

## 3. Species coverage v0

| Species | full body | compact | identity | current renderer | visual authority | 当前状态 |
|---|---|---|---|---|---|---|
| Image | 真实图片主体 | 保留画面识别 | species mark/mini preview | 待定位 | Spatial + Huabu | `PARTIAL` |
| PDF | 纸页/当前页 | 页叠/页预览 | PDF species identity | 待定位 | Spatial + PDF renderer | `PARTIAL` |
| PPT | 当前 slide + rail seam | slide preview | PPT species identity | 待定位 | Gen1 floor + preview system | `OPEN` |
| Web | 页面内容/网页预览 | page snapshot | Web species identity | 待定位 | Spatial + current preview | `OPEN` |
| Text（旧归类，已废止） | 同一对象的 Canvas Text | Outline face | Mind Map face / identity LOD | 待定位 | Huabu + Milkdown + planned wheels | `SUPERSEDED` |

> 最新裁决：Huabu lightweight Text 直接复用 `TextNode/TextNodeBody`；Markdown/Outline/Mind Map 移至 Note/Document projection。见 `27_NC-08_Text_Exact_Construction_Card_v1.md`。
| Collection | expanded visible host | collapsed member stack | stack identity | Frame mechanics 待核 | Spatial + Huabu | `PARTIAL` |
| Colony | organic ambient field | contour/group cue | faint group identity | LCOS primitives 待核 | Spatial behavior + LCOS | `PARTIAL` |
| Glyth | living body | reduced living body | eyes/silhouette | Grok replica 已定位 | Grok/Bloub | `DONOR_FOUND` |
| Skill | 专业对象 body | skill glyph + summary | species identity | 待定位 | T4 + LibTV | `OPEN` |
| Run | process/state body | state capsule | state identity | 待定位 | T4/T6 | `OPEN` |

## 4. State coverage v0

所有 species 最终至少检查：

| 状态族 | 必需状态 |
|---|---|
| presence | rest / hover / selected / multi-selected |
| geometry | resize-active / resized / constrained |
| movement | drag / target-receptive / target-reject / settle |
| depth | focused / presented / deep-work / restore |
| semantics | reference / relation / semantic-give / proxy |
| execution | working / waiting-input / result / pending-review / error |
| scale | full / compact / identity / aggregate |
| lifecycle | archived / restored / stale / missing |

当前没有任何一份 Gate A 文档逐 species × state 全部闭合，因此不能宣称“节点视觉系统已冻结”。

## 5. Donor census v0

| Donor | Phase 1 消费范围 | 证据状态 | 采用模式 |
|---|---|---|---|
| Spatial | intrinsic morphology、focus、reflow、stack、scatter、settle | `VISUALLY_CONFIRMED` + `REPORT_MEASURED`，完整 ledger 待补 | `ADAPT / REPLICATE_BEHAVIOR` |
| Grok replica | Glyth body、eyes、gaze、blink、morph、presence | `DONOR_SOURCE_VERIFIED`（桌面已定位） | `DIRECT_USE / LIFT / ADAPT` |
| Huabu | renderer、resize、LOD、takeover、Frame mechanics | `CURRENT_SOURCE_VERIFIED`（GitHub current main） | `DIRECT_USE / WRAP` |
| Milkdown | Text 阅读/编辑体 | `CURRENT_SOURCE_VERIFIED`（Huabu `apps/web/package.json`, 7.21.1） | `DIRECT_USE / WRAP` |
| react-arborist | Outline wheel | `PLANNED_NOT_FOUND_CURRENT` | `ADOPT_IF_APPROVED` |
| mind-elixir | Mind Map wheel | `PLANNED_NOT_FOUND_CURRENT` | `ADOPT_IF_APPROVED` |
| iOS control/glass | microinteraction/material | `MISSING_EXACT_LOCATOR` | `CLASSIFY_FIRST` |
| TapNow | 仅 Node World 相关 HUD/Pin/Minimap seam；主体留 Phase 3 | 本地研究材料已知，未在本轮逐文件核 | `LIFT / ADAPT` |
| Lovart | Node preview/workbench 接缝；主体留 Phase 4 | 本地研究材料已知，未在本轮逐文件核 | `LIFT / ADAPT` |
| LibTV | Skill/execution/handoff；Node World 仅物种覆盖 | 本地研究仓库已知 | `LIFT / ADAPT` |
| DomainMap / STTIO | 尚不能确认 exact 对应物 | `MISSING_EXACT_LOCATOR` | `HOLD_CLASSIFICATION` |

## 6. 已关闭与开放冲突

### CLOSED

- license / rights 当前不阻塞非商业阶段 donor 使用；仅记录 provenance。
- Workspace 是 Semantic Viewport，不是独立 Canvas/Graph。
- T5 不重写 T1–T4 已冻结的语义与 UX grammar。
- Scope 没有 durable body；不能升级成节点 species。
- Restore 为 same identity + fresh placement，不从 Archive 位置飞回旧坐标。
- fixed-screen identity 必须保留 species，不能全部退化成同一个点。

### HOLD

- collapsed Collection 左拖后的 source spatial outcome。
- LCOS Gen2 adapter/ProjectionBinding 所在 GitHub 分支与 Huabu upstream 的边界。
- DomainMap、STTIO 的 exact material locator。
- Outline / Mind Map wheel 是否已获依赖引入批准。

## 7. v0 判定

本 census 已把混合在聊天中的事实重新分级，但它仍是 `v0`：能够指导继续调查，尚不能作为 T1 direct-construction final blueprint。
