# GenericSourceMorphology LOD 收敛（2026-09-29）

## 变化

generic fallback 之前仅透传 `data-density`，`lcos.css` 也只调整 species body 的外边距/阴影，四档实际仍显示完整身份行、标题与预览。本次补上 fallback 自身的内容降级：

- `mark`：只绘制现有 family 图标，背景/描边/圆角/内边距清空，不把完整白卡缩小冒充身份标记；真实标题仍经 `role=group`、`aria-label` 和原生 `title` 暴露。
- `summary`：显示家族身份和标题，不创建正文预览节点。
- `working / reading`：继续呈现现有标题与真实 preview。

未知与 skill 等仍使用既有类型图标，不造专属形态。`document` 走专属 `DocumentSourceMorphology`，不被本 fallback 规则接管。

## 依据与改动

- READ_SOURCE：`_cabin/01_正本/GEN2_新前端重新总装正本_20260913/references/original_route_cards/T1/LCOS_T1_C1-S1_Current_Source_Exact_Map_20260906.md` §15；`LCOS_T1_C1-S3_Formal_Exact_Source_Construction_Plan_20260906.md` §9 C7-01；`42_T1_Huabu_Gen1_Spatial_Granularity_Recovery_v1.md` §2 第1点、§3.1。
- ADOPTED：沿用 `GENERIC_FAMILY_IDENTITY` 现有图标；仅在 `huabu/apps/web/src/lcos/nodes/source/SourceMorphology.tsx` 按现有 density 决定内容节点；`huabu/apps/web/src/lcos/ui/source/source-presentation.css` 负责 mark 空白形态。
- VISUAL_SOURCE：mark 使用已存在 family glyph，远景不画通用白卡；T1 §15/C7-01 将 final morphology/compact body 接入现有 presentation contract，不新增第二套 LOD owner。
- VERIFIED：`pnpm --filter @huabu/web test -- --run src/lcos/nodes/LcosSpeciesBodies.test.tsx`，1 文件、11 项通过；断言覆盖 mark 可访问标题、summary 隐藏 preview、reading 保留真实 preview。
- UNRESOLVED：本轮是定向 SSR 结构验证，没有整页浏览器/用户缩放路径实测；专属 skill morphology 仍无足够 Figma source 证据，保持 generic family fallback。
