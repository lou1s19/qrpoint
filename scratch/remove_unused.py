import re

with open("app/(tabs)/create.tsx", "r") as f:
    content = f.read()

# Remove QR_HTML completely (it was just const CENTER_LOGO_SIZE = 0.15;\n)
# Actually, let's just remove DotStyleIcon and CornerStyleIcon
content = re.sub(r"function DotStyleIcon.*?}\n\nfunction CornerStyleIcon.*?}\n\n", "", content, flags=re.DOTALL)

with open("app/(tabs)/create.tsx", "w") as f:
    f.write(content)
