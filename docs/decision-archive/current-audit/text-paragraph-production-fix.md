# 轻文本真实分行恢复 · 20260927

结论：当前中景短句挤成一行，有一项确定原因是**预览生成器把原文换行抹掉**，不是字体大小或节点尺寸不足。本批修复这条真实生产链；没有为了模仿截图改正文、放大节点或发明换行位置。

## 原件阅读与边界

- `E:/TRAE项目/LCOS0.1收口/_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T1/42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md` §3.1、§4.3：lightweight Text是轻文本本体，不能冒充Markdown文档；full/compact/identity是同一内容呈现。
- 同目录 `LCOS_T5_from_T1_Exact_Implementation_Input_Blueprint_20260907.md` §6（Note与managed Markdown区别）、§13（同一canonical Markdown多face）、§14（full/outline/title与唯一density owner）。
- Figma Main `5388:96` / Text `5388:102`；本地 `E:/TRAE项目/LCOS0.1收口/_cabin/06_Figma/LCOS_Figma_全设计包_20260913/unification/main-final.png`，已目视核对两行短句。
- 实际fixture正文 `E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/.e2e-data/core/workspace/brand-statement.e2e-fixture.txt` 为“越过边界，\n看见下一座山。”。仅只读核对，文件未修改。

## 问题证据

`buildContentPreview` 原来对所有物种使用 `/\s+/g → 空格`。虽然 TextSourceView 的样式为 white-space:pre-line、summary允许两行，真实producer却早已丢掉换行。因此原文和Figma的两行短句在production中变成一行。

文档summary当前一行摘录是另一个映射；原T1要求的真实结构摘要/原位全文仍未完全进入生产。本次没有为统一视觉把所有document都转成轻文本，也没有把160字预览叫全文。

## 改动

1. `buildContentPreview` 新增可选 `preserveLineBreaks`，默认仍保持原文档单行摘要行为。
2. 原 `projectionFacade.readPreview` 用现有 `resolveVisualFamily` 判定轻文本，只有text family打开该选项。Markdown、document和file/text类的原摘要继续保持。
3. 轻文本规范化CRLF为LF、收敛行内连续空白、多空行为单个段落间隔，保留真实行边界。截断仍按现有160字符上限；没有在标点后凭空断行。
4. 原缓存键增加呈现模式，避免同一FileRecord同时作为document摘要和轻文本显示时串用缓存。仍是同一个现有缓存，不加存储/状态owner。

## 验证

- 真实Main冷加载 → Core FileRecord文本读取 → projectionFacade → node descriptor → 原TextSourceView，非静态替代组件。
- 修前DOM：`越过边界， 看见下一座山。`。
- 修后DOM：`越过边界，\n看见下一座山。`，两条真实文字矩形Y=473.90/492.66。
- 原节点world尺寸385×142、summary密度、两行clamp不变；未改相机或canonical几何。
- 4条现有文档summary内容仍为原第一句，未被这次选项污染。
- 7项descriptor测试通过：CRLF、多空行、行内空白、空正文、正好截断在换行前/换行后/长度边界、文档列表摘要不变。
- `apps/web-gen2` TypeScript检查通过，`git diff --check`通过。
- 已目视查看前后节点截图。

## 六字段回传

- **READ_SOURCE**：以上两份原T1原卡精确章节、真实fileRecord对应正文；`projectedNodeDescriptor.ts/buildContentPreview`、`projectionFacade.ts/readPreview`、`TextSourceView`、`sourceTextLayout`、`DocumentSourceView/documentSourceLayout`。
- **ADOPTED**：既有轻文本pre-line视图与真实内容 → 同一buildContentPreview可选换行策略 → production readPreview caller → descriptor.preview → LcosSpeciesBodies → TextSourceView。没有新donor移植。
- **VISUAL_SOURCE**：Figma Main5388:96，轻文本5388:102；保留原文明确两行，近景不另造字号系统。
- **RETIRED**：轻文本生产预览无条件折叠所有换行的行为；文档默认摘要行为未退休。
- **VERIFIED**：真实生产冷加载前后截图、DOM文字/行矩形/world尺寸、7项边界测试、web-gen2 tsc。
- **UNRESOLVED**：Document当前summary仍是第一句而非真实heading结构提示；working/read仍受160字预览上限，不是完整正文/大纲/导图。原卡这些要求尚未完成。多face编辑、Caret/scroll/promotion连续性仍需另批。极远景mark仍按既有owner显示标题/身份，不强行塞完整段落。

## 文件与证据

- `E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/presentation/projectedNodeDescriptor.ts`
- `E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/src/host/projectionFacade.ts`
- `E:/TRAE项目/LCOS0.1收口/LCOS_GEN2_GUI_RECOVERY_20260926/apps/web-gen2/test/projected-node-descriptor.test.ts`
- [修前节点](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/text-paragraph-before.png)
- [修后节点](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/text-paragraph-after.png)
- [修后真实Main](E:/TRAE项目/LCOS0.1收口/GUI全量对齐_20260926/text-paragraph-main-after.png)

本批没有改Core、Shell、Stage、Atlas，没有commit/push；不宣称文档颗粒度全量完成。