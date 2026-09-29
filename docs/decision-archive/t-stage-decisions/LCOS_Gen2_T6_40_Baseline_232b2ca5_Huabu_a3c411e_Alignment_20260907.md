# LCOS Gen2 · T6 · Baseline Alignment 40

## 结论

```text
Gen2 construction truth
= DZWFLi/LCOS_Gen2/main@232b2ca5fbcb3b76b053cf314b5c1193242abb6a

Huabu upstream mechanical truth
= microsoft/Huabu@a3c411e1f655191344285141f08c4738fa6015f7

Local clean checkout
= E:\OS开发\LCOS_Gen2
```

`huabu/` 已正确 vendor 并完成旧 seam 重迁移，无代码回退或重放需求。本轮只修 `HUABU_UPSTREAM.md` 元数据与接续文档基线引用，没有修改 `huabu/` 源码。

## 已执行同步

1. `E:\OS开发\LCOS_Gen2\HUABU_UPSTREAM.md`
   - current pin 改为完整 `a3c411e1...`；
   - 补记 `930bdf306d → 56c3d7c3e1 → 350f0d504a → 232b2ca5` 迁移链；
   - 旧 baseline 只保留为 historical context。
2. `25_Huabu_Latest_Baseline_Declaration_v1.md`
   - 移除 pending integration 旧口径；
   - 标记 Gen2 main 已集成，HUABU_UPSTREAM 已同步。
3. T6 当前接续文档
   - C1-S1、C1-S2、C1-1、C1-2、C1-3及相关 handoff 的 Gen2 pin 统一改为 `232b2ca5`；
   - Huabu统一引用 `a3c411e1...`。

## Old → new source delta audit

比较：

```text
c2ff890a867922a1256572199458438572eb0a8c
..
232b2ca5fbcb3b76b053cf314b5c1193242abb6a
```

T6 C1 主体相关目录：

```text
packages/domain      no relevant delta
packages/contracts   no relevant delta
apps/local-core      no relevant delta
apps/web-gen2        no relevant delta
```

变动集中于 vendored Huabu，包括：

- `huabu/apps/web/src/lcos/LcosArtifactNode.tsx`；
- `huabu/apps/web/src/pages/CanvasPage/CenterArea.tsx`；
- shared canvas/ACP/node-ref/space-move/instruction-frame types。

因此：

- T6 C1-1～C1-3 的 Core/Event/ActiveContext/Mutation/Reconciliation 结论仍有效；
- 所有未来 Huabu adapter、NodeData、CanvasNodeType、command/space-move 实现必须重新以 `232b2ca5` vendored tree精确取型；
- 不得从旧 pin复制 Huabu源码或恢复旧 workaround。

## Git safety

修改前确认：

```text
branch = main
HEAD = 232b2ca5fbcb
tracked worktree = clean
```

修改后预期 tracked diff只有：

```text
M HUABU_UPSTREAM.md
```

校验：`git diff --check` 通过。`git diff --name-only -- huabu/` 为空。

检查期间另有非本轮产生的未跟踪目录：

```text
docs/handoffs/
└─ LCOS_Gen2_T2_C2-3B_SpatialNavigator_ExactSourceBlueprint_20260907.md
```

该文件在本轮修改后并发出现，未读取内容以外执行任何写入、移动、删除或提交。它意味着当前 checkout 已不再完全干净；后续 production implementation 前必须由 owner处理或明确隔离。

## 状态

```text
BASELINE METADATA PATCHED LOCALLY
T6 CONTINUATION PACKAGE ALIGNED
HUABU SOURCE UNTOUCHED
NO COMMIT
NO PUSH
PRODUCTION IMPLEMENTATION NOT STARTED
```

下一施工点仍为 `T6 C1-3-A`，但 Archive lifecycle/schema 属 Red 变更，须在工作树重新干净且获得明确实施批准后开始。

