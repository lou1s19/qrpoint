import re
import os

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace("import { WebView } from 'react-native-webview';", "import { Image } from 'react-native';")
content = content.replace("import * as FileSystem from 'expo-file-system/legacy';", "import * as FileSystem from 'expo-file-system';")

# 2. Remove QR_HTML and normalize functions
qr_html_pattern = re.compile(r"const CENTER_LOGO_SIZE = 0\.15;\n\nconst QR_HTML = `.*?`;\n", re.DOTALL)
content = re.sub(qr_html_pattern, "const CENTER_LOGO_SIZE = 0.15;\n", content)

# 3. Replace DOT_STYLES and CORNER_STYLES
styles_pattern = re.compile(r"const DOT_STYLES: Array.*?\];", re.DOTALL)

new_styles = """const DOT_STYLES: Array<{ value: DotsStyle; label: string }> = [
  { value: 'square', label: 'Square' }, { value: 'mosaic', label: 'Mosaic' }, { value: 'dot', label: 'Dot' }, { value: 'circle', label: 'Circle' }, { value: 'circle-zebra', label: 'Circle Zebra' }, { value: 'circle-zebra-vertical', label: 'Circle Zebra Vertical' }, { value: 'circular', label: 'Circular' }, { value: 'edge-cut', label: 'Edge Cut' }, { value: 'edge-cut-smooth', label: 'Edge Cut Smooth' }, { value: 'japnese', label: 'Japnese' }, { value: 'leaf', label: 'Leaf' }, { value: 'pointed', label: 'Pointed' }, { value: 'pointed-edge-cut', label: 'Pointed Edge Cut' }, { value: 'pointed-in', label: 'Pointed In' }, { value: 'pointed-in-smooth', label: 'Pointed In Smooth' }, { value: 'pointed-smooth', label: 'Pointed Smooth' }, { value: 'round', label: 'Round' }, { value: 'rounded-in', label: 'Rounded In' }, { value: 'rounded-in-smooth', label: 'Rounded In Smooth' }, { value: 'rounded-pointed', label: 'Rounded Pointed' }, { value: 'star', label: 'Star' }, { value: 'diamond', label: 'Diamond' }
];

const CORNER_STYLES: Array<{ value: CornerSquareStyle; label: string }> = Array.from({length: 17}, (_, i) => ({ value: `frame${i}` as CornerSquareStyle, label: `Frame ${i}` }));
const BALL_STYLES: Array<{ value: CornerDotStyle; label: string }> = Array.from({length: 20}, (_, i) => ({ value: `ball${i}` as CornerDotStyle, label: `Ball ${i}` }));"""
content = re.sub(styles_pattern, new_styles, content)

# Wait, we have CORNER_STYLES too. Let's fix the regex to capture both DOT_STYLES and CORNER_STYLES
styles_pattern_full = re.compile(r"const DOT_STYLES: Array.*?(const QR_TYPES:)", re.DOTALL)
content = re.sub(styles_pattern_full, new_styles + "\n\n\\1", content)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
