# 主画布材质与首屏产品身份修复

日期：2026-09-27

## 结论
真实画布背景原为 rgb(245,245,245)，覆盖了已有 Figma 变量 #FAFAFA。现 LCOS 模式沿用 `--gen2-canvas`，实测变为 rgb(250,250,250)。原网格、节点、相机和拖放 owner 保留。
初始 HTML title 从 Huabu 改为 LCOS，项目加载后仍由原项目标题 effect 接管。

## READ_SOURCE
- 原卡：`E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/04_逐Wave施工卡与验收.md`，Wave 1/2：LCOS 壳成为可见组合根、保留 Huabu kernel。
- 同目录 `12_Figma九面视觉统一与前端协作合同.md`：主画布、变量/样式翻译、生产 caller 验证。
- 最细采用说明：`E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/specs/main.json`，5392:3695。
- 生产源码：`huabu/apps/web/src/components/Panels/Canvas/Canvas.tsx` 根容器、`lcos/host/CanvasHostBoundary.tsx`、`lcos/ui/lcos-tokens.css`。

## ADOPTED
既有 Figma canvas 变量 → Canvas chromeMode=lcos 根容器 backgroundColor → CanvasHostBoundary → Main/Context/Workflow 同一 Canvas。
沿用现有 vendored Microsoft Huabu，MIT，pin `a3c411e1f655191344285141f08c4738fa6015f7`，本轮没有复制外部代码。

## VISUAL_SOURCE
Figma nFUdroLvI5qJZuYTW8h2rF，Main 5388:96、采用说明5392:3695、已有 Gen2 Canvas 变量，参考 `unification/main-final.png`。

## RETIRED
LCOS 模式下 vendor `bg-bg-default` 充当画布底色的最终呈现。普通 Huabu 模式仍保留原底色。
首个 HTML 响应 title=Huabu 的旧产品身份闪现。

## VERIFIED
- 真实浏览器 `http://127.0.0.1:5286/projects/lcos-gen2-dev/main`。
- 修前 Canvas 根容器计算样式 rgb(245,245,245)；修后 rgb(250,250,250)，token=#FAFAFA。
- 实际页面仍有1个背景网格和10个真实 fixture 节点。
- 真实点击 Arc 后可打开原 Composer；未发送到外部 Agent。
- Canvas.tsx ESLint 通过；小范围可逆材质修改未新增镜像测试。
- 截图：`root-main-current.png`（修前）、`root-canvas-material-fixed.png`（修后）。

## UNRESOLVED
截图项目为隔离验收 fixture，素材、节点数量、世界位置与 Figma 示例不同；本项只证明材质接入，不证明整套布局/功能已完全一致。
深色真实产品路径和全部九面仍需继续验收。
