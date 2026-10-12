# Domino Image Viewer 官网

`https://dominoimg.com/` 的静态源码，保留既有 GitHub Pages 发布方式、蓝白与深色产品舞台设计、中英日西四语及多屏适配。

## 本地预览

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

浏览 `http://127.0.0.1:8765/?lang=zh`，英文为 `?lang=en`。详情使用按需加载的本地 ES module，应通过 HTTP 预览。

## 修改与生成

- `scripts/content.json`：25 个功能的四语文案。
- `scripts/build_page.py`：生成首页、隐私与条款子页、`feature-content.js`、`locale-data.js`；按内容版本更新静态资源 URL，避免旧脚本与新页面混用。
- `app.js`：自动轮播、滚动分镜、语言、视频及原生详情弹窗。
- `scripts/build_legal.py`：应用与官网的四语隐私政策、使用条款。
- `privacy.js`：子页语言、返回首页及政策/条款往返。
- `analytics.js`：App Store 链接的 Google Ads 点击转化，含超时跳转回退。
- `styles.css`：整体设计、响应式和减少动态效果。
- `language.js`：首屏绘制前选择语言；优先 URL、保存的偏好、浏览器语言、英文。
- `scripts/media-v173.json`：每组截图的原文件名、语言与尺寸。
- `scripts/prepare_v173_media.py`：由用户原件生成响应式 WebP 和 20 秒影片，保留截图 ICC，逐字节复制 HDR/SDR AVIF。需要 Pillow、FFmpeg 和原素材，不参与线上运行。

改完文案、样式或脚本后运行：

```sh
python3 scripts/build_page.py
node --check app.js
```

## v1.7.3 展示

首屏在首次进入时快速依次展示多栏主界面、六图对比、调色台：900ms、1800ms 切换，过渡 550ms；随后每 4.5 秒循环，末页向前衔接首屏。真实本地浏览器实测第三项约 2.58 秒稳定显示。主要图片使用优先加载；极慢网络下图片到达时间仍取决于连接。手动选择、暂停或聚焦正文链接会结束首次快速序列；首屏提供向下探索入口。提供暂停/继续和辅助选择；键盘聚焦正文链接、离开可见区域、后台或打开详情时暂停。减少动态效果时停止自动轮播。

桌面比较章节随原生滚动依次展示六图同屏、容差对比、像素网格，完整截图连续过渡，文字分章入场。手机、平板、无脚本和减少动态效果时按自然页面顺序展示全部三章。没有滚轮拦截、强制滚速、第三方动画框架或常驻 requestAnimationFrame 循环。

42 张真实截图组成 21 组中英文界面，另有此前 App Store 裁剪缩放与批量重命名物料。日、西文使用英文界面并在详情标明。新增两张中/英文局部区域统计截图，组成独立 ROI 模块和放大详情，介绍选区平均 RGB、HSV 与亮度 Y。原图与 ICC 保留，全部现有历史素材保留。另新增中英文调色控制台两张截图，首屏第三张 Banner 与调色章节主图采用这组更完整的可视化曲线、色阶及色轮界面；四语详情与放大查看同步接入。

HDR 主章节与放大详情保留真实应用界面，并把原始 AVIF 覆盖到原截图对应照片区域。原截图为 3600 × 2260，照片顶边 y=600，两栏各宽 1800；原图 1000 × 667 等比铺入。未转码、栅格合成、Canvas 处理或 CSS 亮度模拟。物理 HDR 高光仍需兼容屏幕及浏览器，普通截图无法证明 HDR 显示效果。

20 秒调色影片在视频进入可见区域后加载，静音循环预览，滚出视野、后台或打开弹窗时暂停；返回继续。用户手动暂停后不会因重新进入视野而恢复，按钮可继续。减少动态效果时不自动加载，但可主动播放。自动播放被浏览器拒绝或影片加载失败时提供手动重试；完整演示仍可主动打开。对比演示可手动播放/暂停，离开视野或打开弹窗暂停。原生 dialog 提供键盘约束、Esc 和焦点恢复，失败时回退为静态详情。无脚本时主要产品信息、完整比较章节、原始 HDR 图片、下载和支持入口仍可使用。

## 验证

预览服务器运行时，安装 Playwright 和 Chromium 后执行：

```sh
node scripts/verify_v173.cjs
```

Codex 当前环境可使用已安装的依赖：

```sh
NODE_PATH=/Users/domino/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node scripts/verify_v173.cjs
```

验收范围见 `docs/v173-qa-inventory.md`，结果见 `docs/v173-verification.md`。截图与 JSON 检查记录输出到 `output/playwright/`，不作为网站发布资源。

## 发布

沿用当前仓库的 GitHub Pages 和 `CNAME`。网站主体不依赖构建服务、账户密钥或后端；统计代码从 Clarity、Umami Cloud 和 Google 的官方域名异步或延迟加载。本次改造保持本地可预览状态，尚未提交、推送或发布。


## 网站统计与商城点击转化

`<head>` 已加入 Microsoft Clarity 项目 `yw6i3c0ef7`、Umami Cloud 网站 `5f3394fe-7688-4e38-948f-5a4bad1f9cff` 和 Google Ads `AW-18453204567`。后续运行页面生成器会保留这些代码。

所有 HTTPS App Store 链接（包括轮播生成的元素）点击后，发送 `conversion` 到 `AW-18453204567/iCX7CKPd7fgcENeclt9E`。页面打开时仅初始化 Google 代码，不发送此转化；每次点击发送一次。

普通同页跳转等待 Google 回调，最多等待 1 秒后继续打开商城。广告脚本未加载、被阻止或抛错时也有跳转回退。Command/Ctrl、Shift、中键和新窗口链接保留浏览器原生行为，键盘 Enter 可正常触发。

此转化表示“点击前往 App Store”，不能证明商城内的实际购买或订阅。所提供的 Google Ads 转化目前命名为“订阅”，应在后台按商城点击理解其统计口径。该代码不写入 Google/Baidu 验证文件，也不加入 AMP 片段；当前网站没有 AMP 内容页面。

新增检查：`node scripts/verify_analytics.cjs`，覆盖代码数量和 ID、全部商城入口、点击触发次数、键盘/新标签、中键、回调/超时、脚本受阻与网站主体初始化。统计检查和网站回归检查均使用本地统计脚本替身，不向提供的统计账户发送测试访问或转化。普通导航使用模拟商城；新标签检查验证浏览器创建标签、点击未被阻断、商城 href 和事件次数，实际 Apple 商品页到达不属于本地模拟测试范围。

实现参考 [Google Ads 点击转化说明](https://support.google.com/google-ads/answer/6331304?hl=en)、[gtag 回调与超时参数](https://developers.google.com/tag-platform/gtagjs/reference/parameters)、[Clarity 手动安装](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup)、[Umami 收集数据](https://docs.umami.is/docs/collect-data)。

## 隐私与使用条款

首页支持区及统计说明已链接到 `/Domino-Image-Viewer-Privacy-Policy/`；独立使用条款位于 `/Domino-Image-Viewer-Privacy-Policy/terms/`，沿用原公开路径形状。四语正文、语言偏好和首页往返均已接入。应用源码及 App Store Connect 中现有的外部 URL 未在本轮改动；线上 URL 是否指向新版内容，要在网站实际发布后确认。

隐私内容核对了应用源码：本机图像/统计/评审、文件与照片权限、剪贴板、授权的网络连接与钥匙串、Apple StoreKit 购买及恢复、Apple 更新检查、本地保存与删除。官网单独披露 Clarity、Umami、Google Ads 和托管服务；不把官网的点击转化描述为商城内的真实购买。

公开子页同样初始化三种统计服务，且没有商城链接点击时不会发送 Google Ads 转化。政策页本身的访问可能纳入官网访问统计。

局部截图单独重建：`python3 scripts/prepare_v173_media.py --roi-only`（需要 Pillow）；原件已保存到 `assets/product/v173/source/`，不再依赖临时剪贴板目录。

调色控制台截图单独重建：`python3 scripts/prepare_v173_media.py --grading-only`（需要 Pillow）；中英文原件位于 `assets/product/v173/source/grading-{en,zh}.jpg`。

## 试用、买断与阅读交互

首屏主按钮使用免费下载文案，并提供两周试用/终生买断内链。调色章节同样可进入 `#plans`。购买区用双卡介绍符合资格用户的两周订阅试用和一次性终生购买，并附资格、到期自动续费、取消和恢复购买 FAQ。终生版金额以应用内 App Store 确认页为准；本地 StoreKit 的 ¥78 测试价格未当作线上售价发布。

前三秒快速预览完成后，鼠标悬停会暂停正常轮播，离开后接着剩余时间继续；手动暂停优先，触摸不触发悬停暂停。轮播支持方向键与 Home/End，键盘选页后保持暂停。比较分镜交接使用平滑过渡，快速滚动会取消上一段文字动画。减少动态效果保留所有购买和 FAQ 功能。

`verify_marketing.cjs` 可通过已启动的 Playwright 浏览器调用，检查四语方案、FAQ、内部链接不触发转化、无脚本回退、悬停/手动暂停优先级和键盘选页。商城追踪测试覆盖六个入口，包括两种购买方案，均使用本地脚本替身，不发送生产统计数据。
