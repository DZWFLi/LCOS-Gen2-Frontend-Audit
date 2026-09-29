# NC-11 Run / Result Exact Construction Card v2

## 0. 卡片状态

```text
STATUS: DESIGN READY / RUNTIME WIRING + BROWSER PROOF PENDING
RUN: process machine
RESULT SLOT: proposal ghost
RESULT: target Artifact species
REVIEW: confirmation boundary
HOST: latest Huabu mechanics
IMPLEMENTATION: DIRECT USE + LIFT + WRAP/ADAPT
REWRITE RUN ENGINE: NO
```

Run 与 Result 是两种不同物种：Run 表达过程和因果；Result 表达内容从承诺到真实产物的出生。不得共用普通状态卡。

## 1. 精确复用源

### 最新 Huabu

- `RunLauncher` / `RunCompletionService` / task service：运行机械；
- `space-execute`：agent change attribution / computeChanges；
- `ChangeReviewCard.tsx`：change rows、press-and-hold before、Keep/Revert；
- `acpThreadChangesStore.ts`：stale fingerprint、skipped conflict、reverse revert；
- NodeWrapper、connection、PreviewWorkspace、Common controls。

### LCOS Gen1 a24

- `apps/local-core/src/result-slot-service.ts`：
  - `empty → running → review → materialized`；
  - reject/cancel release；
  - materialize 绑定 canonical ArtifactView。
- `apps/web/src/features/execution/resultSlotProjection.ts`：
  - Core truth 投影；
  - 原位替换为 canonical View；
  - 不制造第二 output。
- `RunOutlinePanel.tsx` / `runEvents.ts`：只读过程投影与事件语义。

### 产品级 donor

- TapNow：`source → branch → empty slots → progressive fill`；
- Lovart：content body / satellite controls / fixed loading footprint；
- Trae：quiet rest、极小 hover、menu 从 trigger 长出；
- Codex Desktop：local anchor、transient/persistent 分层、同 target Work View；
- Spatial：同对象原位 Focus/restore、轻 selection chrome。

### 开源动效器官

- Morphicons `1.7.1`：Run 状态 glyph 连续变形；
- Amicro：
  - `ProgressIndicator.tsx`；
  - `TimerCard.tsx`；
  - `RunningStatsCard.tsx`；
  - `ServerGauge.tsx`；
  - `MonoRoundedGaugeArc.tsx`；
  - `MonoRoundedSparklineChart.tsx`；
  - `MonoActivityHeatmap.tsx`；
  - `shimmer-line.tsx`、`scale-in.tsx`、`fade-up.tsx`。

只拆 SVG/path/progress interpolation，去掉所有 metric card 外壳。

## 2. Run anatomy：过程机器

```text
       reference sockets
              ↓
input port → intent core → active chambers → review gate → result ports
              ↑                  │
           receiver           checkpoint
```

### 外观纪律

- 有明确流向与输入/输出端，不是四边等价矩形；
- process core 是视觉重心，正文/metadata 不是；
- chamber 数量只显示关键阶段，不把日志每行画成节点；
- relation/ports 解释 references、receiver 与 outputs；
- 选中后 Arc 才出现 Inspect/Cancel/Retry 等动作；
- 完成 Run 保留为可审计机器骨架，但停止一切持续动效。

### 状态身体

| 状态 | 机器表现 |
|---|---|
| queued | 通道未点亮，入口已占位 |
| running | 当前 chamber + active path 局部流动 |
| waiting_input | path 停在开放插口，问题成为断点 |
| review | output port 已产生内容，review gate 未放行 |
| completed | path 闭合并静止，结果关系清楚 |
| failed | 失败 chamber 断路，局部 error，不染红整机 |
| cancelled | 通道熄灭，保留审计轮廓 |

## 3. ResultSlot anatomy：Proposal Ghost

```text
branch line
    ↓
expected-species ghost
├─ stable footprint
├─ source/provenance tether
├─ materialization layer
└─ review boundary
```

- 输出数量已知时先生成所有 stable footprints；
- 输出类型已知时 ghost 预示 Image/PDF/Text/Office 等剪影；
- 未知类型用中性生成体，类型确定后 morph；
- loading skeleton 必须与最终内容占同一 footprint；
- spinner 只能是极低层 fallback，不能成为主体。

## 4. Progressive materialization

| 目标物种 | 物化过程 |
|---|---|
| Image | 主色/模糊剪影 → 清晰真实图像 |
| Text/Note | 排版骨架 → 标题/段落真实内容 |
| PDF/Office | 页形 ghost → 封面/首屏/页叠 |
| Web | favicon/source → preview snapshot |
| Audio | 时间槽 → waveform + duration |
| Video | poster 色块 → poster/时间控制 |

多结果采用短促错峰显形，但 slot 位置不动。内容一旦 ready，立刻由目标 species renderer 接管 body。

## 5. Review → materialized

### Review

- 内容已经是真实 Draft body；
- pending boundary 与 Run provenance line 仍可见；
- Keep/Revert/Retry 是卫星控件或 Work View 操作；
- press-and-hold before 复用 Huabu；
- stale/conflict 时危险 Revert disabled。

### Accept

- review boundary 短促 settle 后退场；
- 同一位置绑定 canonical ArtifactView；
- 不复制节点、不先删槽再猜位置；
- Run→Result provenance relation 保留。

### Revert/Retry

- Revert 有序撤回本次 proposal，不伤害后续人工修改；
- Retry 创建新 Run/Revision 关系，旧 Draft 可审计；
- 文件修改必须走 LCOS Revision/hash，Huabu canvas inverse delta 不越权回滚本地文件。

## 6. LOD

### Run

| LOD | 表现 |
|---|---|
| full | intent core、关键 chambers、active path、inputs/outputs、review gate |
| compact | 2–4 个 chamber、状态、输出数、方向性轮廓 |
| glyph | process mark + 方向切口 + status；不能只剩普通圆点 |

### Result

| LOD | 表现 |
|---|---|
| full | 目标内容 body + materialization/review boundary |
| compact | 目标物种剪影 + pending/review 信号 |
| glyph | 内容剪影 + provenance tether |

materialized 后完全切换目标 Artifact 的 LOD，不保留 Result 卡壳。

## 7. 动效落地

### Run

- Morphicons：queued→running、running→waiting、review→completed；
- Amicro mono：Gauge/Progress/Sparkline/Heatmap 器官按真实数据驱动；
- 只有 active chamber/path 持续动；
- waiting/review/completed 静止或只播一次 settle。

### Result

- TapNow 决定行为链；
- Amicro `shimmer-line/scale-in/fade-up` 只实现局部 materialization；
- Spatial layout morph 负责 Focus/Work View；
- 不用整卡 glow、粒子庆祝、黑客解密字。

### Reduced motion

- Run 用 path 分段亮灭和状态形状；
- Result 用 ghost→partial→full 三阶实体度；
- Morphicons 直接切换；
- 禁止流动线、shimmer、旋转与 stagger。

## 8. 状态 owner

| 真值 | Owner |
|---|---|
| Run lifecycle/events | Bridge + Local Core |
| ResultSlot lifecycle | Local Core |
| Artifact/Revision/ChangeSet/Review | Local Core |
| canvas geometry/selection/connections | Huabu |
| animation progress | ephemeral presentation |

动画结束不得推进 lifecycle；重连必须以 Core snapshot/replay 校正视觉。

## 9. Browser acceptance

1. 去掉标题/icon 后仍能区分 Run、ResultSlot、Artifact；
2. `queued→running→waiting_input→running→review→completed` 无错误倒退；
3. waiting_input 是 path 断点，不是 error 卡；
4. 结果生成前已知数量、来源和稳定位置；
5. 物化时 slot 不移动，目标 species 渐进接管；
6. Accept 后只有一个 canonical ArtifactView；
7. Retry 不覆盖旧 Draft；
8. stale/conflict 阻止危险 Revert；
9. 断线不显示 failed，恢复后读 Core truth；
10. far zoom 仍能从 relation 理解 source→Run→Result；
11. Inspector 关闭时 Run node 不订阅完整 change list；
12. 全画布持续流动线不超过 2；
13. reduced motion 无持续动画；
14. 没有第二 Run engine、第二 review store、第二 Result truth。

## 10. 当前 wiring HOLD

审计已确认：ResultSlot contract、persistence、lifecycle、accept→materialize 已有；但 `Run create→claim slot` 与 `Run review→markReview` 尚未 production wired。该缺口由 Core/Bridge owner 补薄接线，T5 不以视觉本地 state 假接通。

## 11. 回滚

Run/Result morphology 全部是只读投影与薄 decoration。proof 失败时可删除 projection renderer，保留 Huabu task/review mechanics 与 LCOS canonical records；不得为视觉回滚迁移或删除 Run/ResultSlot 数据。
