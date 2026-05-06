import re

with open("QRCode Monkey - QR Code Generator zum erstellen vo.html", "r") as f:
    content = f.read()

body_matches = re.findall(r"\.sprite-(circle|square|mosaic|dot|edge-cut|japnese|leaf|pointed|round|star|diamond|circular)[a-zA-Z0-9-]*\{[^\}]*background-position:(-?\d+)px (-?\d+)px\}", content)
ball_matches = re.findall(r"\.sprite-ball(\d+)\{[^\}]*background-position:(-?\d+)px (-?\d+)px\}", content)
frame_matches = re.findall(r"\.sprite-frame(\d+)\{[^\}]*background-position:(-?\d+)px (-?\d+)px\}", content)

output = "export const SPRITE_COORDINATES: Record<string, { x: number, y: number, w: number, h: number }> = {\n"

for match in body_matches:
    # re.findall didn't capture the full name if we used groups like that. Let's fix the regex.
    pass

# Better approach:
rules = re.findall(r"\.sprite-([a-zA-Z0-9-]+)\{[^\}]*background-position:(-?\d+)px (-?\d+)px\}", content)
for name, x, y in rules:
    w, h = 50, 50
    if name not in [f"ball{i}" for i in range(20)] and name not in [f"frame{i}" for i in range(17)]:
        w, h = 90, 80
        # Actually .sprite-body transforms it to scale(0.5). So the logical width is 45x40. We will keep the original size in coordinates and scale it in RN.
    output += f"  '{name}': {{ x: {int(x)}, y: {int(y)}, w: {w}, h: {h} }},\n"

output += "};\n"

with open("constants/SpriteCoordinates.ts", "w") as f:
    f.write(output)
