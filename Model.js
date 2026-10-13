
"use strict";

// Variant 18: Surface of Revolution "Pear"

function Model(name, uSegments = 40, vSegments = 48) {
    this.name = name;

    this.uSegments = uSegments;
    this.vSegments = vSegments;

    // Separate collections of U and V polylines
    this.uLines = [];
    this.vLines = [];

    // WebGL buffers for individual polylines
    this.lineBuffers = [];

    
    // Variant 18: Surface of Revolution "Pear"
    // Equation: z^3(a - z) - b^2(x^2 + y^2) = 0

    this.GetPoint = function(u, v) {

        // Surface parameters
        const a = 2.4;
        const b = 1.5;

        // Height coordinate from the handbook
        const zBook = a * u / Math.PI;

        // Radius according to the exact equation
        const radius =
            zBook * Math.sqrt(
                Math.max(0, zBook * (a - zBook))
            ) / b;

        // Coordinate transformation for WebGL
        const x = radius * Math.cos(v);
        const y = a / 2 - zBook;
        const z = radius * Math.sin(v);

        return [x, y, z];
    };

    // Generate two sets of polylines
    this.GenerateSurface = function() {
        this.uLines = [];
        this.vLines = [];

        // U-polylines: V is fixed, U changes
        for (let j = 0; j < this.vSegments; j++) {
            const v = 2 * Math.PI * j / this.vSegments;

            const vertices = [];

            for (let i = 0; i <= this.uSegments; i++) {
                const u = Math.PI * i / this.uSegments;

                vertices.push(...this.GetPoint(u, v));
            }

            this.uLines.push(new Float32Array(vertices));
        }

        // V-polylines: U is fixed, V changes
        for (let i = 1; i < this.uSegments; i++) {
            const u = Math.PI * i / this.uSegments;

            const vertices = [];

            for (let j = 0; j <= this.vSegments; j++) {
                const v = 2 * Math.PI * j / this.vSegments;

                vertices.push(...this.GetPoint(u, v));
            }

            this.vLines.push(new Float32Array(vertices));
        }
    };

    // Transfer the polylines into WebGL buffers
    this.BufferData = function() {
        this.GenerateSurface();
        console.log("Variant 18 - Pear Surface");
        console.log("U-polylines:", this.uLines.length);
        console.log("V-polylines:", this.vLines.length);
        console.log("Total polylines:",
            this.uLines.length + this.vLines.length);
        console.log("First U-polyline:", this.uLines[0]);
        console.log("First V-polyline:", this.vLines[0]);

        const allLines = [...this.uLines, ...this.vLines];

        this.lineBuffers = [];

        for (const vertices of allLines) {
            const buffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            gl.bufferData(
                gl.ARRAY_BUFFER,
                vertices,
                gl.STATIC_DRAW
            );

            this.lineBuffers.push({
                buffer: buffer,
                count: vertices.length / 3
            });
        }
    };

    // Render every polyline separately
    this.Draw = function() {
        for (const line of this.lineBuffers) {
            gl.bindBuffer(gl.ARRAY_BUFFER, line.buffer);

            gl.vertexAttribPointer(
                shProgram.iAttribVertex,
                3,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.enableVertexAttribArray(
                shProgram.iAttribVertex
            );

            gl.drawArrays(
                gl.LINE_STRIP,
                0,
                line.count
            );
        }
    };
}
