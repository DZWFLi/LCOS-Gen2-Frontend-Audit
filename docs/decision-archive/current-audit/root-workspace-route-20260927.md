# 显式根现场误判子现场：路由修复

结论：已修复。显式 workspaceId 只是寻址方式，不能据此判断子现场。

## READ_SOURCE
- 原T2 C2-1D 根Surface/子现场边界，T4 Scope与WorkView区分。
- LcosProjectRoute.tsx 原实现将任意 workspaceId 传为 childWorkspaceId。
- useLcosWorksite.ts 已读取 graph root scope，但未返回该身份；Shell依childWorkspaceId显示返回/时间轨。

## ADOPTED
- useLcosWorksite返回现有rootScopeId，没有新状态。
- Route依workspace.scopeId匹配真实rootScopeId，并确认该scope内preferredSurface唯一，识别根现场。完全不依赖标题、数组首项或canvas是否存在。
- 普通项目入口移除根workspaceId并跳到对应root surface，保留其它query和hash。
- legacy /canvas override保持URL原样，传root surface且不传childWorkspaceId。
- 真子现场/未知目标继续进入原child/unavailable owner。

## VISUAL_SOURCE
- [根Context纠正后的真实界面](root-workspace-route-corrected.png)
- [未知目标诚实不可用状态](root-workspace-route-missing.png)
真实服务5286，项目lcos-gen2-dev。未拦截Graph或伪造canonical数据。

## RETIRED
退役“URL含workspaceId就是子现场”的判断；没有删除原Shell不可用态和返回链路。

## VERIFIED
- LcosProjectRoute.workspace.test.tsx：4/4通过，覆盖缺canvas根、legacy override、真子、未知目标。
- 全web TypeScript --noEmit通过。
- 三文件ESLint通过无输出。
- 浏览器访问/context?workspaceId=workspace-real-context，最终URL=/context；时间轨0，无返回来源按钮，根Context入口存在。
- 浏览器访问/context?workspaceId=missing-nav-audit，参数保留，显示“找不到指定的工作现场”和workspaceId；未伪装成根成功。

## UNRESOLVED
本批不是子现场加载全矩阵验收；真实子workspace无canvas的状态仍由已有Shell处理。歧义的根preferredSurface不会猜一个目标，保留原显式路径。没有改Shell、Temporal、Core、窗口拓扑。

生产文件：huabu/apps/web/src/lcos/app/LcosProjectRoute.tsx、useLcosWorksite.ts。
测试：同目录LcosProjectRoute.workspace.test.tsx。

### 原件追溯补充
- T2原卡：[C2-1D](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T2/LCOS_Gen2_T2_C2-1D_Worksite_Enter_Active_Back_ExactSourceBlueprint_20260907.md)，§45 SurfaceDock Uses Same Session Controller、§46 SurfaceDock always root。
- T4原卡：[Scope/Work View考古](E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T4/T4_Context_Workflow_Scope_WorkView_Archaeology_20260905.md)，§2.3 当前产品真相、§3.1 CURRENT_TRUTH（Scope ≠ Child Canvas）。
- Figma视觉承载：[ProjectShell 5386:436](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5386-436)、[HUD 5388:27696](https://www.figma.com/design/nFUdroLvI5qJZuYTW8h2rF?node-id=5388-27696)，由本仓 docs/construction/FIGMA_SOURCE_LEDGER.md 的FIG-HUD条目追溯。本批是路由身份修复，没有声称这些Frame定义了canonical根判定，也未重新读取Figma远端。
