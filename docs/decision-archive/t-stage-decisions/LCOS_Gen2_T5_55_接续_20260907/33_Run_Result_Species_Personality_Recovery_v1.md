# Run / Result 物种个性恢复 v1

## 总裁决

Run 和 Result 不能共用一张“任务卡”换状态。

```text
Run = 机器 / 过程解剖 / 因果通道
ResultSlot = 尚未出生但位置与来源已知的承诺
Result = 已经成形的真实内容物种
Review = Run 与 Result 之间的确认边界
```

Run 的个性是“正在做事”；Result 的个性是“东西正在这里出现”。一个偏过程结构，一个偏内容显形。

## 1. 证据链

### Gen2 节点呈现宪法

- Run glyph：状态色点；
- Run compact：状态 + 机器解剖；
- Run full：日志 / 输出 / Review；
- Run 形态：机器/过程解剖、active path、输入输出关系、结果 affordance；
- 明令禁止把每个 Workflow item 做成相同 Run 卡。

### Gen2 服务审计 MD4

- Huabu 的 launch/completion/task/change-review mechanics 高复用；
- LCOS Core 才拥有 input、references、outputs、diff、review、provenance；
- 断线不等于失败，UI 必须重查 canonical Run truth；
- AI 结构性改动先成为 Proposal，批准前不覆盖 Current。

### Gen1 ResultSlot

- lifecycle：`empty → running → review → materialized`；
- slot 不是 Artifact；
- accept 后绑定 canonical ArtifactView，不复制 output；
- reject/cancel 释放未物化 slot；
- 当前审计确认 create→claim 与 run review→markReview wiring 尚未接通，属于 adapter 缺口，不是重造理由。

### TapNow donor 审计

```text
source → branch line → empty result slots → content fills in
```

在结果出现前，用户已经知道数量、来源、位置与分支关系。LCOS 应采用 `Run → ResultSlot/Proposal ghost → progressive materialization → Keep/Revert`，而不是 toast + spinner。

## 2. Run 的身体：可读的机器解剖

Run 不应是矩形状态面板。其最小视觉语法是：

```text
input/reference ports
        ↓
 intent / machine core
        ↓ active path
 execution chambers / checkpoints
        ↓
 result ports / review gate
```

### 轮廓个性

- 方向性强：明确左/上游输入与右/下游输出；
- 中心不是文档正文，而是 process core；
- 外轮廓可比 Artifact 更硬、更机械、更窄长或具方向切口；
- 状态沿 active path 传播，避免整块变色；
- references、receiver、outputs 通过真实关系和端口解释，不堆成 metadata 表。

### 状态个性

- queued：机器轮廓存在，通道未点亮；
- running：只有当前 chamber/path 流动；
- waiting_input：流动停在明确断点，形成开放插口；
- review：输出端已亮，review gate 尚未打开；
- completed：路径完整但静止，结果关系最清晰；
- failed：故障只落在失败 chamber/断路处；
- cancelled：通道熄灭，保留可审计骨架。

这比“蓝=running、绿=done、红=failed”的普通卡片更有物种性。

## 3. ResultSlot 的身体：Proposal Ghost

ResultSlot 的个性不是“空白文件卡”，而是一个**有来源、有位置、有预期物种但尚未完全成形的负空间**。

### Empty / claimed

- 轮廓使用低实体度 ghost；
- 与 Run 由 branch line 相连；
- 如果输出类型已知，ghost 轮廓预示 Image/PDF/Text 等目标物种；
- 输出数量已知时，多个 slot 先稳定占位，不等生成后突然推开画布。

### Progressive materialization

- 内容从 slot 内部出现，位置不跳；
- Image 可由主色/模糊轮廓到清晰内容；
- Text 可由排版骨架到真实段落；
- PDF/Office 可由纸页剪影到封面/首屏；
- 未知类型保持中性生成体，类型确定后再 morph；
- 进度表达来自“实体度增加”，不是中央 spinner。

### Review

- Result 已有真实内容身体；
- 外围仍保留 Draft/Pending boundary 与来源线；
- Keep/Revert 是卫星控制或 Work View review 动作，不遮住内容；
- 与 Current 并置比较时，两个版本身份清晰，不静默替换。

### Materialized

- ghost shell 退场；
- 原位成为对应 canonical ArtifactView；
- Run→Result provenance relation 保留；
- 不再显示为“成功结果卡”，因为它已经是图片、文档、文本或其他真实物种。

## 4. Run 与 Result 的视觉对照

| 维度 | Run | ResultSlot / Result |
|---|---|---|
| 核心隐喻 | 机器、过程、通道 | 承诺、生成、内容出生 |
| 视觉主体 | active path / chambers | ghost → actual content |
| 方向 | 输入到输出 | 从来源线到占位位置 |
| 动效 | 局部过程流动 | progressive materialization |
| full face | 步骤、日志摘要、review gate | 对应内容物种的完整 body |
| compact | 状态 + 机器解剖 | 预期物种 + 实体度 + pending |
| glyph | 状态点 + 方向刻口 | ghost silhouette / 内容剪影 |
| 完成后 | 保留为可审计 Run | 变为 canonical ArtifactView |

## 5. 与 Huabu 的关系

沿用最新 Huabu：

- NodeWrapper、selection、resizer、toolbar、connection、LOD host；
- task launch/completion、thread lifecycle 与 change computation；
- ChangeReviewCard 的 press-and-hold before、Keep/Revert、stale/conflict mechanics；
- canvas command / inverse delta 只用于 Huabu 空间写。

LCOS 必须补的薄层：

- Run lifecycle DTO → Run morphology；
- ResultSlot lifecycle → ghost/materialization；
- canonical Artifact/Revision/ChangeSet/Review → content body 与 review boundary；
- 文件回滚走 LCOS Revision/hash，不把 Huabu canvas inverse delta 越权用于本地文件。

## 6. LOD

### Run

- full：可读步骤解剖、输入输出、review 状态；
- compact：2–4 个主要 chamber + active path + output count；
- glyph：方向性 process mark + status，不能只剩无物种圆点。

### ResultSlot / Result

- full：真实内容逐步成形；
- compact：预期物种剪影 + pending/review；
- glyph：来源关系与内容剪影；
- materialized 后立即使用目标 Artifact 物种自己的 LOD，不继续套 Result LOD。

## 7. 动效预算

- 全画布持续流动线最多两条，优先给 Active Run 和当前选中关系；
- Run 仅 active path 持续动；
- 多 ResultSlot materialize 采用短促错峰，不做长时间瀑布庆祝；
- review/completed 静止；
- reduced motion 以 path 段亮灭、实体度阶跃和状态形状替代流动/渐变。

## 8. 必须进入 NC-11 的验收

1. 不看文字/icon 也能区分 Run 与 Artifact；
2. waiting_input 显示为过程断点，而不是 error 卡；
3. ResultSlot 在产物出现前稳定表达数量、来源、位置；
4. materialize 原位变成真实 ArtifactView，没有第二个 output；
5. Result 完成后继承目标物种形态，不永久戴“Result 卡壳”；
6. Run 与 Result 的连接在 far zoom 仍解释因果；
7. stale/conflict 阻止危险 Revert；
8. refresh/reconnect 不把断线误判失败；
9. visual animation 不成为 lifecycle truth；
10. 复用最新 Huabu mechanics，不建第二 Run engine/review stack。

## 9. 当前 Gate

```text
Run morphology concept: READY
ResultSlot morphology concept: READY
Huabu reuse seam: IDENTIFIED
LCOS create→claim wiring: OPEN
LCOS review→markReview wiring: OPEN
Browser morphology proof: NOT STARTED
Implementation authorization: NOT GRANTED
```
