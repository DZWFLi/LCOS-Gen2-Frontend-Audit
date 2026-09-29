# First-wave Construction Readiness v1

## 结论

第一批六张 exact construction card 已完成设计层定义，但这不等于代码施工已获批准。

| Card | Reuse baseline | Card status | 主要 open item |
|---|---|---|---|
| NC-01 Image | Huabu Image stack | DESIGN READY | identity LOD 浏览器校准 |
| NC-02 PDF | Huabu PDF stack | DESIGN READY | 5 项 fragment/cover adapter 决策 |
| NC-03 Web | Huabu Web stack | DESIGN READY | 5 项 source/provenance adapter 决策 |
| NC-04 Note | Huabu Milkdown Note stack | DESIGN READY | LCOS content/revision adapter |
| NC-05 Video | Huabu Video stack | DESIGN READY | poster cache/view-state adapter |
| NC-06 Frame | Huabu Frame engine | DESIGN READY | unframe 时 canonical Relation 规则 |

## 可进入的下一阶段

```text
reuse feasibility review
→ adapter-only change protocol
→ Image/PDF browser proof
→ verify against acceptance cards
→ only then request implementation scope approval
```

当前最正确的动作不是开始重画六套节点，也不是复制 donor，而是证明现有 Huabu mechanics 能在薄 LCOS adapter 下满足卡片。任何需要 rewrite 的发现必须回到 `19_Reuse_First_No_Rewrite_Ledger_v1.md` 的门槛重新审查。

## Gate A 状态

```text
FIRST-WAVE CARD SET = COMPLETE
FIRST-WAVE IMPLEMENTATION = NOT STARTED
GATE A OVERALL = CONDITIONAL HOLD
```

Gate A 仍未整体通过，因为第二批物种、adapter authority 和运动精测尚未闭合。

