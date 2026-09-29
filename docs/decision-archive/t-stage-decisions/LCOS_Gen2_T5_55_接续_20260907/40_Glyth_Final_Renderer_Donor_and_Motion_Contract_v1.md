# Glyth 最终 Renderer Donor 与 Motion 合同 v1

> 基线：`LCOS_Gen2/main@232b2ca5` + `Huabu@a3c411e1`。  
> Donor：`grok-bot-0.18-reconstructed/main`、Gen1 `LCOS-local-creativeOS/main`、Gen2 vendored Huabu。  
> 性质：施工裁决；未修改代码。

## 0. 最终裁决

```text
Glyth primary body renderer
= Grok reconstructed OnboardingCharacter morphology

Spatial / zoom / selection / hit test / resize host
= Huabu QuestionNode + NodeWrapper + NodeTakeoverLayer

LCOS state truth
= Conversation + Run + waiting_input/review/conflict

Gen1 role
= interaction restraint + spatial continuity + signal hierarchy guardrail
```

不再长期保留“Grok 或 Gen1 Bloub”二选一，也不新造 avatar engine。Grok 已提供 Glyth 所需的完整身体器官：

- 8 种 SVG morphology：`blob / pebble / squircle / tablet / wedge / hex / cloud / teardrop`；
- 双眼与 gaze tracking；
- 39 个 shipped presentation state；
- pointer follow target；
- reduced-motion；
- `spin / bounce / burst` one-shot API 轮廓；
- 尺寸无关 SVG viewBox。

Gen1 当前 GitHub 的 `LcosSignalGlyph` 是 16×16 系统状态信号，不是有身体的 Glyth renderer。它继续约束状态克制与空间连续，不替换 Grok 身体。

## 1. 复用边界

### DIRECT USE / LIFT

- `PERSONA_SHAPE_PATHS` 的 8 种形态路径；
- deterministic `conversationId → shape/color`，同一 Conversation 跨重启不换脸；
- eye geometry、gaze 范围、gradient/color family；
- shipped state vocabulary 作为 presentation donor；
- reduced-motion 分支；
- “没有 initials/CSS fallback”的身份原则。

### THIN ADAPT

- 只接 LCOS 已有 canonical state；
- 仅 active/selected/receptive Glyth 获得逐帧更新；idle 生命感用 CSS/低频共享节拍；
- `spin/bounce/burst` 必须有确定开始与结束；
- body renderer 接入 Huabu `QuestionTakeoverMark.renderMark(state)`；
- `followTarget` 只在 hover、Assembly approach/receptive 或显式互动时开启；
- Cursor 私有颜色 token 映射为 LCOS surface tokens。

### 禁止照搬

- avatar editor、上传/生成头像；
- 把 39 个 presentation state 升级为 LCOS domain state；
- 每实例常驻 `requestAnimationFrame`；
- 每只 Glyth 一个全局 `window.pointermove`；
- 把 imperative action 保存成 canonical 状态；
- 把 Huabu 暖白 sticker/card chrome 原封不动套在 Glyth 身上。

## 2. 为什么复原版不能整段直接粘

Grok 复原源码有三项需要薄修：

1. 每个非 paused character 建立独立 rAF loop，节点规模上升后违反 LCOS 性能纪律；
2. `spin` 没有明确结束条件，会持续读取 action；
3. `burst()` 当前只有 action ref，没有对应渲染表现。

所以成熟可直接采用的是几何、姿态参数、眼神与状态语法；调度层需要薄 adapter。这是在修已知缺陷，不是另造轮子。

## 3. Canonical state → Glyth presentation

| LCOS 真值 | 主姿态 | 局部器官 | 节奏 |
|---|---|---|---|
| idle | `idle` | 低频眨眼、极轻呼吸 | 低频 |
| selected | `listening` | 目光面对用户，身体不放大 | 稳态 |
| voice input | `listening` | 眼神锁定 composer，局部声纹 mark | 输入期间 |
| thinking | `thinking` | 眼睑略收、轻侧倾 | Run 期间 |
| searching | `searching` | gaze/radar 局部扫动 | Run 期间 |
| writing/coding | `working` / `writing` | 小范围节律，主进度仍由 Run path 表达 | Run 期间 |
| waiting_input | `curious` | 朝向用户 + question satellite | 稳态 |
| approval | `listening` | shield/question satellite | 稳态 |
| review ready | `proud` | 一次短 settle | 一次性 |
| completed | `happy` | 一次 blink/smile，随后 idle | 一次性 |
| failed | `alerting` | 局部收紧 + error mark | 一次 + 静态标记 |
| conflict | `confused` | 轻侧倾 + conflict notch | 一次 + 静态标记 |
| open | `listening` | Conversation scene 承担空间变化 | 稳态 |

`angry / scared / sad / bored / shy / laughing / playful / celebrate` 不映射日常系统状态，避免把工具状态演成情绪戏。

## 4. Assembly / Drop 身体编排

> `USER CORRECTED 2026-09-07`：Assembly 默认在右侧打开，但可自由移动并重新 Dock，用户稳定 placement 应由 presentation state 记忆；不是固定右侧。打开/开始装配触发 Glyth Focus。不得显示或旋转 selection/drop 框，反馈由 Glyth 本体氛围光、眼神与姿态承担。几何壳隐形且恒为正方形，resize 只允许同比例。

### target-ready

Assembly 为选中 Glyth 打开后：`listening`，gaze 指向 Source Bay/被拖对象，身体 footprint 不变，外缘出现薄的开放式 presence ring。

### approach

- gaze 跟随被拖对象，不追全局指针；
- 身体最多 `1–2px` screen-space 朝来物方向倾斜；
- 不放大 hit geometry，不弹跳，不出现通用虚线框。

### receptive

```text
presentation = receiving
outer field = open toward payload
eyes = payload direction
visual-only scale ≤ 1.025
```

有效性仍由 Gen2 target resolver 决定，Grok state 只表现结果。

### commit / settle

- pointer release 后先 `committing`，Core 成功前绝不演吸收成功；
- mutation 成功并 read-back 后触发一次会结束的 `burst`/轮廓收束；
- 原对象回 Source Bay，语义 token 进入 context orbit；
- `receiving → happy → idle/listening` 总计约 `220–360ms`；
- durable 留极淡 satellite，temporary 只留短命 tether。

### reject / cancel / failure

- invalid：`confused` 一次短侧倾 + 原因 tooltip，`120–180ms` 复位；
- cancel：柔和复位，不表现受挫；
- Core failure：`alerting` 一次 + 可恢复错误 mark，不播放 settle。

## 5. 缩放中的同一身体

### rich / near

完整 morphology、眼睛和必要嘴部；Conversation 摘要/活动信息放在邻近层，Action Arc 是卫星，不塞进身体。

### readable

完整身体仍在，减少嘴部和次级状态；gaze、关键 Run 状态仍可读；Huabu takeover mark 从视觉中心连续接管。

### collapsed / identity

继续使用同一 `personaShapePath` 的简化轮廓和眼睛；极小时眼睛退化成 identity dot。不能切回暖白 sticker 圆牌，否则 Glyth 会变成 generic badge。

### extreme far

active / selected / waiting_input / error 不聚合；仅非关键 Glyth 可按 screen cell 临时聚合，且不得生成 colony/domain entity。

## 6. Resize 合同

Glyth resize 调整 Conversation 的空间 footprint，不拉伸身体：

```text
NodeResizer geometry
→ resolved footprint
→ contain scale + internal composition
→ SVG always uniform scale
```

- body 始终保持比例；
- 横向空间优先给 label/activity satellites；
- 纵向空间优先给 Run/Result 邻近布局；
- takeover threshold 只计算一次；
- collapsed mark 不提供 resize handle，沿用 Huabu 规则。

## 7. 性能纪律

| 场景 | 允许动效 |
|---|---|
| idle/off-focus | CSS 低频 blink 或静止；无独立 rAF |
| selected/hover | gaze + 短 attention |
| active Run | 局部 pose；持续运动主要属于 Run path |
| Assembly target | gaze + receptive field |
| camera move/zoom | 仅 takeover glide |
| far/aggregate | static identity mark |
| reduced motion | static pose + opacity/stroke |

100 个 Glyth 场景下不允许 100 个 animation loop。逐帧更新只服务视口内且当前需要的少数对象。

## 8. 精确接线

```text
Conversation/Run selectors
→ GlythPresentationState adapter
→ Huabu QuestionNode-compatible projection
→ NodeWrapper(takeover={renderMark})
→ GlythBody / GlythTakeoverMark
```

建议职责名；若已有同责 owner，必须扩展而非新建：

| 职责 | 建议落点 |
|---|---|
| canonical → presentation | `apps/web-gen2/src/presentation/glythPresentation.ts` |
| SVG body | Huabu LCOS renderer seam 内 `GlythBody.tsx` |
| takeover face | 同目录 `GlythTakeoverMark.tsx` |
| one-shot motion | `GlythBody` 内受控 signal，优先现有 CSS/motion primitive |
| Assembly input | 38 号卡的 `glythDropVisualState` |

不得新增保存 Conversation/Run 真值的 Glyth store，只允许可丢失的短命 presentation signal。

## 9. Browser Gate

- `GR-01`：重启及跨 Preview/Spatial/restore 后 shape/color 不变；
- `GR-02`：穿越全部 takeover threshold 无双实体、眼睛瞬移或 selection 丢失；
- `GR-03`：五阶段 body drop 逐帧录像，Core 未成功前绝不 settle；
- `GR-04`：spin/bounce/burst 均按时停止，重复触发可重入；
- `GR-05`：5/80/150/300 节点记录 FPS、long task、活动 animation count；
- `GR-06`：reduced motion、键盘、screen reader、非纯颜色状态通过。

## 10. 当前状态

```text
PRIMARY RENDERER DONOR: DECIDED — GROK
HUABU HOST: DECIDED — DIRECT USE
GEN1 ROLE: DECIDED — EXPERIENCE GUARDRAIL ONLY
STATE MAPPING: READY
ASSEMBLY/DROP BODY MOTION: READY FOR IMPLEMENTATION
PERFORMANCE SCHEDULER ADAPTATION: REQUIRED
BROWSER PROOF: NOT YET
```

本卡收掉此前 `Grok vs Gen1 Bloub` 的 HOLD，但不等于 Glyth 已实现。
