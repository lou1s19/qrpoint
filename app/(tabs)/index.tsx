import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useQRHistory } from '@/hooks/useQRHistory';
import { QR_TYPE_LABELS, QR_TYPE_COLORS, QRHistoryItem } from '@/constants/QRTypes';

function QRMiniPreview({ config }: { config: QRHistoryItem['config'] }) {
  return (
    <View style={[styles.miniQR, { backgroundColor: config.bgColor }]}>
      <View style={[styles.miniQRCorner, styles.topLeft, { borderColor: config.fgColor }]} />
      <View style={[styles.miniQRCorner, styles.topRight, { borderColor: config.fgColor }]} />
      <View style={[styles.miniQRCorner, styles.bottomLeft, { borderColor: config.fgColor }]} />
      <View style={[styles.miniDot, { backgroundColor: config.fgColor, top: '42%', left: '42%' }]} />
      <View style={[styles.miniDot, { backgroundColor: config.fgColor, top: '58%', left: '28%' }]} />
      <View style={[styles.miniDot, { backgroundColor: config.fgColor, top: '35%', left: '62%' }]} />
    </View>
  );
}

function RecentCard({ item, onPress }: { item: QRHistoryItem; onPress: () => void }) {
  const typeColor = QR_TYPE_COLORS[item.type];
  const date = new Date(item.createdAt);
  const now = Date.now();
  const diff = now - item.createdAt;
  let timeLabel = '';
  if (diff < 3600000) timeLabel = `Vor ${Math.floor(diff / 60000)} Min.`;
  else if (diff < 86400000) timeLabel = `Vor ${Math.floor(diff / 3600000)} Std.`;
  else if (diff < 172800000) timeLabel = 'Gestern';
  else timeLabel = date.toLocaleDateString('de-DE');

  return (
    <Pressable style={styles.recentCard} onPress={onPress} android_ripple={{ color: '#e0e7ff' }}>
      <View style={styles.recentQRWrap}>
        <QRMiniPreview config={item.config} />
      </View>
      <View style={styles.recentMeta}>
        <View style={styles.recentTypePill}>
          <View style={[styles.recentDot, { backgroundColor: typeColor }]} />
          <Text style={[styles.recentTypeText, { color: typeColor }]}>
            {QR_TYPE_LABELS[item.type]}
          </Text>
        </View>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentTime}>{timeLabel}</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { items } = useQRHistory();
  const [search, setSearch] = useState('');

  const recent = useMemo(
    () => items.filter(i => !i.isScanned).slice(0, 10),
    [items]
  );

  const filtered = search.trim()
    ? recent.filter(i =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.content.toLowerCase().includes(search.toLowerCase())
      )
    : recent;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <MaterialIcons name="account-circle" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.logo}>QR Point</Text>
        <Pressable style={styles.iconBtn} onPress={() => {}}>
          <MaterialIcons name="settings" size={24} color={COLORS.onSurfaceVariant} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Hallo! 👋</Text>
          <Text style={styles.greetingSubtitle}>Erstelle oder scanne QR-Codes</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="QR-Codes durchsuchen..."
            placeholderTextColor={COLORS.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Action Cards */}
        <View style={styles.actions}>
          {/* Scan Card */}
          <Pressable
            style={styles.actionScan}
            onPress={() => router.push('/scan')}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <View style={styles.actionDecoration} />
            <View style={styles.actionIcon}>
              <MaterialIcons name="qr-code-scanner" size={28} color={COLORS.white} />
            </View>
            <Text style={styles.actionTitle}>Code scannen</Text>
            <Text style={styles.actionSubtitle}>QR & Barcodes erfassen</Text>
          </Pressable>

          {/* Create Card */}
          <Pressable
            style={styles.actionCreate}
            onPress={() => router.push('/create')}
            android_ripple={{ color: '#dde4ff' }}
          >
            <MaterialIcons
              name="add-box"
              size={60}
              color={COLORS.primary}
              style={styles.actionCreateBg}
            />
            <View style={[styles.actionIcon, styles.actionIconLight]}>
              <MaterialIcons name="add" size={28} color={COLORS.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: COLORS.onSurface }]}>Neu erstellen</Text>
            <Text style={[styles.actionSubtitle, { color: COLORS.onSurfaceVariant }]}>
              Custom QR für URLs & mehr
            </Text>
          </Pressable>
        </View>

        {/* Recently Created */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Zuletzt erstellt</Text>
            {recent.length > 0 && (
              <Pressable onPress={() => router.push('/history')}>
                <Text style={styles.viewAll}>Alle anzeigen</Text>
              </Pressable>
            )}
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="qr-code" size={48} color={COLORS.outlineVariant} />
              <Text style={styles.emptyTitle}>Noch keine QR-Codes</Text>
              <Text style={styles.emptySubtitle}>
                Erstelle deinen ersten QR-Code mit dem Button oben
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {filtered.map(item => (
                <RecentCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push('/history')}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.containerPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  logo: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  greeting: {
    paddingHorizontal: SPACING.containerPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  greetingTitle: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  greetingSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.containerPadding,
    marginBottom: SPACING.xl,
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.containerPadding,
    marginBottom: SPACING.xl,
  },
  actionScan: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    height: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  actionDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  actionCreate: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    height: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  actionCreateBg: {
    position: 'absolute',
    top: -4,
    right: -4,
    opacity: 0.12,
    transform: [{ rotate: '12deg' }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLight: {
    backgroundColor: `${COLORS.primary}18`,
  },
  actionTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  actionSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255,255,255,0.75)',
  },
  section: {
    paddingHorizontal: SPACING.containerPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
  },
  viewAll: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  recentList: {
    gap: SPACING.md,
    paddingRight: SPACING.containerPadding,
  },
  recentCard: {
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  recentQRWrap: {
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniQR: {
    width: 80,
    height: 80,
    position: 'relative',
    borderRadius: RADIUS.sm,
  },
  miniQRCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderRadius: 4,
  },
  topLeft: {
    top: 4,
    left: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 4,
    right: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 4,
    left: 4,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  miniDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  recentMeta: {
    gap: 2,
  },
  recentTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  recentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recentTypeText: {
    ...TYPOGRAPHY.labelSm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  recentTime: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
});
