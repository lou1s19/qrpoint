import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/Theme';
import { ThemeMode, useTheme } from '@/context/ThemeContext';

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { value: 'system', label: 'System', icon: 'settings-suggest' },
  { value: 'light', label: 'Light', icon: 'light-mode' },
  { value: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors: C, isDark, mode, setMode } = useTheme();

  function showInfo(title: string, message: string) {
    Alert.alert(title, message);
  }

  return (
    <View style={[styles.root, { backgroundColor: C.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: C.white, borderBottomColor: C.outlineVariant }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="close" size={24} color={C.onSurface} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.onSurface }]}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Appearance */}
          <Text style={[styles.sectionTitle, { color: C.onSurfaceVariant }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
            <View style={styles.themeIntroRow}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? C.surfaceContainerHigh : '#eceeff' }]}>
                <MaterialIcons name="contrast" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: C.onSurface }]}>Appearance</Text>
                <Text style={[styles.rowSubtext, { color: C.onSurfaceVariant }]}>Follows your system appearance by default.</Text>
              </View>
            </View>
            <View style={[styles.modeRow, { backgroundColor: C.surfaceContainerLow }]}>
              {THEME_OPTIONS.map(option => {
                const active = mode === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.modeBtn, active && { backgroundColor: C.primary }]}
                    onPress={() => setMode(option.value)}
                  >
                    <MaterialIcons name={option.icon} size={18} color={active ? C.onPrimary : C.onSurfaceVariant} />
                    <Text style={[styles.modeText, { color: active ? C.onPrimary : C.onSurfaceVariant }]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Info */}
          <Text style={[styles.sectionTitle, { color: C.onSurfaceVariant }]}>INFO</Text>
          <View style={[styles.card, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
            <Pressable style={styles.row} onPress={() => showInfo('About QR Point', 'QR Point – Version 1.0.0\n\nCreate, scan, and manage QR codes quickly and easily.')}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? C.surfaceContainerHigh : '#fff3e0' }]}>
                <MaterialIcons name="info-outline" size={20} color={COLORS.tertiary} />
              </View>
              <Text style={[styles.rowText, { color: C.onSurface }]}>About QR Point</Text>
              <MaterialIcons name="chevron-right" size={22} color={C.onSurfaceVariant} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />
            <Pressable style={styles.row} onPress={() => showInfo('Privacy', 'This app stores all data locally on your device only. No personal data is shared with third parties.')}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? C.surfaceContainerHigh : '#fce4ec' }]}>
                <MaterialIcons name="privacy-tip" size={20} color="#c2185b" />
              </View>
              <Text style={[styles.rowText, { color: C.onSurface }]}>Privacy</Text>
              <MaterialIcons name="chevron-right" size={22} color={C.onSurfaceVariant} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />
            <Pressable style={styles.row} onPress={() => showInfo('Terms of Use', 'By using this app, you agree to the Terms of Use. The app is provided without warranty.')}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? C.surfaceContainerHigh : '#f3e5f5' }]}>
                <MaterialIcons name="description" size={20} color="#7b2d8b" />
              </View>
              <Text style={[styles.rowText, { color: C.onSurface }]}>Terms of Use</Text>
              <MaterialIcons name="chevron-right" size={22} color={C.onSurfaceVariant} />
            </Pressable>
          </View>

          <Text style={[styles.sectionTitle, { color: C.onSurfaceVariant }]}>QR CODES</Text>
          <View style={[styles.card, { backgroundColor: C.white, borderColor: C.outlineVariant }]}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: isDark ? C.surfaceContainerHigh : '#e8f5e9' }]}>
                <MaterialIcons name="cloud-off" size={20} color="#2e7d32" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: C.onSurface }]}>Local generation</Text>
                <Text style={[styles.rowSubtext, { color: C.onSurfaceVariant }]}>QR codes are created on your device and do not depend on a server.</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.version, { color: C.onSurfaceVariant }]}>QR Point • Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.headlineSm },
  content: { padding: SPACING.containerPadding, paddingBottom: 60 },
  sectionTitle: { ...TYPOGRAPHY.labelSm, marginBottom: SPACING.sm, marginLeft: SPACING.xs, marginTop: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.8 },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.xs },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 14, gap: SPACING.md },
  themeIntroRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: 14, paddingBottom: SPACING.sm, gap: SPACING.md },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, ...TYPOGRAPHY.bodyMd },
  rowSubtext: { ...TYPOGRAPHY.labelSm, marginTop: 2 },
  modeRow: { flexDirection: 'row', margin: SPACING.md, marginTop: 0, padding: 4, borderRadius: RADIUS.xl, gap: 4 },
  modeBtn: { flex: 1, minHeight: 42, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  modeText: { ...TYPOGRAPHY.labelMd },
  divider: { height: 1, marginLeft: 68 },
  version: { ...TYPOGRAPHY.labelSm, textAlign: 'center', marginTop: SPACING.xl, marginBottom: 20 },
});
