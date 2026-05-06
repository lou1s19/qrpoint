import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# Replace the incorrect import
content = content.replace(
    "import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'react-native-reanimated-color-picker';",
    "import ColorPicker, { Panel1, Swatches, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';"
)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
