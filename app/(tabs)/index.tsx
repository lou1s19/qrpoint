import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useTheme } from '@/context/ThemeContext';
import { useQRHistory } from '@/hooks/useQRHistory';
import { QR_TYPE_LABELS, QR_TYPE_COLORS, QRHistoryItem, QRPreset } from '@/constants/QRTypes';
import { useQRPresets } from '@/hooks/useQRPresets';
import { buildQRPreviewHtml } from '@/utils/qrPreviewHtml';

function RecentCard({ item, onPress, C }: { item: QRHistoryItem; onPress: () => void; C: any }) {
  const typeColor = QR_TYPE_COLORS[item.type];
  const previewBg = item.config.transparentBg ? '#ffffff' : item.config.bgColor;
  const now = Date.now();
  const diff = now - item.createdAt;
  let timeLabel = '';
  if (diff < 3600000) timeLabel = `${Math.floor(diff / 60000)} min ago`;
  else if (diff < 86400000) timeLabel = `${Math.floor(diff / 3600000)} h ago`;
  else if (diff < 172800000) timeLabel = 'Yesterday';
  else timeLabel = new Date(item.createdAt).toLocaleDateString('en-US');

  return (
    <Pressable style={[styles.recentCard, { backgroundColor: C.white, borderColor: C.outlineVariant }]} onPress={onPress}>
      <View style={[styles.recentQRWrap, { backgroundColor: C.surfaceContainerLow }]}>
        <View style={[styles.miniQR, { backgroundColor: previewBg }]}>
          {item.localImagePath ? (
            <Image source={{ uri: item.localImagePath }} style={{ width: 74, height: 74 }} resizeMode="contain" />
          ) : (
            <QRCode
              value={item.content || 'https://example.com'}
              size={74}
              color={item.config.fgColor || '#000000'}
              backgroundColor={previewBg}
              ecl="H"
            />
          )}
        </View>
      </View>
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: typeColor }} />
          <Text style={[styles.recentTypeText, { color: typeColor }]}>{QR_TYPE_LABELS[item.type]}</Text>
        </View>
        <Text style={[styles.recentTitle, { color: C.onSurface }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.recentTime, { color: C.onSurfaceVariant }]}>{timeLabel}</Text>
      </View>
    </Pressable>
  );
}

function PresetCard({
  preset,
  onPress,
  onDelete,
  C,
}: {
  preset: QRPreset;
  onPress: () => void;
  onDelete: () => void;
  C: any;
}) {
  const previewBg = preset.config.transparentBg ? '#ffffff' : preset.config.bgColor;

  return (
    <View style={[styles.presetCard, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
      <Pressable style={styles.presetCardMain} onPress={onPress}>
        <View style={[styles.presetPreview, { backgroundColor: previewBg, borderColor: C.outlineVariant }]}>
          {preset.previewImagePath ? (
            <Image source={{ uri: preset.previewImagePath }} style={styles.presetPreviewImage} resizeMode="contain" />
          ) : (
            <WebView
              pointerEvents="none"
              style={styles.presetPreviewWebView}
              source={{ html: buildQRPreviewHtml('https://example.com', preset.config) }}
              javaScriptEnabled
              originWhitelist={['*']}
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.presetTitle, { color: C.onSurface }]} numberOfLines={1}>{preset.name}</Text>
          <Text style={[styles.presetMeta, { color: C.onSurfaceVariant }]}>Saved {new Date(preset.createdAt).toLocaleDateString('en-US')}</Text>
        </View>
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8} style={styles.presetDeleteBtn}>
        <MaterialIcons name="delete-outline" size={20} color={C.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { colors: C, isDark } = useTheme();
  const { items, refresh } = useQRHistory();
  const { presets, deletePreset, refresh: refreshPresets } = useQRPresets();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { refresh(); refreshPresets(); }, [refresh, refreshPresets])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refresh(), refreshPresets()]);
    } finally {
      setRefreshing(false);
    }
  }, [refresh, refreshPresets]);

  const recent = useMemo(() => items.filter(i => !i.isScanned).slice(0, 10), [items]);
  const filtered = search.trim()
    ? recent.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.content.toLowerCase().includes(search.toLowerCase()))
    : recent;
  const presetCards = useMemo(() => presets.slice(0, 8), [presets]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.surface }} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.outlineVariant }]}>
        <View style={{ width: 40 }} />
        <Text style={[styles.logo, { color: C.onSurface }]}>QR Point</Text>
        <Pressable style={[styles.iconBtn, { backgroundColor: C.surfaceContainerLow }]} onPress={() => router.push('/settings')}>
          <MaterialIcons name="settings" size={22} color={C.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 6 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} colors={[C.primary]} />}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetingTitle, { color: C.onSurface }]}>Hello! 👋</Text>
          <Text style={[styles.greetingSubtitle, { color: C.onSurfaceVariant }]}>Create or scan QR codes</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
          <MaterialIcons name="search" size={20} color={C.outline} />
          <TextInput
            style={[styles.searchInput, { color: C.onSurface }]}
            placeholder="Search QR codes..."
            placeholderTextColor={C.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Action Cards */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionScan, { backgroundColor: C.surfaceContainerHigh, borderColor: C.outlineVariant }]} onPress={() => router.push('/scan')}>
            <View style={{ position: 'absolute', top: -4, right: -4 }}>
              <MaterialIcons name="qr-code-scanner" size={60} color={C.primary} style={{ opacity: 0.12, transform: [{ rotate: '12deg' }] }} />
            </View>
            <View style={[styles.actionIcon, { backgroundColor: `${C.primary}18` }]}>
              <MaterialIcons name="qr-code-scanner" size={28} color={C.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: C.onSurface }]}>Scan code</Text>
            <Text style={[styles.actionSubtitle, { color: C.onSurfaceVariant }]}>Capture QR & barcodes</Text>
          </Pressable>

          <Pressable style={[styles.actionCreate, { backgroundColor: C.primary }]} onPress={() => router.push('/create')}>
            <View style={styles.actionDecoration} />
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MaterialIcons name="add" size={28} color="#fff" />
            </View>
            <Text style={[styles.actionTitle, { color: '#fff' }]}>Create new</Text>
            <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>Custom QR for URLs & more</Text>
          </Pressable>
        </View>

        {/* Presets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>Presets</Text>
            <Text style={[styles.viewAll, { color: C.onSurfaceVariant }]}>{presets.length} saved</Text>
          </View>

          {presetCards.length === 0 ? (
            <View style={[styles.emptyPreset, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
              <MaterialIcons name="bookmark-border" size={40} color={C.outlineVariant} />
              <Text style={[styles.emptyTitle, { color: C.onSurfaceVariant }]}>No presets yet</Text>
              <Text style={[styles.emptySubtitle, { color: C.outline }]}>Save a design from Create to reuse it here.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.md, paddingRight: SPACING.containerPadding }}>
              {presetCards.map(preset => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  C={C}
                  onPress={() => router.push({ pathname: '/create', params: { presetId: preset.id } })}
                  onDelete={() => Alert.alert('Delete preset?', `Remove "${preset.name}" from your presets?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        if (preset.previewImagePath) {
                          await FileSystem.deleteAsync(preset.previewImagePath, { idempotent: true }).catch(() => {});
                        }
                        await deletePreset(preset.id);
                      },
                    },
                  ])}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recently Created */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>Recently created</Text>
            {recent.length > 0 && (
              <Pressable onPress={() => router.push('/history')}>
                <Text style={[styles.viewAll, { color: C.primary }]}>View all</Text>
              </Pressable>
            )}
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="qr-code" size={48} color={C.outlineVariant} />
              <Text style={[styles.emptyTitle, { color: C.onSurfaceVariant }]}>No QR codes yet</Text>
              <Text style={[styles.emptySubtitle, { color: C.outline }]}>Create your first QR code with the button above</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.md, paddingRight: SPACING.containerPadding }}>
              {filtered.map(item => (
                <RecentCard key={item.id} item={item} C={C} onPress={() => router.push('/history')} />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.containerPadding,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  logo: { ...TYPOGRAPHY.headlineSm, letterSpacing: -0.3 },
  iconBtn: { width: 36, height: 36, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  greeting: { paddingHorizontal: SPACING.containerPadding, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  greetingTitle: { ...TYPOGRAPHY.headlineMd, marginBottom: 2 },
  greetingSubtitle: { ...TYPOGRAPHY.bodyMd },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.containerPadding, marginBottom: SPACING.lg,
    height: 46, borderRadius: RADIUS.xxl, borderWidth: 1, paddingHorizontal: SPACING.md,
  },
  searchInput: { flex: 1, ...TYPOGRAPHY.bodyMd },
  actions: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.containerPadding, marginBottom: 28 },
  actionScan: { flex: 1, borderRadius: RADIUS.xxl, padding: SPACING.md, height: 152, justifyContent: 'space-between', overflow: 'hidden', borderWidth: 1 },
  actionDecoration: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.12)' },
  actionCreate: { flex: 1, borderRadius: RADIUS.xxl, padding: SPACING.md, height: 152, justifyContent: 'space-between', overflow: 'hidden' },
  actionIcon: { width: 42, height: 42, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { ...TYPOGRAPHY.headlineSm, fontSize: 18, lineHeight: 24, marginTop: SPACING.xs },
  actionSubtitle: { ...TYPOGRAPHY.labelSm },
  section: { paddingHorizontal: SPACING.containerPadding },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { ...TYPOGRAPHY.headlineSm },
  viewAll: { ...TYPOGRAPHY.labelMd },
  presetCard: { width: 210, borderRadius: RADIUS.xxl, padding: SPACING.sm, paddingBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  presetCardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  presetPreview: { width: 88, height: 88, borderRadius: RADIUS.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 8, borderWidth: 1 },
  presetPreviewImage: { width: '100%', height: '100%' },
  presetPreviewWebView: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  presetTitle: { ...TYPOGRAPHY.labelMd, marginBottom: 2 },
  presetMeta: { ...TYPOGRAPHY.labelSm },
  presetDeleteBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  emptyPreset: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.xxl, borderWidth: 1, gap: SPACING.sm },
  recentCard: { width: 170, borderRadius: RADIUS.xxl, padding: SPACING.sm, paddingBottom: 12, borderWidth: 1 },
  recentQRWrap: { height: 134, borderRadius: RADIUS.xl, marginBottom: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 26 },
  miniQR: { width: 86, height: 86, borderRadius: RADIUS.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 5 },
  recentTypeText: { ...TYPOGRAPHY.labelSm, textTransform: 'uppercase', letterSpacing: 0.5 },
  recentTitle: { ...TYPOGRAPHY.labelMd, marginTop: 2 },
  recentTime: { ...TYPOGRAPHY.labelSm, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xl * 2, gap: SPACING.sm },
  emptyTitle: { ...TYPOGRAPHY.headlineSm, marginTop: SPACING.sm },
  emptySubtitle: { ...TYPOGRAPHY.bodyMd, textAlign: 'center', maxWidth: 260, lineHeight: 22 },
});
