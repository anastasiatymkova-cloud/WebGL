# WebGL — Practical Assignment 2

**Student:** TR-62mp Anastasiia Tymkova  
**Variant:** 18

## Project Description
This project is a continuation of Practical Assignment 1.

It implements an interactive 3D visualization of a pear-shaped mathematical surface using WebGL.

The surface is rendered with filled triangles using Vertex Buffer Objects (VBOs) and an index buffer.

## Variant 18
- Shading method: Gouraud Shading
- Vertex normal calculation: Analytic Normal

## Implemented Features
- Indexed triangle rendering using WebGL VBOs
- Parametric pear-shaped surface generation
- Analytic vertex normals using partial derivatives
- Gouraud shading in the vertex shader
- Ambient, diffuse and specular lighting
- A single rotating point light source
- Interactive U and V granularity sliders
- Dynamic surface mesh regeneration
- Perspective projection
- Mouse-controlled model rotation

## Implementation
The surface is generated parametrically using U and V coordinates.

Analytic normals are calculated using the cross product of the partial derivatives of the surface.

Lighting is calculated per vertex using the Gouraud shading technique. The resulting colors are interpolated across the triangles.

The point light source rotates around the surface and dynamically changes its illumination.

## Technologies
- JavaScript
- HTML5
- CSS3
- WebGL
- GLSL

## How to Run
1. Clone or download the repository.
2. Open the project folder.
3. Start a local HTTP server.
4. Open http://localhost:8000 in a browser.

Python server command:

    python -m http.server 8000

## Controls
- Drag the mouse to rotate the model.
- Use the U slider to adjust U segments.
- Use the V slider to adjust V segments.
- Observe the rotating point light source.

## Reference
Based on the WebGL practical assignment materials provided by the instructor:

https://github.com/ademch/WebGL/tree/PA2