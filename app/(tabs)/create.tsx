import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import {
  QRType,
  DotsStyle,
  CornerSquareStyle,
  QRCodeConfig,
  DEFAULT_QR_CONFIG,
  QR_TYPE_LABELS,
  buildQRContent,
} from '@/constants/QRTypes';
import { useQRHistory } from '@/hooks/useQRHistory';

const QR_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    overflow: hidden;
  }
  #container canvas, #container svg { display: block; max-width: 100%; max-height: 100%; }
</style>
</head>
<body>
<div id="container"></div>
<script src="https://unpkg.com/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
<script>
var qrCode = null;
var pendingConfig = null;

function getOpts(cfg) {
  return {
    width: 260, height: 260,
    data: cfg.data || 'https://example.com',
    image: cfg.logo || undefined,
    margin: 8,
    dotsOptions: { color: cfg.fgColor || '#4648d4', type: cfg.dotsStyle || 'square' },
    cornersSquareOptions: { type: cfg.cornerSquareStyle || 'extra-rounded', color: cfg.fgColor || '#4648d4' },
    cornersDotOptions: { type: cfg.cornerDotStyle || 'dot', color: cfg.fgColor || '#4648d4' },
    backgroundOptions: { color: cfg.bgColor || '#ffffff' },
    imageOptions: { crossOrigin: 'anonymous', margin: cfg.logoMargin || 5, imageSize: cfg.logoSize || 0.3 },
    qrOptions: { errorCorrectionLevel: 'H' }
  };
}

function initQR(cfg) {
  var c = document.getElementById('container');
  c.innerHTML = '';
  try {
    qrCode = new QRCodeStyling(getOpts(cfg));
    qrCode.append(c);
  } catch(e) { c.innerHTML = '<p style="color:red;font-size:12px">Error: ' + e.message + '</p>'; }
}

function updateQR(cfg) {
  if (!qrCode) { initQR(cfg); return; }
  try { qrCode.update(getOpts(cfg)); } catch(e) { initQR(cfg); }
}

async function exportQR(fmt) {
  if (!qrCode) return;
  try {
    var blob = await qrCode.getRawData(fmt);
    var r = new FileReader();
    r.onload = function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'export', data: r.result, format: fmt }));
    };
    r.readAsDataURL(blob);
  } catch(e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
  }
}

function handleMsg(e) {
  try {
    var msg = JSON.parse(e.data);
    if (msg.type === 'update') updateQR(msg.config);
    if (msg.type === 'export') exportQR(msg.format || 'png');
  } catch(ex) {}
}

document.addEventListener('message', handleMsg);
window.addEventListener('message', handleMsg);

window.onload = function() {
  initQR({ data: 'https://example.com', fgColor: '#4648d4', bgColor: '#ffffff' });
  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
};
</script>
</body>
</html>`;

type TabId = 'content' | 'design' | 'colors' | 'logo';

const TABS: { id: TabId; label: string }[] = [
  { id: 'content', label: 'Inhalt' },
  { id: 'design', label: 'Design' },
  { id: 'colors', label: 'Farben' },
  { id: 'logo', label: 'Logo' },
];

const DOT_STYLES: { value: DotsStyle; label: string; shape: 'circle' | 'square' | 'diamond' | 'rounded' | 'classy' | 'extra' }[] = [
  { value: 'square', label: 'Quadrat', shape: 'square' },
  { value: 'dots', label: 'Punkte', shape: 'circle' },
  { value: 'rounded', label: 'Rund', shape: 'rounded' },
  { value: 'classy', label: 'Classy', shape: 'classy' },
  { value: 'extra-rounded', label: 'Weich', shape: 'extra' },
];

const CORNER_STYLES: { value: CornerSquareStyle; label: string }[] = [
  { value: 'square', label: 'Eckig' },
  { value: 'extra-rounded', label: 'Rund' },
  { value: 'dot', label: 'Punkt' },
];

const QR_TYPES: QRType[] = ['url', 'wifi', 'vcard', 'text', 'email', 'phone', 'sms'];

const PRESET_COLORS = [
  '#4648d4', '#000000', '#1a1a2e', '#e63946', '#2d6a4f',
  '#f77f00', '#7b2d8b', '#0077b6', '#333333', '#c77dff',
];

function DotStyleIcon({ shape }: { shape: DotsStyle }) {
  const s = { width: 14, height: 14, backgroundColor: COLORS.onSurface };
  if (shape === 'dots') return <View style={[s, { borderRadius: 7 }]} />;
  if (shape === 'rounded') return <View style={[s, { borderRadius: 3 }]} />;
  if (shape === 'classy') return <View style={[s, { borderRadius: 2, transform: [{ rotate: '45deg' }] }]} />;
  if (shape === 'extra-rounded') return <View style={[s, { borderRadius: 5 }]} />;
  return <View style={s} />;
}

function ColorSwatch({
  color, selected, onPress,
}: {
  color: string; selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.swatch,
        { backgroundColor: color },
        selected && styles.swatchSelected,
      ]}
    >
      {selected && <MaterialIcons name="check" size={14} color={color === '#ffffff' ? '#000' : '#fff'} />}
    </Pressable>
  );
}

export default function CreateScreen() {
  const webRef = useRef<WebView>(null);
  const { addItem } = useQRHistory();

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [qrType, setQrType] = useState<QRType>('url');
  const [config, setConfig] = useState<QRCodeConfig>(DEFAULT_QR_CONFIG);
  const [webviewReady, setWebviewReady] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Content fields
  const [urlValue, setUrlValue] = useState('https://');
  const [textValue, setTextValue] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcFirstName, setVcFirstName] = useState('');
  const [vcLastName, setVcLastName] = useState('');
  const [vcPhone, setVcPhone] = useState('');
  const [vcEmail, setVcEmail] = useState('');
  const [vcCompany, setVcCompany] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [smsNum, setSmsNum] = useState('');
  const [smsMsg, setSmsMsg] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  function getContentData(): Record<string, string> {
    switch (qrType) {
      case 'url': return { url: urlValue };
      case 'text': return { text: textValue };
      case 'wifi': return { ssid: wifiSSID, password: wifiPass, encryption: wifiEnc };
      case 'vcard': return { firstName: vcFirstName, lastName: vcLastName, phone: vcPhone, email: vcEmail, company: vcCompany };
      case 'email': return { email: emailTo };
      case 'phone': return { phone: phoneNum };
      case 'sms': return { phone: smsNum, message: smsMsg };
      default: return {};
    }
  }

  function getCurrentContent(): string {
    return buildQRContent(qrType, getContentData());
  }

  function getAutoTitle(): string {
    if (customTitle) return customTitle;
    switch (qrType) {
      case 'url': return urlValue.replace(/^https?:\/\//, '').split('/')[0] || 'URL QR';
      case 'wifi': return wifiSSID || 'Wi-Fi QR';
      case 'vcard': return [vcFirstName, vcLastName].filter(Boolean).join(' ') || 'Kontakt QR';
      case 'text': return textValue.slice(0, 30) || 'Text QR';
      case 'email': return emailTo || 'E-Mail QR';
      case 'phone': return phoneNum || 'Telefon QR';
      case 'sms': return smsNum || 'SMS QR';
      default: return 'QR Code';
    }
  }

  const sendUpdate = useCallback((cfg: QRCodeConfig, content?: string) => {
    if (!webviewReady || !webRef.current) return;
    const data = content ?? getCurrentContent();
    const msg = JSON.stringify({
      type: 'update',
      config: {
        data: data || 'https://example.com',
        fgColor: cfg.fgColor,
        bgColor: cfg.bgColor,
        dotsStyle: cfg.dotsStyle,
        cornerSquareStyle: cfg.cornerSquareStyle,
        cornerDotStyle: cfg.cornerDotStyle,
        logo: cfg.logo,
        logoSize: cfg.logoSize,
        logoMargin: cfg.logoMargin,
      },
    });
    webRef.current.postMessage(msg);
  }, [webviewReady]);

  function updateConfig(partial: Partial<QRCodeConfig>) {
    const next = { ...config, ...partial };
    setConfig(next);
    sendUpdate(next);
  }

  function handleWebMessage(event: { nativeEvent: { data: string } }) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') {
        setWebviewReady(true);
        sendUpdate(config, getCurrentContent());
      }
      if (msg.type === 'export' && msg.data) {
        handleExportData(msg.data);
      }
    } catch {}
  }

  async function handleExportData(base64: string) {
    setExporting(false);
    try {
      const filename = `qr-${Date.now()}.png`;
      const path = `${FileSystem.documentDirectory}${filename}`;
      const b64 = base64.replace(/^data:image\/png;base64,/, '');
      await FileSystem.writeAsStringAsync(path, b64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'image/png' });
      } else {
        Alert.alert('Exportiert', `Gespeichert: ${filename}`);
      }
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  }

  async function handleSaveAndExport() {
    const content = getCurrentContent();
    if (!content || content.trim() === 'https://') {
      Alert.alert('Hinweis', 'Bitte gib Inhalt für den QR-Code ein.');
      return;
    }
    // Save to history
    await addItem({
      id: `qr-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: getAutoTitle(),
      type: qrType,
      content,
      createdAt: Date.now(),
      isScanned: false,
      config,
    });
    // Export
    setExporting(true);
    webRef.current?.postMessage(JSON.stringify({ type: 'export', format: 'png' }));
    Alert.alert('Gespeichert!', 'Der QR-Code wurde im Verlauf gespeichert und wird exportiert.');
  }

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const logo = `data:image/jpeg;base64,${result.assets[0].base64}`;
      updateConfig({ logo });
    }
  }

  function removeLogo() {
    updateConfig({ logo: undefined });
  }

  function handleContentChange(value: string, setter: (v: string) => void) {
    setter(value);
    // Debounce handled by setTimeout approach
    setTimeout(() => {
      if (!webviewReady) return;
      const data = buildQRContent(qrType, getContentData());
      webRef.current?.postMessage(JSON.stringify({
        type: 'update',
        config: {
          ...config,
          data: data || 'https://example.com',
        },
      }));
    }, 300);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QR-Code erstellen</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* QR Preview */}
        <View style={styles.previewSection}>
          <View style={styles.previewWrapper}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            {!webviewReady && (
              <View style={styles.previewLoader}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.loadingText}>Lade Editor…</Text>
              </View>
            )}
            <WebView
              ref={webRef}
              source={{ html: QR_HTML }}
              style={styles.webview}
              onMessage={handleWebMessage}
              scrollEnabled={false}
              bounces={false}
              javaScriptEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              allowFileAccess
            />
          </View>
          <Text style={styles.previewLabel}>Live-Vorschau</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabCard}>
          <View style={styles.tabBar}>
            {TABS.map(t => (
              <Pressable
                key={t.id}
                style={[styles.tab, activeTab === t.id && styles.tabActive]}
                onPress={() => setActiveTab(t.id)}
              >
                <Text style={[styles.tabLabel, activeTab === t.id && styles.tabLabelActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.tabContent}>
            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <View style={styles.tabPanel}>
                {/* Type Selector */}
                <Text style={styles.fieldLabel}>TYP</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                  {QR_TYPES.map(t => (
                    <Pressable
                      key={t}
                      style={[styles.typeBtn, qrType === t && styles.typeBtnActive]}
                      onPress={() => setQrType(t)}
                    >
                      <Text style={[styles.typeBtnText, qrType === t && styles.typeBtnTextActive]}>
                        {QR_TYPE_LABELS[t]}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Custom Title */}
                <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>BEZEICHNUNG (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Meine Website"
                  placeholderTextColor={COLORS.outline}
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />

                {/* Fields per type */}
                {qrType === 'url' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>URL</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="https://example.com"
                      placeholderTextColor={COLORS.outline}
                      value={urlValue}
                      onChangeText={v => handleContentChange(v, setUrlValue)}
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </>
                )}

                {qrType === 'text' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>TEXT</Text>
                    <TextInput
                      style={[styles.input, styles.inputMulti]}
                      placeholder="Dein Text hier..."
                      placeholderTextColor={COLORS.outline}
                      value={textValue}
                      onChangeText={v => handleContentChange(v, setTextValue)}
                      multiline
                      numberOfLines={4}
                    />
                  </>
                )}

                {qrType === 'wifi' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>NETZWERKNAME (SSID)</Text>
                    <TextInput style={styles.input} placeholder="Mein WLAN" placeholderTextColor={COLORS.outline}
                      value={wifiSSID} onChangeText={v => handleContentChange(v, setWifiSSID)} />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>PASSWORT</Text>
                    <TextInput style={styles.input} placeholder="Passwort" placeholderTextColor={COLORS.outline}
                      value={wifiPass} onChangeText={v => handleContentChange(v, setWifiPass)} secureTextEntry />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>VERSCHLÜSSELUNG</Text>
                    <View style={styles.radioRow}>
                      {(['WPA', 'WEP', 'nopass'] as const).map(enc => (
                        <Pressable key={enc} style={[styles.radioBtn, wifiEnc === enc && styles.radioBtnActive]}
                          onPress={() => { setWifiEnc(enc); setTimeout(() => sendUpdate(config), 300); }}>
                          <Text style={[styles.radioBtnText, wifiEnc === enc && styles.radioBtnTextActive]}>{enc}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                {qrType === 'vcard' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>VORNAME</Text>
                    <TextInput style={styles.input} placeholder="Max" placeholderTextColor={COLORS.outline}
                      value={vcFirstName} onChangeText={v => handleContentChange(v, setVcFirstName)} />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>NACHNAME</Text>
                    <TextInput style={styles.input} placeholder="Mustermann" placeholderTextColor={COLORS.outline}
                      value={vcLastName} onChangeText={v => handleContentChange(v, setVcLastName)} />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>TELEFON</Text>
                    <TextInput style={styles.input} placeholder="+49 123 456789" placeholderTextColor={COLORS.outline}
                      value={vcPhone} onChangeText={v => handleContentChange(v, setVcPhone)} keyboardType="phone-pad" />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>E-MAIL</Text>
                    <TextInput style={styles.input} placeholder="max@example.com" placeholderTextColor={COLORS.outline}
                      value={vcEmail} onChangeText={v => handleContentChange(v, setVcEmail)} keyboardType="email-address" autoCapitalize="none" />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>FIRMA</Text>
                    <TextInput style={styles.input} placeholder="Meine Firma GmbH" placeholderTextColor={COLORS.outline}
                      value={vcCompany} onChangeText={v => handleContentChange(v, setVcCompany)} />
                  </>
                )}

                {qrType === 'email' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>E-MAIL ADRESSE</Text>
                    <TextInput style={styles.input} placeholder="empfaenger@example.com" placeholderTextColor={COLORS.outline}
                      value={emailTo} onChangeText={v => handleContentChange(v, setEmailTo)} keyboardType="email-address" autoCapitalize="none" />
                  </>
                )}

                {qrType === 'phone' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>TELEFONNUMMER</Text>
                    <TextInput style={styles.input} placeholder="+49 123 456789" placeholderTextColor={COLORS.outline}
                      value={phoneNum} onChangeText={v => handleContentChange(v, setPhoneNum)} keyboardType="phone-pad" />
                  </>
                )}

                {qrType === 'sms' && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>TELEFONNUMMER</Text>
                    <TextInput style={styles.input} placeholder="+49 123 456789" placeholderTextColor={COLORS.outline}
                      value={smsNum} onChangeText={v => handleContentChange(v, setSmsNum)} keyboardType="phone-pad" />
                    <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>NACHRICHT (OPTIONAL)</Text>
                    <TextInput style={[styles.input, styles.inputMulti]} placeholder="Deine Nachricht..." placeholderTextColor={COLORS.outline}
                      value={smsMsg} onChangeText={v => handleContentChange(v, setSmsMsg)} multiline numberOfLines={3} />
                  </>
                )}
              </View>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <View style={styles.tabPanel}>
                <Text style={styles.fieldLabel}>MODUL-STIL</Text>
                <View style={styles.styleGrid}>
                  {DOT_STYLES.map(s => (
                    <Pressable
                      key={s.value}
                      style={[styles.styleBtn, config.dotsStyle === s.value && styles.styleBtnActive]}
                      onPress={() => updateConfig({ dotsStyle: s.value })}
                    >
                      <DotStyleIcon shape={s.value} />
                      <Text style={[styles.styleBtnLabel, config.dotsStyle === s.value && styles.styleBtnLabelActive]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>ECKEN-STIL</Text>
                <View style={styles.radioRow}>
                  {CORNER_STYLES.map(s => (
                    <Pressable
                      key={s.value}
                      style={[styles.radioBtn, config.cornerSquareStyle === s.value && styles.radioBtnActive]}
                      onPress={() => updateConfig({ cornerSquareStyle: s.value })}
                    >
                      <Text style={[styles.radioBtnText, config.cornerSquareStyle === s.value && styles.radioBtnTextActive]}>
                        {s.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* COLORS TAB */}
            {activeTab === 'colors' && (
              <View style={styles.tabPanel}>
                <Text style={styles.fieldLabel}>VORDERGRUNDFARBE</Text>
                <View style={styles.colorRow}>
                  {PRESET_COLORS.map(c => (
                    <ColorSwatch
                      key={c}
                      color={c}
                      selected={config.fgColor === c}
                      onPress={() => updateConfig({ fgColor: c })}
                    />
                  ))}
                </View>
                <View style={styles.colorPreview}>
                  <View style={[styles.colorDot, { backgroundColor: config.fgColor }]} />
                  <Text style={styles.colorHex}>{config.fgColor}</Text>
                </View>

                <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>HINTERGRUNDFARBE</Text>
                <View style={styles.colorRow}>
                  {['#ffffff', '#faf8ff', '#f0f0f0', '#e8f4fd', '#fff3e0', '#fce4ec', '#f3e5f5', '#e8f5e9', '#fffde7', '#000000'].map(c => (
                    <ColorSwatch
                      key={c}
                      color={c}
                      selected={config.bgColor === c}
                      onPress={() => updateConfig({ bgColor: c })}
                    />
                  ))}
                </View>
                <View style={styles.colorPreview}>
                  <View style={[styles.colorDot, { backgroundColor: config.bgColor, borderWidth: 1, borderColor: COLORS.outlineVariant }]} />
                  <Text style={styles.colorHex}>{config.bgColor}</Text>
                </View>
              </View>
            )}

            {/* LOGO TAB */}
            {activeTab === 'logo' && (
              <View style={styles.tabPanel}>
                {config.logo ? (
                  <View style={styles.logoPreviewRow}>
                    <View style={styles.logoPreviewWrap}>
                      <MaterialIcons name="image" size={40} color={COLORS.primary} />
                      <Text style={styles.logoLoadedText}>Logo geladen</Text>
                    </View>
                    <Pressable style={styles.removeLogoBtn} onPress={removeLogo}>
                      <MaterialIcons name="delete" size={20} color={COLORS.error} />
                      <Text style={styles.removeLogoText}>Entfernen</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.logoUploadBtn} onPress={pickLogo}>
                    <MaterialIcons name="add-photo-alternate" size={32} color={COLORS.primary} />
                    <Text style={styles.logoUploadText}>Logo hochladen</Text>
                    <Text style={styles.logoUploadSub}>PNG oder JPG, quadratisch empfohlen</Text>
                  </Pressable>
                )}

                <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>
                  LOGO-GRÖSSE — {Math.round(config.logoSize * 100)}%
                </Text>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>10%</Text>
                  <Pressable style={styles.sliderTrack} onPress={() => {}}>
                    <View style={[styles.sliderFill, { width: `${(config.logoSize - 0.1) / 0.3 * 100}%` }]} />
                    <View style={styles.sliderThumb} />
                  </Pressable>
                  <Text style={styles.sliderLabel}>40%</Text>
                </View>
                <View style={styles.sizePresets}>
                  {[0.15, 0.25, 0.3, 0.35, 0.4].map(s => (
                    <Pressable
                      key={s}
                      style={[styles.sizePreset, config.logoSize === s && styles.sizePresetActive]}
                      onPress={() => updateConfig({ logoSize: s })}
                    >
                      <Text style={[styles.sizePresetText, config.logoSize === s && styles.sizePresetTextActive]}>
                        {Math.round(s * 100)}%
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={[styles.saveBtn, exporting && styles.saveBtnDisabled]}
          onPress={handleSaveAndExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <MaterialIcons name="download" size={22} color={COLORS.white} />
          )}
          <Text style={styles.saveBtnText}>
            {exporting ? 'Wird exportiert…' : 'Speichern & Exportieren'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    paddingHorizontal: SPACING.containerPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    alignItems: 'center',
  },
  headerTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface },
  scroll: { flex: 1 },
  previewSection: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  previewWrapper: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    position: 'relative',
  },
  cornerTL: { position: 'absolute', top: -1, left: -1, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.primary, borderTopLeftRadius: RADIUS.xxl, zIndex: 10 },
  cornerTR: { position: 'absolute', top: -1, right: -1, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: COLORS.primary, borderTopRightRadius: RADIUS.xxl, zIndex: 10 },
  cornerBL: { position: 'absolute', bottom: -1, left: -1, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: COLORS.primary, borderBottomLeftRadius: RADIUS.xxl, zIndex: 10 },
  cornerBR: { position: 'absolute', bottom: -1, right: -1, width: 24, height: 24, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.primary, borderBottomRightRadius: RADIUS.xxl, zIndex: 10 },
  webview: { flex: 1, backgroundColor: 'transparent' },
  previewLoader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, zIndex: 5, gap: SPACING.sm },
  loadingText: { ...TYPOGRAPHY.labelMd, color: COLORS.outline },
  previewLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant, marginTop: SPACING.md },
  tabCard: {
    marginHorizontal: SPACING.containerPadding,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabLabel: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  tabLabelActive: { color: COLORS.primary },
  tabContent: {},
  tabPanel: { padding: SPACING.md, gap: SPACING.xs },
  fieldLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant, letterSpacing: 0.6, marginBottom: SPACING.sm },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  inputMulti: { height: 96, paddingTop: SPACING.sm, textAlignVertical: 'top' },
  typeScroll: { flexGrow: 0, marginBottom: SPACING.xs },
  typeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  typeBtnTextActive: { color: COLORS.white },
  radioRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  radioBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.white,
  },
  radioBtnActive: { backgroundColor: `${COLORS.primary}18`, borderColor: COLORS.primary },
  radioBtnText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  radioBtnTextActive: { color: COLORS.primary },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  styleBtn: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  styleBtnActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` },
  styleBtnLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },
  styleBtnLabelActive: { color: COLORS.primary },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: COLORS.primary, transform: [{ scale: 1.1 }] },
  colorPreview: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  colorDot: { width: 28, height: 28, borderRadius: RADIUS.lg },
  colorHex: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  logoUploadBtn: {
    height: 120,
    borderRadius: RADIUS.xxl,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}08`,
  },
  logoUploadText: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },
  logoUploadSub: { ...TYPOGRAPHY.labelSm, color: COLORS.outline },
  logoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  logoPreviewWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoLoadedText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurface },
  removeLogoBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  removeLogoText: { ...TYPOGRAPHY.labelMd, color: COLORS.error },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  sliderLabel: { ...TYPOGRAPHY.labelSm, color: COLORS.outline, width: 32, textAlign: 'center' },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sizePresets: { flexDirection: 'row', gap: SPACING.sm },
  sizePreset: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sizePresetActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sizePresetText: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },
  sizePresetTextActive: { color: COLORS.white },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    margin: SPACING.containerPadding,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { ...TYPOGRAPHY.headlineSm, color: COLORS.white, fontSize: 16 },
});
