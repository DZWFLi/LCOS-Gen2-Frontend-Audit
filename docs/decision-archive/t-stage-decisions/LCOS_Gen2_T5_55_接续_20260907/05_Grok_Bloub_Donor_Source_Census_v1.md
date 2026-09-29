# Grok / Bloub Donor Source Census v1

## 1. 核验范围

本轮直接读取：

`C:\Users\1\Desktop\Gen2开发\grok-icon-study_replica_20260903\`

核心文件：

- `geometry-data.js`
- `src/character.js`
- `src/eyes.js`
- `src/pose.js`
- `src/tables.js`
- `src/tricks.js`
- `src/fx.js`
- `src/math.js`

证据等级：`DONOR_SOURCE_VERIFIED`。

## 2. 已确认的实现结构

`GrokCharacter` 是统一 orchestrator，承载：

- shape / color / scheme；
- mode / state；
- pose / home pose；
- eye topology / eye scale；
- pointer following / gaze target；
- reduced motion；
- body、eyes、badge、overlay、particles；
- snapshot 与销毁清理。

它不是一张 SVG，也不是 CSS 呼吸 blob，而是由几何、眼型、姿态、弹簧、overlay 与行为调度组合成的角色 renderer。

## 3. 状态表

源码共列出 39 个命名状态：

### Lifecycle（7）

`sleeping / waking / idle / listening / thinking / searching / working`

### Reactions（16）

`excited / surprised / suspicious / angry / drowsy / happy / curious / confused / bored / proud / shy / sad / laughing / scared / playful / celebrate`

### Agent morphs（3）

`orbit / radar / progress`

### Product lifecycle（13）

`spawning / humming / loading / dictating / writing / sending / receiving / uploading / notifying / alerting / dragging / bouncing / powering-down`

每个状态有独立 `EYE_PLAYLIST`、`EYE_HOLD_MS` 和 `BLINK_MS`；因此 LCOS 不应只取 idle/working/error 三张脸。

## 4. 眼睛系统

- 眼型索引至少覆盖 `0–24`，即 25 组眼型；
- 状态通过 playlist 在多眼型间切换；
- eye morph stiffness 会按状态调整；
- `searching` / `excited` 使用更高 stiffness；
- pointer gaze 有映射、范围约束和插值，不是直接绑定光标坐标；
- idle 眼型 hold 为 9–16 秒，blink 为 6–14 秒；
- working 眼型 hold 为 1.8–3.2 秒，blink 为 2.8–5.5 秒；
- listening、thinking、searching 等均有不同节奏。

这验证了前一轮的重要判断：生命感的大头来自 gaze、blink、eye playlist 与状态节奏，而不是让 body 永久大幅扭动。

## 5. 弹簧系统

`tables.js` 当前明确列出 14 组 spring 配置：

```text
spin           [5, 0.9]
x              [3.5, 1]
y              [4, 1]
squash         [10, 0.8]
blink          [26, 1]
eyeScale       [9, 0.85]
gazeX          [13, 1]
gazeY          [13, 1]
notify         [9, 0.55]
humDots        [6, 1]
overlay        [14, 1]
overlayMix     [11, 1]
shape          [10, 1]
overlayTurn    [14, 1]
spinTurn       [6.2, 1]
```

注意：表内实际为 15 个命名项（包括 `spinTurn`）；此前 README 的“15 根弹簧 transform”与源码可对齐，但报告撰写时应按命名项而非模糊措辞。

## 6. Overlay 映射

| LCOS 候选语义 | donor state | overlay |
|---|---|---|
| thinking | `thinking` | `dots` |
| orbit / relation attention | `orbit` | `orbit` |
| searching | `radar` | `radar` |
| progress | `progress` | `progress` |
| spawning | `spawning` | `gather` |
| voice input | `dictating` | `wave` |
| sending | `sending` | `send` |
| receiving | `receiving` | `receive` |
| uploading | `uploading` | `dock` |
| loading | `loading` | `whirl` |
| writing | `writing` | `pencil` |
| alert | `alerting` | `bang` |
| powering down | `powering-down` | `standby` |

`progress` 与 `spawning` 有显式 on/off cycle：分别 2500ms / 2000ms 开、1500ms 休息。LCOS 映射时不能把所有 working 状态都强制成永久循环动画；这也符合“持续流动动效最多两条”的系统规则。

## 7. Reduced motion 与资源释放

- 构造函数读取 `prefers-reduced-motion: reduce`；
- spin、shape trick、particle burst 会尊重 reduced motion；
- `destroy()` 取消 RAF、解绑 pointer listener、清除 particles；
- pointer rect 有缓存，约 200ms 更新一次。

这些不是装饰细节，而是接入 LCOS 时应原样保留的工程能力。

## 8. 几何与文档冲突

README 声称“23 种规则几何形状”；本轮对 `geometry-data.js` 的直接字段检查只检测到 18 个带 `label` 的 shape 条目。该差异必须在下一轮通过实际 `Object.keys(GROK_GEO.shapes)` 运行结果关闭，当前标记：

`OPEN_COUNT_MISMATCH`。

在数量未核清前，不应继续在报告里固定写“23 shapes”。

## 9. LCOS Phase 1 映射建议

### 直接复用

- renderer 分层；
- geometry table 接口；
- eye playlists / hold / blink；
- gaze、pointer attention；
- shape morph spring；
- reduced-motion 与 destroy lifecycle；
- overlay engine 中与 LCOS 状态语义一致的部分。

### 适配

- donor state 名称映射到 LCOS Run / Conversation 状态；
- overlay 颜色进入 LCOS token；
- size / LOD 与 NodeTakeover 对齐；
- `onChange(snapshot)` 接入 LCOS presentation state；
- badge 与通知语义服从 LCOS，不继承 donor 产品含义。

### 不在 Phase 1 决定

- Action Arc 的完整动作集；
- Composer 与 Reference flow；
- right-drag proxy；
- Conversation deep work；
- durable context mapping。

这些属于 Phase 2 的 T3 interaction mapping。

## 10. 当前结论

Grok replica 已经达到可作为 Glyth renderer implementation donor 的颗粒度，远高于“视觉参考”。但 LCOS mapping 还缺：

1. 39 donor states → LCOS canonical states 的逐格裁决；
2. full / compact / identity 三个 LOD 的真实浏览器验证；
3. 与现有 Node wrapper/takeover 的 host seam；
4. shape 数量冲突关闭；
5. 性能预算与同屏多个 Glyth 的降级测试。

因此：

```text
DONOR SOURCE = GO
LCOS INTEGRATION CONTRACT = PARTIAL
T1 DIRECT CONSTRUCTION = HOLD UNTIL HOST SEAM + LOD ACCEPTANCE
```

