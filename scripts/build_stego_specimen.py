# -*- coding: utf-8 -*-
import os
import shutil

src_img = r"C:\Users\willy\.gemini\antigravity\brain\10d8ec9a-6856-4587-af8d-37e23fa08fcb\.user_uploaded\media_1794253902396_88da7ed1.jpg"

if not os.path.exists(src_img):
    print("Error: source image not found at", src_img)
    exit(1)

with open(src_img, "rb") as f:
    orig_bytes = f.read()

# Build Steganographic payload
# We embed:
# 1. JPEG COM (Comment marker): 0xFF, 0xFE
# 2. Trailing text after EOF (FF D9)
stego_comment = (
    "[WEYLAND-YUTANI CORP // BIO-WEAPONS RESEARCH DIVISION]\n"
    "CLASSIFICATION: TOP SECRET // PROJECT STARGAZER // OUTPOST 74\n"
    "SPECIMEN ID: XX121-EMBRYO (XENOMORPH OVOMORPH CYCLE)\n"
    "ANALYSIS LOG: Muestra embrionaria recuperada en sitio de excavacion Val Verde.\n"
    "CONTAINMENT MARKER FLAG: SKULL{XENOMORPH_BIO_SPECIMEN_AUTOPSY}\n"
    "DR. PETER KEYES EMERGENCY PORTAL LOGIN: dr_keys / thermal1987\n"
    "BUILDING BETTER WORLDS (C) WEYLAND-YUTANI CORPORATION\n"
)

comment_bytes = stego_comment.encode("utf-8")
com_len = len(comment_bytes) + 2
com_marker = b"\xff\xfe" + com_len.to_bytes(2, "big") + comment_bytes

# Insert COM marker right after SOI (FF D8)
final_stego_data = orig_bytes[:2] + com_marker + orig_bytes[2:] + b"\n\n" + comment_bytes

# Destination directories
dest_dir1 = os.path.join("prey_services", "web_app", "static", "specimens")
dest_dir2 = os.path.join("prey_services", "web_app", "vulnerable_data")

os.makedirs(dest_dir1, exist_ok=True)
os.makedirs(dest_dir2, exist_ok=True)

path1 = os.path.join(dest_dir1, "xenomorph_embryo.jpg")
path2 = os.path.join(dest_dir2, "xenomorph_embryo.jpg")

with open(path1, "wb") as f:
    f.write(final_stego_data)

with open(path2, "wb") as f:
    f.write(final_stego_data)

print("Generated stego images:")
print(" -", path1, f"({len(final_stego_data)} bytes)")
print(" -", path2, f"({len(final_stego_data)} bytes)")

# Test strings extraction
assert b"SKULL{XENOMORPH_BIO_SPECIMEN_AUTOPSY}" in final_stego_data
print("[+] Verified flag SKULL{XENOMORPH_BIO_SPECIMEN_AUTOPSY} is extractable with strings/exiftool!")
