import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';

import { SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useTheme } from '@/context/ThemeContext';
import { SPRITE_COORDINATES } from '@/constants/SpriteCoordinates';
import {
  QRType,
  DotsStyle,
  CornerSquareStyle,
  CornerDotStyle,
  QRCodeConfig,
  DEFAULT_QR_CONFIG,
  QR_TYPE_LABELS,
  buildQRContent,
  isLikelyWebUrl,
  normalizeWebUrlContent,
} from '@/constants/QRTypes';
import { useQRHistory } from '@/hooks/useQRHistory';
import { mapCornerSquareStyle, mapCornerDotStyle, mapDotsStyle } from '@/constants/QRStyleMapping';
import { QR_GENERATOR_HTML } from '@/constants/QRGeneratorHTML';

type TabId = 'content' | 'design' | 'colors' | 'logo';
type QRSizePreset = 'small' | 'medium' | 'large' | 'custom';

type ExtendedQRConfig = QRCodeConfig & { logoRadius?: number };

const CENTER_LOGO_SIZE = 0.15;

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'content', label: 'Content' },
  { id: 'design', label: 'Design' },
  { id: 'colors', label: 'Colors' },
  { id: 'logo', label: 'Logo' },
];

const DOT_STYLES: Array<{ value: DotsStyle; label: string }> = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dots' },
  { value: 'round', label: 'Round' },
  { value: 'circular', label: 'Circular' },
  { value: 'edge-cut', label: 'Classy' },
  { value: 'edge-cut-smooth', label: 'Smooth' },
];

const CORNER_STYLES: Array<{ value: CornerSquareStyle; label: string; icon?: string }> = [
  { value: 'frame0', label: 'Square' },
  { value: 'frame1', label: 'Rounded', icon: 'frame13' },
  { value: 'frame2', label: 'Circle', icon: 'frame12' },
];

const BALL_STYLES: Array<{ value: CornerDotStyle; label: string; icon?: string }> = [
  { value: 'ball0', label: 'Square' },
  { value: 'ball1', label: 'Circle', icon: 'ball14' },
];

const QR_TYPES: QRType[] = ['url', 'text', 'email', 'phone', 'sms', 'vcard', 'mecard', 'location', 'facebook', 'twitter', 'youtube', 'event', 'crypto', 'wifi'];
const PRESET_FG = ['#4648d4', '#000000', '#1a1a2e', '#e63946', '#2d6a4f', '#f77f00', '#7b2d8b', '#0077b6', '#333333', '#c77dff'];
const PRESET_BG = ['#ffffff', '#faf8ff', '#f0f0f0', '#e8f4fd', '#fff3e0', '#fce4ec', '#f3e5f5', '#e8f5e9', '#fffde7', '#000000'];

const SHAPE_IMAGES: Record<string, any> = {
  "ball0": require("@/assets/images/shapes/ball0.png"),
  "ball1": require("@/assets/images/shapes/ball1.png"),
  "ball10": require("@/assets/images/shapes/ball10.png"),
  "ball11": require("@/assets/images/shapes/ball11.png"),
  "ball12": require("@/assets/images/shapes/ball12.png"),
  "ball13": require("@/assets/images/shapes/ball13.png"),
  "ball14": require("@/assets/images/shapes/ball14.png"),
  "ball15": require("@/assets/images/shapes/ball15.png"),
  "ball16": require("@/assets/images/shapes/ball16.png"),
  "ball17": require("@/assets/images/shapes/ball17.png"),
  "ball18": require("@/assets/images/shapes/ball18.png"),
  "ball19": require("@/assets/images/shapes/ball19.png"),
  "ball2": require("@/assets/images/shapes/ball2.png"),
  "ball3": require("@/assets/images/shapes/ball3.png"),
  "ball4": require("@/assets/images/shapes/ball4.png"),
  "ball5": require("@/assets/images/shapes/ball5.png"),
  "ball6": require("@/assets/images/shapes/ball6.png"),
  "ball7": require("@/assets/images/shapes/ball7.png"),
  "ball8": require("@/assets/images/shapes/ball8.png"),
  "ball9": require("@/assets/images/shapes/ball9.png"),
  "frame0": require("@/assets/images/shapes/frame0.png"),
  "frame1": require("@/assets/images/shapes/frame1.png"),
  "frame10": require("@/assets/images/shapes/frame10.png"),
  "frame11": require("@/assets/images/shapes/frame11.png"),
  "frame12": require("@/assets/images/shapes/frame12.png"),
  "frame13": require("@/assets/images/shapes/frame13.png"),
  "frame14": require("@/assets/images/shapes/frame14.png"),
  "frame15": require("@/assets/images/shapes/frame15.png"),
  "frame16": require("@/assets/images/shapes/frame16.png"),
  "frame2": require("@/assets/images/shapes/frame2.png"),
  "frame3": require("@/assets/images/shapes/frame3.png"),
  "frame4": require("@/assets/images/shapes/frame4.png"),
  "frame5": require("@/assets/images/shapes/frame5.png"),
  "frame6": require("@/assets/images/shapes/frame6.png"),
  "frame7": require("@/assets/images/shapes/frame7.png"),
  "frame8": require("@/assets/images/shapes/frame8.png"),
  "frame9": require("@/assets/images/shapes/frame9.png"),
};

function SpriteIcon({ shape, type, color, active }: { shape: string, type: 'body' | 'frame' | 'ball', color: string, active: boolean }) {
  const coords = SPRITE_COORDINATES[shape];
  
  if (type !== 'body' && SHAPE_IMAGES[shape]) {
    return (
      <View style={{ width: 45, height: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <Image 
          source={SHAPE_IMAGES[shape]} 
          style={{
            width: 40,
            height: 40,
            tintColor: color
          }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (!coords) return null;
  
  const source = require('@/assets/images/sprite-shapes-alpha.png');
    
  // The original images have black shapes. We can't tint PNG easily in RN without tintColor which works for solid colors with alpha.
  // RN Image tintColor replaces all non-transparent pixels with the color. That's perfect for our sprites!
  
  // The scale for body is 0.5 (90->45, 80->40). The frames/balls are 50x50.
  const scale = 0.5;
  const viewWidth = coords.w * scale;
  const viewHeight = coords.h * scale;

  return (
    <View style={{ width: viewWidth, height: viewHeight, overflow: 'hidden', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 4 }}>
      <Image 
        source={source} 
        style={{
          width: 680 * scale,
          height: 630 * scale,
          marginLeft: coords.x * scale,
          marginTop: coords.y * scale,
          tintColor: color
        }}
        resizeMode="stretch"
      />
    </View>
  );
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function hexToRgb(hex: string) {
  const clean = normalizeHex(hex).replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const convert = (channel: number) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}

function contrastRatio(fg: string, bg: string) {
  const first = relativeLuminance(fg);
  const second = relativeLuminance(bg);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string) {
  const safeHex = isHexColor(normalizeHex(hex)) ? normalizeHex(hex) : '#4648d4';
  const { r, g, b } = hexToRgb(safeHex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function ColorSwatch({ color, selected, onPress, C }: { color: string; selected: boolean; onPress: () => void; C: any }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.swatch, { backgroundColor: color, borderColor: selected ? C.primary : C.outlineVariant }, selected && { transform: [{ scale: 1.08 }] }]}
    >
      {selected && <MaterialIcons name="check" size={14} color={color.toLowerCase() === '#ffffff' ? '#000' : '#fff'} />}
    </Pressable>
  );
}

function ColorPickerBlock({
  title,
  value,
  palette,
  onChange,
  C,
}: {
  title: string;
  value: string;
  palette: string[];
  onChange: (hex: string) => void;
  C: any;
}) {
  const [hexDraft, setHexDraft] = useState(value.toUpperCase());

  useEffect(() => {
    setHexDraft(value.toUpperCase());
  }, [value]);

  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={[styles.colorPanel, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
      <View style={styles.colorPanelHeader}>
        <View style={[styles.colorDot, { backgroundColor: value, borderColor: C.outlineVariant }]} />
        <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0, flex: 1 }]}>{title}</Text>
        <TextInput
          style={[styles.compactHexInput, { color: C.onSurface, borderColor: isHexColor(normalizeHex(hexDraft)) ? C.outlineVariant : C.error, backgroundColor: C.surfaceContainerLowest }]}
          value={hexDraft}
          onChangeText={next => {
            const normalized = next.startsWith('#') ? next : `#${next}`;
            setHexDraft(normalized.toUpperCase());
            if (isHexColor(normalized)) onChange(normalized.toUpperCase());
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
        />
      </View>
      <View style={styles.compactColorRow}>
        {palette.slice(0, 7).map(color => (
          <ColorSwatch key={color} C={C} color={color} selected={value.toLowerCase() === color.toLowerCase()} onPress={() => onChange(color)} />
        ))}
        <Pressable style={[styles.swatch, { backgroundColor: C.surfaceContainerHigh, borderColor: C.outlineVariant, justifyContent: 'center', alignItems: 'center' }]} onPress={() => setShowPicker(true)}>
          <MaterialIcons name="colorize" size={16} color={C.onSurfaceVariant} />
        </Pressable>
      </View>
      
      <Modal visible={showPicker} transparent={true} animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '85%', backgroundColor: C.surface, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 }}>
            <Text style={[styles.fieldLabel, { color: C.onSurface, marginBottom: 16, textAlign: 'center' }]}>CHOOSE {title}</Text>
            
            <HSLColorEditor
              value={value}
              onChange={hex => {
                onChange(hex);
                setHexDraft(hex);
              }}
              C={C}
            />
            
            <Pressable style={[styles.saveBtn, { backgroundColor: C.primary, marginTop: 24 }]} onPress={() => setShowPicker(false)}>
              <Text style={[styles.saveBtnText, { color: C.onPrimary }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ValueSlider({
  label,
  value,
  min = 0,
  max,
  suffix = '',
  onChange,
  background,
  C,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
  background?: React.ReactNode;
  C: any;
}) {
  const trackRef = useRef<View>(null);
  const widthRef = useRef(1);
  const pageXRef = useRef(0);
  const [width, setWidth] = useState(1);
  const [pageX, setPageX] = useState(0);
  const progress = (value - min) / (max - min);

  const measure = () => {
    trackRef.current?.measureInWindow((x, _y, w) => {
      pageXRef.current = x;
      widthRef.current = Math.max(1, w);
      setPageX(x);
      setWidth(Math.max(1, w));
    });
  };

  const updateWithMeasuredTrack = (x: number) => {
    trackRef.current?.measureInWindow((trackX, _y, trackWidth) => {
      const safeWidth = Math.max(1, trackWidth);
      pageXRef.current = trackX;
      widthRef.current = safeWidth;
      setPageX(trackX);
      setWidth(safeWidth);
      const nextProgress = Math.max(0, Math.min(1, (x - trackX) / safeWidth));
      onChange(Math.round(min + nextProgress * (max - min)));
    });
  };

  const updateFromPageX = (x: number) => {
    const origin = pageXRef.current || pageX;
    const trackWidth = widthRef.current || width;
    const nextProgress = Math.max(0, Math.min(1, (x - origin) / trackWidth));
    onChange(Math.round(min + nextProgress * (max - min)));
  };

  return (
    <View style={{ gap: SPACING.xs }}>
      <View style={styles.sliderLabelRow}>
        <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>{label}</Text>
        <Text style={[styles.sliderValue, { color: C.onSurfaceVariant }]}>{value}{suffix}</Text>
      </View>
      <View
        ref={trackRef}
        onLayout={measure}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={event => updateWithMeasuredTrack(event.nativeEvent.pageX)}
        onResponderMove={event => updateFromPageX(event.nativeEvent.pageX)}
        style={[styles.sliderTrack, { backgroundColor: C.surfaceContainerHigh }]}
      >
        {background ?? <View style={[StyleSheet.absoluteFillObject, { backgroundColor: C.primary, opacity: 0.25 }]} />}
        <View style={[styles.sliderProgress, { width: `${progress * 100}%`, backgroundColor: C.primary }]} />
        <View style={[styles.sliderThumb, { left: `${progress * 100}%`, borderColor: C.primary }]} />
      </View>
    </View>
  );
}

function HSLColorEditor({ value, onChange, C }: { value: string; onChange: (hex: string) => void; C: any }) {
  const hsl = useMemo(() => hexToHsl(value), [value]);
  const [hue, setHue] = useState(hsl.h);
  const [sat, setSat] = useState(hsl.s);
  const [light, setLight] = useState(hsl.l);
  const [hexDraft, setHexDraft] = useState(value.toUpperCase());

  useEffect(() => {
    const next = hexToHsl(value);
    setHue(next.h);
    setSat(next.s);
    setLight(next.l);
    setHexDraft(value.toUpperCase());
  }, [value]);

  const commitHsl = (nextHue = hue, nextSat = sat, nextLight = light) => onChange(hslToHex(nextHue, nextSat, nextLight));
  const hexValid = isHexColor(normalizeHex(hexDraft));

  return (
    <View style={{ gap: SPACING.md }}>
      <ValueSlider
        C={C}
        label="HUE"
        value={hue}
        max={360}
        suffix="°"
        onChange={h => { setHue(h); commitHsl(h, sat, light); }}
        background={<View style={[StyleSheet.absoluteFillObject, styles.sliderFillRow]}>{Array.from({ length: 36 }).map((_, i) => <View key={i} style={{ flex: 1, backgroundColor: `hsl(${i * 10}, 100%, 50%)` }} />)}</View>}
      />
      <ValueSlider
        C={C}
        label="SATURATION"
        value={sat}
        max={100}
        suffix="%"
        onChange={s => { setSat(s); commitHsl(hue, s, light); }}
        background={<View style={[StyleSheet.absoluteFillObject, styles.sliderFillRow]}><View style={{ flex: 1, backgroundColor: hslToHex(hue, 0, light) }} /><View style={{ flex: 1, backgroundColor: hslToHex(hue, 100, light) }} /></View>}
      />
      <ValueSlider
        C={C}
        label="LIGHTNESS"
        value={light}
        max={100}
        suffix="%"
        onChange={l => { setLight(l); commitHsl(hue, sat, l); }}
        background={<View style={[StyleSheet.absoluteFillObject, styles.sliderFillRow]}><View style={{ flex: 1, backgroundColor: '#000' }} /><View style={{ flex: 1, backgroundColor: hslToHex(hue, sat, 50) }} /><View style={{ flex: 1, backgroundColor: '#fff' }} /></View>}
      />
      <View style={styles.hexRow}>
        <View style={[styles.colorDot, { backgroundColor: hexValid ? normalizeHex(hexDraft) : value, borderColor: C.outlineVariant }]} />
        <TextInput
          style={[styles.hexInput, { color: C.onSurface, borderColor: hexValid ? C.outlineVariant : C.error, backgroundColor: C.surfaceContainerLowest }]}
          value={hexDraft}
          onChangeText={next => {
            const normalized = next.startsWith('#') ? next : `#${next}`;
            setHexDraft(normalized.toUpperCase());
            if (isHexColor(normalized)) onChange(normalized.toUpperCase());
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
        />
      </View>
    </View>
  );
}

export default function CreateScreen() {
  const { colors: C, isDark } = useTheme();
  const { addItem } = useQRHistory();

  const qrWebViewRef = useRef<WebView>(null);
  const pendingQRCallback = useRef<{ resolve: (dataUri: string) => void; reject: (e: Error) => void; id: number } | null>(null);
  const nextRequestId = useRef(0);
  const [webViewReady, setWebViewReady] = useState(false);

  /** Generate QR code locally via embedded qr-code-styling in the hidden WebView. */
  function generateQRLocally(opts: {
    data: string; fgColor: string; bgColor: string; transparent: boolean;
    dotsType: string; cornersSquareType: string; cornersDotType: string;
    logo?: string; logoMargin?: number; margin?: number; size: number; rounded?: boolean;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!qrWebViewRef.current) { reject(new Error('WebView not ready')); return; }
      const id = ++nextRequestId.current;
      // Cancel any previous pending request so it doesn't leave a stuck loading state
      const prev = pendingQRCallback.current;
      if (prev) { pendingQRCallback.current = null; prev.reject(new Error('cancelled')); }
      pendingQRCallback.current = { resolve, reject, id };
      const msg = JSON.stringify({ type: 'generate', requestId: id, ...opts });
      qrWebViewRef.current.injectJavaScript(
        `(function(){window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(msg)}}));})();true;`
      );
      setTimeout(() => {
        if (pendingQRCallback.current?.id === id) {
          pendingQRCallback.current = null;
          reject(new Error('QR generation timed out'));
        }
      }, 10000);
    });
  }

  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [qrType, setQrType] = useState<QRType>('url');
  const [config, setConfig] = useState<ExtendedQRConfig>({ ...DEFAULT_QR_CONFIG, logoRadius: 0, logoMargin: 0 });
  const [exporting, setExporting] = useState(false);
  const [moduleStylesExpanded, setModuleStylesExpanded] = useState(false);
  const [cornerStylesExpanded, setCornerStylesExpanded] = useState(false);
  const [ballStylesExpanded, setBallStylesExpanded] = useState(false);
  const [qrSizePreset, setQrSizePreset] = useState<QRSizePreset>('medium');
  const lastClipboardPrompt = useRef<string | null>(null);
  const clipboardPromptShown = useRef(false);

  const [urlValue, setUrlValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcFirstName, setVcFirstName] = useState('');
  const [vcLastName, setVcLastName] = useState('');
  const [vcPhone, setVcPhone] = useState('');
  const [vcEmail, setVcEmail] = useState('');
  const [vcCompany, setVcCompany] = useState('');

  const [mcName, setMcName] = useState('');
  const [mcPhone, setMcPhone] = useState('');
  const [mcEmail, setMcEmail] = useState('');
  const [mcUrl, setMcUrl] = useState('');
  const [mcAddress, setMcAddress] = useState('');

  const [locLat, setLocLat] = useState('');
  const [locLng, setLocLng] = useState('');

  const [evTitle, setEvTitle] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evStart, setEvStart] = useState('');
  const [evEnd, setEvEnd] = useState('');

  const [cryptoCurrency, setCryptoCurrency] = useState<'bitcoin'|'ethereum'|'litecoin'>('bitcoin');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [vcWebsite, setVcWebsite] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [smsNum, setSmsNum] = useState('');
  const [smsMsg, setSmsMsg] = useState('');

  const setUrlDraft = useCallback((value: string) => {
    setUrlValue(normalizeWebUrlContent(value));
  }, []);

  const setWebsiteDraft = useCallback((value: string) => {
    setVcWebsite(normalizeWebUrlContent(value));
  }, []);

  const contentData = useMemo((): Record<string, string> => {
    switch (qrType) {
      case 'url': return { url: urlValue };
      case 'text': return { text: textValue };
      case 'wifi': return { ssid: wifiSSID, password: wifiPass, encryption: wifiEnc };
      case 'vcard': return { firstName: vcFirstName, lastName: vcLastName, phone: vcPhone, email: vcEmail, company: vcCompany, website: vcWebsite };
      case 'email': return { email: emailTo, subject: emailSubject };
      case 'phone': return { phone: phoneNum };
      case 'sms': return { phone: smsNum, message: smsMsg };
      default: return {};
    }
  }, [qrType, urlValue, textValue, wifiSSID, wifiPass, wifiEnc, vcFirstName, vcLastName, vcPhone, vcEmail, vcCompany, vcWebsite, emailTo, emailSubject, phoneNum, smsNum, smsMsg]);

  const currentContent = useMemo(() => buildQRContent(qrType, contentData), [qrType, contentData]);
  const effectiveBg = config.transparentBg ? '#ffffff' : config.bgColor;
  const contrast = useMemo(() => contrastRatio(config.fgColor, effectiveBg), [config.fgColor, effectiveBg]);
  const hasContrastWarning = contrast < 3;
  const hasQuietZoneWarning = config.margin < 24;
  const visibleDotStyles = moduleStylesExpanded ? DOT_STYLES : DOT_STYLES.slice(0, 3);
  const visibleCornerStyles = cornerStylesExpanded ? CORNER_STYLES : CORNER_STYLES.slice(0, 3);
  const visibleBallStyles = ballStylesExpanded ? BALL_STYLES : BALL_STYLES.slice(0, 3);
  const autoTitle = useMemo(() => {
    switch (qrType) {
      case 'url': return urlValue.replace(/^https?:\/\//, '').split('/')[0] || 'URL QR';
      case 'wifi': return wifiSSID || 'Wi-Fi QR';
      case 'vcard': return [vcFirstName, vcLastName].filter(Boolean).join(' ') || 'Contact QR';
      case 'text': return textValue.slice(0, 30) || 'Text QR';
      case 'email': return emailTo || 'E-Mail QR';
      case 'phone': return phoneNum || 'Phone QR';
      case 'sms': return smsNum || 'SMS QR';
      default: return 'QR Code';
    }
  }, [qrType, urlValue, wifiSSID, vcFirstName, vcLastName, textValue, emailTo, phoneNum, smsNum]);

  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fetchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function generatePreview(nextConfig: ExtendedQRConfig, data: string) {
    if (!webViewReady) return;
    try {
      setPreviewLoading(true);
      const dataUri = await generateQRLocally({
        data: data || 'https://example.com',
        fgColor: nextConfig.fgColor,
        bgColor: nextConfig.bgColor,
        transparent: nextConfig.transparentBg,
        dotsType: mapDotsStyle(nextConfig.dotsStyle),
        cornersSquareType: mapCornerSquareStyle(nextConfig.cornerSquareStyle),
        cornersDotType: mapCornerDotStyle(nextConfig.cornerDotStyle),
        logo: nextConfig.logo,
        logoMargin: nextConfig.logoMargin,
        margin: nextConfig.margin,
        size: 512,
        rounded: false,
      });
      setPreviewBase64(dataUri);
      setPreviewLoading(false);
    } catch {
      setPreviewLoading(false);
    }
  }

  function sendQRUpdate(nextConfig: ExtendedQRConfig, data = currentContent) {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);
    fetchTimeout.current = setTimeout(() => {
      generatePreview(nextConfig, data);
    }, 200);
  }

  function updateConfig(partial: Partial<ExtendedQRConfig>) {
    setConfig(prev => ({ ...prev, ...partial }));
  }

  function setQRSizePreset(nextPreset: QRSizePreset) {
    setQrSizePreset(nextPreset);
    if (nextPreset === 'small') updateConfig({ qrSize: 512 });
    if (nextPreset === 'medium') updateConfig({ qrSize: 1024 });
    if (nextPreset === 'large') updateConfig({ qrSize: 2048 });
  }

  useEffect(() => {
    sendQRUpdate(config, currentContent);
  }, [currentContent, config, webViewReady]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function offerClipboardUrl() {
        try {
          const text = await Clipboard.getStringAsync();
          const normalized = normalizeWebUrlContent(text);
          if (cancelled || clipboardPromptShown.current || !isLikelyWebUrl(normalized) || normalized === urlValue || normalized === lastClipboardPrompt.current) return;

          lastClipboardPrompt.current = normalized;
          clipboardPromptShown.current = true;
          Alert.alert('Paste URL?', `Use this link from your clipboard?\n\n${normalized}`, [
            { text: 'No', style: 'cancel' },
            {
              text: 'Paste',
              onPress: () => {
                setQrType('url');
                setActiveTab('content');
                setUrlValue(normalized);
              },
            },
          ]);
        } catch {
          // Clipboard access can be unavailable on some platforms.
        }
      }

      offerClipboardUrl();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  async function handleSaveAndExport() {
    if (!currentContent) {
      Alert.alert('Heads up', 'Please enter content for the QR code.');
      return;
    }
    setExporting(true);
    try {
      const roundedDataUri = await generateQRLocally({
        data: currentContent,
        fgColor: config.fgColor,
        bgColor: config.bgColor,
        transparent: config.transparentBg,
        dotsType: mapDotsStyle(config.dotsStyle),
        cornersSquareType: mapCornerSquareStyle(config.cornerSquareStyle),
        cornersDotType: mapCornerDotStyle(config.cornerDotStyle),
        logo: config.logo,
        logoMargin: config.logoMargin,
        margin: config.margin,
        size: config.qrSize,
        rounded: true,
      });
      const base64 = roundedDataUri.split(',')[1];
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
        localImagePath: path,
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
      Alert.alert('Error', err.message ?? 'The QR code could not be exported.');
      setExporting(false);
    }
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
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
      updateConfig({
        logo: `data:${mimeType};base64,${asset.base64}`,
      });
    }
  }

  const inputStyle = { color: C.onSurface, borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLowest };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.surface }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />
      <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.outlineVariant }]}>
        <Text style={[styles.headerTitle, { color: C.onSurface }]}>Create QR Code</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.previewSection}>
          <View style={[styles.previewWrapper, { backgroundColor: C.white, borderColor: C.outlineVariant, shadowColor: C.black }]}> 
            {previewLoading && <View style={[styles.previewLoader, { backgroundColor: C.white }]}><ActivityIndicator color={C.primary} size="large" /><Text style={[styles.loadingText, { color: C.outline }]}>Loading preview...</Text></View>}
            {previewBase64 && <Image source={{ uri: previewBase64 }} style={styles.webview} resizeMode="contain" />}

          </View>
          <Text style={[styles.previewLabel, { color: C.onSurfaceVariant }]}>Live Preview</Text>
          {(hasContrastWarning || hasQuietZoneWarning) && (
            <View style={[styles.warningCard, { backgroundColor: `${C.tertiary}18`, borderColor: C.tertiary }]}> 
              <MaterialIcons name="warning-amber" size={20} color={C.tertiary} />
              <Text style={[styles.warningText, { color: C.onSurface }]}>
                {hasContrastWarning ? 'Low contrast may make this QR code harder to scan. ' : ''}
                {hasQuietZoneWarning ? 'A margin below 32 px can also reduce scan reliability.' : ''}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.tabCard, { backgroundColor: C.white, borderColor: C.outlineVariant, shadowColor: C.black }]}> 
          <View style={[styles.tabBar, { borderBottomColor: C.outlineVariant }]}> 
            {TABS.map(tab => (
              <Pressable key={tab.id} style={[styles.tab, activeTab === tab.id && { borderBottomColor: C.primary }]} onPress={() => setActiveTab(tab.id)}>
                <Text style={[styles.tabLabel, { color: activeTab === tab.id ? C.primary : C.onSurfaceVariant }]}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.tabPanel}>
            {activeTab === 'content' && (
              <View style={[styles.contentPanel, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}>
                <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>TYPE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeList}>
                  {QR_TYPES.map(type => (
                    <Pressable key={type} style={[styles.typeBtn, { backgroundColor: C.white, borderColor: C.outlineVariant }, qrType === type && { backgroundColor: C.primary, borderColor: C.primary }]} onPress={() => setQrType(type)}>
                      <Text style={[styles.typeBtnText, { color: qrType === type ? C.onPrimary : C.onSurfaceVariant }]}>{QR_TYPE_LABELS[type]}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {qrType === 'url' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>URL</Text><TextInput style={[styles.input, styles.urlInput, inputStyle]} placeholder="https://example.com" placeholderTextColor={C.outline} value={urlValue} onChangeText={setUrlDraft} onBlur={() => setUrlDraft(urlValue)} keyboardType="url" autoCapitalize="none" autoCorrect={false} multiline numberOfLines={3} scrollEnabled returnKeyType="done" blurOnSubmit={true} onSubmitEditing={Keyboard.dismiss} /></>}
                {qrType === 'text' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>TEXT</Text><TextInput style={[styles.input, styles.inputMulti, inputStyle]} placeholder="Your text here..." placeholderTextColor={C.outline} value={textValue} onChangeText={setTextValue} multiline numberOfLines={4} /></>}
                {qrType === 'wifi' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>NETWORK NAME (SSID)</Text><TextInput style={[styles.input, inputStyle]} placeholder="My Wi-Fi" placeholderTextColor={C.outline} value={wifiSSID} onChangeText={setWifiSSID} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>PASSWORD</Text><TextInput style={[styles.input, inputStyle]} placeholder="Password" placeholderTextColor={C.outline} value={wifiPass} onChangeText={setWifiPass} secureTextEntry /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>ENCRYPTION</Text><View style={styles.radioRow}>{(['WPA', 'WEP', 'nopass'] as const).map(enc => <Pressable key={enc} style={[styles.radioBtn, { backgroundColor: C.white, borderColor: C.outlineVariant }, wifiEnc === enc && { backgroundColor: `${C.primary}18`, borderColor: C.primary }]} onPress={() => setWifiEnc(enc)}><Text style={[styles.radioBtnText, { color: wifiEnc === enc ? C.primary : C.onSurfaceVariant }]}>{enc}</Text></Pressable>)}</View></>}
                {qrType === 'vcard' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>FIRST NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Max" placeholderTextColor={C.outline} value={vcFirstName} onChangeText={setVcFirstName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LAST NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Smith" placeholderTextColor={C.outline} value={vcLastName} onChangeText={setVcLastName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>PHONE</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={vcPhone} onChangeText={setVcPhone} keyboardType="phone-pad" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>E-MAIL</Text><TextInput style={[styles.input, inputStyle]} placeholder="max@example.com" placeholderTextColor={C.outline} value={vcEmail} onChangeText={setVcEmail} keyboardType="email-address" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>COMPANY</Text><TextInput style={[styles.input, inputStyle]} placeholder="My Company Inc." placeholderTextColor={C.outline} value={vcCompany} onChangeText={setVcCompany} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>WEBSITE</Text><TextInput style={[styles.input, styles.urlInput, inputStyle]} placeholder="https://example.com" placeholderTextColor={C.outline} value={vcWebsite} onChangeText={setWebsiteDraft} onBlur={() => setWebsiteDraft(vcWebsite)} keyboardType="url" autoCapitalize="none" multiline numberOfLines={2} scrollEnabled /></>}
                {qrType === 'email' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>EMAIL ADDRESS</Text><TextInput style={[styles.input, inputStyle]} placeholder="recipient@example.com" placeholderTextColor={C.outline} value={emailTo} onChangeText={setEmailTo} keyboardType="email-address" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>SUBJECT (OPTIONAL)</Text><TextInput style={[styles.input, inputStyle]} placeholder="Subject" placeholderTextColor={C.outline} value={emailSubject} onChangeText={setEmailSubject} /></>}
                {qrType === 'phone' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>PHONE NUMBER</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={phoneNum} onChangeText={setPhoneNum} keyboardType="phone-pad" /></>}
                {qrType === 'sms' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>PHONE NUMBER</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={smsNum} onChangeText={setSmsNum} keyboardType="phone-pad" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>MESSAGE (OPTIONAL)</Text><TextInput style={[styles.input, styles.inputMulti, inputStyle]} placeholder="Your message..." placeholderTextColor={C.outline} value={smsMsg} onChangeText={setSmsMsg} multiline numberOfLines={3} /></>}
                {qrType === 'mecard' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>NAME</Text><TextInput style={[styles.input, inputStyle]} placeholder="Max Smith" placeholderTextColor={C.outline} value={mcName} onChangeText={setMcName} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>PHONE</Text><TextInput style={[styles.input, inputStyle]} placeholder="+49 123 456789" placeholderTextColor={C.outline} value={mcPhone} onChangeText={setMcPhone} keyboardType="phone-pad" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>E-MAIL</Text><TextInput style={[styles.input, inputStyle]} placeholder="max@example.com" placeholderTextColor={C.outline} value={mcEmail} onChangeText={setMcEmail} keyboardType="email-address" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>WEBSITE</Text><TextInput style={[styles.input, inputStyle]} placeholder="https://example.com" placeholderTextColor={C.outline} value={mcUrl} onChangeText={setMcUrl} keyboardType="url" autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>ADDRESS</Text><TextInput style={[styles.input, inputStyle]} placeholder="123 Main St" placeholderTextColor={C.outline} value={mcAddress} onChangeText={setMcAddress} /></>}
                {qrType === 'location' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>LATITUDE</Text><TextInput style={[styles.input, inputStyle]} placeholder="e.g. 52.5200" placeholderTextColor={C.outline} value={locLat} onChangeText={setLocLat} keyboardType="numeric" /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LONGITUDE</Text><TextInput style={[styles.input, inputStyle]} placeholder="e.g. 13.4050" placeholderTextColor={C.outline} value={locLng} onChangeText={setLocLng} keyboardType="numeric" /></>}
                {qrType === 'event' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>EVENT TITLE</Text><TextInput style={[styles.input, inputStyle]} placeholder="My Event" placeholderTextColor={C.outline} value={evTitle} onChangeText={setEvTitle} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>LOCATION</Text><TextInput style={[styles.input, inputStyle]} placeholder="Event Location" placeholderTextColor={C.outline} value={evLocation} onChangeText={setEvLocation} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>START DATE (YYYYMMDDTHHMMSS)</Text><TextInput style={[styles.input, inputStyle]} placeholder="20261231T200000" placeholderTextColor={C.outline} value={evStart} onChangeText={setEvStart} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>END DATE (YYYYMMDDTHHMMSS)</Text><TextInput style={[styles.input, inputStyle]} placeholder="20261231T235959" placeholderTextColor={C.outline} value={evEnd} onChangeText={setEvEnd} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>DESCRIPTION</Text><TextInput style={[styles.input, inputStyle, { height: 80 }]} placeholder="Event details..." placeholderTextColor={C.outline} value={evDesc} onChangeText={setEvDesc} multiline /></>}
                {qrType === 'crypto' && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>CURRENCY</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.sm }}>
                    {['bitcoin', 'ethereum', 'litecoin'].map(c => (
                      <Pressable key={c} style={[styles.typeBtn, { paddingVertical: 8, paddingHorizontal: 12 }, cryptoCurrency === c && { backgroundColor: C.primary, borderColor: C.primary }]} onPress={() => setCryptoCurrency(c as any)}>
                        <Text style={[styles.typeBtnText, { color: cryptoCurrency === c ? C.onPrimary : C.onSurfaceVariant }]}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>ADDRESS</Text><TextInput style={[styles.input, inputStyle]} placeholder="Wallet Address" placeholderTextColor={C.outline} value={cryptoAddress} onChangeText={setCryptoAddress} /><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.sm }]}>AMOUNT</Text><TextInput style={[styles.input, inputStyle]} placeholder="0.0" placeholderTextColor={C.outline} value={cryptoAmount} onChangeText={setCryptoAmount} keyboardType="numeric" /></>}
                {['facebook', 'twitter', 'youtube'].includes(qrType) && <><Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginTop: SPACING.md }]}>{QR_TYPE_LABELS[qrType]} URL</Text><TextInput style={[styles.input, styles.urlInput, inputStyle]} placeholder={`https://${qrType}.com/username`} placeholderTextColor={C.outline} value={urlValue} onChangeText={setUrlDraft} onBlur={() => setUrlDraft(urlValue)} keyboardType="url" autoCapitalize="none" multiline numberOfLines={2} scrollEnabled /></>}
              </View>
            )}

            {activeTab === 'design' && (
              <View style={{ gap: SPACING.md }}>
                <Pressable style={styles.sectionToggle} onPress={() => setModuleStylesExpanded(v => !v)}>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>DOT STYLE</Text>
                  <MaterialIcons name={moduleStylesExpanded ? 'expand-less' : 'expand-more'} size={22} color={C.onSurfaceVariant} />
                </Pressable>
                <View style={styles.styleGrid}>
                  {visibleDotStyles.map(style => (
                    <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.dotsStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ dotsStyle: style.value })}>
                      <SpriteIcon shape={style.value} type='body' color={config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant} active={config.dotsStyle === style.value} />
                      <Text style={[styles.styleBtnLabel, { color: config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={[styles.sectionToggle, { marginTop: SPACING.xs }]} onPress={() => setCornerStylesExpanded(v => !v)}>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>CORNER FRAME</Text>
                  <MaterialIcons name={cornerStylesExpanded ? 'expand-less' : 'expand-more'} size={22} color={C.onSurfaceVariant} />
                </Pressable>
                <View style={styles.styleGrid}>
                  {visibleCornerStyles.map(style => (
                    <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.cornerSquareStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ cornerSquareStyle: style.value })}>
                      <SpriteIcon shape={style.icon ?? style.value} type='frame' color={config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant} active={config.cornerSquareStyle === style.value} />
                      <Text style={[styles.styleBtnLabel, { color: config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={[styles.sectionToggle, { marginTop: SPACING.xs }]} onPress={() => setBallStylesExpanded(v => !v)}>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>CORNER DOT</Text>
                  <MaterialIcons name={ballStylesExpanded ? 'expand-less' : 'expand-more'} size={22} color={C.onSurfaceVariant} />
                </Pressable>
                <View style={styles.styleGrid}>
                  {visibleBallStyles.map(style => (
                    <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.cornerDotStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ cornerDotStyle: style.value })}>
                      <SpriteIcon shape={style.icon ?? style.value} type='ball' color={config.cornerDotStyle === style.value ? C.primary : C.onSurfaceVariant} active={config.cornerDotStyle === style.value} />
                      <Text style={[styles.styleBtnLabel, { color: config.cornerDotStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text>
                    </Pressable>
                  ))}
                </View>
                <ValueSlider C={C} label="OUTER MARGIN" value={config.margin} min={0} max={180} suffix=" px" onChange={margin => updateConfig({ margin })} />
                <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>QR SIZE</Text>
                <View style={styles.sizePresetRow}>
                  {([
                    { id: 'small', label: 'Small', size: 512 },
                    { id: 'medium', label: 'Medium', size: 1024 },
                    { id: 'large', label: 'Large', size: 2048 },
                    { id: 'custom', label: 'Custom', size: config.qrSize },
                  ] as Array<{ id: QRSizePreset; label: string; size: number }>).map(option => (
                    <Pressable
                      key={option.id}
                      style={[styles.sizePresetBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, qrSizePreset === option.id && { backgroundColor: `${C.primary}18`, borderColor: C.primary }]}
                      onPress={() => setQRSizePreset(option.id)}
                    >
                      <Text style={[styles.sizePresetLabel, { color: qrSizePreset === option.id ? C.primary : C.onSurface }]}>{option.label}</Text>
                      <Text style={[styles.sizePresetValue, { color: C.onSurfaceVariant }]}>{option.size}px</Text>
                    </Pressable>
                  ))}
                </View>
                {qrSizePreset === 'custom' && <ValueSlider C={C} label="CUSTOM SIZE" value={config.qrSize} min={512} max={2048} suffix=" px" onChange={qrSize => updateConfig({ qrSize })} />}
              </View>
            )}

            {activeTab === 'colors' && (
              <View style={{ gap: SPACING.sm }}>
                <ColorPickerBlock C={C} title="FOREGROUND" value={config.fgColor} palette={PRESET_FG} onChange={fgColor => updateConfig({ fgColor })} />
                <ColorPickerBlock C={C} title="BACKGROUND" value={config.bgColor} palette={PRESET_BG} onChange={bgColor => updateConfig({ bgColor })} />
                <View style={[styles.switchRow, { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow }]}>
                  <View style={{ flex: 1 }}><Text style={[styles.switchTitle, { color: C.onSurface }]}>Transparent background</Text><Text style={[styles.switchSubtitle, { color: C.onSurfaceVariant }]}>For stickers, logos, and overlays.</Text></View>
                  <Switch value={config.transparentBg} onValueChange={transparentBg => updateConfig({ transparentBg })} trackColor={{ false: C.outlineVariant, true: C.primary }} thumbColor={C.white} />
                </View>
              </View>
            )}

            {activeTab === 'logo' && (
              <View style={{ gap: SPACING.md }}>
                {config.logo ? <View style={[styles.logoPreviewRow, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }]}><View style={styles.logoPreviewWrap}><MaterialIcons name="image" size={36} color={C.primary} /><Text style={[styles.logoLoadedText, { color: C.onSurface }]}>Logo loaded</Text></View><Pressable style={styles.removeLogoBtn} onPress={() => updateConfig({ logo: undefined })}><MaterialIcons name="delete" size={20} color={C.error} /><Text style={[styles.removeLogoText, { color: C.error }]}>Remove</Text></Pressable></View> : <Pressable style={[styles.logoUploadBtn, { borderColor: C.primary, backgroundColor: `${C.primary}08` }]} onPress={pickLogo}><MaterialIcons name="add-photo-alternate" size={32} color={C.primary} /><Text style={[styles.logoUploadText, { color: C.primary }]}>Upload logo</Text><Text style={[styles.logoUploadSub, { color: C.outline }]}>PNG or JPG, square recommended</Text></Pressable>}
                <ValueSlider C={C} label="LOGO PADDING" value={config.logoMargin} min={0} max={20} suffix=" px" onChange={logoMargin => updateConfig({ logoMargin })} />
                <ValueSlider C={C} label="LOGO ROUNDING" value={config.logoRadius ?? 0} min={0} max={50} suffix="%" onChange={logoRadius => updateConfig({ logoRadius })} />
              </View>
            )}
          </View>
        </View>

        <Pressable style={[styles.saveBtn, { backgroundColor: C.primary, shadowColor: C.primary }, exporting && styles.saveBtnDisabled]} onPress={handleSaveAndExport} disabled={exporting}>
          {exporting ? <ActivityIndicator color={C.onPrimary} size="small" /> : <MaterialIcons name="download" size={22} color={C.onPrimary} />}
          <Text style={[styles.saveBtnText, { color: C.onPrimary }]}>{exporting ? 'Saving...' : 'Save to Photos'}</Text>
        </Pressable>
      </ScrollView>

      {/* Hidden WebView — local QR generator using qr-code-styling (no API needed) */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <WebView
          ref={qrWebViewRef}
          style={{ width: 1, height: 1 }}
          source={{ html: QR_GENERATOR_HTML }}
          onLoad={() => setWebViewReady(true)}
          onMessage={event => {
            try {
              const msg = JSON.parse(event.nativeEvent.data);
              if (msg.type === 'qr_result') {
                const cb = pendingQRCallback.current;
                if (cb && cb.id === msg.requestId) { pendingQRCallback.current = null; cb.resolve(msg.data); }
              } else if (msg.type === 'error') {
                const cb = pendingQRCallback.current;
                if (cb) { pendingQRCallback.current = null; cb.reject(new Error(msg.message ?? 'WebView error')); }
              }
            } catch {}
          }}
          javaScriptEnabled
          originWhitelist={['*']}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: SPACING.containerPadding, paddingVertical: SPACING.sm, borderBottomWidth: 1, alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.headlineSm },
  scroll: { flex: 1 },
  previewSection: { alignItems: 'center', paddingTop: SPACING.md, paddingHorizontal: SPACING.containerPadding, paddingBottom: SPACING.sm },
  previewWrapper: { width: 270, height: 270, borderRadius: RADIUS.xxl, overflow: 'hidden', padding: 16, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, borderWidth: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: 'transparent', borderRadius: RADIUS.xl, overflow: 'hidden' },
  previewLoader: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 5, gap: SPACING.sm },
  loadingText: { ...TYPOGRAPHY.labelMd },
  previewLabel: { ...TYPOGRAPHY.labelMd, marginTop: SPACING.sm },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md, borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.md },
  warningText: { flex: 1, ...TYPOGRAPHY.labelMd },
  tabCard: { marginHorizontal: SPACING.containerPadding, borderRadius: RADIUS.xxl, overflow: 'hidden', borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { ...TYPOGRAPHY.labelMd },
  tabPanel: { padding: SPACING.sm },
  contentPanel: { gap: SPACING.sm, borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.md },
  fieldLabel: { ...TYPOGRAPHY.labelSm, letterSpacing: 0.6, marginBottom: SPACING.sm },
  sectionToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 },
  input: { height: 46, borderWidth: 1, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 0, textAlignVertical: 'center', ...TYPOGRAPHY.bodyMd, lineHeight: 22 },
  urlInput: { height: 82, maxHeight: 120, paddingTop: SPACING.sm, paddingBottom: SPACING.sm, textAlignVertical: 'top' },
  inputMulti: { height: 96, paddingTop: SPACING.sm, textAlignVertical: 'top' },
  typeList: { gap: SPACING.sm, paddingRight: SPACING.md, paddingVertical: 2 },
  typeBtn: { minHeight: 34, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  typeBtnText: { ...TYPOGRAPHY.labelMd },
  radioRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  radioBtn: { minHeight: 38, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  radioBtnText: { ...TYPOGRAPHY.labelMd },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  styleBtn: { width: 92, height: 80, borderRadius: RADIUS.xl, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  styleBtnLabel: { ...TYPOGRAPHY.labelSm, textAlign: 'center' },
  sizePresetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  sizePresetBtn: { flex: 1, minWidth: 78, borderRadius: RADIUS.lg, borderWidth: 1, paddingVertical: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  sizePresetLabel: { ...TYPOGRAPHY.labelMd },
  sizePresetValue: { ...TYPOGRAPHY.labelSm, marginTop: 2, fontVariant: ['tabular-nums'] },
  cornerIconOuter: { width: 24, height: 24, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  cornerIconInner: { width: 8, height: 8 },
  segmentRow: { flexDirection: 'row', padding: 4, borderRadius: RADIUS.xl, gap: 4 },
  segmentBtn: { flex: 1, minHeight: 42, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  segmentText: { ...TYPOGRAPHY.labelMd },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  compactColorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  colorPanel: { gap: SPACING.sm, borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING.sm },
  colorPanelHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  swatch: { width: 30, height: 30, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  colorDot: { width: 32, height: 32, borderRadius: RADIUS.lg, borderWidth: 1 },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  hexInput: { flex: 1, height: 48, borderWidth: 1, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, ...TYPOGRAPHY.labelMd, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  compactHexInput: { width: 88, height: 34, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, ...TYPOGRAPHY.labelMd, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderRadius: RADIUS.xl, padding: SPACING.sm },
  switchTitle: { ...TYPOGRAPHY.labelMd },
  switchSubtitle: { ...TYPOGRAPHY.labelSm, marginTop: 2 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderValue: { ...TYPOGRAPHY.labelSm, fontVariant: ['tabular-nums'] },
  sliderTrack: { height: 30, borderRadius: 15, overflow: 'hidden', position: 'relative', justifyContent: 'center' },
  sliderFillRow: { borderRadius: 15, flexDirection: 'row', overflow: 'hidden' },
  sliderProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.16 },
  sliderThumb: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', borderWidth: 2, marginLeft: -12, elevation: 4 },
  logoUploadBtn: { height: 120, borderRadius: RADIUS.xxl, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  logoUploadText: { ...TYPOGRAPHY.labelMd },
  logoUploadSub: { ...TYPOGRAPHY.labelSm },
  logoPreviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1 },
  logoPreviewWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoLoadedText: { ...TYPOGRAPHY.labelMd },
  removeLogoBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  removeLogoText: { ...TYPOGRAPHY.labelMd },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.containerPadding, marginTop: SPACING.md, marginBottom: SPACING.sm, height: 48, borderRadius: RADIUS.xl, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { ...TYPOGRAPHY.headlineSm, fontSize: 16 },
});
