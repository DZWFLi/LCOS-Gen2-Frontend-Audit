# 文档节点：真实结构与完整正文接通

日期：2026-09-27。范围：Document 材料节点及 source 对应呈现，不涉及 Core、相机/几何 owner、Context、Workflow、Shell。

结论：已把文档 reading 从“最多160字摘要”改为原文件完整 Markdown，并复用 Huabu Milkdown；summary/working 从真实正文提取结构，没有标题结构时显示真实段落。真实 Main 节点通过用户 resize 已进入 reading，撤销后恢复原节点几何和 summary。

## READ_SOURCE

绝对根：`E:/TRAE项目/LCOS0.1收口`。

- `LCOS_GEN2_GUI_RECOVERY_20260926/AGENTS.md`：原卡→细指引→donor→生产caller逐项读取。
- `_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T1/LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md`：§7–8 文档正文、§14 Document Semantic Zoom、§15物种矩阵。明确 mark身份、summary真实outline hint、working结构/关键块、reading full。
- 同目录 `42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md`：§3.1内容即身体、§3.4同对象晋升、§4.3 LOD；不复制第二实体、阈值或相机。
- `_cabin/05_donor源码/LCOS_GEN2_前端源码Donor精选包_20260914__unzipped/GEN2_前端源码Donor精选包_20260914/03_GEN1_PROVEN_DONORS/repo/apps/web/src/features/spatial/documentSemanticZoom.ts`：extractDocumentHeadings/documentOutlinePreview，采用从正文派生heading的思路，不迁移其.36/.72阈值与强制expanded逻辑。
- 当前生产：`huabu/apps/web/src/lcos/nodes/LcosSpeciesBodies.tsx`、`nodes/source/DocumentSourceMorphology.tsx`；`apps/web-gen2/src/host/projectionFacade.ts::readPreview`；`apps/web-gen2/src/backend/artifacts.ts::getFileRecordText`；`components/Nodes/note/NoteNode.tsx`；`components/Milkdown/MilkdownPreview.tsx`；既有 `nodeHydrationScheduler.ts`。

## ADOPTED

旧错误有精确证据：projectionFacade 先去Markdown、压平为160字符preview，DocumentSourceView再取首句/前三句；reading只把该preview原样显示，无法恢复全文和结构。真实Main所有Note的data.content都是空，因此不能假称已复用native正文。

实际改动链：

1. `LcosSpeciesBodies.tsx` 只向 source 薄传已有 `projectId/fileRecordId`，不改任何实体几何或正文存储。
2. `nodes/source/sourceTypes.ts` 增加这两个既有身份参数。
3. `DocumentSourceMorphology.tsx`：Markdown/text MIME文档复用 `createLcosCoreSession().artifacts.getFileRecordText`；mark不读取，其他可见密度走现有hydration队列。切文件/卸载AbortController取消，key隔离旧内容，忽略迟到响应；失败保留真实preview并允许近景重试。PDF路径保持原实现。
4. `ui/source/documentSourceLayout.ts`：只从原Markdown派生真实heading，排除代码围栏；首H1不重复充当outline，headingless回退真实段落。仍消费原density，不新增阈值。
5. `DocumentSourceView.tsx`：reading完整原Markdown交原 `MilkdownPreview`，只读；原206×154纸张物种保留。正文局部可滚动，不将reading裁成12行或160字。
6. `source-presentation.css`：仅Document全文局部布局/字体继承/滚动；没有改共享token。

## VISUAL_SOURCE

Figma文件 `nFUdroLvI5qJZuYTW8h2rF`，最终Main `5388:96`。

- 文档 `5388:106`：206×154。
- 纸张 `5388:107`：奶白纸面、轻阴影，内容占主体。
- 标题 `5388:108`：x18/y15，16px、25px行高。
- 正文 `5388:109`：x18/y51，13px、21px行高，实际分段文字。
- 原数据：`_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/structures/main/nodes-000.json`。

本轮保持当前纸张材质与既有可读性缩放，修真实内容层级；没有把示例“关于出发”或广告正文写进真实项目。

## RETIRED

- 退役：reading等于descriptor.preview的伪全文；从压平摘要推测文档结构。
- 保留：160字列表预览作为加载/失败fallback、统一density owner、PDF渲染、node identity、Core文件出口、Milkdown只读机制、resize/undo owner。
- 不改Core，不新增fetch协议、编辑器、存储、相机或导航。

## VERIFIED

1. 真实Main `/projects/lcos-gen2-dev/main`：summary/working节点显示真实段落；实际文件只有首H1时不会重复显示文件标题冒充outline。
2. `file-positioning`真实文件完整渲染296字，含原160字符之外的 `canvasId、camera、selection、layout 与 history` 尾段。
3. **真实生产reading**：选中项目定位节点，通过原生右下resize从屏幕110.4×82.53拖至525.19×302.25；统一owner自然判为reading，原Milkdown显示完整正文。截图：`document-reading-real-resize.png`。
4. Ctrl+Z后确认几何回到110.4×82.53，density恢复summary，节点/正文身份不变。
5. 辅助生产组件验证图 `document-reading-production-component.png` 使用同一真实file-positioning，不是假全文；正式reading可达证据以上述真实resize图为准。
6. `document-working-after.png`为真实相机缩放进入working；早期summary图 `document-summary-after.png`拍在H1重复修正前，不作为最终summary验收图。
7. 新测试 `DocumentSourceBehavior.test.tsx`：mark零请求、真结构、超过160字完整reading、切修订/卸载取消与迟到响应、失败保留与重试、代码围栏不冒充heading。连同 `materialReadability.test.tsx` 共2文件8例通过，单worker串行。
8. Huabu web `tsc --noEmit` 通过；`git diff --check`通过。

修前图不伪造：既有 `text-paragraph-main-after.png`中的文档仍是旧preview方案；本批另外以原caller/code证明160字上限，没有把新截图标成before。

## UNRESOLVED

- 原206px宽文档在相机最大2倍时仍不足reading所需480px屏幕宽；通过用户resize可达reading，已实测。本轮不改统一owner阈值。
- 大文件/多文档压力未宣称完成：读取使用当前getFileRecordText完整响应，hydration限制同时启动，但没有新增跨节点缓存或字节限额。当前projection预览读取和文档结构读取可能各读一次同一文件；后续可在既有读取owner优化，不能把正文再截短伪装解决。
- 若源为无结构纯文本，只显示真实摘要，不生成假的大纲。
- Canvas内富文本编辑、块拖出、Reader晋升/滚动记忆不在本项改动范围；目前全文是只读Milkdown，不能报告整套文档编辑链已经完成。
- 没有验证所有Markdown插件、公式/大表格/图片的极端排版；原Milkdown负责解析机制。

本批文件：`LcosSpeciesBodies.tsx`、`sourceTypes.ts`、`DocumentSourceMorphology.tsx`、`DocumentSourceBehavior.test.tsx`、`DocumentSourceView.tsx`、`documentSourceLayout.ts`、`source-presentation.css`。

最终summary整页图：document-summary-final.png（真实resize后撤销回原几何与最终摘要逻辑）。

## 收尾补验：Milkdown 内部字号覆盖已修正

根代理目视指出reading正文偏小，经真实DOM证实：`--lcos-document-body-size=20.5258px`，但Milkdown自身为16px，`p`又被原生 `.milkdown .ProseMirror p {font-size:0.875rem}` 固定成14px。在camera scale=0.535912时仅 **7.50屏幕像素**；此前继承只做到外层，未贯穿真实正文。

仅在 `source-presentation.css` 的 Document全文域内，让milkdown/ProseMirror显式消费既有document-body-size，段落/列表/表格/代码继承该基准；不改全局Milkdown样式、节点几何或density阈值。

最终实测：p=20.5258px × 0.535912 = **11.0000屏幕像素**，符合既有layout的11px正文下限；line-height=31.8149世界像素。最终真实reading验收图改为 **document-reading-real-resize-legible.png**，较早reading-resize图保留为该字号问题的before证据。用户resize后再次Ctrl+Z还原几何。diff check通过；纯CSS不重复全仓tsc。
