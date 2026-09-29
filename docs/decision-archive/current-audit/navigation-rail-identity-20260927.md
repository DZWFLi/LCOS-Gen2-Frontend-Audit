# Railway身份、动态长度与真实Pin覆盖 · 2026-09-27

## 结论

Main左轨空白本身不是丢组件：实际GET view-rail-order返回 orderedRefs=[]、version=0。遵循用户“有了才变长”，不填静态三根入口冒充目的地。

本轮修复另一个可复现生产缺口：切项目后，Rail原先继续显示前一项目目的地和Receiver，直到新响应回来；这些旧对象甚至会按新projectId注册Drop目标。现以projectId为React生命周期边界重挂Rail的展示状态，清旧身份/预览/注册，而不是建立第二份数据。

## 真实Main读取和交互

- GET /projects/lcos-gen2-dev/view-rail-order：200，orderedRefs=[]、version0。
- GET /projects/lcos-gen2-dev/color-pins：200，一组#CE824C、一条成员关系；成员为现有工作流scope。
- 顶部岛确实显示一个彩色标；节点有“管理 真实工作流导入验收 的彩色标：#CE824C”本地角标。[Main截图](navigation-real-main-inventory.png)
- 实际中键拖相机将成员带出视口，生成独立edge浮游标，label=前往 真实工作流导入验收；岛的Pin仍为1。[出画截图](navigation-real-pin-offscreen.png) · [日志](navigation-real-pin-offscreen.log)
- 点击浮游标准确回到node-824ade94-9599-47db-b2d5-7f5f4c3e63d9；DOM位置x1258.85/y216.61，尺寸157.15×154.61，在1440视口内，节点本地角标存在。[到达截图](navigation-real-pin-arrival.png) · [日志](navigation-real-pin-arrival.log)

## 只读合成响应矩阵

独立 railway-fixture.html 挂生产LcosRailway；浏览器只拦截合成项目的GET响应，拒绝写方法，不写canonical数据。不能把此处截图当真实Rail持久化验收。

| 目的地数 | 可见图标 | 主轨尺寸 | 溢出 |
|---|---:|---|---|
| 0 | 0 | 不显示 | 无 |
| 1 | 1 | 52×52 | 无 |
| 4 | 4 | 52×178 | 无 |
| 20 | 4 | 52×178 | +16 |

与Figma page5036:50 / frame5385:283中5385:255的52×52、4项52×178几何一致。切到B并刻意保持B读取pending时，旧目的地立即0；B空响应到达仍0，监测写请求0。

[矩阵数据](railway-readonly-browser.json) · [原始日志](railway-readonly-browser.log)
[单项](railway-readonly-1.png) · [四项](railway-readonly-4.png) · [20项](railway-readonly-20.png) · [切项目pending](railway-project-switch-pending.png)

已目视检查四项截图。合成项目都是scene，所以图标同形；这不能证明自定义形状/颜色身份已经实现。

## 验证与边界

- 回归先失败：p→next且next请求挂起，旧scene:0仍在DOM；修后通过。
- 2测试文件8项通过，包含已有重排/CAS冲突与Receiver状态回归；TypeScript通过。
- 本轮未更改Rail主体样式，不宣称材质已逐像素等同Figma。
- 自定义Rail/导航形状持久化、真实20目的地重排与完整跨项目端到端数据仍缺证。本轮不造这些真值。

## 回传六字段

READ_SOURCE: E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T2/LCOS_Gen2_T2_C2-1C_Railway_ExactSourceBlueprint_20260907.md §0/§1、项目级读取owner、§93；真实RailwayProjection、LcosRailway和GET响应；用户最终纠正“按数量增长、与底部常驻三入口分开”优先于旧卡Surface roots措辞。

ADOPTED: 已有React key项目生命周期→LcosRailway外层→原ProjectRailway状态/读取/Drop注册；原Core orderedRefs保持唯一真值。无新donor复制。

VISUAL_SOURCE: E:/Codex 项目/OS开发/exports/LCOS_Figma_全设计包_20260913/unification/structures/railway/index.json及nodes-000.json；page5036:50、frame5385:283、单项5385:255；原底座36×36和glyph21×21保持。

RETIRED: 不同projectId复用上一项目Rail snapshot/receiver/peek/Drop DOM的旧行为。

VERIFIED: railway-project-identity-tests.json；真实Pin出画→edge浮游标→到达；只读Rail矩阵与切项目pending截图。

UNRESOLVED: 自定义图标/染色持久化、全真实Rail矩阵、视觉像素级匹配未全部完成。
