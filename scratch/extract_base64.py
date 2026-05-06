import re

with open("QRCode Monkey - QR Code Generator zum erstellen vo.html", "r") as f:
    content = f.read()

matches = re.findall(r"data:image/png;base64,([a-zA-Z0-9+/=]+)", content)
for i, match in enumerate(matches):
    if len(match) > 1000: # Only save large images (likely sprite sheets)
        with open(f"scratch/sprite_{i}.png", "wb") as img_file:
            import base64
            img_file.write(base64.b64decode(match))
        print(f"Saved scratch/sprite_{i}.png (size: {len(match)})")
