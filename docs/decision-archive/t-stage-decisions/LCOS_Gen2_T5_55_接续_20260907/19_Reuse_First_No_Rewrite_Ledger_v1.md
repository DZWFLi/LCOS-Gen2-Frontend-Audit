# Reuse First / No Rewrite Ledger v1

## 总裁决

```text
DIRECT USE > LIFT > WRAP/ADAPT > EXTEND > REWRITE
```

`REWRITE` 不是正常选项。只有现有 donor 在技术、架构、安全或 LCOS 产品语义上确实无法适配，并经过单独证据与批准后才允许进入。

## 能力归属

| 能力 | 首选来源 | LCOS 动作 | 禁止事项 |
|---|---|---|---|
| Canvas runtime | Huabu xyflow canvas | DIRECT USE | 第二套 canvas/runtime |
| Node shell | Huabu `NodeWrapper` | DIRECT USE / styling hook | 新 selection/resize wrapper |
| Selection/resizer/toolbar | Huabu | DIRECT USE | 复制 store 或 gesture owner |
| Preview Workspace | Huabu | DIRECT USE + LCOS entity adapter | 新 modal/expanded-node 系统 |
| Note editor | Huabu Milkdown/Crepe | DIRECT USE | 自研 Markdown editor |
| PDF render/search/highlight | Huabu react-pdf stack | DIRECT USE + fragment adapter | 新 PDF renderer |
| Web static/live/reader | Huabu WebNode/WebPreview | DIRECT USE + provenance adapter | Canvas 内新 iframe runtime |
| Image render | Huabu ImageNode/ImagePreview | DIRECT USE | 新图片 viewer/cache owner |
| Frame/layout | Huabu Frame mechanics | DIRECT USE | 第二套 group layout engine |
| LOD mechanics | Huabu `useNodeLOD` / takeover | EXTEND EXISTING OWNER | 第二 zoom store/resolver |
| Text/document semantic policy | LCOS Gen1 | LIFT policy into Huabu owner | 并行 LOD 驱动 |
| Glyth face/motion | Grok replica + Gen1 Bloub | LIFT/WRAP on Huabu host | 从零重做 avatar engine |
| Spatial morphology/choreography | Spatial primary evidence | ADAPT visual contract | 复制 Spatial 产品结构 |
| Control/material microinteraction | iOS 26 donor | selective LIFT | glass 覆盖内容节点 |
| Artifact/Revision/Run truth | LCOS domain/local-core | thin adapters | UI/node data 另造 truth |

## “扩展现有 LOD owner”的准确含义

不创建所谓统一新 resolver。实际路径是：

```text
Huabu current useNodeLOD / useNodeTakeover
→ 增加 LCOS critical-state 与 species render policy 输入
→ 仍由同一 screen-derived owner 输出最终 render mode
```

Gen1 camera-zoom 阈值只作为回归测试向量和迁移参考；不能与 Huabu screen-width LOD 同时写最终状态。

## Visual contract 的含义

Construction card 中的 `PROPOSED` token 只允许：

- 调整现有组件的样式、层级、阈值或过渡；
- 选择现有 donor 中更符合 LCOS 的形态；
- 在现有 host seam 上增加薄状态映射；
- 提出需验证的参数。

它不授权：

- 新建平行 renderer、store、database、preview、editor 或 runtime；
- 重写 donor 已有成熟能力；
- 改变冻结对象模型、主流程或交互语言；
- 用“设计一致性”覆盖性能、安全和持久化 owner。

## 允许考虑 Rewrite 的门槛

必须同时提交：

1. 已核对的 donor exact path/version；
2. 无法 DIRECT USE/LIFT/WRAP/EXTEND 的具体证据；
3. 对当前流程、数据流、文件和 Schema 的影响；
4. 成本、风险、验收、回滚；
5. 用户单独批准。

未满足即保持 `NO REWRITE`。

