from PIL import Image
from pathlib import Path
import math

# Texture resolution
SIZE = 512

# Output directory
texture_dir = Path(__file__).resolve().parent / "textures"
texture_dir.mkdir(exist_ok=True)

# Create three texture images
diffuse = Image.new("RGB", (SIZE, SIZE))
specular = Image.new("RGB", (SIZE, SIZE))
normal_map = Image.new("RGB", (SIZE, SIZE))

# Height data used for normal mapping
height = [[0.0] * SIZE for _ in range(SIZE)]


def clamp(value):
    return max(0, min(255, int(value)))


# Generate diffuse, specular and height data
for y in range(SIZE):
    v = 2 * math.pi * y / SIZE

    for x in range(SIZE):
        u = 2 * math.pi * x / SIZE

        # Procedural pear skin relief
        bump = (
            0.35 * math.sin(
                6 * u + 0.7 * math.sin(3 * v)
            )
            + 0.20 * math.cos(
                8 * v + 0.5 * math.sin(2 * u)
            )
            + 0.12 * math.sin(13 * u - 9 * v)
        )

        height[y][x] = bump

        # Small freckles on the pear skin
        pattern = (
            math.sin(73 * u + 13 * v)
            * math.sin(41 * v - 29 * u)
        )

        freckle = pattern > 0.94

        # Natural yellow-green color variation
        shade = (
            12 * math.sin(3 * v)
            + 9 * math.sin(7 * u + 2 * math.sin(2 * v))
            + 8 * bump
        )

        r = clamp(170 + shade + (20 if freckle else 0))
        g = clamp(182 + shade - (28 if freckle else 0))
        b = clamp(65 + shade * 0.5)

        diffuse.putpixel((x, y), (r, g, b))

        # Specular intensity
        shine = clamp(
            70 + 15 * bump - (25 if freckle else 0)
        )

        specular.putpixel(
            (x, y),
            (shine, shine, shine)
        )


# Generate tangent-space normal map
for y in range(SIZE):
    for x in range(SIZE):

        left = height[y][(x - 1) % SIZE]
        right = height[y][(x + 1) % SIZE]

        up = height[(y - 1) % SIZE][x]
        down = height[(y + 1) % SIZE][x]

        dx = (right - left) * 0.5
        dy = (down - up) * 0.5

        # Increase relief intensity for normal mapping
        normal_strength = 8.0

        nx = -normal_strength * dx
        ny = normal_strength * dy
        nz = 1.0

        length = math.sqrt(nx * nx + ny * ny + nz * nz)

        nx /= length
        ny /= length
        nz /= length

        # Encode normal vector as RGB
        normal_map.putpixel(
            (x, y),
            (
                clamp((nx + 1) * 127.5),
                clamp((ny + 1) * 127.5),
                clamp((nz + 1) * 127.5)
            )
        )


# Save textures
diffuse.save(texture_dir / "pear_diffuse.png")
specular.save(texture_dir / "pear_specular.png")
normal_map.save(texture_dir / "pear_normal.png")

print("All three textures generated successfully!")