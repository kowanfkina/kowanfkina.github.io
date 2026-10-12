"""A source-backed comparison chapter. Public documentation is linked in the UI."""
from collections.abc import Callable
from dataclasses import dataclass
from html import escape

Copy = tuple[str, str, str, str]
YES: Copy = ('Supported', '支持', '対応', 'Compatible')
UNLISTED: Copy = ('—', '—', '—', '—')

@dataclass(frozen=True)
class Viewer:
    key: str
    name: str
    mark: str
    platform: str
    value: str
    value_label: Copy
    focus: Copy
    detail: Copy
    source: str

VIEWERS = (
    Viewer('xnview', 'XnView MP', 'Xn', 'Mac · Windows · Linux', '4',
           ('synchronized views', '同步比较', '同期比較', 'vistas sincronizadas'),
           ('A library-first workflow.', '以素材管理为中心。', 'ライブラリ管理を中心に。', 'Una biblioteca organizada.'),
           ('Broad format support, cataloging and up to four synchronized comparison views.', '丰富格式、目录管理，以及最多四图同步比较。', '幅広い形式、カタログ管理、最大4枚の同期比較。', 'Muchos formatos, catálogo y comparación sincronizada de hasta cuatro imágenes.'),
           'https://www.xnview.com/en/faq/'),
    Viewer('pixea', 'Pixea', 'Px', 'Mac', 'Plus',
           ('editing & enhancement tools', '编辑与增强工具', '編集・画質向上ツール', 'edición y mejora'),
           ('View. Edit. Enhance.', '查看、编辑与智能增强。', '閲覧、編集、画質向上。', 'Ver, editar y mejorar.'),
           ('A media viewer with color tools, batch editing and AI enhancements. Some tools require Plus.', '媒体查看、调色、批量编辑与 AI 增强，部分工具需要 Plus。', 'メディア閲覧、色調整、一括編集、AI画質向上。一部はPlusが必要です。', 'Visor con color, edición por lotes y mejoras con IA. Algunas herramientas requieren Plus.'),
           'https://www.imagetasks.com/pixea/'),
    Viewer('edgeview', 'EdgeView', 'Ev', 'Mac', '2',
           ('two-page display', '双页显示', '見開き表示', 'vista de doble página'),
           ('Images, archives and media.', '图像、压缩包与媒体浏览。', '画像、アーカイブ、メディア。', 'Imágenes, archivos y medios.'),
           ('Browse local and network files, read archives and use single-image or two-page layouts.', '浏览本地与网络文件、直接查看压缩包，支持单图与双页显示。', 'ローカル・ネットワークのファイルやアーカイブを、単画像・見開きで閲覧。', 'Archivos locales y de red, archivos comprimidos y vistas de una imagen o doble página.'),
           'https://www.edgeview.co.kr/?docs=help/image-viewer/display-images'),
    Viewer('faststone', 'FastStone Image Viewer', 'Fs', 'Windows', '4',
           ('side-by-side views', '并排比较', '並列比較', 'vistas en paralelo'),
           ('A familiar Windows viewer.', '熟悉的 Windows 看图工具。', 'Windowsの画像ビューア。', 'Un visor clásico de Windows.'),
           ('Browse, rate and edit photos, with RAW support and side-by-side comparison of up to four images.', '浏览、评级与编辑照片，支持 RAW 和最多四图并排比较。', 'RAW対応で、閲覧、評価、編集、最大4枚の並列比較ができます。', 'Ver, puntuar y editar fotos, con RAW y comparación de hasta cuatro imágenes.'),
           'https://www.faststone.org/FSViewerDetail.htm'),
)

# Rows distinguish specialized review tools from general browsing/editing features.
# A dash means not listed in the reviewed information, rather than proven absent.
ROWS: tuple[tuple[str, Copy, tuple[Copy, ...], bool], ...] = (
    ('browse', ('Fast browsing', '快速浏览', '画像の閲覧', 'Navegación rápida'), (YES, YES, YES, YES, YES), False),
    ('formats', ('RAW & image formats', 'RAW / 多格式', 'RAW・多形式', 'RAW y formatos'), (YES, YES, YES, YES, YES), False),
    ('multi', ('Synchronized comparison', '多图同步比较', '同期比較', 'Comparación sincronizada'),
     (('1–6 images', '1～6 图', '1〜6枚', '1–6 imágenes'), ('Up to 4', '最多 4 图', '最大4枚', 'Hasta 4'), UNLISTED,
      ('Two-page view¹', '双页显示¹', '見開き表示¹', 'Doble página¹'), ('Up to 4 side by side', '最多 4 图并排', '最大4枚の並列', 'Hasta 4 en paralelo')), True),
    ('difference', ('Difference / tolerance', '差异与容差', '差分・しきい値', 'Diferencias y tolerancia'), (YES, UNLISTED, UNLISTED, UNLISTED, UNLISTED), True),
    ('overlay', ('Overlay', '叠加对照', '重ね合わせ', 'Superposición'),
     (('Cross-pane overlay', '跨窗口叠加对照', 'ペイン間の重ね表示', 'Superposición entre vistas'), UNLISTED,
      ('Editing tool · Plus²', '编辑工具 · Plus²', '編集ツール・Plus²', 'Edición · Plus²'), UNLISTED, UNLISTED), True),
    ('pixels', ('Pixel Inspector', '像素检查', 'ピクセル確認', 'Inspector de píxeles'),
     (('Grid + RGB / HSV / Y', '网格 + RGB / HSV / Y', 'グリッド＋RGB / HSV / Y', 'Cuadrícula + RGB / HSV / Y'),
      ('Color readout', '色值查看', '色の値を表示', 'Lectura de color'), UNLISTED,
      ('Pixel display', '像素显示', 'ピクセル表示', 'Visualización de píxeles'), ('Magnifier', '放大查看', '拡大表示', 'Lupa')), True),
    ('roi', ('ROI Statistics', '局部区域统计', '領域統計・ROI', 'Estadísticas de región'),
     (('RGB / HSV / Y means', 'RGB / HSV / Y 均值', 'RGB / HSV / Y 平均値', 'Medias RGB / HSV / Y'), UNLISTED, UNLISTED, UNLISTED, UNLISTED), True),
    ('histogram', ('Histogram', '直方图', 'ヒストグラム', 'Histograma'), (YES, YES, YES, YES, YES), False),
    ('tray', ('Staging Tray', '中转站', '画像トレイ', 'Bandeja de imágenes'),
     (('Collect → compare', '集中收集 → 直接对比', '集めて、そのまま比較', 'Reunir → comparar'), UNLISTED, UNLISTED, UNLISTED, UNLISTED), True),
    ('review', ('Review / Ranking', '评审 / 匿名 Rank', '評価・匿名順位付け', 'Evaluación y ranking'),
     (('Ratings + blind ranking', '评分 + 匿名排序', '評価＋匿名順位付け', 'Puntuación + ranking ciego'),
      ('Ratings & labels', '评分 / 标签', '評価・ラベル', 'Puntuación y etiquetas'),
      ('Ratings / labels · Plus', '评分 / 标签 · Plus', '評価・ラベル・Plus', 'Puntuación / etiquetas · Plus'),
      ('Ratings', '评分', '評価', 'Puntuación'), ('Ratings & tags', '评分 / 标记', '評価・タグ', 'Puntuación y etiquetas')), True),
    ('report', ('Review reports', '评审报告', '評価レポート', 'Informes de evaluación'),
     (('HTML / Markdown', 'HTML / Markdown', 'HTML / Markdown', 'HTML / Markdown'), UNLISTED, UNLISTED, UNLISTED, UNLISTED), True),
    ('workflow', ('AI / CV workflow focus³', 'AI / CV 工作流³', 'AI / CVでの用途³', 'Enfoque AI / CV³'),
     (('Version validation', '版本验证与评审', 'バージョン検証・評価', 'Validación de versiones'),
      ('Library management', '素材管理', '素材管理', 'Gestión de biblioteca'),
      ('AI editing', 'AI 编辑增强', 'AI編集・画質向上', 'Edición con IA'),
      ('Media browsing', '媒体浏览', 'メディア閲覧', 'Exploración de medios'),
      ('Photo selection', '照片筛选', '写真選別', 'Selección de fotos')), False),
)

def build_software_comparison(t: Callable[..., str], store: str) -> str:
    pieces = [f'''<section class="software-comparison" id="software-comparison"><div class="wrap">
<div class="software-heading" data-reveal><p class="eyebrow">{t('CHOOSE YOUR WORKFLOW', '选工具，也是在选工作流。', '自分の作業に合うツールを。', 'ELIGE TU FLUJO DE TRABAJO')}</p>
<h2>{t('Comparison is only the start.<br><em>Make every decision count.</em>', '对比，不止并排。<br><em>让判断，有据可依。</em>', '並べて見る、その先へ。<br><em>根拠ある判断へ。</em>', 'Comparar es el principio.<br><em>Decide con fundamento.</em>')}</h2>
<p>{t('Six synchronized views. Pixel and region statistics. Blind ranking and reports. A connected image workflow, built for Mac.', '六图同步、像素与区域统计、匿名排序与报告。在一个 Mac 工作台里，把观察、验证与判断连起来。', '6枚の同期表示、ピクセル・領域統計、匿名順位付けとレポート。Macでひとつにつながる画像ワークフロー。', 'Seis vistas sincronizadas, estadísticas, ranking ciego e informes. Un flujo conectado, diseñado para Mac.')}</p></div>
<div class="software-stage" data-reveal>
<div class="viewer-switch" role="group" aria-label="Choose a viewer to compare">''']
    for viewer in VIEWERS:
        active = viewer.key == 'faststone'
        pieces.append(f'<button type="button" data-vendor-to="{viewer.key}" aria-pressed="{str(active).lower()}">{escape(viewer.name)}</button>')
    pieces.append(f'''</div><div class="viewer-duo">
<article class="viewer-card domino-viewer"><img class="viewer-icon" src="assets/product/icon.webp" width="80" height="80" alt=""><p class="viewer-platform">Mac</p><h3>Domino Image Viewer</h3>
<p class="viewer-position">{t('Observe. Measure. Decide.', '看清、量化，再判断。', '見て、測って、判断する。', 'Observa. Mide. Decide.')}</p>
<div class="viewer-value">1–6 <span>{t('synchronized views', '同步视图', '同期ビュー', 'vistas sincronizadas')}</span></div>
<p class="viewer-description">{t('Difference and overlay, ROI statistics, staging, blind ranking and exportable reports — in one workspace.', '差异与叠加、区域统计、中转站、匿名 Rank 与可导出的报告，接成一套专业流程。', '差分・重ね表示、領域統計、トレイ、匿名順位付け、レポート出力までをひとつに。', 'Diferencias, superposición, regiones, bandeja, ranking ciego e informes en un solo espacio.')}</p>
<a class="button" id="compare-download" href="{store}">{t('Download free', '免费下载体验', '無料でダウンロード', 'Descargar gratis')} ↗</a>
<a class="viewer-trial" href="#plans">{t('Explore the 2-week trial*', '了解两周免费试用*', '2週間の無料体験を見る*', 'Ver la prueba de 2 semanas*')} →</a></article>''')
    for viewer in VIEWERS:
        active = viewer.key == 'faststone'
        pieces.append(f'''<article class="viewer-card peer-viewer {'is-selected' if active else ''}" data-peer="{viewer.key}" {'hidden' if not active else ''}>
<div class="viewer-monogram {viewer.key}" aria-hidden="true">{viewer.mark}</div><p class="viewer-platform">{viewer.platform}</p><h3>{escape(viewer.name)}</h3>
<p class="viewer-position">{t(*viewer.focus)}</p><div class="viewer-value peer-value">{viewer.value}<span>{t(*viewer.value_label)}</span></div><p class="viewer-description">{t(*viewer.detail)}</p>
<a class="peer-source" href="{escape(viewer.source)}" target="_blank" rel="noopener noreferrer">{t('Official features', '查看官方功能', '公式機能を見る', 'Funciones oficiales')} ↗</a></article>''')
    pieces.append(f'''</div><div class="software-stage-bottom"><p>{t('Choose a viewer. Compare the workflow that matters to you.', '选择一款软件，看看哪套流程更适合你。', '気になるツールを選んで、自分の作業に合うか比較。', 'Elige un visor y compara el flujo que necesitas.')}</p><a class="comparison-jump" href="#capability-matrix">{t('Compare the capabilities', '逐项比较功能', '機能を比較する', 'Comparar funciones')} <span aria-hidden="true">↓</span></a></div></div>
<details class="matrix-details" id="capability-matrix" open><summary>{t('12 capabilities. A clearer choice.', '12 项能力，把差别看清。', '12の機能で、違いを確認。', '12 capacidades. Elige con claridad.')}<span aria-hidden="true">+</span></summary>
<div class="matrix-toolbar"><p>{t('Compare tools for browsing, inspection and review.', '从浏览、检查到评审，逐项比较。', '閲覧、確認、評価の機能を比べる。', 'Compara herramientas de navegación, inspección y evaluación.')}</p><div class="matrix-toolbar-actions"><label class="matrix-viewer-picker"><span class="sr-only">{t('Choose a viewer to compare', '选择一款看图软件进行对比', '比較するビューアを選択', 'Elige un visor para comparar')}</span><select id="matrix-viewer" aria-label="Choose a viewer to compare">{''.join(f'<option value="{viewer.key}" {"selected" if viewer.key == "faststone" else ""}>{escape(viewer.name)}</option>' for viewer in VIEWERS)}</select></label><button id="capability-focus" type="button" aria-pressed="false">{t('Focus on inspection & review', '只看专业判断能力', '確認・評価の機能に絞る', 'Centrar en inspección y evaluación')}</button></div></div>
<div class="matrix-scroll" tabindex="0" role="region" aria-label="Image viewer capability comparison"><table class="capability-table"><caption class="sr-only">{t('Image viewer capability comparison', '看图软件功能对比', '画像ビューアの機能比較', 'Comparación de funciones de visores')}</caption><thead><tr><th scope="col">{t('Capability', '能力', '機能', 'Capacidad')}</th><th scope="col" data-vendor="domino">Domino<br>Image Viewer</th>''')
    for viewer in VIEWERS:
        selected = 'is-selected' if viewer.key == 'faststone' else ''
        pieces.append(f'<th scope="col" data-vendor="{viewer.key}" class="{selected}">{escape(viewer.name)}</th>')
    pieces.append('</tr></thead><tbody>')
    for key, label, cells, focused in ROWS:
        pieces.append(f'<tr data-capability="{key}" data-focus="{str(focused).lower()}"><th scope="row">{t(*label)}</th>')
        for vendor, value in zip(('domino', *(v.key for v in VIEWERS)), cells, strict=True):
            cls = 'is-selected' if vendor == 'faststone' else ''
            if value == YES:
                cell = f'<span class="capability-check" aria-hidden="true">✓</span><span class="sr-only">{t(*YES)}</span>'
            elif value == UNLISTED:
                cell = f'<span class="capability-unlisted" aria-hidden="true">—</span><span class="sr-only">{t("Not listed in the reviewed information", "本次资料未列明", "確認した資料に記載なし", "No indicado en la información consultada")}</span>'
            else:
                cell = t(*value)
            pieces.append(f'<td data-vendor="{vendor}" class="{cls}">{cell}</td>')
        pieces.append('</tr>')
    pieces.append(f'''</tbody></table></div><div class="comparison-notes"><p>{t('✓ Supported. — Not listed in the reviewed information; it does not mean absent from every version. Editions and features can change.', '✓ 支持。— 表示本次资料未列明，不代表所有版本均不支持。功能可能因版本或购买方案而异。', '✓ 対応。— は確認した資料に記載がない機能です。全バージョンで非対応とは限りません。エディションにより異なります。', '✓ Compatible. — No indicado en la información consultada; no implica ausencia en todas las versiones. Las ediciones pueden variar.')}</p>
<p>{t('¹ Two-page display is not a synchronized comparison workflow. ² Pixea Plus offers an editing overlay tool. ³ Workflow focus describes use cases, not an AI benchmark. Reports here mean review/ranking statistics and exports.', '¹ 双页显示与多图同步比较并非同一功能。² Pixea Plus 提供编辑叠加工具。³ 工作流侧重点为使用场景，不是 AI 性能评分。报告指评审/排位统计及导出。', '¹ 見開き表示は同期比較とは異なります。² Pixea Plusは編集用重ね合わせに対応。³ 用途の比較でありAI性能評価ではありません。レポートは評価・順位統計と出力を指します。', '¹ La doble página no equivale a comparación sincronizada. ² Pixea Plus incluye superposición de edición. ³ El enfoque describe usos, no rendimiento de IA. Los informes son estadísticas y exportaciones de evaluación.')}</p>
<p class="comparison-sources">{t('References · checked 12 Oct 2026', '参考资料 · 2026 年 10 月 12 日核对', '参考資料・2026年10月12日確認', 'Referencias · consultadas el 12 oct 2026')} · ''')
    for viewer in VIEWERS:
        pieces.append(f'<a href="{escape(viewer.source)}" target="_blank" rel="noopener noreferrer">{escape(viewer.name)} ↗</a> ')
    pieces.append('</p></div></details></div></section>')
    return '\n'.join(piece.rstrip() for piece in pieces)
