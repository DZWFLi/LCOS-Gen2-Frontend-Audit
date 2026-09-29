# LCOS Gen2｜P0 后 UI 高精度与 UX 基础剩余施工量评估

> 基线：frontend-reconstruction-v2 @ b5784bb894bf1e328a06385ceebf6e568e665c44
> 口径：不是按文件数/LOC 算，而是按“是否已经拥有稳定 owner、状态模型、生产 caller、真实交互闭环、可进入最终视觉封板”评估。

## 一、总判断

在 P0 companion 补齐后：

- UX 架构/基础完成度：约 65%–70%
- UX 端到端可用闭环：约 45%–55%
- UI 结构骨架覆盖：约 70%
- UI 高精度还原：约 45%–55%
- 真正可以直接进入最终视觉封板的区域：约 45%
- 仍需先补 UX 基础再封板的区域：约 30%–35%
- 剩余纯视觉/状态精磨：约 20%–25%

这个百分比不是“代码量”，而是按最终产品风险加权后的施工成熟度。

## 二、现在已经可以进入高精度施工的区域

### 1. Node Presentation / Species

基础已经比较稳：
- single presentation seam
- reactive late binding
- species registry
- HostPresentation 控制 native chrome
- native fallback 边界明确
- screen-space presentation facts 已进入 NodeWrapper

P0 补齐后，可以直接逐物种做：
- Card proportion
- typography
- preview crop
- metadata density
- hover / selected / editing / dragging / waiting
- semantic zoom
- transition
- Figma geometry

这一块不应该再等大 UX 重构。

### 2. Action Arc + Edge Arc

P0 compose command 补齐后，command owner 基本稳定。
后续主要是：
- Figma geometry
- angular spacing
- near-field offset
- hover / pressed / disabled
- More popover
- viewport edge flip
- safeRect 最终接入

safeRect 会带来局部位置修正，但不会推翻命令模型。

### 3. Compact Composer

Composer 的：
- target
- prompt draft
- reference draft
- submit
- success clear
- failure preserve
- inline / canvas floating 两种宿主

都已有真实基础。

可先做高精度：
- 高度增长
- chips
- attachments/reference
- send states
- skill/run affordance
- focus/keyboard
- transition

后面 Conversation live adapter 主要改变 receiver/runtime state，不会推翻 Composer 外观体系。

### 4. SurfaceDock / Global shell 基础视觉

Main / Context / Workflow 一级入口已经稳定。
可以做：
- exact size
- spacing
- glass
- icon state
- active indicator
- animation
- Figma responsive layout

Railway 不应再承担一级 Surface switching，因此 SurfaceDock 本身可先封。

### 5. Navigator / Focus-Where / Camera HUD

命令角色已经基本明确，可进入高精度。
唯一需要预留的是 safeRect / occupied rect 接口，不要把位置写死到永远不可避让。

---

## 三、还没有打牢，先不要最终 UI 封板的 UX 基础

### F1. Cross-region Semantic Drop（最高优先）

当前已有：
- pointer recognizer
- Semantic Drop machine
- dwell
- preview
- presentation state

但源码明确还没有 container/slot model，具体 surface placement commit 仍是后续阶段。

需要补完整矩阵：
- Canvas -> Canvas
- Canvas -> Railway
- Canvas -> Assembly
- Assembly -> Canvas
- Railway -> Canvas
- Node/Object -> Composer Reference
- Main / Context / Workflow 跨现场
- Professional Window 接收目标（只在产品语义允许处）

原则：
“Drop 到哪里 = 就在那里使用”，不能再弹第二层目的地表单。

这块如果不先补，高精度 drop affordance 做得越细，返工越漂亮。

### F2. Railway manipulation

现在已有：
- Core orderedRefs read
- destination projection
- real activation
- unresolved ref disabled
- empty = 不显示 Railway

这证明 Railway 的“身份/读取”基础已经正确。

仍缺：
- receive/drop
- reorder
- overflow
- preview
- removal / manage affordance
- drag feedback
- 与 safeRect / ProfessionalWindow 协调

所以 Railway 外观方向可以做，但最终交互状态不要封板。

### F3. Professional Window topology

当前只真正拥有：
- float
- title
- close
- active window
- tab-like switching
- body registry

仍缺：
- dock
- split
- resize
- group
- occupied rect
- window/canvas spatial relationship
- 多窗口布局恢复规则

这一组会直接改变 Window Chrome、尺寸、拖拽 affordance 和周围 HUD 布局，是非常典型的“先做 UI 后做 UX 就返工”区域。

### F4. Conversation Work View live session

目前外壳与 receiver gating 已经值得保留：
- canonical connectedConversation identity
- receiver readiness
- inline Composer
- blocked state

但核心内容还缺真正的 Huabu live session / transcript adapter：
- history
- stream
- waiting
- reconnect
- running
- error
- provider lifecycle
- permission/request 等真实状态

T7 Agentlet transport 重接也是这一链的底座之一。

所以 Conversation Work View 的 Chrome 可以精磨，消息区/状态区暂时只能做到 design-ready，不能称 production fidelity。

### F5. Reader capability model

当前真正打通：
- artifact detail
- revision
- markdown/text read
- image blob preview
- honest unsupported fallback

仍需：
- PDF
- audio
- video
- reading position
- page/time position
- excerpt / reference selection
- version switching / current revision UX
- media controls

Reader 是明显的中型施工包。

### F6. Temporal Rail

当前只是诚实空态骨架。
仍缺：
- real time producer
- Episode aggregation
- scale/window
- wheel navigation
- hover fisheye
- focus/jump
- selected range/state

不能按现在 65px 空 rail 直接做最终 UI。

### F7. ColorPin

当前 production LCOS tree 中没有形成可识别的 ColorPin UI 施工面。
需要从：
- contract truth
- membership
- rendering
- pin placement
- interaction
- filter/focus relation
完整接到 GUI。

它不是阻塞整个 Main 高保真，但会影响节点标记与导航视觉。

### F8. safeRect / occupied rect

Professional Window / Work View 打开后需要向 HUD 提供 occupied/safe rect。

至少：
- Action Arc
- Compact Composer
- Navigator / Focus
- Railway
- Temporal Rail
- camera controls
- edge affordance

要统一避让。

目前 tree 中没有形成最终 safeRect owner。应该先定一个 shell-level layout service/store，再让 HUD 消费，不能每个组件自己写 if(windowOpen) left += 300。

### F9. Workflow meaningful runtime states

WorkflowWorksite 和 Card Pool 已存在，但源码仍明确：
“打开/续接（Run 执行）后续接 T6 Run 事实”。

因此：
- Card appearance
- hand/card pool shell
可以精磨；

但：
- run
- waiting
- continuation
- completed/error
- node/card runtime relationship
仍不宜最终封板。

---

## 四、建议剩余施工按 6 个 UX 包 + 5 个 UI 精磨包处理

### UX-1 Spatial interaction foundation
- cross-region drop matrix
- destination/slot commit
- semantic feedback
- Railway receive/reorder
- Assembly receive/use

### UX-2 Window/layout foundation
- dock/split/resize/group
- occupiedRect/safeRect
- HUD avoidance

### UX-3 Conversation runtime
- Huabu Host transport
- session/transcript/stream
- waiting/reconnect/error
- Work View real state

### UX-4 Reader
- PDF/audio/video
- reading position
- excerpt/reference

### UX-5 Context navigation
- Temporal Rail
- ColorPin
- time/focus relation

### UX-6 Reliability closure
- projection degraded result/retry
- entity key collision
- continuation atomic bind
- browser runtime/E2E

然后做 UI：
- UI-1 Shell / SurfaceDock / Railway
- UI-2 Node species / Arc / Composer
- UI-3 Context / Workflow surface
- UI-4 Professional Window / Reader / Conversation
- UI-5 Global responsive / motion / visual regression

## 五、优先级

如果目标是“尽快进入 UI 高精度阶段，同时最少返工”：

第一批 UX：
1. Semantic Drop commit/matrix
2. Professional Window topology + safeRect
3. Railway receive/reorder

这三项做完，整个产品的空间交互骨架大体就稳定了。

第二批可和 UI 并行：
4. Conversation live session
5. Reader
6. Temporal Rail / ColorPin

与此同时可以直接精磨：
- Node species
- Action Arc
- Composer
- SurfaceDock
- Navigator / Focus
- Shell基础视觉

## 六、里程碑判断

### M1：P0 后
“UI 架构不再漂移，大部分核心视觉 primitive 可以开始精磨。”

### M2：UX-1 + UX-2 + Railway 完成后
“整体 UX 基础约 80%–85%，可以全面进入 Figma 高精度施工。”

这是我认为真正的“UI 全面开工点”。

### M3：Conversation + Reader + Context navigation 完成后
“主要产品 UX 已闭环，可以进入逐屏 visual regression。”

### M4：Visual regression 收口
用真实运行态逐屏比对：
- idle
- hover
- selected
- drag
- editing
- loading
- waiting
- error
- empty
- reconnect
- window open
- narrow viewport
- zoom levels

到这个阶段才适合说“高精度还原完成”。

## 七、最重要的判断

现在已经不是需要再做一次 UX 大重构。

真正应该避免的是两种极端：
1. 等所有后端能力都完成才开始 UI，这会浪费现有已经稳定的 Node/Arc/Composer/Shell 基础；
2. 现在全产品一起像素封板，这会在 Drop、Window、Railway、Reader、Conversation 几块产生明显返工。

正确做法是“双轨施工”：
- 稳定区直接开始 Figma 高精度；
- 不稳定区先补最小 UX owner/state/commit contract，再立即转 UI。

这样是目前离最终产品最近、返工最低的路径。
