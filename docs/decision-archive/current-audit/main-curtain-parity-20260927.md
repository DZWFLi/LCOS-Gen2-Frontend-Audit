# Main 呼出层与真实画布的视觉层级补接

日期：2026-09-27。生产恢复树：`E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926`。

## 问题与修改

Context/Workflow 原已有底层场景衰减，而 Main 共用这两个呼出层时没有接入，底层文字、连线与图片保持完整对比。沿用原来的真实 Canvas，只补 Shell 现有 mainAtlasOpen/mainHandOpen 状态到 CSS 的呈现属性；不新增窗口、画布、状态仓库或业务状态，不隐藏现有功能。

## 六字段

READ_SOURCE：`E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_GEN2_Figma设计合同轻包_仅MD_20260914__unzipped/03_ContextWorkflow产品语义裁决.md` §3.1–3.4；同舱 `LCOS_Figma_全设计包_20260913/pages/5136-49/frames/5140-3012/nodes-*.json` raw层；当前 `LcosProjectShell.tsx`、`MainWorksite.tsx`、`WorkflowWorksite.tsx`、`LightCurtainBackdrop.tsx`及light-curtain.css。

ADOPTED：现有 Context/Workflow light-curtain.css 的真实场景 alpha → MainWorksite 内已有 LcosWorksiteStage；由 LcosProjectShell 的既有开合状态决定，HUD与专业窗口不参与此透明度。

VISUAL_SOURCE：5140:3013真实场景 opacity=0.6600000262、5140:4159空间退后雾opacity=0.1199999973、5140:4160底层光幕渐变。Main手牌沿用0.66，Atlas沿用已采用0.22；未擅自修改Figma涂料。当前只补漏掉的跨入口接线。

RETIRED：Main呼出层开启但真实场景仍保持opacity=1的遗漏行为；保留所有原Canvas及其交互状态。

VERIFIED：真实Main手牌开启computed opacity=0.66且Canvas=1；Esc后=1；集合总览开启=0.22且项目HUD=1；再Esc还原=1，Canvas仍1，焦点回到“打开集合总览”。已目视复核整页修后截图。生产浏览器为隔离e2e项目，素材缺真实预览时保留暂无预览。

UNRESOLVED：完整视觉一致性尚未达成，尤其真实封面供给、文档全文与真实Context子现场数据证据仍有缺口。此项不代表所有光幕动效/场景全量验收。

## 图像

- [修前Main手牌](main-hand-attention-before.png)
- [修后Main手牌](main-hand-attention-after.png)
- [修后Main集合总览](main-atlas-attention-after.png)

未提交、未推送；整套GUI恢复目标继续进行。

追加验证：390×844且prefers-reduced-motion=reduce时，手牌开启opacity=0.66，关闭=1；computed transitionDuration=0.00001s（受项目全局减动效规则影响，实际无可见过渡）。Shell单文件ESLint通过。
