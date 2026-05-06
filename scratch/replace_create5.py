import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

target_dot = """<View style={styles.styleGrid}>{visibleDotStyles.map(style => <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.dotsStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ dotsStyle: style.value })}><DotStyleIcon shape={style.value} color={config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant} /><Text style={[styles.styleBtnLabel, { color: config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text></Pressable>)}</View>"""
new_dot = """<View style={styles.styleGrid}>{visibleDotStyles.map(style => <Pressable key={style.value} style={[styles.styleBtn, { backgroundColor: C.surfaceContainerLow, borderColor: C.outlineVariant }, config.dotsStyle === style.value && { backgroundColor: `${C.primary}10`, borderColor: C.primary }]} onPress={() => updateConfig({ dotsStyle: style.value })}><Text style={[styles.styleBtnLabel, { color: config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text></Pressable>)}</View>"""

content = content.replace(target_dot, new_dot)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
