from PIL import Image
import glob
import os

path = "/home/luis/cni-honduras-platform/frontend/public/images/botones/*.png"
for file in glob.glob(path):
    webp_path = file.replace(".png", ".webp")
    img = Image.open(file)
    img.save(webp_path, "WEBP", quality=85)
    print(f"Converted {file} to {webp_path}")
