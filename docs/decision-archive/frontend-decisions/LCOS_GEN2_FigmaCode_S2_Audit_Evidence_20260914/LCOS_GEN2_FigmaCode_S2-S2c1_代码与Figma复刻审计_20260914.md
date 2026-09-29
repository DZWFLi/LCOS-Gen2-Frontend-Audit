# LCOS GEN2 · FigmaCode S2–S2c1 代码与视觉复刻审计

日期：2026-09-14  
审计对象：`LCOS_GEN2_FigmaCode_S2_through_S2c1_CumulativePack_20260914.zip`  
目标代码：`codex/figma-code-web@f3c1a5f`  
审计方式：隔离 worktree 应用、真实编译/测试、1440×900 浏览器运行、Figma exact node 截图与 DOM 几何对照。  
用户当前施工分支：未修改。

## 结论

**这包不能直接合并。代码思路比上一轮可靠，但呈现只是“部分采用 Figma 形态”，还不是 Figma 复刻。**

分项裁决：

| 增量 | 裁决 | 说明 |
|---|---|---|
| S2a Action Arc | **KEEP + POLISH** | 30×30 圆、17px 图标、弧线和 44px 热区基本成立；生产态是 3 个主动作 + More，共 4 个圆，属于产品适配，不是 Figma `5388:311` 三圆原样复刻。 |
| S2b1 Source Morphology | **KEEP + REFACTOR** | text/document/image/audio 已分形态，方向正确；仍集中在一个大文件，精确尺寸、角标与音频声纹有偏差。 |
| S2b2 Body Seam | **KEEP + FIX HOST** | 复用了现有 neutral body seam，没有另造 Store；但只替换内层 body，没有让现有 NodeWrapper 的外壳、AI badge 和初始几何一起服从物种设计。 |
| S2c1 Glyth | **REWORK** | 内层换成 donor vector，但实机仍是 Huabu 白卡里的小球，尺寸、颜色、外壳均未达到 Figma。 |

## 视觉对照

### 1. 整体 Main

Figma `5388:96` 是完整构图：异形内容节点、独立 Glyth、顶部 HUD、左侧 Dock、底部 Navigator 与 Composer 共同形成一个画面。

当前实机虽然已经有异形 source body，但整体仍是 Huabu 网格、既有投影落位与既有节点外壳。节点散布、相机比例、HUD 组合和 Figma 主稿明显不同。

**结论：整个 Main 不能称为复刻。**  
S2 包也没有覆盖完整 Main，所以它最多只能被验收为局部组件增量。

### 2. Action Arc

Figma exact：

- `5388:311` frame：82×82；
- 3 个可见圆：30×30；
- 坐标：`(0,0) / (46,6) / (52,52)`；
- 图标：17×17。

实机：

- 4 个可见圆的容器：约 102×100；
- 每圆 30×30，热区 44×44；
- 玻璃圆、阴影、近场锚定基本正确；
- 图标按真实命令变成 Open / Reference / Auto-height / More，不是 Figma 示例的三枚图标。

**视觉语言接近，属于可靠适配，不是 exact replica。**

### 3. Image

Figma `5388:98`：

- 图片本体 410×273；
- caption 在下方；
- 角标 11×11，位于图片右上角之外。

实机：

- 当前首屏 image visual 约 281×201（画布 zoom 79%）；
- media-first 与 caption 已成立；
- 仍出现 Huabu 的 `AI` badge；
- 源码角标只有 9×9，而且被放在 `overflow-hidden` 容器内，实际截图看不到 Figma 的棕色角标。

**结构方向对，尺寸/chrome/角标未复刻。**

### 4. Document

Figma `5388:106`：

- 206×154；
- 18px 内边距；
- 清楚的标题、正文、底部来源三级层次。

实机首个 document：

- 外层约 286×206；
- 内层纸张约 270×190；
- 外层仍有白色 NodeWrapper、3px 外框和 AI badge；
- 文本在 79% camera 下明显比 Figma 小且密。

**内容层级部分复刻，宿主几何没有复刻。**

### 5. Text

源码准备了 37px reading typography、次级行和角标，方向接近 Figma `5388:102`。  
但当前 e2e fixture 中没有 text family 的真实生产节点，浏览器验收没有覆盖它。

**只能标为 PREPARED / UNVERIFIED，不能写完成。**

### 6. Audio

Figma `5388:121`：

- 171×96；
- 64 根 2px 声纹；
- 相邻声纹步距约 2.672px，即间隙约 0.672px；
- caption 含真实时长。

源码：

- 每根 2px，但 CSS 使用 `gap: 2px`；
- 64 根声纹总宽会超过 171px并被裁掉；
- e2e 没有 audio fixture，也没有真实时长视觉断言。

**未复刻，需修几何并补真实生产验收。**

### 7. Glyth

Figma `5388:118/119`：

- group 121×142；
- body 92×92；
- 深色独立有机身体；
- 白色双眼；
- label 在身体下方；
- 没有卡片底板。

实机：

- Huabu 外层节点约 222×175；
- 白色背景、3px 白边、AI badge 仍在；
- 内层 Glyth 约 50×50；
- 当前 fixture 呈青绿色；
- 形状与颜色由 8 shape × 4 tone 的哈希选择，而 Figma 当前只提供一个深色 exact visual anchor。

**这是本包最大的视觉失败。内层 SVG 已接，完整节点没有接。**

## 为什么测试绿了，画面仍不对

当前 e2e 主要验证：

- 存在 `data-lcos-glyth-vector`；
- 存在 `data-figma-node-id="5388:119"`；
- image body 挂上了 `5388:98` marker；
- body seam 已经切换。

这些只能证明“代码进入了新 body”，不能证明：

- 外层是不是透明；
- AI badge 是否退役；
- Glyth 是否真为 92×92；
- 整体是否为 121×142；
- image/document 是否采用正确初始尺寸；
- 角标有没有被裁掉；
- camera 构图是否与 Main 主稿一致。

因此当前 e2e 可以全绿，同时画面仍明显不像 Figma。给 DOM 写上 Figma node id，不等于复刻了 Figma。

## 代码质量

### 做对的部分

- 复用现有 `useResolvedNodeBody`、Core descriptor、Huabu NodeWrapper 与现有 shell/canvas store；
- 没有增加第二套产品 Store；
- Conversation identity 使用稳定哈希，不依赖标题、随机数或 localStorage；
- Glyth S2c1 没有引入 per-instance RAF / pointer listener；
- 双击打开 Reader / Conversation Work View 的既有用户路径保留；
- Huabu typecheck 通过；
- 目标 Huabu 测试 12/12 通过；
- Huabu build 通过；
- R2 浏览器 e2e 能跑完，console/page/http 最终场景无失败。

### 合并阻塞项

1. **web-gen2 strict TypeScript 失败**

   `apps/web-gen2/src/presentation/glythPresentation.ts:67-68`  
   数组索引在 `noUncheckedIndexedAccess` 下被推断为可能 `undefined`。

2. **新增 Glyth 单测没有进入默认测试链**

   默认脚本只跑 `test/*.test.ts`，新增文件却放在：

   `src/presentation/glythPresentation.test.ts`

   它使用 Vitest API；默认 `tsx --test` 不会覆盖。用 Vitest 单独跑可通过，但当前 CI/常规命令不会跑它。

3. **ESLint 失败 4 项**

   - `AudioNode.tsx` import/order；
   - `ImageNode.tsx` import/order；
   - `glythGeometry.test.ts` 两项 import/order。

4. **累计 patch 交付不稳**

   - S2a 必须使用 handoff 特别注明的 `--recount` 才能应用；
   - S2c1 在顺序应用 S2a/S2b1/S2b2 后，普通 `git apply --check --recount` 仍在 `index.ts`、`GlythNodeBody.tsx`、e2e 文件发生上下文失败；
   - 本审计为运行验证进行了人工恢复，不能把人工恢复后的测试结果当作“压缩包可直接施工”。

5. **Source renderer 重新长成单文件**

   `LcosSpeciesBodies.tsx` 本轮增加约 400 行，将 text/document/image/audio 与其它物种继续塞在同一文件。功能能跑，但不符合 Gen2 希望“改一种节点只动一个小模块”的颗粒度。

6. **视觉断言只查 adoption marker**

   这是本轮真实失败场景：普通类型测试、主键、Store 与浏览器功能测试都通过，但 NodeWrapper 外壳仍把 Glyth 包成白卡。这里需要 exact-node 的几何/chrome 视觉验收，而不是新增泛化 gate。

## 最小返工方案

### A. 先把包修成可施工件

- 从真实 `f3c1a5f + S2a + S2b1 + S2b2` worktree 重新生成 S2c1 patch；
- 在第二个 fresh worktree 验证完整四段可按文档命令应用；
- 修 strict TS 与 4 个 lint；
- 将 Glyth 测试移入 `apps/web-gen2/test/` 并改用该包现有测试风格，或明确统一 runner。

### B. 扩展现有 body seam，让宿主也接受物种呈现

不要新造第二套 wrapper/store。让现有 neutral presentation seam 附带最小 host presentation 信息，由唯一 `NodeWrapper` 消费：

- `surface: transparent | paper | media | card`；
- `showAiBadge`；
- `allowOverflow`；
- `initialGeometryPreset`（只用于新投影，绝不覆盖用户已保存几何）。

这样：

- Glyth 能真正移除白卡/AI badge；
- text/image/audio 能真正成为自由形态；
- Huabu 继续拥有 selection、resize、connection、drag 与 geometry truth。

### C. 按 Figma exact node 修几何

- Glyth near/readable：body 92×92，group 121×142，默认 exact anchor 使用深色；多 tone/shape 先等 Figma 变体或明确产品裁决；
- Image：410×273 + caption，corner marker 11×11且不能被裁掉；
- Document：206×154；
- Text：385×142；
- Audio：171×96，2px bar + 约 0.672px gap；
- Action Arc：保留真实命令适配，但把“三项 exact”和“四项扩展”分别验收。

### D. 补真正能发现这次错误的验收

在 1440×900 固定 fixture 中加入 text/document/image/audio/Glyth 五种真实 caller，至少检查：

- Glyth outer background transparent；
- 无 AI badge；
- body 与 group bbox；
- source corner marker 可见且 11×11；
- audio 64 bars 全部位于 171px 宽度内；
- 新投影默认几何与 Figma 一致；
- 已持久化用户几何不被重写；
- 对 exact element 截图做人工/视觉走查。

## 最终裁决

当前包适合作为 **S2 设计到代码的中间草稿**，不适合作为可直接合并的完成件。

可以保留的核心是：

- Action Arc 的近场机制；
- visual-family → morphology 分流；
- neutral body seam；
- stable Glyth identity 的纯函数思路。

必须返工的是：

- NodeWrapper host presentation；
- Glyth 完整节点；
- exact geometry；
- audio/marker；
- patch 可应用性；
- strict TS/lint/test coverage；
- 能检出“内层换了、外层没换”的视觉验收。

