# NC-07 Office/PPT — Exact Construction Card v1

## 0. 卡片状态

```text
Huabu baseline: a3c411e1f655191344285141f08c4738fa6015f7
Species: Office Artifact View (docx / pptx / xlsx)
Card status: PARTIAL READY
Mechanical host: Huabu OfficeNode + OfficePreview + NodeWrapper
Reuse posture: DIRECT USE current Office stack; add LCOS slide/page adapter only
```

## 1. Latest Huabu truth

| 项 | 当前实现 |
|---|---|
| Canvas body | `office/OfficeNode.tsx` |
| Preview | `office/OfficePreview.tsx` |
| Formats | docx / pptx / xlsx |
| Default geometry | `400 × 400` |
| Height | manual；refWidth 400；min content scale 0.5 |
| Canvas morphology | 72px 格式图标 + Word/PowerPoint/Excel label + title + 最多5行 summary |
| Preview content | server OfficeLoader 提取的 Markdown，只读 MilkdownPreview |
| Actions | Preview / download original |
| Scroll | Preview 使用 scrollViewKey 恢复 |
| Missing | MissingFileBanner，禁用 actions |
| LOD | current 未 opt-in Huabu binary minimal |
| Native slide/page rendering | NOT PRESENT |

## 2. 能直接沿用的部分

- Office 格式识别与统一入口；
- source/download/missing 处理；
- static Canvas card 与 format-specific icon；
- extracted Markdown Preview；
- Preview Workspace、scroll memory、NodeWrapper、resize；
- server preprocessing/OfficeLoader 输出路径。

这些不得重写。

## 3. LCOS PPT 完整度缺口

LCOS 要求 PPT/PDF 当前页级备注与 current slide 身份。最新 Huabu Office Preview 只提供提取 Markdown，无法证明：

- slide thumbnail；
- current slide/page locator；
- slide visual fidelity；
- page-region fragment；
- 返回原应用当前 slide。

因此 Office 通用卡可以复用，PPT 专业 face 仍是 `PARTIAL`。不能用一个自制 slide renderer 填坑；应优先复用现有 OS/Office preview service、已批准转换服务或源应用能力。

## 4. Face 合同

### Generic Office face（DIRECT USE）

```text
format identity
→ title
→ extracted summary
→ Preview/download
```

### PPT enhanced face（ADAPTER REQUIRED）

```text
current slide thumbnail
→ slide number/count
→ file title
→ optional summary/status
```

如果当前环境没有成熟的 slide thumbnail donor，保持 generic Office face，不得伪造视觉预览。

### DOCX/XLSX

- DOCX：沿用 extracted Markdown 阅读；未来真实分页不是 Phase 1 必需；
- XLSX：当前 extracted Markdown 只是降级阅读面，不能冒充 Excel 网格编辑器；
- 源文件编辑继续交给 source application，不自研 Office editor。

## 5. 状态合同

| 状态 | 显示 | 规则 |
|---|---|---|
| rest/hover/selected | 沿用 OfficeNode/NodeWrapper | 内容 geometry 不变 |
| preprocessing | 稳定 card + loading | 不阻塞 canvas |
| extracted-ready | summary + Markdown Preview | 标明只读/派生 |
| no-extracted-content | format identity 保留 | 明确尚无提取内容 |
| missing/stale | banner 或旧可信 preview +状态 | 不静默覆盖 |
| slide-locator-ready | current slide thumbnail/number | 仅在真实 adapter 可用时 |
| pending-review | Return Zone/Revision 状态 | 不覆盖 Current |

## 6. LOD

Office current 未接 binary minimal。只允许扩展 Huabu 现有 LOD owner：

- full：现有格式卡或真实 slide thumbnail；
- identity：format icon + short title；
- threshold 与 Image/Video/Office media family 一起浏览器校准；
- selected/focused/pending 保留状态；
- 不新建 Office zoom store。

## 7. Adapter 决策

实现前必须确认：

1. PPT thumbnail 来自哪个现成 donor/service；
2. pageIndex canonical base；
3. slide note anchor 是否复用 `NoteAnchor.page`；
4. Office preprocessing output 是 cache 还是 derived Artifact；
5. 源文件外部修改后的 locator/revision 处理；
6. Windows Office/LibreOffice/其他 provider 的能力与回退。

## 8. Browser acceptance

1. docx/pptx/xlsx 格式、下载名、missing 路径正确；
2. Preview 只读、Markdown scroll 恢复；
3. 没有 slide donor 时不显示伪 thumbnail；
4. 有 adapter 时 current slide number/thumbnail 与源文件一致；
5. 外部修改进入 stale，不漂移 note locator；
6. Canvas 不挂 Office editor/大型转换 runtime；
7. identity LOD 复用 Huabu owner，无第二 store；
8. reduced motion、resize、render-count 合格。

## 9. Card verdict

```text
GENERIC OFFICE = DESIGN READY / DIRECT USE
PPT CURRENT-SLIDE FACE = HOLD FOR EXISTING DONOR + ADAPTER
REWRITE OFFICE/PPT RENDERER = REJECTED
```

