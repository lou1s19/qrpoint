import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons';
import { SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useTheme } from '@/context/ThemeContext';
import { useQRHistory } from '@/hooks/useQRHistory';
import { QRCodeConfig, QRHistoryItem, QRType, QR_TYPE_LABELS, QR_TYPE_COLORS } from '@/constants/QRTypes';

const TYPE_FILTERS: Array<QRType | 'all'> = ['all', 'url', 'wifi', 'vcard', 'text', 'email', 'phone', 'sms'];
type ExportAction = 'share' | 'save';

const QR_EXPORT_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:transparent;overflow:hidden}</style></head><body><script src="https://unpkg.com/qr-code-styling@1.9.2/lib/qr-code-styling.js"></script><script>
var qrCode=null;
var CENTER_LOGO_SIZE=0.15;
function normalizeDotsType(type){var map={square:'square',dot:'dots','dot-small':'dots',dots:'dots',tile:'extra-rounded',rounded:'rounded',fluid:'extra-rounded','fluid-line':'rounded',diamond:'classy',star:'extra-rounded',stripe:'square','stripe-row':'square','stripe-column':'square',classy:'classy','classy-rounded':'classy-rounded','extra-rounded':'extra-rounded'};return map[type]||'square';}
function normalizeCornerType(type){var map={square:'square',rounded:'rounded',circle:'dot','rounded-circle':'rounded','circle-rounded':'dot',dot:'dot','extra-rounded':'extra-rounded'};return map[type]||'rounded';}
function getQrSize(cfg){return Math.max(512,Math.min(cfg.qrSize||1024,2048));}
function getMargin(cfg,size){return Math.max(32,Math.min(cfg.margin??48,Math.round(size*0.18)));}
function getErrorCorrectionLevel(cfg){return cfg.logo?'H':((cfg.data||'').length>120?'M':'Q');}
function getOpts(cfg){var size=getQrSize(cfg);var bg=cfg.transparentBg?'transparent':(cfg.bgColor||'#ffffff');var opts={width:size,height:size,type:'canvas',data:cfg.data||'https://example.com',margin:getMargin(cfg,size),qrOptions:{errorCorrectionLevel:getErrorCorrectionLevel(cfg)},dotsOptions:{type:normalizeDotsType(cfg.dotsStyle),color:cfg.fgColor||'#4648d4',roundSize:true},cornersSquareOptions:{type:normalizeCornerType(cfg.cornerSquareStyle),color:cfg.fgColor||'#4648d4'},cornersDotOptions:{type:cfg.cornerDotStyle==='square'?'square':'dot',color:cfg.fgColor||'#4648d4'},backgroundOptions:{color:bg}};if(cfg.logo){opts.image=cfg.logo;opts.imageOptions={crossOrigin:'anonymous',margin:Math.max(cfg.logoMargin??0,10),imageSize:CENTER_LOGO_SIZE,hideBackgroundDots:true};}return opts;}
async function exportQR(cfg){try{qrCode=new QRCodeStyling(getOpts(cfg));var blob=await qrCode.getRawData('png');var reader=new FileReader();reader.onload=function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'export',data:reader.result}));};reader.readAsDataURL(blob);}catch(err){window.ReactNativeWebView.postMessage(JSON.stringify({type:'error',message:err.message}));}}
window.addEventListener('message',function(e){var msg=JSON.parse(e.data);if(msg.type==='export')exportQR(msg.config);});
window.onload=function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));};
</script></body></html>`;

function buildMiniQRHtml(content: string, config: QRCodeConfig) {
  const bgColor = config.transparentBg ? '#ffffff' : config.bgColor;
  return `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bgColor};overflow:hidden}canvas{max-width:100%;max-height:100%}</style>
  </head><body><div id="c"></div>
  <script src="https://unpkg.com/qr-code-styling@1.9.2/lib/qr-code-styling.js"></script>
  <script>
  function normalizeDotsType(type){var map={square:'square',dot:'dots','dot-small':'dots',dots:'dots',tile:'extra-rounded',rounded:'rounded',fluid:'extra-rounded','fluid-line':'rounded',diamond:'classy',star:'extra-rounded',stripe:'square','stripe-row':'square','stripe-column':'square',classy:'classy','classy-rounded':'classy-rounded','extra-rounded':'extra-rounded'};return map[type]||'square';}
  function normalizeCornerType(type){var map={square:'square',rounded:'rounded',circle:'dot','rounded-circle':'rounded','circle-rounded':'dot',dot:'dot','extra-rounded':'extra-rounded'};return map[type]||'rounded';}
  var cfg=${JSON.stringify(config)};
  new QRCodeStyling({width:128,height:128,type:'canvas',data:${JSON.stringify(content || 'https://example.com')},margin:6,dotsOptions:{color:cfg.fgColor||'#4648d4',type:normalizeDotsType(cfg.dotsStyle),roundSize:true},cornersSquareOptions:{type:normalizeCornerType(cfg.cornerSquareStyle),color:cfg.fgColor||'#4648d4'},cornersDotOptions:{type:cfg.cornerDotStyle==='square'?'square':'dot',color:cfg.fgColor||'#4648d4'},backgroundOptions:{color:${JSON.stringify(bgColor)}},qrOptions:{errorCorrectionLevel:'M'}}).append(document.getElementById('c'));
  </script></body></html>`;
}

function HistoryCard({
  item,
  onDelete,
  onShare,
  onSave,
  C,
}: {
  item: QRHistoryItem;
  onDelete: () => void;
  onShare: () => void;
  onSave: () => void;
  C: any;
}) {
  const typeColor = QR_TYPE_COLORS[item.type];
  const now = Date.now();
  const diff = now - item.createdAt;
  let timeLabel = '';
  if (diff < 3600000) timeLabel = `${Math.floor(diff / 60000)} min ago`;
  else if (diff < 86400000) timeLabel = `${Math.floor(diff / 3600000)} h ago`;
  else if (diff < 604800000) timeLabel = `${Math.floor(diff / 86400000)} days ago`;
  else timeLabel = new Date(item.createdAt).toLocaleDateString('en-US');
  const previewBg = item.config.transparentBg ? '#ffffff' : item.config.bgColor;

  return (
    <View style={[styles.card, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
      <View style={[styles.qrPreview, { backgroundColor: previewBg, borderColor: C.outlineVariant }]}>
        {item.localImagePath ? (
          <Image
            source={{ uri: item.localImagePath }}
            style={styles.qrPreviewImage}
            resizeMode="contain"
          />
        ) : (
          <WebView
            source={{ html: buildMiniQRHtml(item.content, item.config) }}
            style={styles.qrPreviewWebView}
            scrollEnabled={false}
            javaScriptEnabled
            pointerEvents="none"
            originWhitelist={['*']}
          />
        )}
      </View>
      <View style={styles.cardMid}>
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}18` }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{QR_TYPE_LABELS[item.type]}</Text>
          </View>
          <Text style={[styles.timeText, { color: C.outline }]}>{timeLabel}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: C.onSurface }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardContent, { color: C.onSurfaceVariant }]} numberOfLines={1}>{item.content}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable style={[styles.actionBtn, { backgroundColor: C.surfaceContainerLow }]} onPress={onShare}>
          <MaterialIcons name="share" size={18} color={C.onSurfaceVariant} />
        </Pressable>
        <Pressable style={[styles.actionBtn, { backgroundColor: C.surfaceContainerLow }]} onPress={onSave}>
          <MaterialIcons name="file-download" size={18} color={C.onSurfaceVariant} />
        </Pressable>
        <Pressable style={[styles.actionBtn, { backgroundColor: C.surfaceContainerLow }]} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={18} color={C.error} />
        </Pressable>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { colors: C, isDark } = useTheme();
  const { items, deleteItem, clearAll, refresh } = useQRHistory();
  const exportWebRef = useRef<WebView>(null);
  const pendingExport = useRef<{ action: ExportAction; item: QRHistoryItem } | null>(null);
  const [exportReady, setExportReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'created' | 'scanned'>('created');
  const [typeFilter, setTypeFilter] = useState<QRType | 'all'>('all');
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh])
  );

  const filtered = useMemo(() => {
    let list = items.filter(i => (activeTab === 'created' ? !i.isScanned : i.isScanned));
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeTab, typeFilter, search]);

  function requestExport(item: QRHistoryItem, action: ExportAction) {
    if (!exportReady) {
      Alert.alert('One moment', 'QR export is still getting ready. Please try again in a moment.');
      return;
    }
    pendingExport.current = { action, item };
    exportWebRef.current?.postMessage(JSON.stringify({ type: 'export', config: { ...item.config, data: item.content } }));
  }

  async function handleExportedImage(dataUri: string) {
    const pending = pendingExport.current;
    if (!pending) return;
    pendingExport.current = null;

    const safeTitle = pending.item.title.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'qr-code';
    const path = `${FileSystem.cacheDirectory}${safeTitle}-${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(path, dataUri.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });

    if (pending.action === 'share') {
      await Sharing.shareAsync(path, { mimeType: 'image/png', dialogTitle: pending.item.title });
      return;
    }

    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access so QR Point can save the QR code.');
      return;
    }
    await MediaLibrary.saveToLibraryAsync(path);
    Alert.alert('Saved', 'The QR code was saved as an image to your photos.');
  }

  function handleSave(item: QRHistoryItem) {
    Alert.alert('Save', 'Do you want to save this QR code as an image to Photos?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save', onPress: () => requestExport(item, 'save') },
    ]);
  }

  function handleClearAll() {
    if (!items.length) return;
    Alert.alert('Clear all?', 'This will delete every item from history and remove any saved local images.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: () => clearAll() },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.surface }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />
      <View style={styles.hiddenExporter}>
        <WebView
          ref={exportWebRef}
          source={{ html: QR_EXPORT_HTML }}
          onMessage={e => {
            const message = JSON.parse(e.nativeEvent.data);
            if (message.type === 'ready') setExportReady(true);
            if (message.type === 'export') handleExportedImage(message.data);
          }}
          javaScriptEnabled
          originWhitelist={['*']}
        />
      </View>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: C.onSurface }]}>History</Text>
        <Pressable
          onPress={handleClearAll}
          disabled={!items.length}
          style={({ pressed }) => [
            styles.clearAllBtn,
            { backgroundColor: items.length ? `${C.error}14` : C.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <MaterialIcons name="delete-sweep" size={18} color={items.length ? C.error : C.outlineVariant} />
          <Text style={[styles.clearAllText, { color: items.length ? C.error : C.outlineVariant }]}>Clear all</Text>
        </Pressable>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
        <MaterialIcons name="search" size={18} color={C.outline} />
        <TextInput
          style={[styles.searchInput, { color: C.onSurface }]}
          placeholder="Search codes..."
          placeholderTextColor={C.outline}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={C.outline} />
          </Pressable>
        )}
      </View>

      <View style={[styles.toggleRow, { backgroundColor: C.surfaceContainerHigh }]}>
        <Pressable
          style={[styles.toggleBtn, activeTab === 'created' && [styles.toggleBtnActive, { backgroundColor: C.white }]]}
          onPress={() => setActiveTab('created')}
        >
          <Text style={[styles.toggleText, { color: activeTab === 'created' ? C.primary : C.onSurfaceVariant }]}>Created</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, activeTab === 'scanned' && [styles.toggleBtnActive, { backgroundColor: C.white }]]}
          onPress={() => setActiveTab('scanned')}
        >
          <Text style={[styles.toggleText, { color: activeTab === 'scanned' ? C.primary : C.onSurfaceVariant }]}>Scanned</Text>
        </Pressable>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {TYPE_FILTERS.map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, { backgroundColor: C.white, borderColor: C.outlineVariant }, typeFilter === f && { backgroundColor: C.primary, borderColor: C.primary }]}
              onPress={() => setTypeFilter(f)}
            >
              <Text style={[styles.filterChipText, { color: typeFilter === f ? '#fff' : C.onSurfaceVariant }]}>
                {f === 'all' ? 'All' : QR_TYPE_LABELS[f as QRType]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <MaterialIcons name={activeTab === 'created' ? 'qr-code' : 'qr-code-scanner'} size={64} color={C.outlineVariant} />
            <Text style={[styles.emptyTitle, { color: C.onSurfaceVariant }]}>{activeTab === 'created' ? 'No created codes' : 'No scanned codes'}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            C={C}
            onDelete={() => Alert.alert('Delete?', 'Really delete this item?', [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem(item.id) }])}
            onShare={() => requestExport(item, 'share')}
            onSave={() => handleSave(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.containerPadding,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  headerTitle: { ...TYPOGRAPHY.headlineMd, flex: 1 },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    height: 36,
    borderRadius: RADIUS.full,
  },
  clearAllText: { ...TYPOGRAPHY.labelMd },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.containerPadding, marginBottom: SPACING.md,
    height: 44, borderRadius: RADIUS.xxl, borderWidth: 1, paddingHorizontal: SPACING.md,
  },
  searchInput: { flex: 1, ...TYPOGRAPHY.bodyMd },
  toggleRow: { flexDirection: 'row', marginHorizontal: SPACING.containerPadding, marginBottom: SPACING.md, borderRadius: RADIUS.xxl, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.xl },
  toggleBtnActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  toggleText: { ...TYPOGRAPHY.labelMd },
  filterBar: { marginBottom: SPACING.md },
  filterList: { paddingHorizontal: SPACING.containerPadding, gap: SPACING.sm, alignItems: 'center' },
  filterChip: { minHeight: 36, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterChipText: { ...TYPOGRAPHY.labelMd },
  list: { paddingHorizontal: SPACING.containerPadding, paddingBottom: SPACING.md, gap: SPACING.sm },
  card: { flexDirection: 'row', borderRadius: RADIUS.xxl, padding: SPACING.md, borderWidth: 1, alignItems: 'center', gap: SPACING.md },
  qrPreview: { width: 64, height: 64, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  qrPreviewImage: { width: '100%', height: '100%' },
  qrPreviewWebView: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  cardMid: { flex: 1, gap: 2 },
  typeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  typeBadgeText: { ...TYPOGRAPHY.labelSm, textTransform: 'uppercase', letterSpacing: 0.4 },
  timeText: { ...TYPOGRAPHY.labelSm },
  cardTitle: { ...TYPOGRAPHY.labelMd },
  cardContent: { ...TYPOGRAPHY.labelSm },
  cardActions: { flexDirection: 'column', gap: SPACING.xs },
  actionBtn: { width: 36, height: 36, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: SPACING.sm },
  emptyTitle: { ...TYPOGRAPHY.headlineSm },
  hiddenExporter: { width: 1, height: 1, opacity: 0, overflow: 'hidden', position: 'absolute' },
});
