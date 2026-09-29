# 导航收口增量：Drop 真实回执与 Arc 初次身份等待

代码已稳定。本轮不再新增导航功能，交根代理合并回归。原 `inventory-navigation` 不改；当前23项见 `navigation-current-status.md/json`。

## 修了什么

- 原 `DropCommitRouter` 收到任何 HTTP 200 都回 success。现在读取真实 `AssemblyApplyResultV1.results[]`：applied、already-member、failed、unsupported、未确认分别呈现；`allApplied`不覆盖逐项事实。
- 原 `LcosHostOverlay`成功即cancel吞掉所有回执。现在沿同一个Drop store保存本次请求和反馈，未完成项继续可见。没有前端回滚成功写入。
- “只重试失败项”只含原请求中明确failed、且非unsupported的精确sourceRef；ArtifactView不换Artifact，Skill的source/version不丢。原target、placement保留。重复点击只提交一次，已成功/已存在项不重跑。
- 重试后继续显示前次成功与尚未解决项；网络异常/缺失item result不盲目重放。旧transaction不盖住新手势，换项目清理本次反馈。
- 接收点的轻量回执仍在原HostOverlay内，不开新大窗口。按实际高度向左上放，避免压住刚打开的Composer；44px按钮、逐项aria反馈、减弱运动保留。
- Arc等到本canvas且同project的首次bindingIdentitiesReady再出现；描述信息仍loading时不阻塞已识别节点。成功读取空绑定表时，自由节点照常获得真实命令；右键同样遵守这条条件。
- 修全量回归3个旧Arc断言：现在测placement父层+button相对偏移后的44px热区；disabled原因实际hover Tooltip和aria-description均验证，不把缺失title当成语义丢失。
- `LcosDropPreview.tsx`仅额外清除EOF空行；先前预览代码不在本批重构。

## 源码与采用记录

READ_SOURCE:
- `E:/TRAE项目/LCOS0.1收口/_cabin/08_MD原件包与单件/LCOS_Gen2_T3_TO_T5_全范围_Exact_Interaction_Blueprint_20260907.md` §6.6–6.8（remote preserve-source、Core失败、成功不可视觉回滚），以及既读§8.2/8.4/19近场Arc。
- `E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T4/LCOS_Gen2_T4_C1-3_Assembly_ExactSourcePlan_20260906.md` §24/26、§69–72。
- `E:/TRAE项目/LCOS0.1收口/_cabin/02_施工卡/接续包/LCOS_Gen2_T4_to_T5_C1-3_Assembly_VisualState_Delta_20260906.md` §12 partial、§20结果状态、§22 typed apply truth。
- 当前仓 `packages/contracts/src/assembly.ts`逐项契约、`apps/web-gen2/src/backend/assembly.ts`的CoreAssemblyClient、现Drop router/store/HostOverlay及AssemblyBody现有逐项分类。

ADOPTED:
- 现有CoreAssemblyClient.apply → DropCommitRouter → 同一LcosDropStore.settle → 原LcosHostOverlay中的轻量回执。
- Huabu Common Button/Tooltip、现有LCOS玻璃token、useHudViewport；不复制新的通用按钮或另建状态owner。

VISUAL_SOURCE:
- Arc最终Figma `5388:311`（30px视觉orb/44px热区与角包）；Drop沿历史反馈族与原T3/T4真实状态，未把缺失设计动画自称还原完。

RETIRED:
- “Promise resolve = 全部成功”的假回执分支。
- all-success立即隐藏所有结果；透明Arc矩形拦截空隙；初次身份未明时旧Arc先行出现。

VERIFIED:
- 10文件65测试通过；`pnpm exec tsc --noEmit`通过；相关`git diff --check`通过。
- 真实浏览器右拖已有项目节点到Glyth → 原引用草稿与近场Composer；最终显示“引用已交给会话”。回执(861.23,140.67,280,69)，Composer(1018,312,338,234)，不重叠。
- 最后reload后的新日志只有INFO，无新console error；不代表整个历史HMR会话从未有错。

UNRESOLVED:
- 多项partial在本fixture暂无自然触发入口；测试实际实例化CoreAssemblyClient和Host，仅HTTP结果模拟，不等同真实后端录屏。
- 全物种接收轮廓/回弹与通用Drop target覆盖仍未完成；这些已保留在NAV20/21当前状态。
- 初次pending Arc通过组件真实store切换回归，尚未补慢网实拍。

## 本批文件

- [huabu/apps/web/src/lcos/drop/dropCommitRouter.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropCommitRouter.ts)
- [huabu/apps/web/src/lcos/drop/dropTypes.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropTypes.ts)
- [huabu/apps/web/src/lcos/drop/dropAssemblyReceipt.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropAssemblyReceipt.ts)
- [huabu/apps/web/src/lcos/drop/LcosDropReceipt.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/LcosDropReceipt.tsx)
- [huabu/apps/web/src/lcos/lcosDropState.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/lcosDropState.ts)
- [huabu/apps/web/src/lcos/LcosHostOverlay.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.tsx)
- [huabu/apps/web/src/lcos/ui/nearfield/drop-feedback.css](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/nearfield/drop-feedback.css)
- [huabu/apps/web/src/lcos/LcosDropPreview.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosDropPreview.tsx)
- [huabu/apps/web/src/lcos/drop/dropAssemblyReceipt.test.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropAssemblyReceipt.test.ts)
- [huabu/apps/web/src/lcos/drop/dropFoundation.test.ts](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/drop/dropFoundation.test.ts)
- [huabu/apps/web/src/lcos/LcosHostOverlay.receipt.test.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/LcosHostOverlay.receipt.test.tsx)
- [huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/LcosActionArc.tsx)
- [huabu/apps/web/src/lcos/navigation/GlythStateActions.test.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/navigation/GlythStateActions.test.tsx)
- [huabu/apps/web/src/lcos/ui/nearfield/LcosActionOrbView.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/nearfield/LcosActionOrbView.tsx)
- [huabu/apps/web/src/lcos/ui/nearfield/LcosActionOrbView.test.tsx](E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web/src/lcos/ui/nearfield/LcosActionOrbView.test.tsx)

## 本批回归命令

工作目录：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/huabu/apps/web`

```powershell
pnpm exec vitest run --maxWorkers=2 src/lcos/drop/dropAssemblyReceipt.test.ts src/lcos/drop/dropFoundation.test.ts src/lcos/LcosHostOverlay.receipt.test.tsx src/lcos/LcosHostOverlay.test.tsx src/lcos/lcosDropState.test.ts src/lcos/LcosDropPreview.test.tsx src/lcos/navigation/GlythStateActions.test.tsx src/lcos/ui/nearfield/LcosActionOrbView.test.tsx src/lcos/navigation/actionArcGeometry.test.ts src/components/Common/boundedPopoverAvoidance.test.ts
pnpm exec tsc --noEmit
```

导航前三批文件/70项测试见 `navigation-implementation.md`；Arc局部避让/26项历史回归见 `arc-hit-avoidance-implementation.md`。次数存在交集，不相加冒充独立case总量。
