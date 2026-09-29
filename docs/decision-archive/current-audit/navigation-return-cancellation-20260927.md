# 回程取消与首帧相机竞争修复 · 2026-09-27

## 结论

上一轮两个明确断点已有实际进展：正常运动模式首帧立即进入连续3次成功；返回加载中切换根现场，迟到响应不再抢回路由或覆盖新根画布。正常返回也实测通过。

## 修复内容

- 首屏自动取景过去仅在“过渡目标画布等于当前画布”时让位。进入的approach阶段目标尚在另一个画布，自动fit仍能打断RF动画，导致动画Promise不结束。现在任何显式worksite过渡都优先，且排队的fit在真正执行前重查现有意图。没有新增计时器或相机owner。
- 回程的return-restore意图由原返回动作保留到加载、投影重建及路由提交结束。相机动画完成仅恢复镜头，不再把“动画完成”伪装成“导航取消”。
- 原LcosProjectShell回程主体抽为 navigation/returnToSourceWorksite.ts，由原按钮调用；每个异步边界复核原意图。新根切换消费旧意图之后，迟到回程不会选择节点、清历史或改路由。
- 无捕获镜头的旧返回历史继续采用已加载owner视角，原返回动作结束时消费意图，不永久等待缺省值。
- 无Local Core/backend修改，无第二套导航/Canvas/store，无S11窗口拓扑修改。

## 浏览器证据

使用现有DEV场景 nav12-fixture.html + 生产导航helper、真实Huabu读取器、原RF相机及根切换hook。投影/工作现场身份为测试fixture，不能当完整产品用户旅程验收。

1. 首帧正常运动：刷新后直接点击，无700ms人为等待，连续3次真实读取目标成功。
   [日志](navigation-first-frame-entry.log)
2. 正常返回：returned；Canvas owner回到nav12-test-only，URL回/main；监听没有POST/PUT/DELETE。
   [日志](navigation-return-normal.log) · [截图](navigation-return-normal.png)
3. 回程取消：用浏览器路由拦截暂缓真实源画布GET；点击根切换并完成，再放行旧GET。回执cancelled，URL仍/main，实际Canvas仍canvas-171d1990-29a9-45ba-b5ea-08227ac2e577。
   [日志](navigation-return-root-wins.log) · [截图](navigation-return-root-wins.png)

## 回传六字段

READ_SOURCE: 上一轮navigation-closure-20260927.md明确未闭合条目；T2 C2-1D原卡§§34–44的两阶段导航、latest wins、旧响应不污染历史；现有LcosCanvasCommands首屏fit/transition消费、worksiteCameraTransition、LcosProjectShell回程、waitForProjectedEntity、useLcosWorksiteNav。

ADOPTED: 原LcosProjectShell.returnToSource主体→navigation/returnToSourceWorksite→同一Shell返回按钮；保留原switchCanvas、waitForProjectedEntity、RF和shell.worksiteCameraTransition。没有新donor复制。

VISUAL_SOURCE: 延续已有Context/Workflow子现场及返回导航视觉；本项修动作连续性，不改Figma形态。

RETIRED: return-restore动画结束即消费导航意图；await加载或投影重建后的迟到return仍强行navigate；首帧自动fit覆盖显式approach。

VERIFIED: 上述3类浏览器路径；navigation-cancellation-tests.json（加载失败、正常返回、加载中取消、投影等待中取消、原进入/根切换/Shell回归）；tsc通过。测试执行有原Shell测试环境socket hang up日志，测试断言仍通过，不冒充零控制台警告。

UNRESOLVED: 真实canonical多层子现场/全部跨项目矩阵、真实材料重建的端到端恢复尚未全验；手动缩放或其他第三方相机动作打断approach的全组合尚未验。目标是此断点修复，不宣称整个导航或Gen2已经完成。

最终验证数字：5 个测试文件、19 项通过、0 失败；Web TypeScript通过；ESLint 0错误（DEV fixture原非空断言1条warning）；git diff --check通过。
