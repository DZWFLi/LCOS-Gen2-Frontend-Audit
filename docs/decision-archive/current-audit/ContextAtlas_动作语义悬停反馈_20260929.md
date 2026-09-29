# Context Atlas 动作语义悬停反馈｜2026-09-29

结论：补上“打开现场 / 选择现场 / 定位已有投影”的鼠标悬停提示。卡片点击和右下角箭头原本执行不同真实动作，但提示只有 `aria-label`，视觉用户只看到同一个箭头；现在两处交互命中区都会显示现有动作名，不改动作、owner、布局或数据。

| 对照项 | 证据与结果 |
|---|---|
| READ_SOURCE | `E:\TRAE项目\LCOS0.1收口\_cabin\06_Figma\LCOS_GEN2_Figma设计合同轻包_仅MD_20260914__unzipped\03_ContextWorkflow产品语义裁决.md` §3.2（Atlas 集合→child canvas）；§3.4（真实 Workflow 定位与 child canvas 语义）；§5 Context/Workflow；`E:\TRAE项目\LCOS0.1收口\_cabin\01_正本\GEN2_新前端重新总装正本_20260913\references\figma-master\LCOS_Figma_前端施工完整采用清单_20260913.md` Context/Workflow 项；§7.3 Context 连续动作。 |
| VISUAL_SOURCE | 现有 `ContextAtlasStage.tsx` 注释指向 Figma Atlas `5388:24294` / Collection `5333:96`；沿用既有 `collection-enter.svg` 箭头及卡片布局，不改 Figma 几何。 |
| 生产入口 | `huabu/apps/web/src/lcos/surfaces/main/MainCollectionAtlas.tsx:60` 调用 `ContextAtlasStage`；不是孤立 Gallery。`ContextAtlasStage.tsx:85-114` 按真实 workspace/projection 分支：唯一可用 child workspace→打开，多个→选现场，无 child 但已有 projection→定位；其余原因禁用。 |
| 行为前 | `ContextAtlasStage.tsx` 的主卡 hit 区和小箭头都有精确 `aria-label`，但没有可见提示；进入与定位都复用同一箭头素材。已比对主仓 `E:\OS开发\LCOS_GEN2\huabu\apps\web\src\lcos\surfaces\context\ContextAtlasStage.tsx` 与 `ui/context/ContextCollectionFace.tsx`，对应动作控件没有 `title`。 |
| 行为后 | `ContextAtlasStage.tsx:102,106,113` 为箭头按钮增加与当前真实分支一致的 title（打开、选择、定位）；`ContextCollectionFace.tsx:50-51` 给整卡透明命中按钮增加 `activationLabel` 对应 title。hover 停留时原生浏览器提示文案与现有读屏名语义一致。 |
| ADOPTED | 沿用 `ContextAtlasStage` 的真实目标解析及 `ContextCollectionActionGlyph` → `ContextCollectionFace` 的现有视图；仅增强两处原交互命中区的提示，不新增状态、目标、查询或第二动作 owner。 |
| RETIRED | 无旧 UI caller 退役；保留整卡点击与箭头按钮两个既有入口。 |
| VERIFIED | `git diff --check` 对本次两个文件通过。尝试本机 Playwright 浏览器观察时缺 Chromium executable（提示需安装 `chromium_headless_shell`），故没有声称浏览器视觉实测；未跑测试或安装浏览器。 |
| UNRESOLVED | 浏览器 hover 实际呈现仍需在现有浏览器确认；提示依赖浏览器原生 `title` 延迟。Collection 拆分/合并/删除及 Context 领域组织仍按既有报告标为未闭环，本次不伪造入口。 |

本次修改：

- `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\surfaces\context\ContextAtlasStage.tsx`
- `E:\TRAE项目\LCOS0.1收口\LCOS_GEN2_GUI_RECOVERY_20260926\huabu\apps\web\src\lcos\ui\context\ContextCollectionFace.tsx`

未改 backend；未 commit、merge 或 push。
