from PIL import Image

def convert_to_transparent(path):
    img = Image.open(path).convert("RGBA")
    data = img.getdata()

    new_data = []
    # The shapes are likely black or dark gray, and background is white.
    # QRCode monkey sprite sheets: Usually they have white background or transparent?
    for item in data:
        # if pixel is white or very light gray, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            # We want the shape to be purely black with its alpha so tintColor works perfectly
            # Or just keep the pixel if it's dark
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(path, "PNG")
    print(f"Converted {path} to transparent")

convert_to_transparent("assets/images/sprite-body.png")
convert_to_transparent("assets/images/sprite-frame-ball.png")
