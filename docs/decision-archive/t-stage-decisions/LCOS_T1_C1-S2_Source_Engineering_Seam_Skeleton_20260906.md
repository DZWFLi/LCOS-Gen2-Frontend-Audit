# LCOS Gen2 · T1 Phase C1-S2
## Source Engineering Seam Skeleton
### 给 T5 的空间 / HUD / LOD / Layout 工程约束正本 · 2026-09-06

> 文档性质：T1 Phase C1 正式交付 02 / 03  
> 读者优先级：T5 GUI / Visual > T1 coding > T2/T3/T4/T6 cross-thread review  
> 目标：不是告诉 T5“源码怎么写”，而是把最终 GUI 必须建立在什么真实 mechanics 上讲清楚，并把 T5 可以自由决定的视觉区与绝不能跨越的语义边界分开。

---

# 0. 本稿怎么读

T5 不需要先读完所有源码考据。

如果只为开始最终 GUI 规划，优先阅读：

- S1 Adaptive Presentation / LOD；
- S2 Collection Visible Host；
- S4 ProfessionalWindow → HUD；
- S6 Colony；
- S8 Fixed-screen Identity；
- S9 Layout / Settle；
- 最后的《T5 Visual Input Matrix》。

需要追“为什么”时，再回 C1-S1 查 current source。

---

# 1. 总体施工哲学

T1 的 architecture 目标不是把 Huabu 换成 LCOS 自研 canvas。

真实结构应是：

```text
LCOS canonical semantics
        ↓
thin host / projection / interaction seams
        ↓
Huabu mature canvas mechanics
        ↓
T5 final visual morphology & motion
```

原则：

1. Core 只拥有真正需要 durable/canonical 的语义。
2. Huabu 拥有 geometry、parent、viewport、frame、snap、drag 等画布 mechanics。
3. LCOS host seam 只翻译 owner contract。
4. T5 只决定 presentation，不制造新的 canonical truth。
5. GUI 中能直接操作对象本体，就不堆常驻 mode button / chooser /表单。
6. 所有 drop / focus / peel / restore 应有视觉反馈，但反馈不能反向篡改语义。

---

# 2. S1 · Adaptive Presentation / LOD Seam

## 2.1 Invariant

同一 authoritative projection 在不同 zoom / focus / screen pressure 下，可以改变 presentation，但不能改变 canonical identity。

LOD 不是：

- 创建复制实体；
- 切换到另一份 entity；
- 把 world node 永久替换成 HUD object。

LOD 是同一 projection 的 presentation state。

## 2.2 Current foundation

Current Gen2 已有：

- node presentation contract；
- renderer registry；
- visual family/species；
- Huabu node render path。

状态：

`PARTIAL_CURRENT`

它足够让 T5 设计最终形态，而不需要先改 ontology。

## 2.3 T1 thin seam

T1 后续应暴露类似：

```ts
type NodePresentationContext = {
  zoom: number
  selected: boolean
  focused: boolean
  hovered: boolean
  screenPressure: 'normal' | 'constrained'
  professionalWindowEnvironment?: ProfessionalWindowEnvironment
}

type NodePresentationState =
  | 'full'
  | 'compact'
  | 'identity'
  | 'fixed-screen-identity'
```

具体类型名可在施工时收敛，重要的是 owner 关系。

## 2.4 T5 Engineering Input

T5 可以决定：

- full body；
- compact body；
- identity glyph；
- label emergence；
- hover/focus emphasis；
- fixed-screen takeover 的大小与形状；
- transition；
- density；
- material。

T5 不可决定：

- 复制第二个 canonical node；
- 用 instanceId 绕过 D12；
- 把 fixed-screen identity 变成新的 entity；
- 让 LOD 改 membership。

## 2.5 Motion phases

建议视觉阶段：

`full → compact → identity → fixed-screen identity`

必须：

- continuous；
- target identity 可追踪；
- transition 期间 hit target 不漂移；
- reduced motion 下状态结果一致。

---

# 3. S2 · Collection Visible Host / Expanded Layout Seam

这是 T1 → T5 最重要的一条。

## 3.1 Invariant

Collection 同时具有：

- canonical membership semantic；
- spatial presentation；
- visible host state。

三者不能混成一个 JSON blob。

## 3.2 Expanded Collection

spatial primitive：

Huabu Frame。

默认：

`free`

不是自动 Grid。

Visible host 的真实 mechanics：

- authoritative Collection projection = native Frame；
- 当前 hosted member 可有 `parentId=collectionFrameId`；
- Huabu reparent 保留 absolute drop position；
- frame fit 由 Huabu executor 统一处理。

## 3.3 Collapsed Collection

不是 child canvas。

不是“Frame 缩小后把 child geometry 挤进去”。

而是：

display-only presentation。

Authoritative expanded geometry 保留。

Hosted child bodies 在当前 display projection 下可隐藏。

## 3.4 Fold state

仅保存：

`collapsed / expanded`

建议 session/local presentation state。

不保存：

- membership；
- child geometry；
- contour；
- canonical entity。

## 3.5 Left Drop · Expanded Host

真实事件链：

```text
T3 gesture resolved
→ Collection target receptive
→ T6/Core membership commit
→ success
→ T1 spatial manifestation
→ SET_NODE_PARENT
→ Huabu fit
→ optional local settle
→ visual settled
```

T5 应能表现：

1. target receptive；
2. semantic commit；
3. node stays where released；
4. host acknowledges；
5. nearby geometry lightly settles；
6. no modal chooser。

## 3.6 Left Drop · Collapsed Collection

事件链：

```text
gesture
→ canonical membership commit
→ compact Collection acknowledges membership
→ source node stays exactly where it is
```

不：

- auto-expand；
- move node；
- open child canvas。

T5 要通过轻量反馈说明“已加入”，而不是用空间位移伪造加入。

## 3.7 Right Drag

事件链：

```text
right-drag
→ membership commit
→ source x/y/parent unchanged
→ target membership feedback
```

T5 必须把它与 left-drag 做出感知差异，但差异不应该是一个大型模式面板。

## 3.8 Relation Handle

Project Relation。

不属于 Collection membership gesture。

视觉上应与左/右拖目标感知区分，避免“一个连线把节点塞进 Collection”的错觉。

## 3.9 Many-to-many Membership

若 E 属于 A 与 B：

- 真身仍一份；
- A hosted 时，B 可以显示 membership cue/reference/proxy；
- proxy 必须看起来不是第二个 authoritative body。

T5 需要提供明确的视觉层级：

`authoritative body > reference/proxy/cue`

## 3.10 T5 自由度

可设计：

- collapsed Collection compact body；
- expanded frame morphology；
- title placement；
- membership count；
- host receptive state；
- expansion transition；
- proxy cue；
- free/grid/stack/masonry 切换后的视觉；
- settle motion。

不可设计：

- folder child-canvas illusion；
- always-on control chrome；
- drop chooser；
- member list 取代空间；
- automatic grid as default。

---

# 4. S3 · Semantic Drop Spatial Outcome Seam

T3 owns grammar。

T1 owns spatial consequences。

## 4.1 Input contract

T1 不识别：

“这是不是左拖、右拖、relation handle”。

T3 应给 resolved intent，例如：

```ts
type SemanticDropSpatialIntent = {
  kind:
    | 'collection-membership-left'
    | 'collection-membership-right'
    | 'relation'
    | 'remote-target'
  sourceProjectionId: string
  targetEntityId: string
  targetProjectionId?: string
  releaseWorldPoint?: {x:number; y:number}
}
```

具体名称不重要，重要的是 T1 不重写 gesture grammar。

## 4.2 Core-first

semantic truth 先 commit。

Spatial manifestation 后执行。

原因：

如果先 auto-reparent，再 Core commit 失败，用户会短暂看到一个并不存在的 canonical membership。

## 4.3 Huabu bypass

复用现成 drag reparent bypass。

目标：

正常 drag geometry 可提交；

但 Collection semantic target 情况下：

Huabu 不抢先 auto-parent。

canonical commit 成功后再由 T1 manifest。

## 4.4 Failure

### Core failure

- 不 host；
- 视觉回退；
- 不留假 membership。

### Core success / spatial failure

- canonical membership 保留；
- 显示 recoverable feedback；
- requery parent；
- 后续 reconcile/retry spatial manifestation。

不做分布式 rollback。

## 4.5 T5 states

至少需要：

- approach；
- receptive；
- accepted；
- committing；
- settle；
- recoverable failure。

无需把这些状态做成文字标签。

---

# 5. S4 · ProfessionalWindow Occupancy → HUD Seam

## 5.1 Owner

T4 生产：

`ProfessionalWindowEnvironment`

T1/T2 消费。

## 5.2 T1 consumers

直接受影响：

- Focus framing；
- Navigation Marker；
- Color Pin；
- Map Locator；
- Minimap；
- Action Arc；
- edge drop bands；
- fixed-screen identity；
- Colony/Collection 的 screen-space transient feedback。

Composer 主要由 T2/T3 consumer，但同一 environment。

## 5.3 Geometry rule

所有 screen-space HUD 只能使用：

- viewport；
- safeRect；
- occupiedRects；
- activeRegions。

不得：

- `document.querySelector()` 找 WorkView；
- 读 sidebar DOM width；
- 写死 `320px`；
- 把 safeRect 持久化进 project data。

## 5.4 Work View coexistence

旧 arbitration：

`workViewOpen → only work-view`

退役。

新原则：

Work View 可以与必要 HUD 共存。

区别在：

- HUD relocation；
- clipping；
- scale；
- priority；
- transient hide；

而不是全局 kill。

## 5.5 T5 Engineering Input

T5 要设计的是：

“有一块屏幕被专业窗口占用后，HUD 怎么自然让路”。

不是：

“Work View 一开，画布所有导航都消失”。

建议 T5 对以下状态给图：

1. no PW；
2. left/right dock；
3. narrow canvas；
4. focus target near occupied edge；
5. multiple markers；
6. minimap 与 ActionArc potential collision；
7. PW resize in progress。

---

# 6. S5 · Work View Camera Freeze

## 6.1 Invariant

Professional Window：

open / close / resize

不会主动改变 camera transform。

## 6.2 Current Huabu behavior

Huabu generic resize 会做 centre compensation。

这个默认不能全局删，因为它对普通 standalone Huabu 有意义。

## 6.3 Owner split

T4：

- viewport resize policy；
- host-level override。

T1：

- consumes result；
- HUD reflow；
- focus framing；
- browser acceptance。

## 6.4 Explicit Focus exception

用户显式 Focus/Locate 时：

Camera 可以改变。

因此 test 要区分：

```text
passive host resize ≠ explicit camera request
```

## 6.5 T5 Engineering Input

PW resize 时：

- world objects 不应看起来滑动；
- HUD 可以移动；
- occupied edge 附近 HUD 可以重排；
- visual transition 可有，但 world camera 不变。

这个差异非常重要。

---

# 7. S6 · Colony Derive-only Geometry Seam

## 7.1 Invariant

Colony contour 永远是：

`f(member geometry)`

不是 canonical geometry source。

## 7.2 Proposed T1 modules

可在施工时细化命名，职责应拆成：

```text
colonyMembershipPresentationState
colonyGeometryProjection
colonyPeelSession
colonyRescopePreview
```

不创建：

`colonyContourRepository`

## 7.3 Derive flow

```text
surface-local member ids
+ Huabu node bounds
→ organic contour
→ visual field
```

成员 position 改变：

- contour 随 geometry 重算；
- 不向 Core 写 contour points。

## 7.4 Peel

Peel 是 interaction session。

需要：

- peel candidate；
- threshold；
- tether；
- neck；
- preview displacement；
- commit / cancel；
- settle。

达到 commit：

- membership delta 交 canonical owner；
- contour 自动 derive。

## 7.5 Rescope

用户改变 Colony scope：

- 预览成员变化；
- 预览 contour；
- commit member delta；
- geometry 自动重算。

不出现 control points。

## 7.6 T5 Engineering Input

T5 可以尽情决定：

- organic field 是雾、膜、薄边、光场还是其它；
- neck/tether morphology；
- peel elasticity；
- threshold feedback；
- dissolve；
- rescope transition。

但需要保持：

1. Colony 比 Collection 更有机；
2. 看得出它是“当前成员共同形成的场”；
3. 不像 Frame/Folder；
4. 不像 editable vector shape；
5. 不需要常驻“编辑轮廓”模式。

---

# 8. S7 · Archive Restore Fresh Placement Seam

## 8.1 Owner split

T6：

canonical archive lifecycle。

T1：

projection eligibility consumer。

## 8.2 Archive

```text
eligibility active → inactive
→ reconciler notices
→ remove active projection
→ remove/retire current binding as appropriate
```

Archive 不等于：

“节点移到画布角落的 archive area”。

## 8.3 Restore

```text
inactive → active
→ same canonical identity
→ ensure current projection
→ fresh Huabu layout
→ no old x/y restore
```

Fresh placement 应使用：

- current visible geometry；
- safe placement；
- local layout；
- current canvas context。

不使用旧 ArtifactView position。

## 8.4 Search/Focus

Archived search result：

- 打开 archive viewer；
- 不自动 restore；
- 不瞬间把对象塞回当前 canvas。

## 8.5 T5 Engineering Input

T5 可以设计：

- cold/archive visual；
- restore arrival；
- fresh placement animation；
- archive viewer visual。

不能通过动画暗示：

“对象只是一直藏在原坐标”。

Restore 是重新进入 active spatial projection。

---

# 9. S8 · Fixed-screen Identity / HUD Perception

## 9.1 Problem

世界坐标里的对象在远 zoom 下如果只继续缩小，会变成：

- 看不见的小点；
- 无法命中；
- identity 丢失。

## 9.2 Principle

在一定 presentation state 下：

identity 可以使用 screen-space takeover。

但：

- canonical projection 仍是原 world entity；
- takeover 是 display representation；
- 不创建 duplicate truth。

## 9.3 Shared mechanics

应该与：

- Marker；
- Pin；
- Locator；
- Focus HUD；
- occupancy；

共享 screen-space environment。

## 9.4 T5 Engineering Input

T5 可以定义：

- glyph；
- halo；
- label；
- selected state；
- direction indicator；
- clustering appearance；
- edge behavior。

不能做：

- 第二份 world node；
- 每个 HUD 一套独立 spatial database；
- fixed-screen identity 永远盖住主视觉。

---

# 10. S9 · Layout / Settle Quality Seam

## 10.1 Default

Expanded Collection：

free spatial layout。

Drop 到哪里：

主体尽量留在哪里。

## 10.2 What Huabu already does

Huabu 负责：

- parent；
- frame fit；
- snap；
- structured layouts；
- geometry command；
- undo。

## 10.3 T1 gap

只补：

`minimal local settle`

目标：

当新节点与近邻明显重叠时：

- 只移动必要邻居；
-  bounded displacement；
- deterministic；
- locked nodes 不动；
- 不把 free layout 变 Grid；
- 不全局整理 canvas。

## 10.4 Donor

Spatial 的行为价值：

- 落位后邻居自然聚散；
- focus 周边退场；
- transition 克制；
- feedback 不是“重排整张图”。

借行为，不搬 ontology/runtime。

## 10.5 Reduced Motion

reduced-motion：

- 可取消 tween；
- 最终 geometry 与正常 motion 相同。

Motion 不能成为 geometry 计算逻辑本身。

## 10.6 T5 Engineering Input

T5 应给：

- normal settle；
- crowded settle；
- locked neighbor；
- frame edge；
- reduced motion；
- explicit Grid/Masonry transition。

T5 不需要设计 solver。

---

# 11. Cross-thread Contract Skeleton

## 11.1 T6 → T1

必须提供：

- canonical Collection entity；
- membership query/mutation；
- Collection nesting；
- archive eligibility/lifecycle；
- Colony final membership commit owner。

T1 不缓存第二份 canonical truth。

## 11.2 T3 → T1

必须提供：

- resolved gesture intent；
- target class；
- left/right/relation distinction；
- visible/remote distinction；
- drag bypass coordination。

T1 不根据 pointer button 重新猜语义。

## 11.3 T4 → T1

必须提供：

- ProfessionalWindowEnvironment；
- viewportResizePolicy；
- ProjectSession host context。

T1 不读 DOM 推导 safe area。

## 11.4 T2 → T1

主要共享：

- selection；
- composer/action states；
- display identity；
- overlay placement pressure。

T1 不重新定义 Composer semantic。

## 11.5 T5 → T1 after C2

回填：

- morphology；
- size tokens；
- spacing；
- motion timing；
- opacity；
- glyph；
- hover/focus behavior；
- peel threshold visual cue；
- fixed-screen identity visuals；
- Collection collapsed/expanded appearances；
- archive/restore appearance；
- PW-aware HUD layouts。

T1 再把这些写入 final exact source plan。

---

# 12. T5 Visual Input Matrix

| Object / State | Must express | T5 free to design | Must NOT imply |
|---|---|---|---|
| Collection collapsed | durable group target, compact | body/glyph/count/material | child canvas |
| Collection expanded | visible host / free spatial frame | frame/title/boundary | default grid |
| Collection receptive | can accept membership | glow/field/edge response | relation creation |
| right-drag Collection | membership only | distinct accept feedback | source movement |
| Collection proxy | membership here, body elsewhere | chip/ghost/reference | second true entity |
| Colony idle | derived organic group field | contour/material | editable vector shape |
| Colony peel | member separating | tether/neck/elasticity | contour-point editing |
| Scope highlight | one-time target range | transient highlight | durable container |
| Worksite | durable work surface | visual shell | old Workspace mixed ontology |
| Child Canvas | nested Worksite | navigation transition | Collection expanded |
| Professional Window | occupied screen region | chrome/proportion | camera pan |
| Focus | explicit locate/camera request | framing feedback | membership change |
| Pin/Marker | screen-space identity/direction | glyph | duplicate world node |
| Archive object | lifecycle inactive/cold | archive viewer form | hidden active node |
| Restore arrival | fresh spatial projection | arrival animation | old x/y resurrection |
| Free settle | minimal local adjustment | easing | global auto-arrange |

---

# 13. T5 Required State Boards

为了 C2 真正回填源码，T5 最好至少产出以下 state board，而不是只给一张 hero mockup。

## Board A · Collection

1. collapsed idle
2. collapsed receptive
3. collapsed accepted
4. expanded idle
5. expanded receptive
6. left-drop commit
7. settle
8. right-drag accepted
9. multi-membership proxy
10. collapse/expand transition
11. explicit Grid
12. explicit Masonry/Stack

## Board B · Colony

1. idle
2. hover
3. selected
4. add candidate
5. peel start
6. tether
7. threshold near
8. commit
9. cancel
10. rescope preview
11. dissolve
12. reduced motion

## Board C · Screen-space / PW

1. full canvas
2. PW docked left
3. PW docked right
4. PW resizing
5. focus near occupied edge
6. marker cluster
7. locator
8. minimap
9. fixed-screen identity
10. Action Arc collision case
11. Composer collision case
12. narrow safeRect

## Board D · Archive / Restore

1. active
2. archive transition
3. archive viewer
4. search result archived
5. restore requested
6. fresh arrival
7. crowded arrival
8. reduced motion

---

# 14. Prohibited “Visual Fixes” That Create Architecture Debt

T5 不要为了画面好看提出以下 workaround：

- “collapsed 时把所有孩子 position 缩到 folder 内”；
- “每个 Collection 都复制一套 member card”；
- “Work View 开启就关闭 Marker/Minimap”；
- “Pin 直接做一个绝对定位 DOM，自己记 object coordinates”；
- “Archive 保存 old canvas position，restore 再飞回去”；
- “Colony 给八个 resize handles”；
- “drop 先移动，Core 失败再弹 toast”；
- “right drag 也让节点轻轻飞过去表示成功”；
- “Focus 顺便 select + add membership”；
- “free layout 为了整齐默认自动 Grid”。

这些视觉方案表面省事，实质是在 GUI 层偷偷改产品语义。

---

# 15. S2 Exit Criteria

T5 从本稿已经可以得到：

- 每个主要空间对象的真实 mechanics；
- 当前 source 中现成与缺失的边界；
- 跨线程 producer/consumer；
- GUI 允许自由设计的区域；
- 不可暗示的错误语义；
- 必须覆盖的 visual states；
- C2 回填 T1 所需的参数类型。

因此：

**C1-S2 = T5 DESIGN READY。**

T1 下一步不再继续扩大读源码，而进入 C1-S3，把这些 seam 排成最终可施工的 exact-file waves。

---

# Appendix A · T5 Interaction Contract by Phase

T5 最容易在“静态图很好看、交互一动就和语义打架”这里踩坑。因此本附录把几个核心动作拆成时序状态。状态名只是工程沟通语言，不要求 UI 显示文字。

## A.1 Expanded Collection · left drag

| Phase | Canonical state | Spatial state | T5 visual responsibility |
|---|---|---|---|
| approach | unchanged | source moving | target barely senses proximity |
| receptive | unchanged | source preview at pointer | expanded host visually accepts |
| release | pending | source at release geometry | no immediate teleport |
| canonical commit | membership pending→success | parent still old temporarily | subtle commit feedback |
| spatial manifest | membership true | parent→Collection Frame | host ownership becomes legible |
| frame fit | true | frame geometry adjusts | boundary should feel responsive |
| local settle | true | near neighbors may shift | movement must stay local |
| settled | true | stable | remove transient cues |

最重要的视觉约束：

“membership success”与“spatial host success”可以间隔极短时间，但不要在 Core 结果未知时先演成完全成功。

## A.2 Collapsed Collection · left drag

| Phase | Canonical | Spatial | Visual |
|---|---|---|---|
| approach | unchanged | source moves | compact target receptive |
| release | pending | source at original drop completion | no expansion |
| commit | membership true | x/y/parent unchanged | compact membership acknowledgment |
| settled | true | unchanged | cue fades |

不要出现“吸入 folder”的动画，因为 source 并没有 spatially enter。

## A.3 Collection · right drag

必须表达“连接/加入成功”，但不能借 source translation 表达。

可用：

- target pulse；
- short tether confirmation；
- count/change cue；
- temporary reference echo。

不可用：

- source flying to target；
- target auto-expand；
- frame reparent preview。

## A.4 Colony peel

| Phase | Membership | Derived contour | Visual |
|---|---|---|---|
| idle | current | current | organic field |
| pull | unchanged | preview deformation | tether/neck |
| near threshold | unchanged | preview | stronger threshold cue |
| cancel | unchanged | rederive current | elastic return |
| commit | delta pending | preview | release/transition |
| canonical success | changed | derive new | field settles |
| failure | unchanged | old current | clear but lightweight recovery |

T5 应把“membership 真正改变”的瞬间与纯 elastic preview 区分开。

---

# Appendix B · Screen-space Collision Priority

这不是要求 T5照着一个固定 z-index 表画，而是给 occupancy-aware GUI 一个稳定优先级。

建议优先级原则：

1. active pointer interaction / drop feedback；
2. explicit Focus target / critical locator；
3. Composer / Action Arc 当前用户正在操作的 transient；
4. selected identity / Pin；
5. navigation markers；
6. Minimap / passive overview；
7. decorative background feedback。

当 safeRect 变窄时，优先使用：

- relocate；
- compact；
- cluster；
- label hide；
- edge stack。

最后才是暂时隐藏。

绝不优先：

“Work View 开了所以全部 display:none”。

---

# Appendix C · Collection Visual Grammar Required Distinctions

T5 必须让以下形态不靠读说明书也能区分。

## C.1 Collection vs Colony

Collection：

- durable identity；
- 可命名/可嵌套；
- 可以 expanded visible host；
- 边界更结构化；
- presentation layout 可选择。

Colony：

- organic relation field；
- contour 随 members；
- peel / tether；
- 不像文件夹/Frame。

## C.2 Collection vs Worksite

Collection expanded 仍是当前 canvas 中的 visible host。

Worksite 是 durable work surface。

不要让 expanded Collection 出现：

- 独立 viewport chrome；
- breadcrumb；
- child canvas navigation affordance。

## C.3 Collection vs Scope highlight

Scope 是 one-time range/target。

所以 transient Scope：

- 可以用轻高亮/选区；
- 不应拥有 durable title/body；
- 不应看起来像可长期展开的 Collection。

## C.4 Collection vs Remote target

Remote Collection/portal 不是当前 visible host。

T5 应让 remote target 的 receptive state 表现：

“语义会送到那里”

而不是：

“这个节点马上被本地 frame 吸进去”。

---

# Appendix D · HUD State Grammar

## D.1 Focus

Focus 是明确用户命令。

视觉需要：

- 当前 target；
- framing transition；
- arrived state。

不需要：

- 自动打开大量 inspector；
- 自动修改 Collection；
- 自动 select unrelated nodes。

## D.2 Pin

Pin 强调“保持注意/身份”。

若 target off-screen：

可进入 edge/screen-space representation。

## D.3 Locator

回答“在哪里”。

应偏方向/位置感，而不是“收藏/标记”。

## D.4 Minimap

overview。

不应把每种 LCOS semantic 重新编码一套独立数据。

## D.5 Fixed-screen identity

这是 LOD 的极端 display state。

不等于 Pin，也不等于 Locator。

T5 可让它们共享视觉 family，但必须在 interaction affordance 上可辨别。

---

# Appendix E · ProfessionalWindow Responsive Scenarios

T5 设计稿至少覆盖以下 8 个，不然源码阶段会被迫临时发明。

### PW-01 · 30% width dock

画布宽度仍足，HUD 轻避让。

### PW-02 · 45–50% width dock

safeRect 显著收窄，marker/labels 需要 compact。

### PW-03 · Resize continuous

camera 不动，HUD 连续 reposition。

### PW-04 · Target behind occupiedRect

显式 Focus 应把 target frame 进 safeRect，而不是窗口后面。

### PW-05 · Action Arc near PW edge

Arc 可翻转/移位。

### PW-06 · Composer near PW edge

Composer 保持局部，不膨胀成另一大侧栏。

### PW-07 · Minimap collision

Minimap 可 relocate 或 compact。

### PW-08 · Multiple edge markers

需要 cluster/stack，不能互相覆盖成一团。

---

# Appendix F · Motion Contract

## F.1 Motion is explanatory, not canonical

动画解释：

- accepted；
- moved；
- hosted；
- peeled；
- restored；
- focused。

动画本身不决定：

- membership；
- parent；
- archive state。

## F.2 Suggested phase language

T5 可以在不同对象使用不同 easing，但工程统一理解为：

```text
approach
receptive
commit
manifest
settle
rest
```

Colony 多：

```text
tension
threshold
release
reform
```

Restore 多：

```text
arrival
place
settle
```

## F.3 Reduced motion

所有动作需要一个不依赖 tween 的等价终态。

例如：

- Collection settle：立即应用 geometry；
- Focus：可零 duration framing；
- Peel：减少 elastic overshoot；
- Restore：fade/instant placement。

---

# Appendix G · T5 Handoff Acceptance

T1 接收 T5 C2 时，不要求设计师交源码，但需要每个核心对象至少回答：

1. idle 长什么样；
2. hover 长什么样；
3. selected 长什么样；
4. receptive 长什么样；
5. commit feedback 长什么样；
6. failure/recovery 如何提示；
7. occupied-space 下如何变体；
8. reduced-motion 如何等价；
9. LOD/zoom 如何变化；
10. 哪些文字常驻、哪些 hover 才出现。

如果一套设计只有 hero frame，没有这些 state，则还不能进入 C3 final source patch。

---

# Appendix H · T5 C2 Deliverable Contract

这一节不是要求 T5 服从某种固定 UI 风格，而是把 C2 最终要交回 T1 的信息格式压实。这样 T5 可以自由设计，T1 也不会在 C3 时对着一张漂亮静态稿猜“这个 hover 到底怎么动”。

## H.1 每个对象至少提供 4 类信息

### 1. Visual anatomy

说明：

- 哪部分是 persistent body；
- 哪部分只在 hover/focus 出现；
- 哪部分是 transient feedback；
- label 常驻还是条件出现；
- hit area 与可见形状是否一致。

### 2. State transitions

至少说明：

- idle → hover；
- hover → selected；
- approach → receptive；
- accepted → settled；
- failure / cancel；
- reduced-motion 等价。

### 3. Spatial constraints

说明：

- minimum padding；
- boundary / safe edge；
- 与 occupiedRect 相遇怎么处理；
- compact 的最小尺寸；
- screen-space takeover 最大尺寸；
- 多 marker/proxy 如何 cluster。

### 4. Semantic note

每张 state board 标注：

- 这个视觉是否改变 canonical data；
- 如果不改变，明确写 `PRESENTATION ONLY`；
- 如果动作最终会 commit，注明真正 owner：T3/T4/T6/T1。

这可以有效防止 GUI 阶段不小心把“漂亮的临时状态”设计成 durable data。

---

# Appendix I · Seam-by-Seam C2 Return Fields

## I.1 Collection

T5 回传：

```text
collapsed:
  body
  title
  count
  hover
  selected
  receptive
  accepted

expanded:
  frame/boundary
  title
  host padding
  hosted-body relationship
  empty state
  receptive
  settle

proxy:
  visual hierarchy
  hover
  focus jump affordance

motion:
  collapse
  expand
  accept
  host
  settle
```

无需回传：

- membership schema；
- parent logic；
- Core mutation。

## I.2 Colony

```text
field:
  idle
  selected
  hover

peel:
  initial tension
  tether/neck
  near threshold
  commit
  cancel

rescope:
  candidate member
  preview field
  commit
  settle

dissolve:
  motion/material
```

无需回传 contour algorithm。

## I.3 Focus / HUD

```text
Focus:
  target emphasis
  framing feedback
  arrived
  archived target variant

Marker:
  on-edge
  corner collision
  cluster

Pin:
  persistent identity
  selected
  offscreen

Locator:
  direction / distance cue

Minimap:
  normal
  compact
  relocated

Fixed-screen identity:
  min/max size
  label
  hover
  selected
```

## I.4 Professional Window responsive states

```text
safeRect normal
safeRect medium
safeRect narrow
PW left
PW right
PW resize
overlay collision
multiple HUD collision
```

重要：

这些只定义 presentation response，不给出 camera compensation。

## I.5 Archive / Restore

```text
archive transition
archive viewer
archived search result
restore requested
arrival
fresh placement settled
crowded placement
```

---

# Appendix J · Engineering Freedom vs Visual Freedom

| Area | Engineering frozen | T5 visual freedom |
|---|---|---|
| Collection identity | canonical / one authoritative | shape/material/title |
| Collection host | native Frame semantics | boundary language |
| default layout | free | spacing / settle easing |
| right drag | no movement | success feedback |
| collapsed drop | no host/no expand | target acknowledgment |
| Colony contour | derived | morphology |
| peel threshold semantics | T1 interaction | threshold visual |
| WorkView camera | frozen transform | window transition |
| HUD occupancy | T4 safeRect | relocation/compact form |
| Focus | explicit camera request | framing animation |
| Restore geometry | fresh placement | arrival animation |
| LOD identity | same projection | compact/glyph/takeover |
| local settle | bounded/deterministic | easing/timing |

这张表就是 C2 的护栏：

T5 可以在右栏大胆做，不需要畏手畏脚；
左栏则不要用视觉方案反向修改。

---

# Appendix K · Examples of Valid Visual Innovation

为了避免“工程约束”把 T5 误导成保守 UI，这里给出一些完全合法的创新空间。

## K.1 Collection expanded boundary

可以：

- 极轻边界；
- 只在 hover/selected 时增强；
- 空间标签；
- 局部角标；
- material field；
- frame-like but not SaaS card。

只要仍表达 visible host。

## K.2 Collapsed Collection

可以：

- compact glyph-body；
- layered stack hint；
- subtle member density cue；
- responsive identity tile；
- abstract spatial bundle。

不必长得像文件夹。

## K.3 Colony

可以非常有机：

- soft membrane；
- translucent field；
- elastic topology；
- subtle blur field；
- living boundary。

只要不出现“可编辑 vector contour”的 affordance。

## K.4 Fixed-screen identity

可以借：

- map label；
- spatial HUD；
- Apple-like lightweight capsule；
- icon + micro label；
- directional halo。

它不是 traditional desktop pin 的复刻。

## K.5 Restore arrival

可以是：

- light arrival；
- scale/fade；
- bounded spatial settle；
- position reveal。

关键是让用户感到“重新进入当前工作空间”，而不是“从旧坐标解除隐藏”。

---

# Appendix L · C2 Review Questions

T1 收到 T5 后，只问下面这些工程问题，不重新审美裁决：

1. 这张视觉有没有暗示第二 authoritative entity？
2. 这张视觉有没有要求 Core 存 presentation geometry？
3. PW resize 时是否有 camera 被动位移？
4. right-drag 是否被画成 spatial move？
5. collapsed Collection 是否被画成 child canvas？
6. Colony 是否被画成 editable contour？
7. Archive 是否被画成 hidden active node？
8. Restore 是否要求 old x/y？
9. free layout 是否被视觉强制成 Grid？
10. transient overlay 是否依赖 hardcoded panel width？
11. reduced-motion 是否存在同样终态？
12. proxy/reference 是否和 authoritative body 有足够层级差？

全部通过：

直接进入 C3 exact source backfill。

不通过：

只修相关视觉/contract，不重开整个 Phase B。

---

# Appendix M · S2 Final Status

```text
Product semantics        CLOSED
Engineering seams        DEFINED
Current source mapping   LINKED TO C1-S1
T5 visual freedom        EXPLICIT
Cross-thread ownership   EXPLICIT
T5 required states       EXPLICIT
C2 return fields         EXPLICIT
Production coding        WAIT C2
```

本稿的任务到这里结束。

它不是最终视觉稿，也不是代码实现稿。

它是 T5 可以直接拿去做真正 GUI 设计，而不会踩穿 underlying source semantics 的工程护栏。
