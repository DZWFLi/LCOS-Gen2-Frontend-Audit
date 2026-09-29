# Workflow 手牌 → 真实现场与高数量卡池

日期：2026-09-26。

依据：最终用户原话回收裁决 `GEN2_ContextWorkflow_原话回收与FigmaT5增量裁决_20260911.md` §3.4、§7；Figma 5140:3012、5343:630 结构/文案；现有 WorkflowCardPool/HandOverlay caller。

## 实修

1. **进入成功收手牌**：原先 beginChildWorksiteNavigation 返回 true 后没有收回手牌。在同一Workflow组件只切workspaceId时，handOpen仍可能留着遮住真实画布。现由 CardPool 回调现有 HandOverlay.onClose。失败保留轻预览与错误，不因为点了入口就伪装已经进入。
2. **大量/搜索网格**：旧6+选择器假设slot是hand-cards的直系child，生产被task lane包裹所以失效。现在在真实task lane标明pool/hand，6+或有搜索时走网格，少牌仍保留扇形。复用原卡牌、滚动容器与选择owner。

文件：`surfaces/workflow/WorkflowCardPool.tsx`、`WorkflowWorksite.tsx`、`ui/workflow/workflow-hand.css`。没有改Core/topology/导航store。

## 验证

- 新导航回归3项：轻预览不收、成功进入收、失败保留原因、无画布不进入（后三场景合为三项测试）；原resolver3项也通过。
- 只读隔离浏览器压力测试：拦截仓库GET的ok/value响应，放入20张明确标“排版测试工作流”的卡，保留17个实际技能。未写Core，不能称为真实20条业务工作流。
- 37牌：1440宽4列，390宽1列；两种宽度末牌都能滚到；搜索剩1张也保持网格；slot transform均none，scrollWidth=clientWidth；5状态0页面错误。
- 桌面图与390图都保留底层真实画布及光幕，卡池未变成独立SaaS页面。
- 真实fixture没有可进入的Workflow child目标；进入收牌的完整路由回合目前仅单测证明，不补假workspace。

## 证据

- [压力脚本](./surfaces-workflow-pool-qa.cjs)
- [几何与DOM记录](./surfaces-workflow-pool-states.json)
- [1440卡池](./surfaces-workflow-pool-20-1440.png)
- [390卡池末项](./surfaces-workflow-pool-20-last-390.png)
- [搜索结果](./surfaces-workflow-pool-search.png)
- [32项当前状态](./surfaces-current-status.md)

## 仍未假补

Workflow region需要真实位置/范围与来源会话ID；Atlas组织轴需要真实数据producer；双组Reader需要按T4接现有窗口region。以上仍在清单，没有用静态占位图声称完成。
