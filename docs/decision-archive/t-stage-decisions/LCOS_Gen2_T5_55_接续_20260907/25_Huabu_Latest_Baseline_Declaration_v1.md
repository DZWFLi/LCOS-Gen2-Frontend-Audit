# Huabu Latest Baseline Declaration v1

## 基线

```text
Upstream: https://github.com/microsoft/Huabu
Branch: main
Verified commit: a3c411e1f655191344285141f08c4738fa6015f7
Verification date: 2026-09-07
Role: Gen2 Node/Canvas/Preview mechanical baseline
```

本接续包后续所有 Huabu 路径、参数、能力和缺口均以该 commit 为准，直到执行者显式刷新并记录新的 commit。

## 与 Gen2 的关系

> `UPDATED 2026-09-07`：GitHub `DZWFLi/LCOS_Gen2/main@232b2ca5` 已把基于 upstream `a3c411e1` 的 Huabu tree vendor 到仓库内 `huabu/`，并重迁移 LCOS thin seams。此前“Gen2 尚未同步最新 Huabu”的判断已过期。

当前仍需区分：

- GitHub Gen2 main：已包含 `a3c411e1` migration baseline；
- 当前本地 `E:\Codex 项目\OS开发`：不是上述 Gen2 main 工作树，不能据此代表同步后的可运行体验；
- `HUABU_UPSTREAM.md`：当前工作树内容已校正为 `a3c411e1` 并补充迁移说明（2026-09-07），但尚未形成可确认的已提交状态；核对时工作树同时存在 `M HUABU_UPSTREAM.md` 与未跟踪 `docs/handoffs/`，不得在未厘清归属前提交或推送；
- 浏览器验收：尚未因 vendor 完成而自动通过。

```text
Huabu latest = upstream mechanical truth
LCOS Gen2 main@232b2ca5 = integrated product/domain construction truth
Gen1 = completeness/policy donor, not runtime host
```

## 同步责任边界

Huabu 最新同步与旧补丁重迁移已由独立执行线落入 GitHub main；T5 当前职责是：

- 依据最新 Huabu 制作 species/state construction cards；
- 识别 DIRECT USE / WRAP / ADAPT 边界；
- 防止旧路径、旧参数和旧 workaround 混入；
- 为同步后的 host 提供视觉合同与验收；
- 不在当前旧本地 Prototype 中复刻 Huabu；后续只对 GitHub Gen2 main 的 vendored `huabu/` 做薄接入。

## 刷新规则

未来 upstream HEAD 改变时必须：

1. 记录新旧 commit；
2. 检查 cards 引用路径和 current-source truth；
3. 上游已原生解决的 adapter/补丁改为 DIRECT USE；
4. 不机械重放旧 diff；
5. 更新本声明与受影响 card 的证据等级。
