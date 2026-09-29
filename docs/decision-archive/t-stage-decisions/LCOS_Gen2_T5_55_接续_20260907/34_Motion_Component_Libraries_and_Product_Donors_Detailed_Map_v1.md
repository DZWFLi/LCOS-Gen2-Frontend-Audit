# 动效组件库与产品级 Donor 细化采用图 v1

## 结论

本项目采用“双轨 donor”：

```text
产品级 donor → 决定整段体验、空间因果、节奏、开合与结果出现方式
开源组件库 → 提供可维护、可测试、可降级的局部器官
最新 Huabu → 承担宿主、运行机械和通用交互
LCOS → 拥有 canonical truth、物种形态与最终裁决
```

不以“必须来自开源组件库”为前提。专有产品可以成为高保真行为 donor，但不复制拿不到的私有实现；当前项目以非商用实现效果为主，已有源码的组件在满足技术适配、基本许可证义务和 host seam 时优先直接采用或薄改，不因假设中的未来商用场景降为纯参考。

## 1. 开源动效组件库：精确到组件

### 1.1 Morphicons `1.7.1` / MIT

本地源码：`Gen2开发/源码参考_20260903/morphicons/`。

能力：任意 stroke icon 路径间 spring morph；支持 Lucide/Tabler/Heroicons/Iconoir 数据；React binding；zero runtime dependencies；SSR 首帧稳定。

采用位置：

| 物种 | icon pair / 用法 |
|---|---|
| Audio | `Play ↔ Pause`、`Mic ↔ Square`、`Volume ↔ VolumeX` |
| Run | `Clock/Queue ↔ Play`、`Play ↔ PauseCircle`、`Loader/Activity ↔ Check`、`Activity ↔ TriangleAlert` |
| Result | `Sparkles/Loader ↔ Eye`、`Eye ↔ Check`、`Undo ↔ RotateCcw` |

规则：

- 优先用 `morphicons/react` 的 `MorphIcon`，不自己手写 SVG path tween；
- icon morph 是状态提示，不是状态机 owner；
- LCOS 必须显式设 `reducedMotion="user"`，不能沿用库当前默认的 `never`；
- 静态 icon 继续用 `lucide-react`，只在有因果连续性的 pair 上引入 Morphicons。

### 1.2 Amicro / MIT 源码 registry

本地源码：`Gen2开发/源码参考_20260903/amicro/`。npm 分发不完整，但 GitHub registry 与源码完整，因此只能“精准收割 + provenance”，不能当普通 npm UI 库整包引入。

Audio 采用候选：

- `registry/ui/loading/apple-sound-wave.tsx`
- `registry/ui/loading/apple-equalizer.tsx`
- `registry/ui/loading/symmetric-wave.tsx`
- `registry/ui/loading/shimmer-line.tsx`
- `registry/ui/loading/apple-icon-morph.tsx`

裁决：波形/equalizer 只提取运动方式，与 Huabu `AudioNode` 的真实播放、seek、record lifecycle 合并；不把 loader 组件原样冒充真实音频波形。

Run 采用候选：

- `src/components/metrics/ProgressIndicator.tsx`
- `src/components/metrics/TimerCard.tsx`
- `src/components/metrics/RunningStatsCard.tsx`
- `src/components/dither-charts/ServerGauge.tsx`
- `src/components/mono-charts/MonoRoundedGaugeArc.tsx`
- `src/components/mono-charts/MonoRoundedSparklineChart.tsx`
- `src/components/mono-charts/MonoActivityHeatmap.tsx`
- `src/components/metrics/AnimatedMetricCard.tsx` 的 `mono-*` SVG/transition 分支

裁决：只取 path、viewBox、progress interpolation、时间/强度表示等“机器器官”，去掉 Card shell、业务名字和 dashboard anatomy，重新组装进 Run 的 process body。

Result 采用候选：

- `registry/ui/entrance/scale-in.tsx`
- `registry/ui/entrance/fade-up.tsx`
- `registry/ui/loading/shimmer-line.tsx`
- checkmark draw / icon morph 类短反馈

裁决：只能服务 ghost→content 的局部显形，不负责 slot 布局，也不做全屏 loading。

共享基础：

- `registry/lib/presets.ts`
- `registry/hooks/use-reduced-motion.ts`
- `registry/hooks/use-web-haptics.ts`（只在明确支持的 drop/accept 上）

默认拒绝：`breathing-glow`、`concentric-pulse`、`apple-breathe` 作为整卡常驻状态；Curtain/zipper/whimsical 未有功能语义时不用。

### 1.3 React Bits / 免费源码，许可需逐件复核

本地源码：`Gen2开发/源码参考_20260903/react-bits/`。

可选小件：

- `AnimatedContent` / `FadeContent`：一次性 panel/content reveal；
- `CountUp` / `Counter`：Run 的真实数字计数；
- `Magnet`：drop/accept 局部吸附；
- `ClickSpark`：极短的放置成功反馈，默认可关闭；
- `StarBorder`：只提取路径运动思路，若用于 review/selection 必须极度降噪；
- `BlurText`：仅 Work View 标题首次进入，不能用于频繁状态词。

默认不用：`SpotlightCard` 套对象；所有 three/ogl 背景；Aurora、Particles、Galaxy、Hyperspeed、LiquidChrome、MetaBalls、Silk、Ribbons；营销式 Shiny/Decrypted 文本。

React Bits 不作为 canonical identity owner，但对已在本地取得源码、能满足当前非商用用途且技术适配的具体组件，可以 `COPY SELECTED / ADAPT`；记录来源、版本、修改与删除路径即可，不因许可讨论无限搁置实现。

### 1.4 `motion/react`

这是执行层，不是视觉 donor。所有 layout morph、spring、AnimatePresence、路径/数值插值最终统一经它执行；业务组件不得各自发明 spring 常量。

优先采用：

- layout/layoutId：Spatial→Focus/Work View 同一身份 morph；
- spring：`lcosSprings.snappy/smooth/gentle/stiff`；
- AnimatePresence：无法共享 layoutId 时的受控退路；
- `useReducedMotion`：组件级降级。

## 2. 产品级 donor：成熟体验可优先

### 2.1 Spatial — 对象与空间

用于：

- Audio/媒体作为内容身体，而非白条卡；
- 原位打开、反向关闭、同一身份连续；
- 选择 chrome 极轻；
- 内容之间的留白、让路、聚散与整体呼吸；
- 约 220–260ms 的 snappy 打开 proof 起点。

不用于：Run 过程语义、ResultSlot lifecycle、LCOS 窗口壳。

### 2.2 TapNow — 生成结果出生

用于 Result 的核心链：

```text
source → branch line → empty slots → progressive fill → review
```

它优先于任意 loading 组件，因为它解决了“生成前用户是否知道数量、位置、来源”这个产品问题。开源 entrance/shimmer 只能填充这条链中的局部运动。

### 2.3 Lovart — 内容优先与卫星控制

用于：

- `Content is the body, controls are satellites`；
- loading skeleton 占据最终内容 footprint；
- object-local toolbar；
- controls 贴近 target 又不盖住内容；
- Result/Proposal 的局部操作层级。

### 2.4 Trae — 克制瞬态

用于：

- quiet rest；
- 极小 hover blast radius；
- menu 从 trigger 长出；
- tooltip 解释而不创建模式；
- progressive disclosure 的节奏。

适合约束 Run/Result 的控制 chrome，避免“AI 状态一来全画布闪”。

### 2.5 Codex Desktop — 锚点与持续工作层

用于：

- local anchor→local preview；
- skeleton 与最终 popup 使用同一 footprint；
- transient explanation 与 persistent management 分离；
- Run/Review 需要持续操作时才进入 Work View；
- 关闭后返回原 target 和上下文。

### 2.6 最新 Huabu — 可直接用的产品实现

用于：

- Audio record/play/seek/cleanup；
- NodeWrapper、selection、resize、toolbar、PreviewWorkspace；
- task launch/completion/thread lifecycle；
- ChangeReview 的 before preview、stale/conflict、Keep/Revert；
- canvas/connection/LOD host。

Huabu 是真实实现基线，不只是视觉参考；但其 Generic shell 不能覆盖 LCOS 物种形态。

### 2.7 LibTV / Figma / 其他产品

只有在现有主 donor 缺少相应成熟体验时补位：

- LibTV：canvas shell/双入口等已审计行为；
- Figma：selection、handles、多人设计工具的空间精度；
- 原生 macOS/iOS：媒体控制、reduce motion、focus/keyboard/accessibility 质量线。

不能因为产品更知名就替换已闭合的 LCOS 语义或 Huabu host。

## 3. Audio 的最终 donor 组合

```text
Huabu AudioNode lifecycle/player
+ Spatial media morphology/open-close
+ Morphicons play/pause/record-stop
+ Amicro sound-wave/equalizer motion extraction
+ native media accessibility conventions
+ LCOS Artifact/revision/stale adapter
```

重点：Amicro 波形只能给“怎么动”，Huabu `<audio>` 与 MediaRecorder 决定“真的在发生什么”。

## 4. Run 的最终 donor 组合

```text
Huabu task/change mechanics
+ LCOS Run canonical semantics
+ Amicro mono metric organs
+ Morphicons state transitions
+ Trae quiet-rest discipline
+ Codex Desktop persistent-work hierarchy
```

Run body 应像一台可读的过程机器；`AnimatedMetricCard` 只拆器官，绝不整卡搬入。

## 5. Result 的最终 donor 组合

```text
LCOS ResultSlot lifecycle
+ TapNow empty-slot/progressive-materialization behavior
+ Lovart content-first/local-controls
+ Spatial same-object morph
+ Huabu review/stale/conflict mechanics
+ Amicro entrance/shimmer as local implementation detail
```

结果成形后必须脱掉 Result shell，成为 Image/PDF/Text/Office 等真实 Artifact 物种。

## 6. 采用优先级

```text
1. 最符合冻结产品语义、实际效果最成熟的产品行为
2. 最新 Huabu 已有真实机械
3. 本地已有源码且可技术适配的成熟开源组件
4. 已验证的本地薄 primitives
5. 只有上述都无法满足时才做最小自研
```

“成熟产品 donor 优先”不等于只写参考说明。能直接落地的源码组件就直接采用或薄改；拿不到源码的产品体验则复刻已经验证的因果、反馈、节奏和空间行为。许可证、署名和 provenance 是交付记录，不作为拖延当前非商用实现的借口。
