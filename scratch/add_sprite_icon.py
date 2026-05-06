import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# Add imports
if "SPRITE_COORDINATES" not in content:
    content = content.replace("import { useTheme } from '@/context/ThemeContext';", "import { useTheme } from '@/context/ThemeContext';\nimport { SPRITE_COORDINATES } from '@/constants/SpriteCoordinates';")

sprite_component = """
function SpriteIcon({ shape, type, color, active }: { shape: string, type: 'body' | 'frame' | 'ball', color: string, active: boolean }) {
  const coords = SPRITE_COORDINATES[shape];
  if (!coords) return null;
  
  const source = type === 'body' 
    ? require('@/assets/images/sprite-body.png') 
    : require('@/assets/images/sprite-frame-ball.png');
    
  // The original images have black shapes. We can't tint PNG easily in RN without tintColor which works for solid colors with alpha.
  // RN Image tintColor replaces all non-transparent pixels with the color. That's perfect for our sprites!
  
  // The scale for body is 0.5 (90->45, 80->40). The frames/balls are 50x50.
  const scale = type === 'body' ? 0.5 : 0.8;
  const viewWidth = coords.w * scale;
  const viewHeight = coords.h * scale;

  return (
    <View style={{ width: viewWidth, height: viewHeight, overflow: 'hidden', alignItems: 'flex-start', justifyContent: 'flex-start', marginBottom: 4 }}>
      <Image 
        source={source} 
        style={{
          width: type === 'body' ? 680 * scale : 550 * scale,
          height: type === 'body' ? 630 * scale : 660 * scale,
          marginLeft: coords.x * scale,
          marginTop: coords.y * scale,
          tintColor: color
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
"""

if "function SpriteIcon" not in content:
    content = content.replace("function isHexColor(value: string) {", sprite_component + "\nfunction isHexColor(value: string) {")

# Update UI to use SpriteIcon
# Body
content = re.sub(
    r"<Text style={\[styles\.styleBtnLabel, \{ color: config\.dotsStyle === style\.value \? C\.primary : C\.onSurfaceVariant \}\]}\>\{style\.label\}</Text>",
    r"<SpriteIcon shape={style.value} type='body' color={config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant} active={config.dotsStyle === style.value} /><Text style={[styles.styleBtnLabel, { color: config.dotsStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text>",
    content
)

# Frame
content = re.sub(
    r"<Text style={\[styles\.styleBtnLabel, \{ color: config\.cornerSquareStyle === style\.value \? C\.primary : C\.onSurfaceVariant \}\]}\>\{style\.label\}</Text>",
    r"<SpriteIcon shape={style.value} type='frame' color={config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant} active={config.cornerSquareStyle === style.value} /><Text style={[styles.styleBtnLabel, { color: config.cornerSquareStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text>",
    content
)

# Ball
content = re.sub(
    r"<Text style={\[styles\.styleBtnLabel, \{ color: config\.cornerDotStyle === style\.value \? C\.primary : C\.onSurfaceVariant \}\]}\>\{style\.label\}</Text>",
    r"<SpriteIcon shape={style.value} type='ball' color={config.cornerDotStyle === style.value ? C.primary : C.onSurfaceVariant} active={config.cornerDotStyle === style.value} /><Text style={[styles.styleBtnLabel, { color: config.cornerDotStyle === style.value ? C.primary : C.onSurfaceVariant }]}>{style.label}</Text>",
    content
)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
