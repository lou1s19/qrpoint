import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  Share,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { useQRHistory } from '@/hooks/useQRHistory';
import { QRHistoryItem, QRType, QR_TYPE_LABELS, QR_TYPE_COLORS } from '@/constants/QRTypes';

const TYPE_FILTERS: Array<QRType | 'all'> = ['all', 'url', 'wifi', 'vcard', 'text', 'email', 'phone', 'sms'];

function QRPreviewSmall({ config }: { config: QRHistoryItem['config'] }) {
  return (
    <View style={[styles.qrPreview, { backgroundColor: config.bgColor }]}>
      <View style={[styles.qrCorner, styles.qrTL, { borderColor: config.fgColor }]} />
      <View style={[styles.qrCorner, styles.qrTR, { borderColor: config.fgColor }]} />
      <View style={[styles.qrCorner, styles.qrBL, { borderColor: config.fgColor }]} />
      <View style={[styles.qrDot, { backgroundColor: config.fgColor, top: '48%', left: '47%' }]} />
      <View style={[styles.qrDot, { backgroundColor: config.fgColor, top: '60%', left: '32%' }]} />
      <View style={[styles.qrDot, { backgroundColor: config.fgColor, top: '37%', left: '63%' }]} />
      <View style={[styles.qrDot, { backgroundColor: config.fgColor, top: '65%', left: '58%' }]} />
    </View>
  );
}

function HistoryCard({
  item,
  onDelete,
  onShare,
}: {
  item: QRHistoryItem;
  onDelete: () => void;
  onShare: () => void;
}) {
  const typeColor = QR_TYPE_COLORS[item.type];
  const date = new Date(item.createdAt);
  const now = Date.now();
  const diff = now - item.createdAt;
  let timeLabel = '';
  if (diff < 3600000) timeLabel = `Vor ${Math.floor(diff / 60000)} Min.`;
  else if (diff < 86400000) timeLabel = `Vor ${Math.floor(diff / 3600000)} Std.`;
  else if (diff < 604800000) timeLabel = `Vor ${Math.floor(diff / 86400000)} Tagen`;
  else timeLabel = date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <QRPreviewSmall config={item.config} />
      </View>
      <View style={styles.cardMid}>
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}18` }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>
              {QR_TYPE_LABELS[item.type]}
            </Text>
          </View>
          <Text style={styles.timeText}>{timeLabel}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardContent} numberOfLines={1}>{item.content}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable style={styles.actionBtn} onPress={onShare}>
          <MaterialIcons name="share" size={18} color={COLORS.onSurfaceVariant} />
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
        </Pressable>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { items, loading, deleteItem, refresh } = useQRHistory();
  const [activeTab, setActiveTab] = useState<'created' | 'scanned'>('created');
  const [typeFilter, setTypeFilter] = useState<QRType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = items.filter(i => (activeTab === 'created' ? !i.isScanned : i.isScanned));
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, activeTab, typeFilter, search]);

  function handleDelete(id: string, title: string) {
    Alert.alert(
      'Löschen?',
      `"${title}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => deleteItem(id) },
      ]
    );
  }

  async function handleShare(item: QRHistoryItem) {
    await Share.share({ message: item.content, title: item.title });
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyWrap}>
        <MaterialIcons
          name={activeTab === 'created' ? 'qr-code' : 'qr-code-scanner'}
          size={64}
          color={COLORS.outlineVariant}
        />
        <Text style={styles.emptyTitle}>
          {activeTab === 'created' ? 'Keine erstellten QR-Codes' : 'Keine gescannten Codes'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeTab === 'created'
            ? 'Erstelle deinen ersten QR-Code im Tab "Create".'
            : 'Scanne einen QR-Code mit dem Scanner.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Verlauf</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={18} color={COLORS.outline} />
        <TextInput
          style={styles.searchInput}
          placeholder="Codes durchsuchen..."
          placeholderTextColor={COLORS.outline}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={COLORS.outline} />
          </Pressable>
        )}
      </View>

      {/* Created / Scanned Toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, activeTab === 'created' && styles.toggleBtnActive]}
          onPress={() => setActiveTab('created')}
        >
          <Text style={[styles.toggleText, activeTab === 'created' && styles.toggleTextActive]}>
            Erstellt
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, activeTab === 'scanned' && styles.toggleBtnActive]}
          onPress={() => setActiveTab('scanned')}
        >
          <Text style={[styles.toggleText, activeTab === 'scanned' && styles.toggleTextActive]}>
            Gescannt
          </Text>
        </Pressable>
      </View>

      {/* Type Filters */}
      <FlatList
        horizontal
        data={TYPE_FILTERS}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        style={styles.filterBar}
        renderItem={({ item: f }) => (
          <Pressable
            style={[styles.filterChip, typeFilter === f && styles.filterChipActive]}
            onPress={() => setTypeFilter(f)}
          >
            <Text style={[styles.filterChipText, typeFilter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'Alle Typen' : QR_TYPE_LABELS[f as QRType]}
            </Text>
          </Pressable>
        )}
      />

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={[styles.list, filtered.length === 0 && { flex: 1 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={refresh}
        refreshing={loading}
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            onDelete={() => handleDelete(item.id, item.title)}
            onShare={() => handleShare(item)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    paddingHorizontal: SPACING.containerPadding,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  headerTitle: { ...TYPOGRAPHY.headlineLg, color: COLORS.onSurface },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.containerPadding,
    marginBottom: SPACING.md,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.containerPadding,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.xxl,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  toggleTextActive: { color: COLORS.primary },
  filterBar: { flexGrow: 0, marginBottom: SPACING.md },
  filterList: { paddingHorizontal: SPACING.containerPadding, gap: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.white,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurfaceVariant },
  filterChipTextActive: { color: COLORS.white },
  list: { paddingHorizontal: SPACING.containerPadding, paddingBottom: SPACING.xl },
  separator: { height: SPACING.sm },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    gap: SPACING.md,
    alignItems: 'center',
  },
  cardLeft: {},
  qrPreview: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    position: 'relative',
    flexShrink: 0,
  },
  qrCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderWidth: 2.5,
  },
  qrTL: { top: 4, left: 4, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 3 },
  qrTR: { top: 4, right: 4, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 3 },
  qrBL: { bottom: 4, left: 4, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 3 },
  qrDot: { position: 'absolute', width: 5, height: 5, borderRadius: 1 },
  cardMid: { flex: 1, gap: 2 },
  typeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  typeBadgeText: { ...TYPOGRAPHY.labelSm, textTransform: 'uppercase', letterSpacing: 0.4 },
  timeText: { ...TYPOGRAPHY.labelSm, color: COLORS.outline },
  cardTitle: { ...TYPOGRAPHY.labelMd, color: COLORS.onSurface, marginTop: 2 },
  cardContent: { ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant },
  cardActions: { flexDirection: 'column', gap: SPACING.xs },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurfaceVariant, marginTop: SPACING.sm },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
});
