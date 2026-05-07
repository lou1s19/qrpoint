import os

dir_path = "assets/images/shapes"
files = sorted([f for f in os.listdir(dir_path) if f.endswith(".png")])

print("const SHAPE_IMAGES: Record<string, any> = {")
for f in files:
    key = f.replace(".png", "")
    print(f'  "{key}": require("@/assets/images/shapes/{f}"),')
print("};")
