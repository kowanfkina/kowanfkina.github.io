"""Localized privacy and terms pages; statements checked against the shipped app code."""
from html import escape

POLICY_PATH = '/Domino-Image-Viewer-Privacy-Policy/'
TERMS_PATH = POLICY_PATH + 'terms/'

# Each row is (anchor, localized heading, localized paragraphs). Keep application
# behavior distinct from the website's third-party analytics.
PRIVACY = [
    ('scope', ('1. Scope', '1. 适用范围', '1. 適用範囲', '1. Alcance'), [
        ('This policy covers Domino Image Viewer for macOS and its official website, dominoimg.com. The app provides image browsing, comparison for up to six images, pixel and regional statistics, HDR viewing, color grading, reviews, ranking and image export tools.',
         '本政策适用于 macOS 应用 Domino Image Viewer 及官网 dominoimg.com。应用提供图片浏览、最多六图对比、像素与局部区域统计、HDR 查看、调色、评审、排序与图像输出工具。',
         '本ポリシーは macOS アプリ Domino Image Viewer と公式サイト dominoimg.com に適用されます。画像閲覧、最大 6 枚の比較、ピクセル・領域統計、HDR 表示、カラー調整、評価、順位付け、画像出力を提供します。',
         'Esta política se aplica a Domino Image Viewer para macOS y a dominoimg.com. La app ofrece exploración, comparación de hasta seis imágenes, estadísticas de píxeles y regiones, HDR, color, evaluación, clasificación y exportación.'),
        ('The app and the website handle different information. Website analytics described below are not embedded in the Mac app.',
         '应用和官网处理的数据有所不同。下文说明的官网统计服务没有集成到 Mac 应用中。',
         'アプリとウェブサイトでは扱う情報が異なります。以下のサイト解析サービスは Mac アプリには組み込まれていません。',
         'La app y el sitio tratan información distinta. Los servicios de analítica del sitio descritos abajo no están integrados en la app para Mac.')]),
    ('local', ('2. Your image workspace', '2. 本地图像与工作数据', '2. 画像と作業データ', '2. Imágenes y datos de trabajo'), [
        ('The app processes images, folders and paths you open or authorize. Thumbnails, previews, metadata, pixel and ROI statistics, adjustments, review projects, ratings and ranking results are processed on your Mac. Editing and export operate on destinations you choose; the app does not automatically upload this content to developer-operated servers or use it for model training.',
         '应用处理你打开或授权访问的图片、文件夹和路径。缩略图、预览、元数据、像素与 ROI 统计、调色数据、评审项目、评分及排位结果在 Mac 上处理。编辑与导出写入你选择的位置；应用不会自动将这些内容上传到开发者服务器，也不会将其用于模型训练。',
         '開いた、またはアクセスを許可した画像、フォルダ、パスを扱います。サムネイル、プレビュー、メタデータ、ピクセル・ROI 統計、調整、評価プロジェクト、採点、順位は Mac 上で処理されます。編集・出力先は利用者が選択し、内容を開発者のサーバーへ自動送信したりモデル学習に利用したりしません。',
         'La app procesa las imágenes, carpetas y rutas que abres o autorizas. Miniaturas, vistas previas, metadatos, estadísticas ROI, ajustes, proyectos de evaluación, puntuaciones y clasificaciones se procesan en tu Mac. La edición y exportación usan el destino elegido; este contenido no se sube automáticamente a servidores del desarrollador ni se utiliza para entrenar modelos.'),
        ('Local preferences, caches, recent locations and security-scoped bookmarks may be stored to restore authorized folders and workspace settings. Core image tools do not require a developer account. The app has no embedded advertising, behavioral analytics or developer crash-upload SDK.',
         '应用可能在本机保存偏好、缓存、最近位置和安全作用域书签，以恢复已授权目录和工作台设置。核心图像工具不要求注册开发者账户。应用没有内置广告、行为分析或向开发者上传崩溃报告的 SDK。',
         '設定、キャッシュ、最近使った場所、アクセス許可を復元するセキュリティスコープ付きブックマークをローカルに保存する場合があります。画像ツールに開発者アカウントは不要で、広告・行動解析・開発者向けクラッシュ送信 SDK は搭載していません。',
         'Las preferencias, cachés, ubicaciones recientes y marcadores de acceso autorizado pueden guardarse localmente. Las herramientas de imagen no requieren una cuenta del desarrollador. No se integran SDK de publicidad, análisis de comportamiento ni envío de fallos al desarrollador.')]),
    ('access', ('3. Access you control', '3. 权限与主动操作', '3. アクセスの管理', '3. Acceso bajo tu control'), [
        ('File and folder access follows macOS sandbox permissions. Photo-library browsing uses the authorization granted through macOS. Images pasted into the capture tray are read from the clipboard when you choose to paste; app-workspace captures and exported results remain in your selected workflow.',
         '文件与文件夹访问遵循 macOS 沙盒权限。照片图库浏览使用你通过 macOS 授予的授权。主动粘贴到截图托盘时，应用读取剪贴板中的图片；应用工作区截图与导出结果用于你选择的图像工作流。',
         'ファイル・フォルダは macOS のサンドボックス権限に従ってアクセスします。写真ライブラリは macOS で許可した範囲を利用します。キャプチャトレイへの貼り付け操作時にクリップボードの画像を読み取り、アプリ画面のキャプチャと出力は選択した作業で利用します。',
         'El acceso a archivos y carpetas sigue los permisos de macOS. La fototeca usa la autorización del sistema. Las imágenes del portapapeles se leen al pegarlas en la bandeja de capturas; las capturas del espacio de trabajo y las exportaciones se usan en el flujo que eliges.'),
        ('For network locations and cloud-backed folders you authorize, the app or macOS connects to your chosen service to authenticate, list and access files, including when reconnecting a saved location. The remote provider receives the requests and authentication needed for that connection; image content is not sent to a developer image-upload service.',
         '对于你授权的网络位置和云端同步目录，应用或 macOS 会连接对应服务，进行认证、目录查询与文件访问，包括重新连接已保存的位置。远端服务会收到连接所需的请求与认证信息，图像内容不会发送至开发者图像上传服务。',
         '許可したネットワーク場所やクラウド同期フォルダでは、アプリまたは macOS が選択サービスへ接続し、認証・一覧取得・ファイルアクセスを行います。保存場所の再接続も含み、接続に必要な要求と認証情報はそのサービスに渡ります。画像を開発者のアップロードサービスへ送信しません。',
         'Para las ubicaciones de red y carpetas sincronizadas autorizadas, la app o macOS conecta al servicio elegido para autenticar, listar y acceder a archivos, incluso al reconectar ubicaciones guardadas. El proveedor recibe las solicitudes y autenticación necesarias; las imágenes no se envían a un servicio de subida del desarrollador.'),
        ('Saved network configuration may include server address, username, path and host fingerprint. Passwords can remain in memory for the session or be saved in the macOS Keychain when you choose to remember them. You can remove saved connections and credentials.',
         '保存的网络配置可能包括服务器地址、用户名、路径与主机指纹。密码可仅保留在当前会话内存中；选择记住密码时会保存到 macOS 钥匙串。你可以移除已保存的连接和凭据。',
         '保存する接続設定にはサーバー、ユーザー名、パス、ホストのフィンガープリントが含まれる場合があります。パスワードはセッション中のメモリに保持し、保存を選ぶと macOS キーチェーンを利用します。保存した接続と認証情報は削除できます。',
         'La configuración guardada puede incluir servidor, usuario, ruta y huella del host. La contraseña puede mantenerse en memoria durante la sesión o guardarse en el llavero de macOS si eliges recordarla. Puedes eliminar conexiones y credenciales guardadas.')]),
    ('apple', ('4. Apple purchases and updates', '4. Apple 购买、恢复与更新', '4. Apple の購入・復元・更新', '4. Compras, restauración y actualizaciones de Apple'), [
        ('Subscriptions and lifetime access use Apple StoreKit. The app checks verified transaction and entitlement information to determine access, and may cache access status locally. Restore Purchases requests synchronization with the App Store. Apple processes payments; the developer does not receive your payment-card details or Apple Account password.',
         '订阅与终身解锁通过 Apple StoreKit 处理。应用读取经过验证的交易与权益信息以确认使用权限，并可能在本机缓存权限状态。“恢复购买”向 App Store 请求同步。付款由 Apple 处理，开发者不会获得你的支付卡信息或 Apple 账户密码。',
         'サブスクリプションと買い切りの解除は Apple StoreKit を使用します。検証済みの取引・利用権を確認し、状態をローカルに保存する場合があります。「購入を復元」は App Store に同期を要求します。支払いは Apple が処理し、開発者にカード情報や Apple Account のパスワードは渡りません。',
         'Las suscripciones y el acceso permanente usan Apple StoreKit. La app verifica transacciones y derechos de acceso y puede guardar su estado localmente. Restaurar compras solicita la sincronización con el App Store. Apple procesa el pago; el desarrollador no recibe tu tarjeta ni la contraseña de tu cuenta de Apple.'),
        ('Update checks contact Apple’s app lookup service with the app identifier and system region. Automatic update checks can be disabled in app settings. Apple’s platform services and any diagnostics you elect to share with Apple follow Apple’s policies.',
         '检查更新会向 Apple 应用查询服务发送应用标识与系统地区信息。你可以在应用设置中关闭自动更新检查。Apple 的平台服务，以及你选择向 Apple 共享的诊断信息，遵循 Apple 的政策。',
         '更新確認ではアプリ識別子とシステムの地域情報を Apple の検索サービスへ送ります。自動確認はアプリ設定で無効にできます。Apple のサービスと利用者が Apple に共有する診断情報には Apple のポリシーが適用されます。',
         'La comprobación de actualizaciones envía el identificador de la app y la región del sistema al servicio de consulta de Apple. Puedes desactivar las comprobaciones automáticas en ajustes. Los servicios y diagnósticos que decidas compartir con Apple siguen sus políticas.')]),
    ('website', ('5. Website analytics', '5. 官网访问与统计', '5. サイトのアクセス解析', '5. Analítica del sitio'), [
        ('The official website uses Microsoft Clarity, Umami Cloud and Google Ads to understand visits, improve the presentation and measure App Store link clicks. Depending on the service and browser settings, information may include page URLs, referrals, browser and device characteristics, interactions, IP-derived approximate location, and cookie or similar identifiers.',
         '官网使用 Microsoft Clarity、Umami Cloud 和 Google Ads，了解访问情况、改进展示并衡量 App Store 链接点击。按服务与浏览器设置，相关数据可能包括页面地址、来源、浏览器与设备特征、交互、基于 IP 的大致地区，以及 Cookie 或类似标识。',
         '公式サイトは Microsoft Clarity、Umami Cloud、Google Ads を用いてアクセスを把握し、表示を改善し、App Store リンクのクリックを測定します。サービスとブラウザ設定に応じて、URL、参照元、ブラウザ・端末情報、操作、IP に基づくおおよその地域、Cookie 等の識別情報を扱う場合があります。',
         'El sitio usa Microsoft Clarity, Umami Cloud y Google Ads para entender visitas, mejorar la presentación y medir clics hacia el App Store. Según el servicio y el navegador, los datos pueden incluir URL, referencias, características del dispositivo, interacciones, región aproximada por IP y cookies u otros identificadores.'),
        ('The Google Ads conversion on this website means a click to open the App Store. It does not confirm a purchase or subscription inside the store. Website services cannot access the image library or local working files used in the Mac app.',
         '本官网的 Google Ads 转化代表“点击前往 App Store”，不代表用户已在商城完成购买或订阅。官网统计服务不能访问 Mac 应用中的图像库或本地工作文件。',
         'このサイトの Google Ads コンバージョンは App Store を開くクリックを意味し、購入や購読の完了を示すものではありません。サイト解析は Mac アプリの画像ライブラリや作業ファイルへアクセスできません。',
         'La conversión de Google Ads representa un clic para abrir el App Store, no una compra o suscripción confirmada. Los servicios del sitio no acceden a la biblioteca de imágenes ni a los archivos de trabajo de la app para Mac.')]),
    ('storage', ('6. Storage and your choices', '6. 保存、删除与统计控制', '6. 保存・削除・選択', '6. Almacenamiento y controles'), [
        ('Local working data remains until you remove it, the app’s cache policy clears it, or macOS manages it. You can manage permissions in macOS, remove saved locations and projects, and clear caches in the app. Uninstalling may leave exported files or local support data; deleting those files is separate from cancelling a subscription.',
         '本地工作数据会保留至你主动删除、应用缓存策略清理或 macOS 管理清理。你可以在 macOS 中管理权限，移除保存的位置和项目，并通过应用清理缓存。卸载可能保留已导出文件或本地支持数据；删除这些文件与取消订阅是不同操作。',
         '作業データは利用者による削除、アプリのキャッシュ管理、macOS の管理までローカルに残ります。macOS で権限を管理し、保存場所やプロジェクトの削除、キャッシュの消去ができます。アンインストール後も出力ファイル等が残る場合があり、削除してもサブスクリプションは解約されません。',
         'Los datos locales permanecen hasta que los elimines o los gestionen la caché o macOS. Puedes administrar permisos, quitar ubicaciones y proyectos y limpiar la caché. Desinstalar puede dejar archivos exportados o datos locales; eliminarlos es distinto de cancelar una suscripción.'),
        ('The website stores your chosen language in browser local storage. You can clear site data and manage cookies or block analytics through your browser controls. Website hosting and analytics providers process and retain their service data under their own policies and settings; clearing local browser data does not erase records already held by those providers.',
         '官网通过浏览器本地存储记住你选择的语言。你可以清除站点数据，使用浏览器设置管理 Cookie 或阻止统计请求。网站托管与统计服务按照各自政策和设置处理、保存服务数据；清除浏览器本地数据不会自动删除服务方已经保存的记录。',
         'サイトは選択言語をブラウザのローカルストレージに保存します。サイトデータの消去、Cookie 管理、解析のブロックはブラウザで行えます。ホスティング・解析事業者は各自の方針と設定に従ってデータを保存し、ブラウザの消去で事業者側の既存記録は削除されません。',
         'El sitio guarda el idioma elegido en el almacenamiento local del navegador. Puedes borrar datos, administrar cookies o bloquear la analítica desde el navegador. Los proveedores de alojamiento y analítica conservan datos conforme a sus políticas y ajustes; borrar datos del navegador no elimina registros ya guardados por ellos.')]),
    ('contact', ('7. Support, rights and changes', '7. 支持、隐私请求与政策更新', '7. サポート・権利・更新', '7. Soporte, derechos y cambios'), [
        ('If you email support, we receive your address, message and any attachments you choose to send, and use them to respond and resolve the issue. Send only the information needed for support. Depending on applicable law, you may request access, correction, deletion or restriction of personal information we hold by contacting the address below.',
         '你通过邮件联系支持时，我们会收到你的邮件地址、正文和主动发送的附件，用于回复和解决问题。请仅发送支持所需的信息。依据适用法律，你可以通过下方邮箱请求访问、更正、删除或限制处理我们持有的个人信息。',
         'メールでの問い合わせではアドレス、本文、任意で送った添付を受け取り、回答と問題解決に利用します。必要な情報のみを送信してください。適用法に応じて、下記アドレスへ保有情報の開示・訂正・削除・処理制限を依頼できます。',
         'Al contactar por correo recibimos tu dirección, mensaje y adjuntos voluntarios para responder y resolver el problema. Envía solo lo necesario. Según la legislación aplicable, puedes solicitar acceso, corrección, eliminación o limitación del tratamiento escribiendo a la dirección indicada.'),
        ('We update this policy when features or data practices change and show the revised date here. Contact: <a href="mailto:1134105470@qq.com">1134105470@qq.com</a>.',
         '功能或数据处理方式变化时，我们会更新本政策，并标明修订日期。联系邮箱：<a href="mailto:1134105470@qq.com">1134105470@qq.com</a>。',
         '機能やデータの扱いが変わる際はポリシーと更新日を改訂します。連絡先：<a href="mailto:1134105470@qq.com">1134105470@qq.com</a>。',
         'Actualizamos esta política y su fecha cuando cambian las funciones o las prácticas. Contacto: <a href="mailto:1134105470@qq.com">1134105470@qq.com</a>.')])
]

PROVIDERS = [
    ('Microsoft Clarity', ('Heatmaps and session replay help us understand page interactions and improve the website. Cookies and similar technologies may be used.', '通过热力图和会话回放了解页面交互，改进官网；可能使用 Cookie 与类似技术。', 'ヒートマップとセッション再生で操作を把握し、サイトを改善します。Cookie 等を使用する場合があります。', 'Los mapas de calor y las grabaciones de sesión ayudan a mejorar el sitio. Puede usar cookies y tecnologías similares.'), 'https://www.microsoft.com/privacy/privacystatement'),
    ('Umami Cloud', ('Page visits, referrals and browser or device information help us understand traffic. We do not send names, email addresses or app files as custom analytics fields.', '通过页面访问、来源及浏览器或设备信息了解流量；我们不把姓名、邮箱或应用文件作为自定义统计字段发送。', '訪問、参照元、ブラウザ・端末情報からアクセスを把握します。名前、メール、アプリのファイルを独自解析項目として送信しません。', 'Usamos visitas, referencias y datos del navegador o dispositivo para entender el tráfico. No enviamos nombres, correos ni archivos de la app como campos personalizados.'), 'https://umami.is/privacy'),
    ('Google Ads', ('Measures clicks on App Store links for advertising attribution. Google may receive page and network information and use cookies according to its policies.', '衡量 App Store 链接点击与广告归因。Google 可能接收页面和网络信息，并按其政策使用 Cookie。', 'App Store へのクリックと広告効果を測定します。Google はページ・通信情報を受け取り、方針に従って Cookie を利用する場合があります。', 'Mide clics hacia el App Store y la atribución publicitaria. Google puede recibir datos de página y red y usar cookies conforme a sus políticas.'), 'https://policies.google.com/technologies/partner-sites'),
]

TERMS = [
    ('license', ('1. License and use', '1. 许可与使用范围', '1. ライセンスと利用', '1. Licencia y uso'), [
        ('Domino Image Viewer is licensed, not sold. Use is governed by the <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple Standard EULA</a> and applicable law. You retain responsibility for copyright and permissions for the images you open, edit or share.', 'Domino Image Viewer 向你授予软件使用许可，不转移软件所有权。使用遵循 <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple 标准 EULA</a> 及适用法律。你需确保打开、编辑和分享的图像具备相应版权或授权。', 'Domino Image Viewer はソフトウェアの所有権ではなく利用許諾を提供します。<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple 標準 EULA</a> と適用法に従い、画像の閲覧・編集・共有に必要な権利は利用者が確保してください。', 'Domino Image Viewer se licencia, no se vende. Se aplican el <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">EULA estándar de Apple</a> y la ley. Eres responsable de los derechos sobre las imágenes que abres, editas o compartes.')]),
    ('purchase', ('2. Purchases and subscriptions', '2. 购买、订阅与恢复', '2. 購入・サブスクリプション・復元', '2. Compras, suscripciones y restauración'), [
        ('The app is free to download; subscription or lifetime in-app purchase unlocks full access. Available products, duration, price, trial eligibility and renewal details are shown in the purchase screen before confirmation. Auto-renewing subscriptions continue until cancelled through your Apple Account subscription settings. Deleting the app does not cancel a subscription.', '应用可免费下载，通过订阅或终身应用内购买解锁完整功能。实际产品、期限、价格、试用资格和续订信息会在确认购买前显示。自动续订订阅持续至你通过 Apple 账户的订阅设置取消；删除应用不会取消订阅。', '無料でダウンロードでき、サブスクリプションまたは買い切りの App 内購入で全機能を利用できます。商品、期間、価格、体験資格、更新条件は購入確定前に表示されます。自動更新は Apple Account の設定で解約するまで続き、アプリの削除では解約されません。', 'La descarga es gratuita; una suscripción o compra permanente desbloquea el acceso completo. Los productos, plazos, precios, pruebas y renovación se muestran antes de confirmar. Las suscripciones se renuevan hasta cancelarlas en los ajustes de Apple. Borrar la app no cancela la suscripción.'),
        ('Use Restore Purchases with the Apple Account that made the purchase to request synchronization of eligible entitlements. Purchase, refund and cancellation decisions are handled by Apple under its policies. The website’s App Store click event does not establish a purchase or entitlement.', '请使用购买时的 Apple 账户，通过“恢复购买”同步符合条件的权益。付款、退款和订阅取消按 Apple 的平台政策处理。官网的 App Store 点击事件不能证明购买成功或授予使用权限。', '購入時の Apple Account で「購入を復元」を使用し、有効な利用権を同期してください。支払い、返金、解約には Apple の方針が適用されます。サイトでのクリックだけでは購入や利用権を確認できません。', 'Usa Restaurar compras con la cuenta de Apple que realizó la compra para sincronizar los derechos elegibles. Apple gestiona pagos, reembolsos y cancelaciones conforme a sus políticas. Un clic del sitio no confirma una compra ni concede acceso.')]),
    ('files', ('3. Your files and results', '3. 文件操作与结果', '3. ファイルと結果', '3. Archivos y resultados'), [
        ('Keep backups before overwriting, deleting or running batch operations. You choose which files to process and where to export; review outputs before using them in a critical workflow. Display, HDR, color and format results depend on the source file, screen, system and supported codecs.', '覆盖、删除或批量操作前，请保留原始文件备份。你选择处理的文件与导出位置，在用于关键工作流前应核对结果。显示、HDR、色彩与格式效果取决于源文件、屏幕、系统和支持的编解码器。', '上書き、削除、一括操作の前に元ファイルをバックアップしてください。処理対象と出力先は利用者が選択し、重要な作業で使う前に結果を確認してください。表示、HDR、色、形式は元画像、画面、システム、対応コーデックに依存します。', 'Conserva copias antes de sobrescribir, borrar o ejecutar operaciones por lotes. Elige los archivos y destinos y revisa los resultados antes de usarlos en trabajos críticos. La visualización, HDR, color y formatos dependen del archivo, la pantalla, el sistema y los códecs.')]),
    ('support', ('4. Support and applicable rights', '4. 支持与适用权利', '4. サポートと適用される権利', '4. Soporte y derechos aplicables'), [
        ('The app is provided subject to the warranties and limitations in the Apple Standard EULA and applicable law. Nothing here excludes rights that cannot legally be waived. For questions about features, purchases or these terms, contact <a href="mailto:1134105470@qq.com">1134105470@qq.com</a>.', '应用的保证与责任限制以 Apple 标准 EULA 和适用法律为准，本条款不排除依法不得放弃的权利。功能、购买或条款相关问题，请联系 <a href="mailto:1134105470@qq.com">1134105470@qq.com</a>。', '保証と責任制限は Apple 標準 EULA と適用法に従い、法律上放棄できない権利は制限しません。機能、購入、規約については <a href="mailto:1134105470@qq.com">1134105470@qq.com</a> へご連絡ください。', 'Se aplican las garantías y limitaciones del EULA de Apple y la ley. No se excluyen derechos irrenunciables. Para dudas sobre funciones, compras o términos, escribe a <a href="mailto:1134105470@qq.com">1134105470@qq.com</a>.')])
]

def build_legal_pages(t, tracking_head):
    pages = {}
    titles = [
        ('Privacy policy', '隐私政策', 'プライバシーポリシー', 'Política de privacidad'),
        ('Terms of use', '使用条款', '利用規約', 'Términos de uso')]
    for is_terms, rows in ((False, PRIVACY), (True, TERMS)):
        heading = titles[int(is_terms)]
        pathname = TERMS_PATH if is_terms else POLICY_PATH
        other = POLICY_PATH if is_terms else TERMS_PATH
        key = f'Domino Image Viewer — {heading[0]}'
        t(*(f'Domino Image Viewer — {name}' for name in heading))
        title = escape(key)
        html = [f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f7fb"><meta name="description" content="{title}"><meta name="page-title-key" content="{title}"><title>{title}</title><link rel="canonical" href="https://dominoimg.com{pathname}"><link rel="icon" href="/assets/product/icon.webp">']
        for lang,query in (('x-default',''),('en','?lang=en'),('zh-CN','?lang=zh'),('ja','?lang=ja'),('es','?lang=es')):
            html.append(f'<link rel="alternate" hreflang="{lang}" href="https://dominoimg.com{pathname}{query}">')
        html.append(tracking_head)
        html.append('<script src="/language.js"></script><link rel="stylesheet" href="/styles.css"><script defer src="/locale-data.js"></script><script defer src="/privacy.js"></script><script defer src="/analytics.js"></script><script defer src="https://cloud.umami.is/script.js" data-website-id="5f3394fe-7688-4e38-948f-5a4bad1f9cff"></script></head><body class="policy-page">')
        html.append(f'<a class="skip" href="#main">{t("Skip to content","跳转到正文","本文へスキップ","Saltar al contenido")}</a><header class="nav"><div class="nav-inner"><a class="brand" data-locale-link href="/"><img src="/assets/product/icon.webp" width="34" height="34" alt=""><span>Domino <b>Image Viewer</b></span></a><nav aria-label="Main"><a data-locale-link href="/">{t("Home","首页","ホーム","Inicio")}</a><select id="language" aria-label="Language / 语言 / 言語 / Idioma"><option value="auto">Auto · 自动</option><option value="zh">简体中文</option><option value="en">English</option><option value="ja">日本語</option><option value="es">Español</option></select></nav></div></header><main id="main"><section class="policy-hero"><div class="wrap"><p class="eyebrow">DOMINO IMAGE VIEWER / {"TERMS" if is_terms else "PRIVACY"}</p><h1>{t(*heading)}</h1>')
        if is_terms:
            lead = ('A clear guide to using your image workspace.', '使用图像工作台的权利与责任。', '画像ワークスペースの利用について。', 'Derechos y responsabilidades en tu espacio de imagen.')
        else:
            lead = ('Your images stay in your workflow. Here is how the app and website handle information.', '图像留在你的工作流中。应用与官网如何处理信息，在这里说明。', '画像は自分のワークフローに。アプリとサイトの情報の扱いを説明します。', 'Tus imágenes, en tu flujo de trabajo. Así tratan la información la app y el sitio.')
        html.append(f'<p class="lead">{t(*lead)}</p><p class="policy-meta">{t("Updated October 12, 2026 · macOS app and official website","更新于 2026 年 10 月 12 日 · macOS 应用与官网","2026 年 10 月 12 日更新 · macOS アプリと公式サイト","Actualizado el 12 de octubre de 2026 · App para macOS y sitio oficial")}</p>')
        if not is_terms:
            summary = [
                (('Local image processing','本地图像处理','画像はローカルで','Imágenes en tu Mac'), ('Browsing, grading, statistics and reviews run on your Mac.','浏览、调色、统计与评审在你的 Mac 上进行。','閲覧・調整・統計・評価は Mac 上で処理。','Exploración, color, estadísticas y evaluación en tu Mac.')),
                (('Purchases with Apple','Apple 购买与恢复','Apple で購入・復元','Compras con Apple'), ('StoreKit verifies access; Apple processes payment.','StoreKit 验证权益，Apple 处理付款。','StoreKit で利用権を確認し、Apple が決済。','StoreKit verifica el acceso y Apple procesa el pago.')),
                (('Website analytics','官网统计单独说明','サイト解析も明確に','Analítica del sitio'), ('Clarity, Umami and Google Ads are used on the website.','官网使用 Clarity、Umami 和 Google Ads。','サイトは Clarity、Umami、Google Ads を使用。','El sitio usa Clarity, Umami y Google Ads.'))]
            html.append('<div class="policy-summary">'+''.join(f'<div><h2>{t(*name)}</h2><p>{t(*copy)}</p></div>' for name,copy in summary)+'</div>')
        html.append(f'<a class="policy-crosslink" data-locale-link href="{other}">{t(*titles[int(not is_terms)])} ↗</a></div></section><div class="policy-layout wrap"><nav class="policy-toc" aria-label="Contents"><p class="eyebrow">{t("ON THIS PAGE","本页内容","このページの内容","EN ESTA PÁGINA")}</p>')
        html.extend(f'<a href="#{anchor}">{t(*name)}</a>' for anchor,name,_ in rows)
        html.append('</nav><div class="policy-content">')
        for anchor,name,paragraphs in rows:
            html.append(f'<section id="{anchor}"><h2>{t(*name)}</h2>')
            html.extend(f'<p>{t(*paragraph)}</p>' for paragraph in paragraphs)
            if anchor == 'website':
                html.append('<div class="policy-providers">'+''.join(f'<div><h3>{name}</h3><p>{t(*copy)}</p><a href="{url}">{t("Provider privacy information","服务方隐私说明","事業者のプライバシー情報","Privacidad del proveedor")} ↗</a></div>' for name,copy,url in PROVIDERS)+'</div>')
                html.append(f'<p>GitHub Pages · <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">{t("Hosting privacy information","网站托管隐私说明","ホスティングのプライバシー情報","Privacidad del alojamiento")}</a></p>')
            if anchor == 'apple':
                html.append(f'<p>Apple · <a href="https://www.apple.com/legal/privacy/">{t("Apple privacy policy","Apple 隐私政策","Apple のプライバシーポリシー","Política de privacidad de Apple")}</a></p>')
            html.append('</section>')
        html.append(f'</div></div></main><footer class="wrap"><span>© 2026 Domino Image Viewer</span><a class="policy-footer-link" data-locale-link href="/">{t("Back to the website","返回官网","公式サイトへ戻る","Volver al sitio")} ↑</a><a class="policy-footer-link" data-locale-link href="{other}">{t(*titles[int(not is_terms)])}</a></footer></body></html>')
        pages[pathname.lstrip('/')+'index.html'] = '\n'.join(html)+'\n'
    return pages
