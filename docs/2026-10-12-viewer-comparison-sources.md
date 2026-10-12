# 软件对比的事实与范围

核对日期：2026-10-12。资料来自开发者官网、官方帮助、开发者发布的本地化仓库与 App Store 开发者更新说明；不是对五款软件进行统一环境的性能测试。只核对本次展示的能力，不据此宣称已经穷尽整个市场。

## 公开资料

| 软件 | 页面与展示依据 |
| --- | --- |
| XnView MP | [官方 FAQ](https://www.xnview.com/en/faq/)：Mac/Windows/Linux、多格式、最多四图同步缩放和平移；[官方入门 PDF](https://www.xnview.com/download/XnViewMP%20for%20Beginners.pdf)：直方图、评分与标签；[官方论坛的色值功能说明](https://newsgroup.xnview.com/viewtopic.php?p=183103)：色值查看。没有据此声称和 Domino 的像素/ROI 工作台等价。 |
| Pixea | [官方功能表](https://www.imagetasks.com/pixea/)：Mac、多格式/RAW、编辑/AI 增强、Plus 的 Image overlay、按评分/标签筛选；[开发者的 App Store 更新说明](https://apps.apple.com/us/app/pixea/id1507782672)：编辑叠加工具、修改图与原图对比、元数据评分/标签。不能把 Overlay 写成“无”。[开发者发布的 Main.strings](https://raw.githubusercontent.com/imagetasks/Pixea-Localizations/main/en.lproj/Main.strings) 有 Histogram 与 Rating 界面项，直方图按基本支持展示。 |
| EdgeView | [开发者主页](https://www.edgeview.co.kr/?lang=en)：Mac、RAW/多格式、媒体/压缩包/网络文件；[显示布局帮助](https://www.edgeview.co.kr/?docs=help/image-viewer/display-images)：双页显示；[缩放帮助](https://www.edgeview.co.kr/?docs=help/image-viewer/zoom-in-out)：像素显示、Loupe；[效果帮助](https://www.edgeview.co.kr/?docs=help/image-viewer/effects)：Level 的直方图；[文件管理帮助](https://www.edgeview.co.kr/?docs=help/image-viewer/remove-and-rate)：星级评分。双页显示与多图同步比较区别标注。 |
| FastStone Image Viewer | [官方功能页](https://www.faststone.org/FSViewerDetail.htm)：Windows、RAW/多格式、最多四图并排比较、直方图、评分/标记、放大镜。并排能力按官网范围表述，没有额外假设全部操作同步。 |

这些页面没有列明的专业功能，在界面用“— / 本次资料未列明”展示；不能把网页中没有写到的功能当作所有版本均不支持。不同购买方案和版本可能改变功能范围。功能表不是虚构星级评分，也不是统一速度、质量或 AI 性能排名。

## Domino Image Viewer

核对应用本地源码和已有截图，不修改应用源码。

- `Models/ComparisonSession.swift`：跨窗口 Overlay；使用现有叠加对照含义，不额外承诺透明度混合。
- `Services/PixelSampler.swift`：`sampleROIResult` 区域 RGB / HSV / Y 均值。页面不把全图直方图改称 ROI 直方图。
- `Views/Comparison/CaptureTray.swift`：收集图像并进入对比的中转站。
- `Views/EvaluationWorkspaceView.swift`：评审与匿名 Ranking、统计、HTML / Markdown 导出。未展示并不存在的 CSV 导出。
- 六图同步、差异/容差、像素检查已由应用截图、现有功能描述及比较会话实现交叉确认。

“AI / CV 工作流”展示用途定位：Domino 的版本验证与评审、XnView 的素材管理、Pixea 的 AI 编辑、EdgeView 的媒体浏览、FastStone 的照片筛选。这是编辑性的场景归纳，明确不作为 AI 性能分数，也不声称其他软件只能用于该场景。

营销重点是六图观察、像素/区域量化、匿名评审和可分享报告的完整流程。未使用无证据的“市场唯一”“绝对最好”或价格承诺。两周试用沿用既有资格和自动续费说明。
