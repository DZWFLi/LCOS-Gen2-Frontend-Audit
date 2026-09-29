# DZ Dream Signal Motion v4

完整作品集主站的平面排版与动效整合版。不是独立研究页。

原有 Apple → Duo → 拼贴手托小苹果 → 三入口 Ice Works → 有限双翼透视墙 → 案例读取窗 → 最后一章吃苹果 → 原本人像接、抛、砸头 → DZ 粒子流程保留。将 Editorial Study 01 的大字、裁切编号、实色色带、半色调、印刷图案及有限的平面动效接入这条流程。

## 直接查看

打开 `dist/DZ_DreamSignal_Motion_v4.html`。脚本、样式、图片与运行时许可内置，不依赖 CDN、npm 或外部服务。需要浏览器启用 JavaScript、WebGL2 和硬件加速。原生双击 file:// 路径并未在本次自动化环境里实测；验证方式和环境见 `整合与验收.md`。

向左拖动苹果或按「打开这个念头」。进入后用滚轮、横向/纵向拖动切换入口，点击当前物件或文字进入章节。章节顺序自由，已完成的入口退出选择；最后一章滚动时才吃苹果。案例通过卡片或「展开看看」读取。Esc 关闭案例、返回入口。收尾继续滚动，反向滚动可倒回。

## 构建与开发

本地构建工具与运行依赖已在 `vendor/`。不需要联网装包即可执行：

```sh
npm run check
npm test
npm run build
npm start
```

开发页在本机 `127.0.0.1:4173`；开发入口是根目录 `index.html`。单文件构建输出 `dist/DZ_DreamSignal_Motion_v4.html`。构建同时保留旧的两个 HTML 文件名作为本地开发兼容别名；压缩交付里只放一份最新单文件，避免混淆。

## 修改入口

- `content.json`：现有案例、经历与流程内容。示意图片和模板证据仍需用户替换。
- `src/graphic/identity.js`：三章节大标题、辅文、图形、信号色。
- `src/graphic/GraphicLayer.js`：原生 DOM 大字切片、条形图形、索引和碰撞字。
- `src/graphic/print-field.js`：同一背景 shader 内的印刷图层，只在章节、阶段、尺寸改变时重画图案。
- `src/styles/graphic.css`：大字排版、响应式与平面动效。
- `assets/entries/*.svg`：可编辑入口图形源；`.webp` 是已有 SDF 图集的输入。
- `src/apple/exterior03/`：从用户提供 v03 承接的外壳几何、材质与轮廓。只用于外观，不接入旧 Intro 主流程。
- `src/apple/hand.js`：只把可见手素材向左移，掌心函数和转移时序沿用当前工程。

请不要执行 `scripts/patch-seed.py`、`patch-type.py` 等历史一次性补丁来重复修改成品；它们只为原工程溯源保留，不属于本轮构建过程。

## 验证与边界

本轮日志、JSON、截图及自动化脚本在 `verification/`，结论见 `整合与验收.md`。截图来自完整 HTML 的 Chromium 实际渲染。录入测试包含真实按钮、鼠标、滚轮、触摸事件，也用已有 review 接口定位特定章节与动画帧。

整站使用系统字体栈；不同操作系统的英文字形和文字度量可能略有差别。不包含字体文件，也没有把用户的 Marathon 参考海报、视频或游戏标志放进交付包。
