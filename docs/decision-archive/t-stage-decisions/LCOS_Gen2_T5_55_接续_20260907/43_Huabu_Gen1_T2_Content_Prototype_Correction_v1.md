# Huabu × Gen1 × T2 内容原型纠偏 v1

日期：2026-09-07

## 任务摘要

根据用户反馈，纠正内容原型中 Focus 偏移、Huabu 视觉缺失以及 Gen1 双形态切换缺失。

## 实际范围

- Focus 从写死偏移改为按目标实际屏幕矩形与当前 safeRect 计算；标记为 T2 seam simulation，未冒充 production 已接通。
- Image 改为 Huabu/Gen1 的 material-face 语言：内容本体、轻圆角、底部渐隐 caption、低 chrome。
- Markdown Document 改为 Huabu/Gen1 的 readable-paper 语言：轻微纸面裁切、低阴影、正文优先。
- 恢复 Gen1 `text ↔ mindmap` 同源双形态：只切 `noteLayout`，canonical Markdown body 与 entity/projection 不变。
- 保留 Huabu Preview 的 `WYSIWYG ↔ raw Markdown`，并与 Gen1 双形态明确分层。

## 变更流程

```text
旧：generic body → Rich/Markdown toggle → hard-coded Focus offset
新：Huabu material body → Gen1 text/mindmap projection → Huabu preview edit mode → T2 safeRect Focus request
```

## 修改文件

- `C:\Users\1\.codex\visualizations\2026\09\06\01a077aa-e302-7723-b1ec-5e53cceae58e\opendesign\mockups\t1-content-granularity\index.html`

## 验证结果

- Document 选择后 Focus：camera 从 `x0 y0 z1.00` 变为计算结果 `x-270 y45 z1.14`，目标视觉中心对齐当前 safeRect。
- 正文 → 导图：contract 显示 `Gen1 same-body · map`；entity/projection 不变。
- 打开右侧 Work View：camera 读数保持 `x-270 y45 z1.14`；contract 显示 `camera-frozen`。
- 页面和直接原型 URL 均返回 HTTP 200。

## 证据路径

- 原型：`http://127.0.0.1:8289/opendesign/mockups/t1-content-granularity/index.html`
- Huabu current：`NoteNode.tsx`、`NotePreview.tsx`、`MilkdownFloatingToolbar.tsx`
- Gen1：`CanvasNodeVisual.tsx`、`InlineNoteEditor.tsx`、`MindMapNoteVisual.tsx`、`documentSemanticZoom.ts`

## 风险与未完成

- T2 Focus production consumer 尚未在本原型中真实接入；当前只验证计算与视觉契约。
- Mind Map 为轻量交互示意，尚未复刻 Gen1 的完整树编辑、Tab/Shift+Tab、drag reorder 与双击编辑。
- 未修改 Gen2/Huabu 仓库；当前仓库脏状态仍不适合施工。

## 回滚

删除本独立原型目录即可，不影响任何产品代码或 canonical 数据。
