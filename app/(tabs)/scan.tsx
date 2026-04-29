import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
  Animated,
  Easing,
  StatusBar,
  Share,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useQRHistory } from '@/hooks/useQRHistory';
import { DEFAULT_QR_CONFIG } from '@/constants/QRTypes';

function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });

  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
      pointerEvents="none"
    />
  );
}

function ResultSheet({
  data,
  onClose,
  onSave,
}: {
  data: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const isURL = /^https?:\/\//i.test(data);
  const isPhone = /^tel:/i.test(data);
  const isEmail = /^mailto:/i.test(data);
  const isWifi = /^WIFI:/i.test(data);
  const isVCard = /^BEGIN:VCARD/i.test(data);

  function getIcon() {
    if (isURL) return 'link';
    if (isPhone) return 'phone';
    if (isEmail) return 'email';
    if (isWifi) return 'wifi';
    if (isVCard) return 'contact-page';
    return 'text-snippet';
  }

  function getLabel() {
    if (isURL) return 'URL';
    if (isPhone) return 'Telefon';
    if (isEmail) return 'E-Mail';
    if (isWifi) return 'Wi-Fi';
    if (isVCard) return 'Kontakt';
    return 'Text';
  }

  async function handleAction() {
    try {
      if (isURL) await Linking.openURL(data);
      else if (isPhone) await Linking.openURL(data);
      else if (isEmail) await Linking.openURL(data);
      else await Share.share({ message: data });
    } catch {
      Alert.alert('Fehler', 'Aktion konnte nicht ausgeführt werden.');
    }
  }

  async function handleShare() {
    await Share.share({ message: data });
  }

  return (
    <View style={styles.resultSheet}>
      <View style={styles.resultHandle} />
      <View style={styles.resultHeader}>
        <View style={styles.resultIconWrap}>
          <MaterialIcons name={getIcon() as any} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.resultMeta}>
          <Text style={styles.resultType}>{getLabel()}</Text>
          <Text style={styles.resultData} numberOfLines={2}>{data}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={20} color={COLORS.onSurfaceVariant} />
        </Pressable>
      </View>

      <View style={styles.resultActions}>
        {(isURL || isPhone || isEmail) && (
          <Pressable style={[styles.resultBtn, styles.resultBtnPrimary]} onPress={handleAction}>
            <MaterialIcons name={isURL ? 'open-in-browser' : isPhone ? 'call' : 'send'} size={18} color={COLORS.white} />
            <Text style={styles.resultBtnPrimaryText}>
              {isURL ? 'Link öffnen' : isPhone ? 'Anrufen' : 'E-Mail senden'}
            </Text>
          </Pressable>
        )}
        <View style={styles.resultSecondaryRow}>
          <Pressable style={styles.resultBtnSecondary} onPress={handleShare}>
            <MaterialIcons name="share" size={18} color={COLORS.primary} />
            <Text style={styles.resultBtnSecondaryText}>Teilen</Text>
          </Pressable>
          <Pressable style={styles.resultBtnSecondary} onPress={onSave}>
            <MaterialIcons name="bookmark" size={18} color={COLORS.primary} />
            <Text style={styles.resultBtnSecondaryText}>Speichern</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const { addItem } = useQRHistory();

  function handleBarcodeScanned({ data }: { data: string }) {
    if (scanned) return;
    setScanned(true);
    setResult(data);
  }

  function handleClose() {
    setResult(null);
    setScanned(false);
  }

  async function handleSave() {
    if (!result) return;
    await addItem({
      id: `scan-${Date.now()}`,
      title: result.slice(0, 40) || 'Gescannter QR',
      type: /^https?:\/\//i.test(result) ? 'url' : /^WIFI:/i.test(result) ? 'wifi' : /^BEGIN:VCARD/i.test(result) ? 'vcard' : 'text',
      content: result,
      createdAt: Date.now(),
      isScanned: true,
      config: DEFAULT_QR_CONFIG,
    });
    Alert.alert('Gespeichert', 'QR-Code wurde im Verlauf gespeichert.');
    handleClose();
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung benötigt', 'Bitte erlaube den Zugriff auf die Galerie.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });
    if (!pickerResult.canceled) {
      Alert.alert('Hinweis', 'QR-Erkennung aus Bilddateien wird in dieser Version über die Kamera unterstützt.');
    }
  }

  if (!permission) return <View style={styles.dark} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.dark}>
        <View style={styles.permissionWrap}>
          <MaterialIcons name="qr-code-scanner" size={72} color="rgba(255,255,255,0.4)" />
          <Text style={styles.permTitle}>Kamerazugriff benötigt</Text>
          <Text style={styles.permSubtitle}>
            Um QR-Codes zu scannen, benötigt die App Zugriff auf deine Kamera.
          </Text>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Berechtigung erteilen</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Vignette */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Scanly</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.headerBtn} onPress={() => setTorchOn(v => !v)}>
              <MaterialIcons
                name={torchOn ? 'flashlight-on' : 'flashlight-off'}
                size={22}
                color="white"
              />
            </Pressable>
            <Pressable style={styles.headerBtn} onPress={() => Alert.alert('QR Point', 'Halte den QR-Code in den Rahmen, um ihn automatisch zu scannen.')}>
              <MaterialIcons name="help-outline" size={22} color="white" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Viewfinder */}
      <View style={styles.viewfinderWrap} pointerEvents="none">
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <ScanLine />
          <View style={styles.qrIconWrap}>
            <MaterialIcons name="qr-code-2" size={64} color="rgba(255,255,255,0.15)" />
          </View>
        </View>
        <View style={styles.viewfinderText}>
          <Text style={styles.alignText}>QR-Code ausrichten</Text>
          <Text style={styles.alignSubtext}>
            Halte den Code im Rahmen für automatisches Scannen
          </Text>
        </View>
      </View>

      {/* Bottom */}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
        <Pressable style={styles.galleryBtn} onPress={pickFromGallery}>
          <MaterialIcons name="image" size={20} color={COLORS.onSurface} />
          <Text style={styles.galleryBtnText}>Aus Galerie wählen</Text>
        </Pressable>
      </SafeAreaView>

      {/* Result Sheet */}
      {result && (
        <View style={styles.resultOverlay}>
          <ResultSheet data={result} onClose={handleClose} onSave={handleSave} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  dark: { flex: 1, backgroundColor: '#0a0a0a' },
  permissionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.containerPadding * 2,
    gap: SPACING.md,
  },
  permTitle: { ...TYPOGRAPHY.headlineMd, color: 'white', textAlign: 'center', marginTop: SPACING.md },
  permSubtitle: { ...TYPOGRAPHY.bodyMd, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  permBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  permBtnText: { ...TYPOGRAPHY.labelMd, color: 'white' },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.containerPadding,
    paddingVertical: SPACING.sm,
  },
  headerLeft: {},
  headerTitle: { ...TYPOGRAPHY.headlineSm, color: 'white' },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  viewfinderWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  viewfinder: {
    width: 260,
    height: 260,
    position: 'relative',
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: COLORS.primaryContainer,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: RADIUS.xxl },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: RADIUS.xxl },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: RADIUS.xxl },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: RADIUS.xxl },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  qrIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderText: { alignItems: 'center', gap: SPACING.xs },
  alignText: { ...TYPOGRAPHY.labelMd, color: 'white', textTransform: 'uppercase', letterSpacing: 1 },
  alignSubtext: { ...TYPOGRAPHY.bodyMd, color: 'rgba(255,255,255,0.55)', textAlign: 'center', maxWidth: 240, lineHeight: 22 },
  bottomSafe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: 'white',
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  galleryBtnText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurface },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  resultSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.containerPadding,
    paddingBottom: 40,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  resultHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.outlineVariant,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  resultIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultMeta: { flex: 1, gap: 2 },
  resultType: { ...TYPOGRAPHY.labelSm, color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultData: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultActions: { gap: SPACING.sm },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
    borderRadius: RADIUS.xl,
  },
  resultBtnPrimary: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  resultBtnPrimaryText: { ...TYPOGRAPHY.labelMd, color: COLORS.white },
  resultSecondaryRow: { flexDirection: 'row', gap: SPACING.sm },
  resultBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 48,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  resultBtnSecondaryText: { ...TYPOGRAPHY.labelMd, color: COLORS.primary },
});
