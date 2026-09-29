# NC-10 Glyth — Exact Construction Card v1

> `UPDATED 2026-09-07`：原卡把 Grok 与 Gen1 Bloub 写成待二选一的内容已被 `40_Glyth_Final_Renderer_Donor_and_Motion_Contract_v1.md` 取代。当前裁决为：Grok `OnboardingCharacter` 是唯一主身体 donor；Huabu 是唯一 host；Gen1 只作空间连续性与克制程度 guardrail。性能浏览器证明仍为 HOLD。

## 0. 卡片状态

```text
Huabu baseline: a3c411e1f655191344285141f08c4738fa6015f7
Species: Conversation / Agent Glyth
Card status: PARTIAL READY
Host mechanics: DIRECT USE Huabu QuestionNode + NodeTakeoverLayer
Character renderer: LIFT Grok OnboardingCharacter morphology；Gen1 only as experience guardrail
Canonical truth: LCOS Conversation + Run
Rewrite posture: NO new avatar/LOD/animation engine
```

## 1. Host truth

最新 Huabu QuestionNode 已具备：

- Question body为只读 conversation anchor；
- double-click 打开 compose 或现有 conversation；
- thread/conversation owner；
- idle/running/done/error、unread、approval、open、conflict presentation；
- QuestionTakeoverMark；
- NodeTakeoverLayer Portal；
- screen-derived continuous badge→mark；
- reduced full body 与 collapsed mark 的单 owner；
- Preview/Chat anchor 与 active view 判断。

LCOS 不重做这些 mechanics，只替换/扩展 mark renderer 与 canonical status adapter。

## 2. Donor truth

### Grok replica

- `GrokCharacter` 单一 orchestrator；
- 39个命名状态、25组 eye morph、gaze/blink/pose/overlay；
- 15个命名 spring；
- reduced-motion；
- destroy 时取消 RAF、listener、particles；
- pointer rect 约200ms缓存更新。

### Gen1 Bloub

- `LcosGlyth.tsx`、`glythBloub.ts`、`glythMotion.ts`；
- `visual/bloub/*` 的 face/shape/skins/states；
- normal/mid/far/extreme-far policy 和 critical/ephemeral cluster 测试向量。

源码比较已完成：选择 Grok 作为主实现；Gen1 不再提供并列 renderer。不能把两套动画引擎同时挂到一个 Glyth。

## 3. Reuse assembly

```text
LCOS Conversation/Run state
→ thin status adapter
→ existing Huabu Question badge/takeover contract
→ Grok-derived Glyth renderer (single body owner)
→ existing Portal/position/size/activation lifecycle
```

Huabu 继续拥有 mark size、corner→centre position、collapse stage 与 interaction。Character renderer只接收 `size/status/gaze/reducedMotion`，不得反向控制 viewport 或 node geometry。

## 4. Latest Huabu takeover constants

```text
TAKEOVER_START_WIDTH = 64px
TAKEOVER_END_WIDTH = 24px
TAKEOVER_HYSTERESIS = 6px
TAKEOVER_GLIDE_MS = 200ms
BADGE_FRACTION = 0.28
BADGE_MIN/MAX = 30/84px
MARK_MIN/MAX = 6/30px
MARK_FACE_MIN = 7px
```

全部直接沿用作为第一版机械基线。Gen1 zoom bands只用于回归 critical identity/cluster behavior，不再并行驱动 stage。

## 5. Canonical state mapping v1

| LCOS truth | Huabu presentation | donor character state | overlay | 裁决 |
|---|---|---|---|---|
| conversation idle | idle | idle | none | DIRECT |
| compose/input active | open | listening | none | DIRECT |
| queued | running-like badge | waking/loading | none/whirl短暂 | ADAPT |
| running: thinking | running | thinking | dots，间歇 | ADAPT |
| running: searching | running | searching/radar | radar，间歇 | ADAPT |
| running: writing | running | writing | pencil，间歇 | ADAPT |
| waiting_input | approval/attention | listening/curious | none | 不表现为 error |
| permission request | approval | alerting | bang一次 | 仅事件触发 |
| review ready | done-unviewed | notifying/proud | notify一次 | 不永久循环 |
| completed viewed | done/viewed | idle/happy | none | settle回idle |
| failed unviewed | error | alerting/sad | bang一次 | 错误文案优先 |
| conflict changes | done + conflictCount | suspicious/alerting | compact warning | 不冒充Run失败 |
| conversation open | open priority | listening/idle | none | current Huabu priority |

39个 donor states不是39个 canonical LCOS状态。Reaction states只允许作为短暂 presentation response，不写回 Run/Conversation truth。

## 6. Motion budget

- 生命感优先由 eye playlist、blink、gaze和轻 pose产生；
- body 不永久大幅扭动；
- progress/spawning沿用 donor的 on/off cycle，不持续占用动效预算；
- 同屏持续流动线最多2条；非焦点 Glyth 降低动画频率；
- reduced motion 关闭 spin、shape trick、particle burst，保留清晰状态切换；
- unmount必须调用 donor destroy/cleanup。

## 7. LOD / density

### Huabu owner

badge→mark连续缩放、card fade、position glide均由现有 takeover输出。

### Gen1 completeness constraints

- selected/focused/active conversation是 critical；
- critical Glyth不能被远距离聚合吞掉；
- extreme-far非关键 Glyth可按96px screen cell ephemeral cluster；
- cluster不写 Core/Relation/Marker。

实现方式是在 Huabu现有 owner外围提供 critical/cluster projection输入，不迁移Gen1第二套camera/LOD store。

## 8. Identity / interaction

- face保持可识别直到 `MARK_FACE_MIN=7px`，更小才退成identity dot；
- gaze只表达注意方向，不等于选择、Reference或授权；
- hover/selected/open/running/approval/error必须有badge/chrome/文案辅助，不能只靠表情；
- double-click/activate继续走Huabu conversation seam；
- Glyth不可自动移动、创建关系或执行动作；agent action仍由Run/command权限控制。

## 9. 未闭合项

1. Grok 8 个源码已证实 morphology 中首轮具体开放哪些；
2. LCOS Run细分phase是否有canonical字段，还是只使用RunStatus；
3. 同屏多个Glyth的CPU/GPU实测预算；
4. one-shot `spin/bounce/burst` 的结束与可重入修复；
6. Conversation Scene/Work View的最终host seam。

## 10. Browser acceptance

1. `64→24px` takeover连续，card/mark不跳；
2. `6px` hysteresis边界无闪烁，`200ms` glide与body fade一致；
3. 30–84px badge、6–30px mark、7px face→dot符合current Huabu；
4. LCOS状态映射不改变canonical Run/Conversation；
5. waiting_input不显示error；permission/review/error事件动画只播放一次后settle；
6. active/selected Glyth不被cluster；非关键extreme-far cluster不持久化；
7. reduced motion关闭高运动效果；
8. 20个Glyth同屏达到预算，非焦点节流；
9. destroy后无RAF/listener/particle泄漏；
10. conversation打开/关闭保持同一thread/entity与spatial anchor。

## 11. Card verdict

```text
HOST + TAKEOVER = DESIGN READY / DIRECT USE LATEST HUABU
CHARACTER DONOR = SOURCE READY
FINAL RENDERER SELECTION = DECIDED — GROK
PERFORMANCE + BROWSER PROOF = HOLD
NEW AVATAR OR LOD ENGINE = REJECTED
```
