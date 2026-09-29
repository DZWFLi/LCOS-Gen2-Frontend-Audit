# 会话续工渐进确认与 Context 根入口修复

日期：2026-09-26。工作树：`LCOS_GEN2_GUI_RECOVERY_20260926`。本轮没有修改 backend/Core、创建新业务状态库或执行真实新建会话。

## 结论

WorkView 的四个常驻黑色续工按钮已收进现有 Composer 的“会话选项”。默认一行，展开后选择一种方式、确认继承范围，再提交。原有继续/精选新建/空白新建/完整分支命令全部保留。

## 原稿依据

- Figma 文件 `nFUdroLvI5qJZuYTW8h2rF`，5246:59；5249:415/726/1044/1355/1665/1975。已读取全设计包的 frame/nodes JSON，确认原文“新对话知道什么”“在哪里工作”“本次提交只读不随草稿改变”。
- T3 原卡 §20：紧凑输入、原位/工作窗共用草稿，内部滚动，不能扩成大侧栏。
- T7 V2 §9–10：历史/上下文/目录三轴独立；四模式不混用；不支持完整分支不能自动改成精选新建；未知结果不能再创建。
- R5 §7–8、§13–18：模式在更多选项内渐进展开，工程细节默认折叠。

原卡根目录：`E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/`，分别为 T3/T7 子目录。R5：`_cabin/04_R系列与T5规划/前端冲刺/LCOS_Gen2_R5_Glyth_ConversationSession_UX产品化设计施工规范_20260917.md`。

## 实际修改

| 项目 | 真实实现 |
|---|---|
| 紧凑入口 | `professional/ConversationContinuationControls.tsx`；Host 由根任务放入原 Composer 的折叠插槽。WorkView 保留“会话选项”入口，canSend=false 时仍能进入其它合法模式 |
| 能力检查 | 使用原 `useCollaborationSession` 的 canResume/canSelectedContext/canBlankNew/canFork；选择模式只预览，显式确认才调用原 client |
| 四种语义 | 继续=原历史与原上下文；精选=仅显式引用无原历史；空白=无原历史且请求不附带草稿引用；完整分支=原生能力决定的已完成历史 |
| 目录 | 当前命令默认 shared；没有真实隔离能力投影，不伪造可选的隔离目录 |
| 视觉复用 | 使用已有 Oreo `LcosButton` 和 `ComposerReferenceStrip`，引用确认条只读，不重复提供移除按钮 |
| 请求快照 | `retainContinuationIntent` 持有原 operationId；嵌套 ref 也复制。失败后即便草稿变空/换材料，重试仍用原请求和原快照标签 |
| 回执 | accepted 仅显示“请求已提交，等待外部确认”，不声称外部创建完成，不强制打开 Diagnostics |
| 恢复 | retryable 错误重试原请求；unknown/nonretryable 不直接重发，提供打开原会话工作窗的“核对或恢复原操作” |
| 并发 | 防同步双击；旧目标迟到回执不通知当前目标；原目标的既有投影仍可正常刷新 |
| Esc | 焦点在选项控件内时只收回选项并消费事件，不关闭外层 Composer/工作窗 |
| Context 根入口 | `ContextWorksite.tsx` 根据原 canvasBySurface 区分根/子；根走原 switchWorksite，成功才收光幕；子保留原 helper/sourceWasChild/时间轨 |

## 更正上批子现场判断

`workspace-real-main/context/workflow` 实际都是 root scope，不能因为点进后没有 workspaceId、时间轨或返回按钮就判为缺失。上批报告中“Context同现场未进入子现场”的待查证项现已澄清。根入口应回到根画布；真子现场链由原 helper 保留，4项单测验证。当前 fixture 没有真实子现场完整往返素材，未宣称真实浏览器已证明该回合。

## 验证与截图

- 4 个专项测试文件、19 项测试通过：模式预览不提交、完整分支不降级、blank 不带引用、快照与原请求重试、切模式保留意图、unknown 不重发且恢复入口可达、异步跨目标隔离、空/不支持引用阻断、快速双击与 Esc、WorkView保留入口、Context根/子分流。
- 完整 TypeScript 检查通过；本批 ESLint 通过。
- 浏览器使用恢复后的同一隔离 5286/43131/3011 服务，独立 Chrome context。8 个状态，0 console/pageerror，0 continuation/Run 写请求。
- 控制区：1440下宽454px；390下宽276px；两者 scrollWidth=clientWidth。默认折叠高36px，展开238/264.5px。390确认按钮随既有窗口正文滚动，未另建浮窗。
- fixture 四种续工能力尚未完成探测，因此真实页面确认按钮均诚实禁用；命令成功/失败路径由真实接口形状单测覆盖，没有伪造 capability 供拍图。

文件：

- [浏览器脚本](./surfaces-continuation-qa.cjs)
- [完整状态与请求记录](./surfaces-continuation-states.json)
- [1440展开](./surfaces-continuation-expanded-1440.png)
- [390确认区](./surfaces-continuation-390.png)
- [390 Esc后](./surfaces-continuation-escape-390.png)
- [根Context入口纠正](./surfaces-context-root-corrected.png)

## 真实限制

1. 当前提交快照只在本次 Composer 挂载期间持有；没有把它伪装成跨刷新持久快照。历史完整引用尚未由 operation RecoveryProjection 暴露，关闭后未知操作应在原会话工作窗核对/恢复。
2. 不添加前端假隔离目录能力；只有现有 shared 默认实际成立。
3. 创建阶段和外部确认后的伴身动效属于 G06/G07 后续，不能用本次 accepted 当成创建完成。
