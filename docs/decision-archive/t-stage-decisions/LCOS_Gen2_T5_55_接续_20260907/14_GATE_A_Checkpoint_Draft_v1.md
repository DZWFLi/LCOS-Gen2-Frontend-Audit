# Gate A Checkpoint Draft v1

## 判定

```text
Gate A overall: CONDITIONAL HOLD
Authority recovery: PASS
Primary evidence inventory: PASS
First-wave construction-card readiness: PASS
NC-01 Image exact card: DESIGN READY
NC-02 PDF exact card: DESIGN READY / 5 ADAPTER DECISIONS OPEN
NC-04 Note exact card: DESIGN READY
NC-03 Web exact card: DESIGN READY / 5 ADAPTER DECISIONS OPEN
NC-05 Video exact card: DESIGN READY
NC-06 Frame exact card: DESIGN READY / RELATION ADAPTER OPEN
NC-11 Run/Result exact card: DESIGN READY / RUNTIME WIRING HOLD
NC-12 Audio exact card: DESIGN READY / PREVIEW PROOF OPEN
All-species exact construction cards: NOT YET
NC-09 Collection: PARTIAL READY / 5 PRODUCT DECISIONS OPEN
NC-10 Glyth: HOST READY / FINAL RENDERER + PERFORMANCE HOLD
Implementation authorization: NOT GRANTED BY THIS REPORT
Current root Huabu integration: NOT PRESENT
Huabu authority baseline: main @ a3c411e1f655191344285141f08c4738fa6015f7
```

这不是“方向不清”，而是范围已经切到可执行、但全物种合同尚未闭合。Image、PDF、Web、Note、Video、Frame 可以开始逐张制作 exact construction card；不能据此把整个 Gate A 宣布为 PASS。

## 已闭合

- Huabu current main 的 node body、wrapper、takeover、minimal LOD 与 Preview host 已定位；
- LCOS GitHub Gen1 的语义缩放、Glyth LOD、pointer language 与 Bloub 资产已恢复；
- Spatial 80 帧已建立 primary evidence manifest 和事件账本；
- Grok replica 的状态、眼型、spring、overlay、reduced motion 已完成源码 census；
- iOS 26 donor 已限定为 control / material / microinteraction，不作为 node morphology authority；
- species × state × donor × host seam 已形成矩阵；
- 第一批六个物种已有明确 construction-card 队列和完成定义。
- Reuse feasibility 已确认：Huabu 能承载第一批，但 current root `apps/web` 尚不是 Huabu host。

## 仍未闭合的硬缺口

1. 第一批六张 exact construction card 已完成设计稿，但尚未进行浏览器 proof；
2. Huabu screen-width LOD 与 Gen1 camera-zoom policy 尚未实现单一 resolver 设计；
3. Markdown document 的 Outline/Mind Map 专业 projection 尚未建立 construction card；它不属于轻量 TextNode；
4. Collection collapsed body已明确复用现有member preview组合，但source-return等5项行为尚未冻结；
5. Glyth host/state mapping已完成，仍待Grok/Gen1主renderer选择与性能proof；Run/Result 物种与动效卡已闭合但 create→claim、review→markReview wiring 待 Core/Bridge；Skill、Colony、Space Ref仍有合同缺口；
6. Spatial 六组关键帧虽已复核，但尚未完成逐帧时序、位移和 easing 测量；
7. DomainMap / STTIO 的 exact local evidence 尚未定位。

Text 项已纠正：最新 Huabu Text 是轻量 textarea，不应承担 Markdown/Milkdown 三 face；Note 的 Milkdown canvas read face 与 Preview edit face已经源码确认。Office/PPT 的 current-slide renderer 则仍未存在于最新 Huabu。

## 可以继续推进的范围

不需要等待补料即可继续：

```text
NC-01 Image exact construction card
NC-02 PDF exact construction card
NC-03 Web exact construction card
NC-04 Note exact construction card
NC-05 Video exact construction card
NC-06 Frame exact construction card
Unified LOD owner proposal（只出设计，不改冻结流程）
```

必须等待映射闭合或审批：

```text
Skill final morphology
Colony persistence/body owner
Canvas/Space Ref 产品语义
Collection collapsed source-return behavior
任何改变主流程、对象模型、Schema 或 runtime owner 的实现
```

## 颗粒度判断

当前颗粒度已经足够让 T1 **开始第一批卡片设计与浏览器原型验证**，也足够识别不可越界的 owner；还不足以让 T1 一次性施工整个 Node World，更不足以放行 Gate B。

第一批六张 exact card、reuse feasibility review 与 adapter-only change protocol 已完成。由于 current root 尚未集成 Huabu，下一步必须先评审 Huabu-as-host 的 A0 build-only spike；获得重大变更批准后，才可做 Image/PDF 的真实浏览器 proof。

## 风险与回滚

- 风险：把 donor token 当成 LCOS canonical semantics，或让两套 LOD 同时驱动；
- 风险：先批量施工，再发现 card 模板缺少 persistence / promotion seam；
- 回滚点：本阶段只产出报告与卡片，不修改源码、Schema、数据或冻结交互；删除/废弃单张 draft 即可回滚。
