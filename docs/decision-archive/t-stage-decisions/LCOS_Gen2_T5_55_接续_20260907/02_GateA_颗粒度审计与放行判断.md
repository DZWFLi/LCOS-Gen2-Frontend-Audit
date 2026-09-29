# Gate A 颗粒度审计与放行判断

## 结论

**当前颗粒度不够，不能直接推进 Gate B；但方向已足够稳定，可以继续完成 Gate A，不需要重开产品讨论。**

我对当前成果的评估：

| 维度 | 当前成熟度 | Gate A 要求 | 判断 |
|---|---:|---:|---|
| 产品语义与责任边界 | 90% | 90% | 足够 |
| Gen1 完整度下限 | 70% | 90% | 需补 ledger |
| current mechanics 定位 | 55% | 95% | 不够 |
| current renderer census | 30% | 95% | 明显不够 |
| Spatial primary evidence | 55% | 90% | 需逐帧账本 |
| Grok / Bloub 源码 census | 35% | 90% | 需逐文件 |
| iOS / DomainMap / STTIO 分类 | 15% | 80% | 缺原件定位 |
| donor → state → source seam | 40% | 95% | 不够施工 |
| exact tokens / motion | 45% | 90% | 混有报告值与推断值 |
| 验收与回滚 | 20% | 100% | 未形成 |

## 为什么聊天颗粒度不够

现有记录大量使用“已经确认”“直接吃”“GO”这样的结论词，但一个施工条目至少还应包含：

```text
object / species
→ exact state
→ user trigger
→ visual anatomy
→ authoritative owner
→ current host seam
→ donor source locator
→ reuse mode
→ geometry / spacing / material
→ motion timeline
→ LOD behavior
→ reduced-motion fallback
→ conflict / open cell
→ browser acceptance
→ rollback boundary
```

缺其中任意关键层，施工 Agent 仍然必须自行设计，等于 T5 没把工作做完。

## 证据等级必须统一

后续所有表格使用以下状态，禁止混写：

| 标记 | 含义 |
|---|---|
| `CURRENT_SOURCE_VERIFIED` | 在指定 current root 中亲自定位并读到 |
| `DONOR_SOURCE_VERIFIED` | donor 源码/资源已定位并核读 |
| `VISUALLY_CONFIRMED` | 原视频或帧图直接看见 |
| `REPORT_MEASURED` | 研究报告给出测量值，未由源码确认 |
| `HISTORICAL_DOCUMENTED` | 历史文档存在，但尚未验证 current truth |
| `INFERRED` | 基于证据推断，尚非事实 |
| `MISSING` | 应有但未找到 |
| `SUPERSEDED` | 已被最新裁决覆盖 |
| `OPEN` | 需要 owner 或用户裁决 |

## Gate A 放行条件

必须同时满足：

- 每个核心 species 至少有 full / compact / identity 三态；
- 每态都有 current host seam、donor、reuse mode 与验收；
- Image / PDF / PPT / Web / Text current renderer 全部定位；
- Collection expanded/collapsed/proxy、Colony、Scope、Restore、pending-review 有明确视觉合同；
- Spatial state-frame ledger 完整，不把报告数值写成源码真值；
- Grok body/eyes/state/transition 的 exact implementation census 完成；
- 缺失 donor 明确标记，不阻塞可独立完成的单元；
- 所有冲突被归入 `CLOSED / OPEN / HOLD`；
- 输出 Gate A checkpoint，并给出 `PASS` 或限定范围的 `CONDITIONAL PASS`。

## 当前允许与禁止

允许继续：

- Gate A 证据普查；
- donor 源码读取与逐帧分析；
- current renderer 定位；
- construction blueprint 文档；
- 不改变冻结语义的浏览器校准。

禁止直接进入：

- Gate B 总体整合；
- 新 Master HTML 宣称“视觉融合完成”；
- T1 全量 C3 施工；
- 将推断值升级为全局设计 token；
- 以 generic card 临时代替缺失 species body。

## 放行判断

```text
Gate A: CONDITIONAL HOLD

不是方向不对；
是证据与施工颗粒度未闭环。
```

预计补齐后不需要再次讨论大方向，只需让 Dz 对关键 donor fidelity 与节点完成度做视觉验收。

