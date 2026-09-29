# LCOS GEN2 真增量合并校验

日期：2026-09-22  
目标代码线：`E:\OS开发\LCOS_GEN2_STAGE7_ADAPT_20260920`  
目标 HEAD：`769022e`  
状态：隔离验证完成；尚未应用到正式施工线、未提交、未推送

## 结论

只保留真增量后的组合候选已经通过合并校验，可以作为下一步正式落线候选。

可用补丁：

`C:\Users\1\Desktop\前端冲刺\LCOS_GEN2_TRUE_DELTA_R4_COMBINED_ADAPTED_on_769022e_20260922.patch`

补丁对 `769022e` 的 `git apply --check` 结果：**通过**。

## 纳入内容

### R4-only

- Project Launcher 组件化与视觉层
- 对象右键命令菜单及真实 command dispatch
- Floating surfaces
- Source marker / image / text presentation
- Source geometry 与显式 presentation inputs

### COMBINED 非 Assembly

- HUD / Shell / Railway / Surface Dock
- Camera Controls presentation 与 owner 迁移候选
- Density / Species
- Context / Workflow collection presentation

### 单文件冲突处理

两组增量只在 `LcosSpeciesBodies.tsx` 冲突。最终版本同时保留：

- COMBINED 的 Context/Workflow collection face
- R4 的 marker color、media fit、media position
- 原有 canonical reference / canvas / shell owner

没有新增第二 store、第二 canvas 或伪 backend。

## 明确排除

- R1 全部内容
- R4 中全部 Assembly / Professional Window 累计内容
- COMBINED 中全部 Assembly / Professional Window 内容
- Pass4：缺 Pass3，未进入候选
- 虚假的 `F2`、`Ctrl+D` 快捷键提示
- 新增的装饰性 `data-figma-node-id="5187:921"`、`5226:1264`

## 校验中修正的问题

1. 对象菜单快捷键改为读取现有 shortcut registry；没有真实绑定的动作不显示快捷键。
2. Launcher 首屏恢复“打开已有项目”入口。
3. 对象菜单增加最大高度与纵向滚动。
4. 修复 context menu origin 的 `HTMLElement | null` 类型问题。
5. 删除 COMBINED 遗留的未使用 `activeWorkspaceId`。
6. 去掉 Launcher dialog 的强制 `autoFocus`。
7. 修正 Source marker 测试对 DOM 颜色序列化格式的脆弱依赖。
8. 整理补丁带入的 import 排序问题。

## 验证结果

### 真增量定向测试

- 6 个测试文件
- 25 个测试
- **25/25 通过**

覆盖：

- Species presentation
- Source geometry
- Density
- Project Launcher views
- Object command menu
- Source views

### TypeScript

- `tsc --noEmit`
- **通过**

### Lint

- 29 个变更 TS/TSX 文件
- **通过，0 error**

### Production build

- `tsc && vite build`
- **通过**
- 仅保留项目已有的 CSS Highlight、第三方包注释和 chunk size 警告

### LCOS 全量测试 A/B

未修改基线 `769022e`：

- 418 passed
- 19 failed

真增量候选：

- 430 passed
- 19 failed

结论：候选新增 12 个通过测试，**没有新增失败**。19 个失败在基线与候选完全一致，属于现有测试/环境问题，不由本次真增量引入。

## 补丁规模

- 36 files changed
- 1457 insertions
- 503 deletions
- 0 个 Assembly / Professional Window 文件

## 下一步

该补丁已经具备正式落到 `769022e` 的技术条件。正式落线时仍建议保持一个独立提交，并在落线后执行同一组 typecheck、定向测试、lint 和 production build。

Pass4 等拿到 Pass3 或基于当前 HEAD 重导出后，再单独处理 MiniMap / HUD placement，不与本补丁混合。
