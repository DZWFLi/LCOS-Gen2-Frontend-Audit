# Huabu `a3c411e` Vendored Baseline 对齐报告 v1

> 目的：解决 `LCOS_Gen2` 最新 merge、实际 `huabu/` tree 与 `HUABU_UPSTREAM.md` 之间的基线冲突。  
> 方式：GitHub API 只读溯源；未修改、提交或 push GitHub 仓库。

## 0. 对齐结论

```text
Upstream mechanical baseline
= microsoft/Huabu@a3c411e1f655191344285141f08c4738fa6015f7

LCOS Gen2 integrated baseline
= DZWFLi/LCOS_Gen2@232b2ca5fbcb3b76b053cf314b5c1193242abb6a

Vendored location
= LCOS_Gen2/huabu/

Metadata needing correction
= LCOS_Gen2/HUABU_UPSTREAM.md (still says 58339e2)
```

**代码应保持当前 `a3c411e` migration tree；应修正文档 pin，不能把代码回退到 `58339e2`。**

## 1. Git 证据链

### 1.1 Gen2 main

```text
232b2ca5fbcb3b76b053cf314b5c1193242abb6a
merge: rebase LCOS seam onto Huabu upstream a3c411e (migration)
parents:
- c2ff890a867922a1256572199458438572eb0a8c
- 350f0d504a325b8ec19a5518191a0c55e31ad332
```

merge tree 与第二 parent `350f0d504a` 完全相同；即 migration 分支是被采用的最终树。

### 1.2 Migration 链

```text
930bdf306d  chore(vendor): re-vendor Huabu upstream a3c411e (migration baseline)
56c3d7c3e1  migration(huabu): re-apply LCOS seam/adapter onto upstream a3c411e
761af8d599  chore: drop stray tsconfig backup
350f0d504a  fix(lcos): adapt LcosArtifactNode to a3c411e strict NodeData/CanvasNodeType
232b2ca5fb  merge: rebase LCOS seam onto Huabu upstream a3c411e
```

### 1.3 Upstream commits

| baseline | SHA | upstream tree | date |
|---|---|---|---|
| current | `a3c411e1f655191344285141f08c4738fa6015f7` | `478c2a7ffcd8ae67ccf95ff46b7f6f477bca1f54` | 2026-09-05 |
| old | `58339e269b784728d67730c70bfe7792cae2457d` | `8b14a615cd43660ce219235af8479d994bd99cbd` | 2026-08-31 |

## 2. Vendored tree 比对

在 `930bdf306d` 重新 vendor 的时间点，比较：

- upstream `a3c411e` tree：1969 entries；
- Gen2 `huabu/` vendor tree：1968 entries；
- blob 差异：8 项。

差异仅为迁移/归档处理：

| 路径 | 差异性质 |
|---|---|
| `.git-blame-ignore-revs` | vendor 内容差异 |
| `.nvmrc` | vendor 内容差异 |
| `apps/docs/.npmrc` | vendor portable configuration |
| `apps/server/evals/.gitignore` | vendor 内容差异 |
| `.../Reservoir Sedimentation — Field Survey.md` | Windows filename 编码后路径名不同，blob 内容相同 |
| `assets/huabu-logo.svg` | vendor 内容差异 |
| `pnpm-lock.yaml` | vendor 排除 |

其中带错误编码文件名的两条在 upstream/vendor 中 blob SHA 相同，属于路径编码差异，不是源码版本差异。其余核心 source blob 对齐 `a3c411e`，随后 `56c3d7c3e1` 才重施 LCOS seam。

因此实际树与 migration history 同时证明：当前有效 upstream pin 是 `a3c411e1`。

## 3. `HUABU_UPSTREAM.md` 精确修正要求

同步执行者应在 `DZWFLi/LCOS_Gen2` 的干净工作树中修改：

```diff
-| **Pin commit SHA** | `58339e269b784728d67730c70bfe7792cae2457d` |
+| **Pin commit SHA** | `a3c411e1f655191344285141f08c4738fa6015f7` |
```

并把旧的 Vendoring 叙述更新为 migration history，至少写明：

```text
2026-09-07:
- re-vendor upstream a3c411e at 930bdf306d
- re-apply LCOS thin seams at 56c3d7c3e1
- strict type/path adaptation through 350f0d504a
- merged to main at 232b2ca5
```

原文关于 `58339e2 + 407ea21 + 12d5ba4 + 129bf81` 的叙述应保留为 historical baseline，不能继续写成 current vendored baseline。

## 4. 修改前后流程

### 修改前

```text
Git history says a3c411e
       ×
HUABU_UPSTREAM says 58339e2
       ↓
执行者无法确定 construction truth
```

### 修改后

```text
HUABU_UPSTREAM current pin = a3c411e
→ migration commits recorded
→ LCOS_Gen2 main merge recorded
→ cards / tests / implementation all cite same baseline
```

## 5. 验收条件

1. `HUABU_UPSTREAM.md` current pin 为完整 `a3c411e1...`；
2. 文档明确 old baseline 与 current migration baseline；
3. `git diff --check` 通过；
4. 文档搜索不再把 `58339e2` 描述为 current；
5. 不修改 `huabu/` 源码 tree；
6. 不重放旧 patch、不回退 vendor；
7. 提交/推送由负责同步的执行者按授权完成。

## 6. 当前状态

```text
ACTUAL BASELINE: ALIGNED BY EVIDENCE
CONTINUATION PACKAGE: ALIGNED
GITHUB METADATA FILE: PATCH REQUIRED
CODE CHANGE: NOT REQUIRED
BROWSER GATE: UNAFFECTED / STILL PENDING
```

本轮没有在当前脏工作区修改仓库，也没有自动 commit 或 push。
