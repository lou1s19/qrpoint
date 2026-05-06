import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

target = "  CornerSquareStyle,\n  QRCodeConfig,"
new_target = "  CornerSquareStyle,\n  CornerDotStyle,\n  QRCodeConfig,"

content = content.replace(target, new_target)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
