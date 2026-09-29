# LCOS GEN2 新 Patch 子代理联合审计

日期：2026-09-22  
审计方式：4 路独立子代理 + 主代理只读复核  
当前代码线：`E:\OS开发\LCOS_GEN2_STAGE7_ADAPT_20260920`，HEAD `769022e`  
状态：只读审计，未应用补丁、未修改仓库、未提交、未推送

## 结论

这批不是纯乱改，确实有之前没吸收的新功能；但 **4 个包都不能整包直接合入当前代码线**。

| Patch | 判定 | 处置 |
|---|---|---|
| `LCOS_GEN2_Figma_Fidelity_Assembly_Shell_HUD_Workflow_Context_Composer_COMBINED_e22fafb_20260920.patch` | **ADAPT** | 只拆取非 Assembly 的 HUD、Shell、Density、Context、Workflow 增量 |
| `LCOS_GEN2_Pass4_HUD_Locator_MiniMap_INCREMENTAL_FROM_PASS3_20260920.patch` | **NEEDS_BASE** | 缺 Pass3；先补前置或按当前 `769022e` 重导出 |
| `LCOS_GEN2_GUI_Fidelity_R1_AssemblyWholeSurface_CUMULATIVE_on_e22fafb_20260921.patch` | **REJECT** | 已被 R4 完整包含，且当前已有更新版 Assembly；退役 |
| `LCOS_GEN2_GUI_Fidelity_R4_FloatingSurfaces_CUMULATIVE_on_e22fafb_20260921.patch` | **ADAPT** | 去掉全部 R1/Assembly，仅拆取 Launcher、对象菜单、浮层和 Source 表现 |

一句话：**最值得捞的是 R4-only，其次是补齐出生链后的 Pass4；R1 不再追，COMBINED 只当拆件来源。**

## 关键证据

### 1. 三个累计包出生在旧提交，不认当前代码线

`COMBINED`、`R1`、`R4` 都能干净应用到 `e22fafb`，但都不能直接应用到当前 `769022e`。

R1/R4 的冲突集中在：

- `AssemblyBody.tsx`
- `AssemblyBody.lifecycle.test.tsx`
- `ProfessionalWindowStage.tsx`
- `AssemblyMaterialView.tsx`
- `AssemblySourceTabsView.tsx`
- `professional-assembly.css`

R1/R4 还把当前已经存在的 7 个 Assembly 文件当成新文件再次投递。这不是普通小冲突，而是旧累计终态要覆盖当前已验证实现。

### 2. R4 完整包含 R1

R1 的 13 个 Assembly postimage 与 R4 对应文件逐文件一致。R4 不是接在 R1 后面的增量，而是包含 R1 的累计包。

因此禁止：

- `R1 → R4`
- `R4 → R1`
- 把 R1 单独补到当前线

### 3. COMBINED 与 R1/R4 是同一旧基线上的分叉实现

以 `AssemblyBody.tsx` 和 `ProfessionalWindowStage.tsx` 为例，它们从相同旧 blob 出发，却生成不同后态。整包混用会互相覆盖。

COMBINED 还迁移了 Camera Controls owner：

- 从 canvas-local 移到 `LcosGlobalHud`
- zoom 仍读 canonical canvas store，没有另起第二 store
- 但直接用 `window.innerWidth/innerHeight`，没有显式 resize 订阅

所以它不是单纯 CSS 包，而是 owner 迁移，必须单独适配和回归。

### 4. Pass4 确实缺 Pass3

Pass4 对 `e22fafb` 和 `769022e` 都无法应用，多个 preimage blob 与现有历史不一致，说明它来自另一条已经做完 Pass1–3 的文件状态。

它并非空气包，真实包含：

- 新增 `LcosMiniMapOverlay.tsx`
- MiniMap toggle/state 接线
- safeRect → camera insets
- `lcosHudPlacement.ts` 大幅增强
- 窄 safeRect 测试

但它同时把 Camera Controls 的 `Fit` 入口替换成 MiniMap toggle。没有 Pass3 就无法确认 Fit 被迁到哪里，也无法安全判断 51 行 CanvasCommands 删除是否合理。

## 真正值得保留的新内容

### COMBINED

- Shell 级 Camera Controls 候选
- HUD / Railway / Navigator 表现调整
- Density / Species 调整
- Context / Workflow presentation 调整

必须剔除：Assembly、Professional Window、Assembly CSS 和相关旧测试覆盖。

### Pass4

- MiniMap
- HUD Locator / placement
- safeRect camera insets

前提：找到 Pass3，或让产出方基于 `769022e` 重导出净增量。

### R4-only

- Project Launcher 组件化与视觉层
- 对象右键命令菜单
- Floating surfaces CSS
- Source marker / image / text presentation
- 少量 Species / geometry / type 增量

这是本批最有价值的部分。

## 明确问题

### P1：R4 展示不存在的快捷键

`LcosActionArc.tsx` 显示：

- 重命名：`F2`
- 重复：`Ctrl+D`
- 复制：固定 `Ctrl C`

当前快捷键注册只能确认 Mod+C 和 Delete/Backspace，没有 F2 和 Ctrl+D。菜单点击本身接了真实 command dispatch，但快捷键文字属于假承诺，必须删除或接入现有 shortcut registry。

### P1：R1/R4 会撤回当前 Assembly 窗口操作

R1/R4 会删除当前 Assembly 专用的关闭按钮、更多窗口操作、停靠/分组入口组织，退回旧的通用按钮列；同时把当前 `artifactView` canonical 映射预期拉回旧 `artifact` 预期。

### P2：R4 对象菜单有真实接线，但交互退化

真实部分：

- 使用现有 `buildLcosNodeCommands`
- 点击调用真实 `dispatch(command)`
- 使用 Huabu Popover
- 尝试恢复触发节点焦点

需修正：

- 命令分组被拍平
- `disabledReason` 被藏进 title/aria-label
- 菜单没有自身 max-height 与纵向滚动
- `data-figma-node-id` 测试只证明字符串存在，不能证明 Figma fidelity

### P2：R4 Launcher 有真实改造，但把“打开已有项目”藏深了

Launcher 保留真实 Core session、创建、打开和项目卡操作，不是假页面。但当前首屏直达的“打开已有项目”在 R4 中被藏进新建对话框，发现性倒退；拆取时应恢复首屏入口。

### P2：R1/R4 缩减小屏空间保护

R1/R4 把当前窄屏动态边距改成固定 24px，并进一步压缩可用宽高。固定 Figma 坐标换来了响应式倒退，不应回灌。

### P3：累计包噪声过大

R1/R4 混入大量去花括号等格式变化，增加冲突面但没有产品价值。后续不要再交付“名字像增量、内容是半个宇宙”的累计包。

## 推荐施工顺序

1. **R1 直接退役。**
2. **先处理 R4-only：**剔除全部 Assembly/R1 文件，只移植 Launcher、对象菜单、浮层和 Source presentation。
3. R4 移植时同步修：假快捷键、命令分组、disabled reason、菜单滚动、Launcher 直达打开入口。
4. **Pass4 暂停：**找 Pass3，或要求基于 `769022e` 重导出 MiniMap/HUD 净增量。
5. **COMBINED 最后拆：**只拿当前缺失的非 Assembly 增量；Camera Controls owner 迁移单独做，不与 R4 混成一次提交。
6. 每块独立完成 typecheck、定向测试、production build 和真实交互回归。

## 不允许的组合

- R1 + R4
- R4 + R1
- Combined + R1 整包叠加
- Combined + R4 整包叠加
- Pass4 单独打到 `e22fafb` 或 `769022e`

## 需要补的东西

优先找：

1. Pass3 的 patch、commit 或完整工作树快照。
2. 如果找不到，要求产出方从当前 `769022e` 重做并导出：
   - `R4_ONLY_on_769022e.patch`
   - `PASS4_MINIMAP_HUD_ONLY_on_769022e.patch`

本轮没有应用任何补丁，也没有修改、提交或推送仓库。
