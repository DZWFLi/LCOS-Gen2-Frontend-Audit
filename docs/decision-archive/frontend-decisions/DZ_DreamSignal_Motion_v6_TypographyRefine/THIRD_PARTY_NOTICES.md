# 第三方代码、素材与实现边界

## Ice Works

来源：https://github.com/MegD1/Ice-works-showcase

原作者：Yousuf Soomro。MIT 许可正文保留于 `licenses/IceWorks-MIT.txt`。

本次以用户提供的原始完整 Final 源码工程为基础。`src/ring/engine.js`、`shaders.js`、`math.js`、`assets.js`、`meta.js`及 `heading.js` 承接了该工程对上游 `Carousel.jsx`、`components/shaders/planeShaders.js` 与 `components/ring/` 的移植。

保留的主要算法包括 signed-slot 排序、黏连桥、SDF 平滑并集、鼠标波纹、悬停粒子、邻对象退让、惯性衰减与吸附。三入口布局与有限档案轨道是本次适配；档案中的原点关系仍进入同一个 SDF。

这是一份独立的离线兼容宿主，不是上游 Next.js / GSAP 原工程，也不宣称原生 Next.js / GSAP 构建已完成。入口时序在本地以同类解析缓动驱动；渲染、布局与输入代码可在源码中检查。

上游 `public/` 图片与商业字体不属于其源码 MIT 授权范围。本包没有复制那些图片或字体。

## Simplex noise

`src/ring/shaders.js` 保留 Ashima Arts / Stefan Gustavson 的 Simplex noise 作者注释；正文见 `licenses/Ashima-MIT.txt`。

## 本地运行与构建依赖

从用户 v03/v06 工程承接，未在本次更换版本：

- Three.js 0.140.0，许可 `vendor/three/LICENSE`。
- React 19.1.1 离线预览运行包，许可 `vendor/react/LICENSE`。
- TypeScript 5.8.3，仅构建使用，许可与第三方说明保留在 `vendor/typescript/`。

单文件 HTML 内也嵌入了运行代码所需的许可正文。

## 视觉素材

- `assets/grass-sky.jpg`、`mark.svg`：原 Final 工程内的背景与标记，保持沿用。
- `assets/studies/01.webp` 至 `08.webp`：原工程的测试视觉图，继续作为可替换样例。项目封面继续采用这些样例图；三入口现采用下文记录的 Coolshapes 轮廓。
- `assets/apples/apple_real_full.webp`、`apple_bite_01.webp`、`apple_bite_02.webp`、`apple_core.webp`：来自用户本次 `DZ_cutouts_and_apples_20260917(1).zip` 内的四张苹果 PNG。只做透明背景清理、共同画幅、尺寸和分发格式处理。
- `assets/apples/apple_skin_albedo.webp`、`apple_skin_roughness.webp`：从同一完整苹果图片的果皮区域提取细节、压低原照片的大尺度照明，再镜像连续拼接得到的满幅纹理。不是把整张照片作为前侧贴纸；不是新生成的苹果照片或扫描模型。
- `assets/collage/upper.webp`、`lower.webp`：直接来自用户提供的 `dz_outro_upper_exact.png`、`dz_outro_lower_exact.png`。做轮廓遮罩和构图裁切，保留本人原像素；没有生成、换脸或重新绘制人物。源图是排版页面切片，不是独立高分辨率人物原片，因此无法凭裁切恢复原来被苹果或文字遮住的区域。
- `assets/collage/hand.webp`：来自用户提供的 `Hands (30).png`，保留原透明通道、裁切并镜像，作为有深度测试的分段平面参与左侧内腔。它是剪贴画手，不冒充骨骼绑定的三维人手模型。
- 三维苹果外壳：本轮从用户提供的 `DZ_Apple_IceWorks_v03(2).zip` 提取原几何、轮廓和材质，隔离在 `src/apple/exterior03/`。只承接外观，不导入 v03 Intro 宿主、旧内腔或其输入流程。实际 optical 参数为 roughness .14、transmission .91、clearcoat .85；红色透射不等于无色玻璃。内部仍由当前工程的 `src/apple/field.js` 负责。
- 原工程的未使用旧肖像资源仍留在源码素材目录中供历史追溯，本版渲染不调用它们。
- 全部 UI 使用系统字体；交付包不包含字体文件。

项目正文沿用原来的 `content.json`；示意封面和模板证据不应当作真实商业作品成品。正式发布前由用户自行替换、确认案例与素材使用权。

本次没有新增 AI 生成图片，没有发布、部署、推送或上传到任何外部账号。入口图集由既有许可 SVG 轮廓和原创印刷排版离线输出。

## Coolshapes

Three entry contours from realvjy/coolshapes-react: flower/1, wheel/1, misc/1. MIT; see licenses/Coolshapes-MIT.txt. Palettes and shared SDF atlas adapted here. No Marathon game assets or typefaces are bundled.

## Dream Signal Motion v4 整合修订

本轮根据用户已批准的 Editorial Study 01，将大字号、裁切编号、实色色带、半色调和分段动效整合回完整 Ice Works 主站，而不是更换浏览架构。

三个入口的具体映射为 Projects → wheel/1、About → flower/1、Workflow → misc/1；轮廓来源仍是 Coolshapes MIT，颜色、排字和纹理为本轮原创适配。`assets/entries/*.svg` 为可编辑源，`.webp` 为 SDF 图集输入；WebP 中的文字是图形素材的一部分，主要标题、正文、入口操作仍是原生 DOM。

用户提供的 Marathon / YUP 图片、视频和游戏标志仅作为风格与节奏参考，未复制进入分发包。所有 UI 和运行时 Canvas 排字均采用系统字体栈，包内没有字体文件或嵌入字体。不同操作系统的英文字形可能略有差异。

当前 `src/entry/objects.js` 是历史未调用实现，不是本版主入口渲染路径。本版入口继续经 `src/ring/engine.js` 与 `shaders.js` 的同一个 SDF pass 渲染，无额外 Three.js 基础体叠层。
