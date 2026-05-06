import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

target_webview = """            {!webviewReady && <View style={[styles.previewLoader, { backgroundColor: C.white }]}><ActivityIndicator color={C.primary} size="large" /><Text style={[styles.loadingText, { color: C.outline }]}>Loading editor...</Text></View>}
            <WebView
              ref={webRef}
              source={{ html: QR_HTML }}
              style={styles.webview}
              onMessage={event => {
                const message = JSON.parse(event.nativeEvent.data);
                if (message.type === 'ready') setWebviewReady(true);
                if (message.type === 'export') handleExportData(message.data);
              }}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              allowFileAccess
            />"""

new_webview = """            {previewLoading && <View style={[styles.previewLoader, { backgroundColor: C.white }]}><ActivityIndicator color={C.primary} size="large" /><Text style={[styles.loadingText, { color: C.outline }]}>Loading preview...</Text></View>}
            {previewBase64 && <Image source={{ uri: previewBase64 }} style={styles.webview} resizeMode="contain" />}
"""

content = content.replace(target_webview, new_webview)

# Also need to remove webRef and webviewReady from states
target_refs = """  const webRef = useRef<WebView>(null);
  const { addItem } = useQRHistory();

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [qrType, setQrType] = useState<QRType>('url');
  const [config, setConfig] = useState<ExtendedQRConfig>({ ...DEFAULT_QR_CONFIG, logoRadius: 0, logoMargin: 0 });
  const [webviewReady, setWebviewReady] = useState(false);"""

new_refs = """  const { addItem } = useQRHistory();

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [qrType, setQrType] = useState<QRType>('url');
  const [config, setConfig] = useState<ExtendedQRConfig>({ ...DEFAULT_QR_CONFIG, logoRadius: 0, logoMargin: 0 });"""

content = content.replace(target_refs, new_refs)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
