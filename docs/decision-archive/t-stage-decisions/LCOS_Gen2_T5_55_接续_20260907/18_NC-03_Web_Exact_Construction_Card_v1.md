# NC-03 Web — Exact Construction Card v1

## 0. 卡片状态

```text
Species: Web Artifact View
Card status: DESIGN READY / IMPLEMENTATION NOT STARTED
Canonical truth: URL or imported HTML artifact + provenance
Mechanical host: Huabu WebNode + WebPreview + NodeWrapper
Morphology authority: captured page/site identity
Primary visual donor: Spatial v2 import/capture + webclip morphology
```

## 1. Current-source truth

| 项 | 真值 |
|---|---|
| Canvas body | `apps/web/src/components/Nodes/web/WebNode.tsx` |
| Preview | `apps/web/src/components/Nodes/web/WebPreview.tsx` |
| Default geometry | `400 × 400` |
| Height | manual；reference width `400`；minimum content scale `0.5` |
| Resize | free ratio |
| Canvas face | static preview only；不挂 live iframe |
| Static preview | og:image → favicon/siteName fallback → generic Web fallback |
| Footer | favicon/type icon + title + optional 3-line summary |
| LOD | `full → minimal`；进入 `<140px`，退出 `≥160px` |
| Hydration | minimal 跳过 preview fetch；full 时 shared scheduler 分帧请求 |
| Preview modes | `live` / `reader` |
| Browser fallback | live 未 ready 且 reader 已就绪，`3500ms` 后自动 reader |
| Loading badge | `1500ms` 后消失，不等待所有 SPA 资源 |
| Scroll memory | reader mode 使用 `scrollViewKey` |
| External open | 仅远程 HTTP(S) URL 显示 |

## 2. Source kinds 与权威边界

| Source kind | Canvas identity | Preview behavior | 权威说明 |
|---|---|---|---|
| remote URL | site/URL + captured preview | live 优先；受 embeddability 影响 | 外部网页会变化，必须保留 capturedAt/hash |
| MHTML/static snapshot | snapshot identity | scripts off；display-only | snapshot 是可复现证据，不等于当前 live page |
| imported HTML | local artifact identity | scripts 可按 sandbox policy 开启 | 原文件与权限归 Local Core |
| interactive HTML artifact | declared interactiveView | bridge-enabled live face | capability contract 必须 host 校验 |
| reader artifact | derived readable projection | reader mode | 从 canonical source 派生，不是第二 truth |

URL、snapshot、reader 不得混成一个模糊 `src` 语义。LCOS adapter 至少需要记录 `sourceKind / originalUrl / capturedAt / sourceRevision`。

## 3. 形态合同

### Full face

```text
visual priority:
1. captured page image / og:image
2. favicon + site identity
3. title
4. optional summary
5. provenance/status
```

- Web 是 webclip，不是浏览器窗口缩小版；canvas 不放地址栏、刷新按钮或 live iframe；
- cover 可裁切填充 thumbnail area，footer 保留来源身份；
- cover 加载失败必须无闪烁地露出 favicon/site fallback；
- 没有 preview 仍显示可信 URL/site identity，不能显示 broken-image 图标；
- summary 是派生信息，失败时不能让整个节点看起来损坏。

### Minimal face

第一阶段保留 current `150±10px` mechanics，body 建议为：

```text
favicon/site mark + short title/domain
remote/snapshot/local identity cue
loading/error/stale 可见
```

不能只显示 generic Web icon；来源域名或 snapshot 身份必须留下。

## 4. 状态视觉合同

| 状态 | canvas body | chrome/feedback | 约束 |
|---|---|---|---|
| rest | static cover/fallback + footer | 无 browser chrome | 内容/来源优先 |
| hover | 内容不变 | host outline | external link 只在 toolbar |
| selected | 内容不变 | screen-space selection/handles | 不改变 card layout |
| preprocessing | footprint 不变 | skeleton + processing | 不并发轰炸 preview API |
| preview-loading | fallback 保持 | thumbnail skeleton overlay | 结果到达平滑替换 |
| no-preview | favicon/site 或 Web fallback | 角落小型 no-preview cue | 不把 extraction failure 当 source missing |
| missing | 无伪内容 | MissingFileBanner | local artifact 写/读屏障 |
| stale | 保留 capture | `PROPOSED` source-changed notch + capturedAt | live 与 snapshot 差异可见 |
| live | Preview iframe | corner loading badge | iframe 从开始可见，不被 loading 层盖住 |
| reader | readable projection | mode identity + scroll | 明确是派生 reader |
| offline | captured preview/reader 可用时保留 | offline cue | 不显示伪 live |
| unsafe/blocked | 不执行内容 | permission/sandbox explanation | 不放宽 sandbox 静默重试 |

## 5. Preview mode policy（沿用 Huabu WebPreview）

### Current mechanics

```text
Electron:
  start live

Plain browser:
  embeddable=false → reader
  true/unknown → live first
  live not ready after 3500ms AND reader ready → reader
```

### Security boundary

- remote URL：`allow-scripts allow-forms allow-popups allow-same-origin`；仍与 host 跨源；
- MHTML snapshot：scripts off；
- interactive uploaded HTML：scripts/forms allowed，但不授予 same-origin；
- iframe `referrerPolicy=no-referrer`；
- interactive bridge 只为 host-validated capability definition 建立。

T5 不得为了“体验顺滑”弱化 sandbox 或把 live failure 隐藏成成功。

## 6. LOD / performance

```text
full → minimal: screenWidth < 140px
minimal → full: screenWidth >= 160px
```

- minimal 不请求 `/api/web/preview`；
- full hydration 一节点一帧放行；
- canvas 永不挂 live iframe；
- source/preview 变化时清空 image-failure flags 并允许新 URL 重试；
- in-flight 请求在 LOD/source 变化后忽略旧结果；
- critical selected/focused/pending node 的 enhanced-minimal 仍是 `PROPOSED`。

## 7. Capture → Canvas → Preview choreography

```text
source browser/page
→ explicit capture/import
→ provisional placement preview
→ Web ArtifactView lands on Canvas
→ ingestion produces capture/reader metadata
→ open Preview as live or reader face
→ close to same anchor/context
```

Spatial v2 的重点不是复制 split-screen UI，而是保持 source-to-target 连续性：用户始终知道素材从哪个页面进入哪个 Workspace。

### Motion（PROPOSED）

- placement：source thumbnail 到 canvas rect 的连续移动；建议 `220–360ms`，批量对象错峰；
- preview open：webclip rect 到阅读/live face，建议 `200–280ms`；
- cover/fallback swap：短 crossfade，不改变 footer height；
- reduced motion：`120ms` crossfade，不做跨屏飞行；
- 批量导入的 `≈550ms` 不能在视频逐帧测量前冻结。

## 8. Persistence / provenance

| 数据 | Owner | 规则 |
|---|---|---|
| original URL / local artifact | Local Core | 明确 source kind |
| capturedAt / source hash | Local Core | 用于 stale/provenance |
| og image/favicon/summary | derived cache | 可失效、可重建 |
| reader HTML | derived artifact/cache contract | 不成为独立 canonical truth |
| geometry | projection | 交互结束后 batch persist |
| reader scroll | Preview Workspace | view-key scoped |
| interactive capability | contracts/security | host validated；最小权限 |

外部页面变化时不自动替换用户确认过的 capture；提供 Refresh/Recapture，生成新 Revision 或显式更新 derived cache，取决于 adapter 决策。

## 9. Browser acceptance

1. 创建 `400×400` remote URL node，canvas 不挂 iframe；
2. og:image 成功、失败、缺失三条路径均无 broken-image 闪烁；
3. favicon/siteName/generic fallback 层级正确；
4. preprocessing、preview-loading、no-preview、missing、offline 能被区分；
5. full/minimal 在 `140/160px` 边界无抖动，minimal 不请求 preview；
6. 50 个 Web node 不同帧分批请求，旧请求结果不覆盖新 src；
7. plain browser `embeddable=false` 直接 reader；超时仅在 reader ready 时切换；
8. loading badge约 `1500ms` 收起；live fallback约 `3500ms`，timer unmount 清理；
9. Electron/browser 分支符合各自策略；
10. remote、snapshot、uploaded HTML 的 sandbox flags 分别正确；
11. reader 重开恢复 scroll；reload 可重新尝试 live；
12. external open 只对 HTTP(S) 出现，使用 `noopener`；
13. stale capture 显示 capturedAt/source identity，不伪装当前 live；
14. Preview 关闭恢复 node/entity、anchor、selection、camera context；
15. reduced motion 与 viewport render-count 合格。

## 10. Adapter open decisions

1. remote capture 是 Revision、Snapshot Artifact 还是可再生 cache；
2. reader HTML 的持久化级别；
3. stale 的判定策略与刷新授权；
4. interactiveView capability 与 LCOS Connector/安全模型的映射；
5. live/reader 用户选择是否跨 Preview session 持久化。

## 11. Card verdict

```text
DESIGN READY
MECHANICAL AND SECURITY BASELINE VERIFIED
SEMANTIC ADAPTER DECISIONS: 5 OPEN
```
