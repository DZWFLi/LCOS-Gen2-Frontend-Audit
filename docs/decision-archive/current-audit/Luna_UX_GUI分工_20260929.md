# Luna UX / GUI 本轮分工

日期：2026-09-29

已按用户要求启动三路既有 Luna 子代理，本轮优先可见体验，不扩大底层施工与测试。

| 分路 | 施工重点 | 文件边界 |
| --- | --- | --- |
| T1/T2 | 集合形态与成员呈现；Color Pin、浮标、Rail 的入口及层级 | Collection 节点呈现、相关导航文件 |
| T3/T4 | Glyth 续工与继承的近场呈现；保留引用、能力判断和恢复反馈 | ConversationContinuationControls 及相关样式 |
| Context/Workflow | 原裁决下的进入、预览、取用、返回及层级关系 | Context/Workflow surfaces 与 UI |

## 共同要求

- 先核主仓与相关功能工作树，有现成实现优先复用，不能把未接入误报为不存在。
- 按原 T 卡、后续裁决及 Figma 采用清单施工；每路先完成 1–2 个证据充分的具体问题。
- 不新增第二套状态 owner，不用假成功掩盖功能缺项。
- 本批不扩展 Core，集合闭环授权保留供后续使用。
- 不跑大范围测试，只做必要定向检查。
- 各路提供改动文件、依据、尚未闭环点和 MD 回传；主代理统一复核。
- 尚未完成或合并。修复完成后再进行本地合并，暂不 push。

修复区：E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926
主仓：E:\OS开发\LCOS_GEN2

## 继续施工：第二小批

用户在简历资料整理插曲后明确要求继续，由 Luna 直接施工。三路已重新启动：

- T1/T2：优先集合文件夹材质与远中近呈现，或导航密集遮挡。不能仅补 tooltip，也不能伪造正式集合成员。
- T3/T4：核查上一批四模式选择是否重新卡片化，继续收紧为近场图像控件；保留继承范围、引用预览与确认/恢复。
- Context/Workflow：优先修预览、进入、取用、返回的理解与入口问题；不只调整轻幕透明度。

这一批仍限定 UX/GUI。先复用主仓已有实现，直接落代码；必要浏览器观察优先于大范围测试。三路文件范围互斥，主代理汇总复核。当前属于进行中，未宣称完成或已合并。

## 主审截图复核与继续修正

已查看 Collection_mark_LOD_20260929.png 与 continuation-inheritance-nearfield.png。

- 集合：近中远轮廓一致性有所改善，但无预览时仍显示两张占位纸片及“组织未标注”。已交 Luna 核查真实数据来源，避免无数据时制造成员内容感；无真实预览应采用克制、诚实的空态。
- 续工：四项图标选择带比2×2大卡紧凑；截图的字体和引用区域疑似缺全局样式。已交 Luna 核样式加载及真实窄宽状态，不能把隔离挂载截图当整页验收。
- Context：悬停动作提示已补，但仅是小改。继续核返回、当前现场身份与操作入口，不据此宣布整体UX完成。

三路 Luna 已再次启动。此前截图均有隔离组件或未全链验证限制，尚未完成整页统一复核。本次不合并、不push。

## 按完整目标恢复持续施工

用户明确要求直接开工并按完整 Gen2 GUI 对齐 Figma 的方向持续推进。已查询目标：状态 active，原目标完整保留，无需另建目标，也不冒称已完成或已重启不存在的暂停状态。

三路 Luna 当前施工分工：
- Workflow 取用后 Composer 不挂载：扩大到唯一 HostOverlay/可见性 caller，直接修现有链路，不另建 Composer。
- Professional Window 横/竖分屏：扩大到既有窗口拓扑与 shell store 窗口部分，复用现有分屏方法及相关功能工作树，不新增 owner。
- 主画布节点呈现：按已有节点缺口与 Figma 修文字/图片/文件等物种的实际呈现，集合正式成员和缺少 donor 的项目暂后置，不以其阻塞其余工作。

不再重复制作对账表。每路以代码和真实界面变化回传；整套目标未完成，尚不合并、不push。

## 分屏与 Composer 的跨路复核

主审已读取当前 LcosHostOverlay.tsx 和 composerPresentationOwner.ts。发现分屏改动需要同步可见 Composer 所属窗口的判断：旧 helper 每 region 仅查一个 activeWindow，新多 group 分屏下可能有多个可见 body。已通知窗口与 Composer 两路协调，只由一方修改相关 helper，避免重复挂载或误隐藏。

本次核对基于当前源码，不把累计 diff 视作本批新增成果。三路当前均为运行中，继续实施；整套对齐未完成。

## 窗口分屏施工断点确认

当前源码确认：windowRegionTopology.ts 已有 groups / activeGroupId / splitDirection / splitRatio 与 splitRegionGroup；Shell runtime 和 Stage 仍有旧的单active窗口路径。Luna 正在接通既有group owner到生产渲染，并采用现有window-topology-persistence工作树中的相关保存/恢复实现，源工作树不修改。

主审补充边界：关闭分屏至单组或合并时，清理分屏参数或确保渲染只按实际组数判断；旧session flat结构仅归一化读取，不并存两套成员真值。Composer可见owner枚举需同步多group，相关两路已协调。

目前为施工中，尚无整条分屏路径完成证据，不宣称验收通过或已合并。

主审进一步核到 Stage 的 inlineComposerOpen 还受全局 active conversation 限制；桌面下即使会话窗口可见，非全局激活时也可能没有内嵌输入框。已把这一条件及未分配窗口的合成region路径交给Composer代理一并核对，避免仅修compact而遗漏桌面。当前尚待修复后的真实入口证据。

### Composer 原因修正

实际 ConversationWorkViewBody 按 receiver 匹配挂载输入框；Stage.inlineComposerOpen 仅用于 Esc 行为。因此前述“桌面非全局激活也必然不挂载”的疑点未成立，不计缺陷。保留已确认的 compact 可见性不一致问题。

共享可见窗口 helper 明确由 Composer 路实现，窗口路只消费并负责 store/groups 和 Stage 分屏，避免两路重复实现与并发改写。当前修复仍在进行，尚未计为已完成。

## 当前落码核查

已看到 shell store 开始加入 splitWindowRegion / mergeWindowRegionGroups / setWindowRegionSplitRatio 接口，共享 professionalStageVisibility.ts 已写入工作区。主审读到该新函数的中间版本仍按每region单active返回，已交回补齐多组可见窗口及失效active回退，尚不计为完成。

本次核查有实际源码变化，非仅分派计划；Stage最终接入与真实画面仍待本批收尾。

最新源码复核：split/merge/ratio 已从声明进入 Shell 实际动作，groups 作为成员组织正在接入 open/activate/close/group/ungroup；Stage 双pane与持久恢复尚未接完。共享可见枚举已增加group，但主审发现compact布局输入可能按group重复计同一region，已交回核查，避免分屏一开就误收为紧凑模式。仍为在建状态，不作为交付完成。

共享可见性最新版本已按每个物理region唯一计算compact，再枚举组内可见窗口，之前重复计数点已修。主审继续检查旧会话active ID不属于当前组的回退边界，交由同一代理处理。Stage最终双pane挂载尚待接入，不将helper完成等同分屏完成。

## 双窗格已接入，继续修交互边界

当前 ProfessionalWindowStage 已导入共享可见性函数，并出现分屏按钮与两个pane生产渲染；Workflow取用已传真实按钮rect作Composer锚点。主审读到活动组切换时pane比例及DOM顺序可能随active交换，已要求按region.groups固定顺序与索引保持左右/上下位置，避免点另一个窗格导致布局跳动。真实整页复核仍待完成。

主审已确认Stage按region.groups固定顺序呈现双pane。进一步发现peer body props与主pane可能不齐，已要求保持Portal等入口一致；分隔条需补键盘与指针取消清理，不能因新增分屏降低现有可访问性。仍待代理收尾与真实页面复核。

分屏拖拽收尾已在源码看到双pane同步比例、pointercancel恢复原basis与卸载清理；这些是代码层证据，尚未据此宣布真实交互通过。当前等待已运行的Luna完成取用→Composer和分屏的页面验证，没有重启代理或新增审计任务。

窗口代理回报当前web类型检查已通过，3个定向文件49项通过，Stage浏览器与恢复仍待验证。主审已读取新增professionalWindowPersistence.ts，交回补核rect/dockWidth有限值和窗口可选字段解析，确认全项目清理函数不会用于普通关闭/切换。类型通过不是窗口交互已验收。

## 工作流取用截图主审

已查看 workflow-composer-after-take.png：卡面显示已加入草稿，但页面同时提示 main现场还没有画布，截图未见Composer。已要求代理区分“Canvas/唯一Host尚未挂载”与“compact窗口owner误判”两种原因，不得据该图认定Composer已修或归因仅为compact。继续在真实可用现场核验，禁止另加第二Composer规避。

窗口布局持久数据已补有限rect/正尺寸/dockWidth校验，当前仅源码确认。

已确认无Canvas时HostOverlay不挂载是本次截图的直接原因。主审未接受整层Host搬到Shell的提议，因其同时承载Drop/Temporal且原架构限定唯一受控canvas portal。已定位LcosSurfaceDock→useLcosWorksiteNav→ensureCanvas正式建立路径，交代理核真实点击/transitionError；若同现场无画布被错误提前返回则在现有导航owner内修。保持草稿与唯一Composer，不新增第二宿主。

主审已读useLcosWorksiteNav完整函数：不存在同surface提前返回，不能据猜测改导航。已要求固定Main只执行一次正式ensureCanvas→switchCanvas→取用，捕获具体请求/返回并确认ReactFlow及Host真实挂载，排除主动换路由引起的ERR_ABORTED噪声。仍未获得Composer整链成功证据。

主审实时复查：5286/3011/43131均监听；GET 5286/api/workspace 与3011/api/workspace均200且configured:true。窗口代理此前ECONNREFUSED并非当前持续阻塞，已通知浏览器代理继续共用现有服务，不重启。分屏代码与50项定向检查已回传，真实整页/重载仍待验证。

主审已查看workflow-main-canvas-after-take.png：画布现已出现，Composer仍未见，因此no-canvas不是全部原因。已要求在同一状态逐层核composerOpen/target→仲裁→owner→Host open→DOM位置/遮挡，不再换场景猜原因。另Output图像节点与Figma参考并列截图已生成，待代理交付源码证据后复核。

主审已读SourceMorphology当前diff：output改按真实artifactKind/MIME复用现有图像/文本/音视频body，未知类型仍保留诚实fallback。已要求代理确认上游props贯通及生成来源不丢失；并列Figma图片仅组件样例，非整画布验收。当前三路仍在执行。

窗口代理确认此前节点报告中的TS错误是真实新错误，已修复sameTabRestored/diskRestored类型混用与重复id/layout。主审读取当前setProject确认磁盘仅恢复窗口布局，同页会话才恢复Composer字段；代理最新tsc退出0。此前“检查通过”只对应当时版本，当前以本次修复后结果为准。Composer生产路径仍在验证。

## 继续施工：2026-09-29

原目标仍为 active：将 Gen2 的 GUI/UX 按既有 Figma 与 T1–T7 原裁决落实进真实前端。沿用原目标，不另建重复目标。

- Luna T1/T2：已完成通用节点远中近信息密度修正，继续右键菜单与节点真实操作入口。定向结构测试 11 项通过；整页缩放尚未验证。
- Luna T3/T4：继续装配、阅读窗口布局及信息密度；保留现有窗口状态归属。
- Luna T6/T7：工作流手牌取用后输入框被画布焦点规则隐藏的原因已定位并修复，真实页面确认仅一个 Composer 出现。接着验证分屏、比例和重载。
- 主代理：检查修改是否进入真实调用链，协调文件边界，汇总后本地合并；暂不 push。

已复核 WorkflowCardPool 的焦点恢复位于用户明确取用动作中，不是渲染副作用。该修复复用既有画布注意力状态，没有新增第二套输入框。

未完成事项仍按原清单推进，不把上述局部修复当成整套 GUI 已完成。

## 用户纠正：整批施工，减少协调开销

三路Luna改为整批自主交付，不再按小改动频繁回报或等待主代理检查：

1. 集合：持久成员→接口/回执→投影→Drop→展开折叠完整链。
2. 非集合Drop：Glyth、Composer、Railway和原卡允许的Portal目标识别、预览、提交、逐项反馈与恢复。
3. 页面验证：窗口遮挡→Context完整进出与时间轨→Workflow预览/取用/进入/返回→Glyth真实入口。

中途仅真实阻塞或文件冲突上报。主代理处理独立代码，收到整批结果再集中复核，不定时反复查代理状态。所有分工仍沿用现有授权与owner，不提交或推送。

## 追加重点待办：Context / Workflow 原型与生产对齐（用户确认）

2026-09-29：重要性高；排队位置不提前。继续当前集合、非集合 Drop 和既定验证批次，不以此项打断或替换原待办，不据此提前开展两视图重构。

- [ ] 按原 HTML、T 系列后续裁决、最终 Figma 逐状态核对，保留原型交互及空间组织，不凭名称或占位框判完成。
- [ ] Context：时间／事情性质组织；唤出、悬停、聚焦、进入、返回；真实子现场及右侧密集时间轨。
- [ ] Workflow：手牌、完整卡池、内容预览、进入真实现场、取用和返回；核对搜索／筛选／最近使用。
- [ ] 区分 Core 已有但未接、生产 caller 接错、真正缺失接口；不将上下文提案等同集合合并拆分。
- [ ] 同状态对照截图和真实操作验收；缺真实数据须明确记录，根现场不冒充子现场，组件测试不代替整页核验。

已确认的源码偏差与原件索引：[Context_Workflow_原型与生产偏差核查_20260929.md](./Context_Workflow_原型与生产偏差核查_20260929.md)。该项目前为待办，尚未完成。
