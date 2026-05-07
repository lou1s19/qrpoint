import os
from PIL import Image

input_dir = "assets/images/shapes"
output_dir = "assets/images/shapes_processed"
os.makedirs(output_dir, exist_ok=True)

for filename in os.listdir(input_dir):
    if filename.endswith(".jpg"):
        path = os.path.join(input_dir, filename)
        img = Image.open(path).convert("RGBA")
        
        # Resize
        img = img.resize((128, 128), Image.Resampling.LANCZOS)
        
        # Convert white-ish to transparent
        data = img.getdata()
        new_data = []
        for item in data:
            # If it is white or very light gray, make it transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                # Make the shape black so tintColor works reliably
                new_data.append((0, 0, 0, 255))
        
        img.putdata(new_data)
        new_filename = filename.replace(".jpg", ".png")
        img.save(os.path.join(output_dir, new_filename), "PNG")
        print(f"Processed {filename} -> {new_filename}")

