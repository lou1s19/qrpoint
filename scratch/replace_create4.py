import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# Add ballStylesExpanded to state
target_expanded = """  const [cornerStylesExpanded, setCornerStylesExpanded] = useState(false);
  const [qrSizePreset, setQrSizePreset] = useState<QRSizePreset>('medium');"""

new_expanded = """  const [cornerStylesExpanded, setCornerStylesExpanded] = useState(false);
  const [ballStylesExpanded, setBallStylesExpanded] = useState(false);
  const [qrSizePreset, setQrSizePreset] = useState<QRSizePreset>('medium');"""

content = content.replace(target_expanded, new_expanded)

# Add visibleBallStyles
target_visible = """  const visibleCornerStyles = cornerStylesExpanded ? CORNER_STYLES : CORNER_STYLES.slice(0, 3);"""
new_visible = """  const visibleCornerStyles = cornerStylesExpanded ? CORNER_STYLES : CORNER_STYLES.slice(0, 3);
  const visibleBallStyles = ballStylesExpanded ? BALL_STYLES : BALL_STYLES.slice(0, 3);"""

content = content.replace(target_visible, new_visible)

# Add UI section for BALL_STYLES
target_ui = """                <Pressable style={[styles.sectionToggle, { marginTop: SPACING.sm }]} onPress={() => setCornerStylesExpanded(value => !value)}>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>CORNER STYLE</Text>
                  <MaterialIcons name={cornerStylesExpanded ? 'expand-less' : 'expand-more'} size={22} color={C.onSurfaceVariant} />
                </Pressable>
                <View style={styles.styleGrid}>{visibleCornerStyles.map(style => <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.cornerSquareStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ cornerSquareStyle: style.value, cornerDotStyle: style.value === 'square' ? 'square' : 'dot' })}><CornerStyleIcon shape={style.value} color={config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant} /><Text style={[styles.styleBtnLabel, { color: config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text></Pressable>)}</View>"""

new_ui = """                <Pressable style={[styles.sectionToggle, { marginTop: SPACING.sm }]} onPress={() => setCornerStylesExpanded(value => !value)}>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>FRAME STYLE</Text>
                  <MaterialIcons name={cornerStylesExpanded ? 'expand-less' : 'expand-more'} size={22} color={C.onSurfaceVariant} />
                </Pressable>
                <View style={styles.styleGrid}>{visibleCornerStyles.map(style => <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.cornerSquareStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ cornerSquareStyle: style.value })}><Text style={[styles.styleBtnLabel, { color: config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text></Pressable>)}</View>
                
                <Pressable style={[styles.sectionToggle, { marginTop: SPACING.sm }]} onPress={() => setBallStylesExpanded(value => !value)}>
                  <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant, marginBottom: 0 }]}>EYEBALL STYLE</Text>
                  <MaterialIcons name={ballStylesExpanded ? 'expand-less' : 'expand-more'} size={22} color={C.onSurfaceVariant} />
                </Pressable>
                <View style={styles.styleGrid}>{visibleBallStyles.map(style => <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.cornerDotStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ cornerDotStyle: style.value })}><Text style={[styles.styleBtnLabel, { color: config.cornerDotStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text></Pressable>)}</View>"""

content = content.replace(target_ui, new_ui)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
