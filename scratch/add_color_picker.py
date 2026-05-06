import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# Add imports
if "react-native-reanimated-color-picker" not in content:
    content = content.replace(
        "import { MaterialIcons } from '@expo/vector-icons';",
        "import { MaterialIcons } from '@expo/vector-icons';\nimport ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'react-native-reanimated-color-picker';"
    )

if "Modal," not in content and "Modal " not in content:
    content = content.replace("import { View, Text, TextInput, ScrollView, Pressable, Image, KeyboardAvoidingView, Platform, Switch, ActivityIndicator, Alert, Share } from 'react-native';",
    "import { View, Text, TextInput, ScrollView, Pressable, Image, KeyboardAvoidingView, Platform, Switch, ActivityIndicator, Alert, Share, Modal } from 'react-native';")

target_block = """  return (
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
        {palette.slice(0, 8).map(color => (
          <ColorSwatch key={color} C={C} color={color} selected={value.toLowerCase() === color.toLowerCase()} onPress={() => onChange(color)} />
        ))}
      </View>
    </View>
  );"""

new_block = """  const [showPicker, setShowPicker] = useState(false);

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
            
            <ColorPicker
              value={value}
              onComplete={({ hex }) => {
                onChange(hex.toUpperCase());
                setHexDraft(hex.toUpperCase());
              }}
              style={{ width: '100%', gap: 20 }}
            >
              <Panel1 />
              <HueSlider />
            </ColorPicker>
            
            <Pressable style={[styles.saveBtn, { backgroundColor: C.primary, marginTop: 24 }]} onPress={() => setShowPicker(false)}>
              <Text style={[styles.saveBtnText, { color: C.onPrimary }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );"""

content = content.replace(target_block, new_block)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
