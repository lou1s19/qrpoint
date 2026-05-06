import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# Replace sendQRUpdate, updateConfig, etc
target = """  function sendQRUpdate(nextConfig: ExtendedQRConfig, data = currentContent) {
    if (!webviewReady || !webRef.current) return;
    webRef.current.postMessage(JSON.stringify({ type: 'update', config: { ...nextConfig, data: data || 'https://example.com' } }));
  }"""

new_target = """  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchQRCode = useCallback(async (nextConfig: ExtendedQRConfig, data: string) => {
    try {
      setPreviewLoading(true);
      const payload = {
        data: data || 'https://example.com',
        config: {
          body: nextConfig.dotsStyle,
          eye: nextConfig.cornerSquareStyle,
          eyeBall: nextConfig.cornerDotStyle,
          bodyColor: nextConfig.fgColor,
          bgColor: nextConfig.transparentBg ? '#FFFFFF' : nextConfig.bgColor,
          eye1Color: nextConfig.fgColor,
          eye2Color: nextConfig.fgColor,
          eye3Color: nextConfig.fgColor,
          eyeBall1Color: nextConfig.fgColor,
          eyeBall2Color: nextConfig.fgColor,
          eyeBall3Color: nextConfig.fgColor,
          logo: nextConfig.logo || ''
        },
        size: 1024,
        download: false,
        file: 'png'
      };

      const res = await fetch('https://api.qrcode-monkey.com/qr/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Origin': 'https://www.qrcode-monkey.com',
          'Referer': 'https://www.qrcode-monkey.com/'
        },
        body: JSON.stringify(payload)
      });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewBase64(result);
        setPreviewLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setPreviewLoading(false);
    }
  }, []);

  function sendQRUpdate(nextConfig: ExtendedQRConfig, data = currentContent) {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      fetchQRCode(nextConfig, data);
    }, 400);
  }"""

content = content.replace(target, new_target)

target_web_ready = """  useEffect(() => {
    sendQRUpdate(config, currentContent);
  }, [webviewReady, currentContent, config]);"""

new_web_ready = """  useEffect(() => {
    sendQRUpdate(config, currentContent);
  }, [currentContent, config]);"""

content = content.replace(target_web_ready, new_web_ready)

target_export = """  async function handleExportData(dataUri: string) {
    setExporting(false);
    try {
      const filename = `qr-${Date.now()}.png`;
      const path = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, dataUri.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo access so QR Point can save the QR code.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(path);
      Alert.alert('Saved', 'The QR code was saved to your photos.');
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'The QR code could not be exported.');
    }
  }

  async function handleSaveAndExport() {
    if (!currentContent) {
      Alert.alert('Heads up', 'Please enter content for the QR code.');
      return;
    }

    await addItem({
      id: `qr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: autoTitle,
      type: qrType,
      content: currentContent,
      createdAt: Date.now(),
      isScanned: false,
      config,
    });
    setExporting(true);
    webRef.current?.postMessage(JSON.stringify({ type: 'export', format: 'png' }));
  }"""

new_export = """  async function handleSaveAndExport() {
    if (!currentContent) {
      Alert.alert('Heads up', 'Please enter content for the QR code.');
      return;
    }
    setExporting(true);
    try {
      // Re-fetch at requested size
      const payload = {
        data: currentContent,
        config: {
          body: config.dotsStyle,
          eye: config.cornerSquareStyle,
          eyeBall: config.cornerDotStyle,
          bodyColor: config.fgColor,
          bgColor: config.transparentBg ? '#FFFFFF' : config.bgColor,
          eye1Color: config.fgColor,
          eye2Color: config.fgColor,
          eye3Color: config.fgColor,
          eyeBall1Color: config.fgColor,
          eyeBall2Color: config.fgColor,
          eyeBall3Color: config.fgColor,
          logo: config.logo || ''
        },
        size: config.qrSize,
        download: false,
        file: 'png'
      };

      const res = await fetch('https://api.qrcode-monkey.com/qr/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Origin': 'https://www.qrcode-monkey.com',
          'Referer': 'https://www.qrcode-monkey.com/'
        },
        body: JSON.stringify(payload)
      });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          const filename = `qr-${Date.now()}.png`;
          const path = `${FileSystem.documentDirectory}${filename}`;
          await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
          
          await addItem({
            id: `qr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title: autoTitle,
            type: qrType,
            content: currentContent,
            createdAt: Date.now(),
            isScanned: false,
            config,
            localImagePath: path
          });

          const permission = await MediaLibrary.requestPermissionsAsync();
          if (permission.granted) {
            await MediaLibrary.saveToLibraryAsync(path);
            Alert.alert('Saved', 'The QR code was saved to your history and photos.');
          } else {
            Alert.alert('Saved to History', 'The QR code was saved to your history. Permission needed to save to photos.');
          }
          setExporting(false);
        } catch (err: any) {
          Alert.alert('Error', err.message ?? 'Failed to save the QR code.');
          setExporting(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'The QR code could not be exported.');
      setExporting(false);
    }
  }"""

content = content.replace(target_export, new_export)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
