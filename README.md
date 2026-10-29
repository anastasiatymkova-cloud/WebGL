# WebGL ControlTask — Variant 18

## Three-Texture Rendering and Normal Mapping
This project extends Practical Assignment 2 (PA2) by adding three-texture rendering and per-pixel normal mapping to a mathematical 3D surface.

**Variant 18: Prioritize Normal**

## Surface Model
The application renders a pear-shaped surface of revolution defined by:

z³(a − z) − b²(x² + y²) = 0

The surface is generated parametrically using indexed triangles and analytic vertex normals.

## Implemented Features
- Diffuse texture for surface color.
- Specular texture for reflected highlights.
- Normal texture for per-pixel surface detail.
- UV texture coordinates and tangent vectors.
- Gram-Schmidt orthogonalization with normal priority.
- TBN matrix for tangent-space normal mapping.
- Ambient, diffuse and specular lighting.
- Rotating point light source.
- Interactive 3D model rotation.
- Adjustable U and V surface segments.
- Normal Mapping ON/OFF comparison.

## Variant 18 — Normal Priority
Gram-Schmidt orthogonalization preserves the normal vector and corrects the tangent:

```glsl
vec3 N = normalize(vNormalEye);

vec3 T = normalize(
    vTangentEye - N * dot(N, vTangentEye)
);

vec3 B = normalize(cross(N, T));
```

The resulting TBN matrix transforms normals from tangent space into eye space for per-pixel lighting.

## Project Files
- `index.html` — user interface.
- `main.js` — WebGL initialization, lighting and interaction.
- `Model.js` — surface geometry, normals, tangents and GPU buffers.
- `shader.gpu` — vertex and fragment shaders.
- `TextureHandler.js` — texture loading.
- `generate_textures.py` — procedural texture generation.
- `textures/` — diffuse, specular and normal textures.
- `Utils/` — matrix operations and trackball rotation.

## How to Run
1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension.
3. Open `index.html` with Live Server.
4. Rotate the 3D model using the mouse.
5. Adjust U and V segments using the sliders.
6. Toggle Normal Mapping to compare the lighting results.

The generated PNG textures are included in the project.

## Technologies
JavaScript, WebGL 1.0, GLSL, HTML, CSS, Python and Pillow.

## Author
TR-62mp Anastasiia Tymkova    
Variant 18