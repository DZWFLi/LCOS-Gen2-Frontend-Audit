# N26 / N30｜节点远中近与 Glyth 连续缩放

本批把“缩小原卡片”改成按既有密度显示不同信息。已改善远中近辨识；不宣称完整 Glyth 接管动效已经做完。

## 采用与实际改动

- **READ_SOURCE**：Figma `5152:272` 远景、`5152:49` 中景、`5152:503` 近景；最终 Main `5388:96`、Glyth `5388:118/119`；T1 §14 文档语义缩放、§16 连续性、§26 接管约束；生产 `useLcosDensity / resolvePresentationDensity`。
- **ADOPTED**：四档唯一 density 保持原算法。mark 只读身份；summary 保留真实首句；working 保留真实关键段；reading 显示上游给出的所有预览。不重新生成摘要，不造大纲标题。
- **VISUAL_SOURCE**：纸面材料保持最终 Main 的纸面；文字保持无框；Glyth 保持 donor 黑色形体和白色眼睛，原 92px 基准不再按 mark 突然砍成 34px。
- **RETIRED**：删除 Glyth 34/92 硬切。文档摘录从 grid-item 中移入独立 clipping 容器，避免真实浏览器中 `display: flow-root` 让一行截断失效。按实际 zoom 保持标题约 12px、摘要约 11px 的屏幕可读度，媒体 caption 至少约 10.5px。
- **所有权**：不新增第二 LOD、不写节点世界坐标/尺寸、不自动改用户相机。布局函数只是消费 host 的 worldWidth/height/zoom；Glyth 接收反应、真实状态主动作、媒体播放链均保留。

## 实测与截图

原问题测量：文档 summary 屏幕宽约 102px，标题仍是 16 world px，即约 8.6 screen px；正文虽然 clamp=1，实际仍排出多行。Glyth mark 被缩成约 18 screen px。

修后中远景测量：标题达到 12 screen px，摘要真实一行；63% 时 Glyth 主体约 58 screen px。其连续尺寸不再随 density 边界突然变两倍。

- [远景 37%：材料身份与 Glyth 轮廓](nodes-lod-far.png)
- [中景 53%：真实一句摘录，材料与形体可辨](nodes-lod-medium.png)
- [近景 100%：关键段落、真实媒体、Glyth 表情](nodes-lod-near.png)

以上同一个隔离 fixture，只经已有 UI 缩放按钮和中键平移取景；未改 canonical 节点、未补假业务数据。初始远景/中景带原选中集合及其 Arc，近场避让由主代理另修。

**验证**：31 项针对性材料/媒体/密度/G02行为测试通过；Huabu web TypeScript 检查通过。包含真实句子映射、无内容不伪造、屏幕字号、Glyth密度边界前后连续、原PDF媒体链与会话主动作回归。

## 不能混成完成的余项

1. 上游 `buildContentPreview` 只给约 160 字并压平段落。reading 能展示全部“已给预览”，不能冒充全文/真实完整大纲。全文仍应使用现有 Reader；若要原位全文，需真实内容加载链另行接线。
2. N30 的 Glyth → 专业 WorkView 连续接管动画尚未增加。本批只解决 body 大小硬切、远景黑豆与字号问题。
3. 极远景的真实屏幕面积仍有限，长标题截断保留 tooltip；不会为了强行可读改相机或改变节点世界几何。
4. 无真实预览的工作流集合仍如实显示“暂无预览”；没有拿宣传图填充。

## 文件

- `huabu/apps/web/src/lcos/nodes/GlythNodeBody.tsx`
- `huabu/apps/web/src/lcos/ui/glyth/glythBodyLayout.ts`
- `huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx`
- `huabu/apps/web/src/lcos/nodes/source/sourceTypes.ts`
- `huabu/apps/web/src/lcos/ui/source/DocumentSourceView.tsx`
- `huabu/apps/web/src/lcos/ui/source/documentSourceLayout.ts`
- `huabu/apps/web/src/lcos/ui/source/sourceTextLayout.ts`
- `huabu/apps/web/src/lcos/ui/source/TextSourceView.tsx`
- `huabu/apps/web/src/lcos/ui/source/source-presentation.css`
- `huabu/apps/web/src/lcos/ui/source/materialReadability.test.tsx`
