# Huabu Current Source Census v1

## 来源

- 上游：`https://github.com/microsoft/Huabu`
- 分支：`main`
- 核验方式：GitHub current tree API + raw source；不是历史审计转述。
- 证据等级：`CURRENT_SOURCE_VERIFIED`。

## 已关闭的路径误判

历史对话曾写 `apps/web/src/components/Nodes/TextNodeBody.tsx` 404，并进一步推断 current Text renderer 未找到。current main 的真实路径是：

`apps/web/src/components/Nodes/shared/TextNodeBody.tsx`

因此应改为：旧精确路径失效，但 current renderer **存在**。

## Current exact paths

```text
apps/web/src/components/Nodes/NodeWrapper.tsx
apps/web/src/components/Nodes/NodeTakeoverLayer.tsx
apps/web/src/components/Nodes/frame/FrameNode.tsx
apps/web/src/components/Nodes/shared/TextNodeBody.tsx
apps/web/src/config/semanticZoom.ts
apps/web/src/config/nodeTakeover.ts
apps/web/src/hooks/useNodeLOD.ts
apps/web/src/hooks/useNodeTakeover.ts
apps/web/src/hooks/useTakeoverMarkDrag.ts
packages/shared/src/canvas-engine/frame/projection.ts
```

## Semantic Zoom 真值

- current Huabu 是 `full → minimal` 单层降级，不是三档 renderer；
- minimal screen threshold：150px；
- hysteresis：10px；
- opt-in heavy types：`note / pdf / web`；
- minimal typography tiers 由 node representative canvas size 决定：32 / 52 / 76px；
- `question` 不走 binary semantic zoom，走 continuous takeover；
- provenance chrome 低于 150px 隐藏。

这意味着聊天中“minimal/compact/default”不是三个 LOD 状态，而是 minimal placeholder 的三个字体层级。后续 T5 文档必须纠正术语。

## Question takeover 真值

```text
start width          64px
end width            24px
hysteresis            6px
glide                200ms
badge fraction        .28
badge min/max        30/84px
collapsed mark        6–30px
face → dot threshold  7px
```

takeover 的 size 由实时屏幕尺寸连续计算，position 跟随 body fade 做 corner → centre glide。`NodeTakeoverLayer` 通过 Portal 渲染 mark，并只订阅小范围状态，避免全 node body 在连续 zoom 中重渲染。

## NodeWrapper / Frame / Text 可借能力

### NodeWrapper

- selection；
- resize；
- floating actions / overlay；
- semantic LOD；
- takeover；
- interaction phase 与 screen-derived signals。

### FrameNode

- visible container；
- content-driven resize；
- children proportional scaling；
- free / row / column / grid；
- rAF-coalesced resize preview；
- shared undo snapshot；
- label 使用 zoom-invariant overlay。

### TextNodeBody

- single auto-sizing textarea surface；
- shared sizing；
- edit/read-only pointer switching；
- double-click edit capture；
- search-highlight mirror；
- shell inset correction。

这说明 Text current body 并非 Milkdown canvas editor；current node body 是 textarea surface，Milkdown 是已安装 wheel，是否用于 deep work/reading face 仍需按实际调用路径核验。

## 依赖真值

Huabu current `apps/web/package.json` 包含 Milkdown 7.21.1 系列：

`core / crepe / ctx / plugin-block / plugin-cursor / prose / react / utils`

未见 `react-arborist` 与 `mind-elixir`。

## 对 LCOS 的边界纠正

`projectionBinding.ts` 与 `projectToSpaceProjection.ts` 没有出现在 Huabu current main tree。它们属于 LCOS adapter/Gen2 施工语境，不能再被写成 Huabu current mechanics 文件。Huabu 当前可确认的 projection primitive 是：

`packages/shared/src/canvas-engine/frame/projection.ts`

后续必须分开：

```text
LCOS canonical projection semantics
→ LCOS ProjectionBinding / adapter
→ Huabu canvas/frame projection mechanics
```

## 当前结论

Huabu current mechanics 的颗粒度已经足以支持 T1 继续做 exact integration planning，但还不能直接施工 LCOS 特有 species，因为 LCOS adapter 分支与 host seam 尚未完成精确定位。

