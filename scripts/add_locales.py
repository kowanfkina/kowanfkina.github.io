"""Add reviewed Japanese and Spanish marketing copy to the existing four-language build."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
# Each entry is newly authored copy, not a machine translation request to an external service.
rows=[
('Skip to content','本文へスキップ','Saltar al contenido'),
('Explore','機能','Funciones'),('Support','サポート','Soporte'),('Get the app','入手する','Obtener'),
('See more.<br><em>Create better.</em>','もっと見える。<br><em>もっと、つくれる。</em>','Mira más.<br><em>Crea mejor.</em>'),
('Your images. Every possibility.','画像の可能性を、もっと。','Tus imágenes. Más posibilidades.'),
('From your first favorite to the finest pixel. Browse, compare and create in one powerful Mac workspace.','お気に入りの一枚から、繊細なピクセルまで。閲覧、比較、制作を、ひとつの Mac ワークスペースで。','De tu foto favorita al detalle de cada píxel. Explora, compara y crea en un solo espacio para Mac.'),
('Discover on the App Store','App Store で見る','Ver en el App Store'),('Watch the film','デモを見る','Ver el vídeo'),
('Watch the 30-second film','30 秒のデモを見る','Ver el vídeo de 30 segundos'),
('image formats','画像形式','formatos de imagen'),('Make room for your favorites.','お気に入りを、手元に。','Tus favoritas, siempre a mano.'),
('Made for photographers. Built for detail.','写真のために。細部のために。','Para tus fotos. Para cada detalle.'),
('Browse & organize','閲覧・整理','Explorar y organizar'),('Compare six images','6 枚を比較','Comparar seis imágenes'),('Inspect every pixel','ピクセルを確認','Inspeccionar píxeles'),
('One workspace. Every detail.','ひとつの空間に、すべての細部を。','Un espacio. Todos los detalles.'),
('Real app. Real possibilities.','実際のアプリ画面。広がる可能性。','La app real. Posibilidades reales.'),
('New HDR display','新しい HDR 表示','Nueva visualización HDR'),
('LESS SWITCHING. MORE CREATING.','切り替えを減らして、制作に集中。','MENOS CAMBIOS. MÁS CREACIÓN.'),
('Your whole workflow.<br><span class="muted">Beautifully connected.</span>','ワークフロー全体を。<br><span class="muted">ひとつにつなぐ。</span>','Todo tu flujo de trabajo.<br><span class="muted">Perfectamente conectado.</span>'),
('From the first browse to the final review, keep your images and your tools together. Open mixed-format folders, find your favorites and move straight into the details.','最初の閲覧から最後のレビューまで、画像とツールをひとつに。さまざまな形式の画像からお気に入りを選び、そのまま細部の確認へ進めます。','Desde la primera exploración hasta la revisión final, reúne imágenes y herramientas. Abre carpetas con distintos formatos, elige tus favoritas y examina los detalles.'),
('formats, including RAW','RAW を含む形式','formatos, incluido RAW'),('synchronized views','画像を同期比較','vistas sincronizadas'),('a new way to see','新しい表示体験','una nueva forma de ver'),
('A CLOSER LOOK','細部まで、見えてくる。','UNA MIRADA MÁS ATENTA'),
('Great images. Meet great insight.','美しい画像を、深く知る。','Grandes imágenes. Más información.'),
('Six images','6 枚比較','Seis imágenes'),('Difference','差分','Diferencias'),('Pixels','ピクセル','Píxeles'),
('Scroll to explore, or choose a view above','スクロール、または上の表示を選択','Desplázate o elige una vista arriba'),
('IN SYNC. IN MOTION.','動きも、視点も、ひとつに。','EN MOVIMIENTO. EN SINTONÍA.'),
('Same detail.<br>Every view.','同じ細部を。<br>すべての画像で。','El mismo detalle.<br>En cada vista.'),
('Zoom and pan together. Spend your time comparing images, not finding your place.','ズームと移動を同期。位置合わせの手間を減らし、画像の比較に集中できます。','Sincroniza el zoom y el desplazamiento. Dedica tu tiempo a comparar imágenes, sin tener que buscar la misma zona.'),
('Play demonstration ▶','デモを再生 ▶','Reproducir demostración ▶'),('Pause demonstration Ⅱ','デモを一時停止 Ⅱ','Pausar demostración Ⅱ'),('Video unavailable. Try again.','動画を読み込めません。再試行してください。','Vídeo no disponible. Inténtalo de nuevo.'),
('A BRIGHTER PERSPECTIVE','明るさの、その先へ。','UNA PERSPECTIVA MÁS LUMINOSA'),
('Let highlights<br><em>come to life.</em>','ハイライトに、<br><em>もっと表情を。</em>','Da vida<br><em>a las altas luces.</em>'),
('Meet HDR display. Switch between HDR and SDR, right inside your image workspace.','新しい HDR 表示。いつものワークスペースで、HDR と SDR を切り替えられます。','Descubre la visualización HDR. Alterna entre HDR y SDR sin salir de tu espacio de trabajo.'),
('HDR appearance depends on the image and display. This web preview is a standard dynamic range capture.','HDR の見え方は画像とディスプレイによって異なります。このページでは SDR の画面キャプチャを使用しています。','El aspecto HDR depende de la imagen y la pantalla. Esta vista web utiliza una captura en rango dinámico estándar.'),
('THOUGHTFULLY EQUIPPED','制作に必要なものを、手元に。','HERRAMIENTAS BIEN PENSADAS'),
('Small details.<br>Big possibilities.','細部へのこだわり。<br>広がる可能性。','Pequeños detalles.<br>Grandes posibilidades.'),
('Explore the tools that bring your image workflow together.','画像のワークフローをつなぐツールをご覧ください。','Descubre las herramientas que conectan tu flujo de trabajo.'),
('Give your images<br>a space of their own.','あなたの画像に、<br>専用のワークスペースを。','Dale a tus imágenes<br>su propio espacio.'),
('Domino Image Viewer. Made for your Mac.','Domino Image Viewer。あなたの Mac のために。','Domino Image Viewer. Hecho para tu Mac.'),
('View on the App Store','App Store で見る','Ver en el App Store'),('Here to help.','いつでも、お手伝いします。','Estamos para ayudarte.'),
('Questions, feedback or something not working? Get in touch.','ご質問、ご意見、不具合のご報告など、お気軽にご連絡ください。','¿Dudas, sugerencias o algún problema? Ponte en contacto.'),
('Privacy policy','プライバシーポリシー','Política de privacidad'),('Every detail matters.','すべての細部が、大切。','Cada detalle importa.'),('Back to top ↑','トップへ ↑','Volver arriba ↑'),
('Original music · Clear Motion','オリジナル音楽 · Clear Motion','Música original · Clear Motion'),('Explore feature','機能の詳細を見る','Explorar la función'),('Close','閉じる','Cerrar'),
('Six images. One clear comparison.','6 枚を並べて、違いを明確に。','Seis imágenes. Una comparación clara.'),
('Compare two to six images with synchronized zoom and pan. Keep every version focused on the same detail.','2〜6 枚の画像を、ズームと移動を同期して比較。同じ細部をすべてのバージョンで確認できます。','Compara de dos a seis imágenes con zoom y desplazamiento sincronizados. Observa el mismo detalle en cada versión.'),
('Small changes. Clearly visible.','わずかな違いも、はっきりと。','Pequeños cambios. Claramente visibles.'),
('Keep both originals beside the difference map. Adjust tolerance in the app to focus on the changes that matter.','2 枚の原画像と差分マップを並べて表示。アプリ内で許容値を調整し、注目する変化を確認できます。','Muestra ambos originales junto al mapa de diferencias. Ajusta la tolerancia en la app para centrarte en los cambios relevantes.'),
('Every pixel. In clear detail.','ピクセルひとつまで、くっきり。','Cada píxel. Con todo detalle.'),
('Inspect pixel grids, values and regional statistics together. Turn a closer look into a more precise comparison.','ピクセルグリッド、数値、領域統計をまとめて確認。細かな観察を、より正確な比較へ。','Examina la cuadrícula de píxeles, sus valores y las estadísticas de cada región. Una mirada más cercana para comparar con precisión.'),
('Domino Image Viewer — Every detail matters.','Domino Image Viewer — すべての細部が、大切。','Domino Image Viewer — Cada detalle importa.'),
('Browse, compare and create with Domino Image Viewer for Mac. HDR, six-image comparison, pixel inspection and professional reviews.','Mac 用 Domino Image Viewer で、画像の閲覧・比較・制作を。HDR、最大6枚の比較、ピクセル検査、専門的なレビューに対応。','Explora, compara y crea con Domino Image Viewer para Mac. HDR, comparación de seis imágenes, inspección de píxeles y revisiones profesionales.'),
('Main','メインナビゲーション','Navegación principal'),('Comparison views','比較表示','Vistas de comparación'),('Feature details','機能の詳細','Detalles de las funciones'),('Product demonstration','製品デモ','Demostración del producto'),
('Synchronized image comparison demonstration','画像の同期比較デモ','Demostración de comparación sincronizada'),
('Domino image browser, ratings and file tray','画像ブラウザ、評価、ファイルトレイ','Explorador de imágenes, valoraciones y bandeja de archivos'),
('HDR and SDR display comparison','HDR と SDR の表示比較','Comparación de visualización HDR y SDR'),
('English interface demonstration','英語インターフェースのデモ','Demostración con interfaz en inglés'),
]
# Feature translations include all detail modal copy, not just headings.
features=[
(1,['最大6枚の同期比較','6 枚を並べて。違いをひと目で。','2〜6枚の画像を並べ、ズームと移動を同期。同じ位置の細部を比較できます。',[['2〜6枚の柔軟なレイアウト','写真選び、修正確認、複数バージョンの比較に。'],['ズームと移動を同期','画像間で同じ位置をすぐに確認できます。'],['画面とデータを一緒に','ヒストグラム、領域統計、ピクセル情報を表示。']],'複数画像の比較ワークスペース'],['HASTA SEIS IMÁGENES','Seis imágenes. Una comparación clara.','Compara de dos a seis imágenes con zoom y desplazamiento sincronizados para observar el mismo detalle.',[['Diseños de 2 a 6 imágenes','Compara selecciones, retoques y versiones.'],['Navegación sincronizada','Amplía y desplaza todas las vistas a la vez.'],['Imágenes con información','Consulta histogramas, estadísticas y datos de píxeles.']],'Espacio de comparación de imágenes']),
(2,['許容値で差分を比較','わずかな違いも、はっきりと。','2枚の画像の違いを差分マップで表示。許容値を調整し、しきい値を超える変化に注目できます。',[['原画像と差分を並べて','2枚の原画像と比較結果を同時に確認。'],['許容値を調整','確認したい内容に合わせて感度を設定。'],['細部を同期して確認','同じ位置をズーム・移動しながら変更を検証。']],'原画像 A / 差分 / 原画像 B'],['TOLERANCIA Y DIFERENCIAS','Pequeños cambios. Claramente visibles.','Convierte las diferencias entre dos imágenes en un mapa visual. Ajusta la tolerancia para destacar los cambios que superen el umbral.',[['Originales junto a la diferencia','Examina ambas imágenes y el resultado a la vez.'],['Tolerancia ajustable','Configura la sensibilidad según la tarea.'],['Inspección sincronizada','Amplía y desplaza las vistas para comprobar cambios.']],'Original A / Diferencia / Original B']),
(3,['新しい HDR 表示','ハイライトに、もっと表情を。','対応ディスプレイで HDR 画像を表示。HDR と SDR を切り替え、表示モードによる違いを確認できます。',[['HDR 画像を自動検出','バッジで HDR 画像をひと目で確認。'],['HDR / SDR を切り替え','ひとつのワークフローで表示を比較。'],['自動 HDR を選択可能','設定で有効にして、日常の閲覧に。']],'HDR / SDR 表示比較'],['NUEVA VISUALIZACIÓN HDR','Da vida a las altas luces.','Visualiza imágenes HDR en pantallas compatibles. Alterna entre HDR y SDR para examinar cada modo.',[['Detección automática de HDR','Identifica las imágenes HDR con sus indicadores.'],['Cambio entre HDR y SDR','Compara los modos dentro del mismo flujo.'],['HDR automático opcional','Actívalo en Ajustes para la exploración diaria.']],'Comparación de visualización HDR / SDR']),
(4,['MAC の画像ワークスペース','見る。比べる。つくる。ひとつの場所で。','画像の閲覧、精密な比較、日常の制作ツールを、Mac のひとつのワークスペースに。',[['100以上の形式を表示','一般的な画像、RAW、対応アーカイブを閲覧。'],['お気に入りを手元に','1〜5つ星、評価フィルタ、Finderタグ、ファイルトレイ。'],['整理から出力まで','一括リネーム、回転、反転、切り抜き、サイズ変更。']],'画像ブラウザ、評価、ファイルトレイ'],['TU ESPACIO DE IMÁGENES PARA MAC','Explora. Compara. Crea. Todo en uno.','Reúne la exploración, la comparación precisa y las herramientas creativas en un solo espacio para Mac.',[['Más de 100 formatos','Explora imágenes, RAW y archivos comprimidos compatibles.'],['Tus favoritas, siempre a mano','Estrellas, filtros, etiquetas de Finder y bandeja de archivos.'],['Organiza y exporta','Renombra por lotes, gira, refleja, recorta y cambia el tamaño.']],'Explorador, valoraciones y bandeja de archivos']),
(5,['画像結合ワークスペース','複数の画像を、ひとつの作品に。','作品紹介、比較、共有のために画像を配置。レイアウトを調整し、プレビューして書き出せます。',[['横方向・縦方向に結合','画像の順番と方向を選択。'],['余白と背景を調整','画面に合わせて間隔や背景を設定。'],['確認して書き出す','素材の選択から完成画像まで。']],'画像結合の設定とプレビュー'],['COMPOSICIÓN DE IMÁGENES','Varias imágenes. Una composición.','Prepara diseños para tu portafolio, comparaciones o publicaciones. Organiza, previsualiza y exporta en un solo lugar.',[['Diseños horizontales o verticales','Elige el orden y la dirección de las imágenes.'],['Espaciado y fondos','Ajusta los márgenes y el fondo de la composición.'],['Previsualiza y exporta','Lleva tu selección hasta una imagen terminada.']],'Controles de composición y vista previa']),
(6,['レビュー / 匿名ランキング','画質に集中。先入観を減らす。','レビューモードで採点、または匿名ランキングで比較。判断を保存可能な評価プロジェクトにまとめられます。',[['2つの評価方法','採点と匿名の順位付けを使い分け。'],['ペア設定とランダム化','データソースを設定し、グループとペインの順番を変更。'],['続きから再開','モードごとに最大9件を保存。インポート・エクスポート対応。']],'評価プロジェクトと画像の組み合わせ'],['REVISIÓN / CLASIFICACIÓN ANÓNIMA','Céntrate en la calidad. Reduce sesgos.','Puntúa imágenes o compáralas de forma anónima. Organiza tus decisiones en proyectos de evaluación guardados.',[['Dos formas de evaluar','Elige puntuación o clasificación anónima.'],['Empareja y aleatoriza','Configura fuentes y aleatoriza grupos y paneles.'],['Continúa cuando quieras','Guarda hasta 9 proyectos por modo. Importa y exporta.']],'Proyectos de evaluación y emparejamiento']),
(7,['プロフェッショナルなレビュー','見ながら評価。判断を記録。','画像を並べて確認し、採点コンソールで判断を記録。観察と評価をひとつの流れで進められます。',[['画像と採点を同時に','現在のグループに集中できます。'],['問題タグを記録','見つけた問題をレビューに残せます。'],['集計とレポート','グループごとの採点を振り返り、結果を確認。']],'画像比較と採点コンソール'],['ESPACIO DE REVISIÓN PROFESIONAL','Inspecciona. Puntúa. Concéntrate.','Compara imágenes en paralelo y registra tus decisiones en la consola de puntuación. Revisa y evalúa sin interrumpir el flujo.',[['Imágenes y puntuación juntas','Céntrate en el grupo actual.'],['Etiquetas de problemas','Anota los problemas que encuentres al revisar.'],['Resúmenes e informes','Consulta las puntuaciones y revisa tus resultados.']],'Comparación y consola de puntuación']),
(8,['選択領域の統計','領域を選んで、データを読む。','注目する領域を選択し、色と輝度のデータを画像と一緒に確認。比較の手がかりが増えます。',[['調べたい範囲を自由に','被写体、シャドウ、ハイライトを確認。'],['RGB / HSV / 輝度','領域統計とヒストグラムをまとめて表示。'],['複数画像を連動して確認','同じ細部に注目して比較できます。']],'複数画像の領域選択と統計'],['ESTADÍSTICAS POR REGIÓN','Selecciona una región. Consulta los datos.','Elige una zona y examina su color y luminancia junto a la imagen para comparar con más información.',[['Elige la zona de interés','Examina sujetos, sombras o altas luces.'],['RGB / HSV / luminancia','Consulta estadísticas e histogramas.'],['Inspección vinculada','Observa el mismo detalle en varias vistas.']],'Selección de regiones y estadísticas']),
(9,['プロモード / ピクセルグリッド','ピクセルひとつまで、くっきり。','高倍率でピクセルグリッドと数値を表示。バージョンを並べ、色の変化や細かな違いを確認できます。',[['グリッドと数値を重ねて表示','画像上でピクセル情報を直接確認。'],['高倍率ズームを同期','同じ位置でバージョン間の違いを比較。'],['統計情報も一緒に','ヒストグラムと領域データを活用。']],'高倍率ピクセルグリッド比較'],['MODO PRO / CUADRÍCULA DE PÍXELES','Cada píxel. Con todo detalle.','Examina la cuadrícula y los valores con gran aumento. Compara versiones para detectar cambios de color y diferencias sutiles.',[['Cuadrículas con valores','Lee la información de píxeles sobre la imagen.'],['Gran aumento sincronizado','Compara la misma posición entre versiones.'],['Datos siempre a la vista','Usa histogramas y estadísticas durante la inspección.']],'Comparación ampliada de píxeles'])
]
data=json.loads((ROOT/'scripts/content.json').read_text())
for n,ja,es in features:
    item=data[n-1]
    for locale,vals in [('ja',ja),('es',es)]:
        item[locale]={'label':vals[0],'title':[vals[1]],'description':vals[2],'features':vals[3],'screenLabel':vals[4]}
    for field in ['label','description','screenLabel']:
        rows.append((item['en-US'][field],item['ja'][field],item['es'][field]))
    rows.append((' '.join(item['en-US']['title']),item['ja']['title'][0],item['es']['title'][0]))
translations={en:{'ja':ja,'es':es} for en,ja,es in rows}
(ROOT/'scripts/content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
(ROOT/'scripts/translations.json').write_text(json.dumps(translations,ensure_ascii=False,indent=2))
(ROOT/'locale-data.js').write_text('window.DOMINO_TRANSLATIONS = '+json.dumps(translations,ensure_ascii=False)+';\n')
print(f'{len(rows)} translation entries; nine complete feature descriptions in Japanese and Spanish.')
