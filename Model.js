
"use strict";

// Variant 18: Surface of Revolution "Pear"

function Model(name, uSegments = 40, vSegments = 48) {
    this.name = name;

    this.uSegments = uSegments;
    this.vSegments = vSegments;

    // PA2: Vertex Buffer Object and Index Buffer
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer();

    this.count = 0;
    
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

    // PA2 Variant 18: Analytic Vertex Normal
    this.GetNormal = function(u, v) {

        const a = 2.4;
        const b = 1.5;

        // Height parameter of the pear surface
        const h = a * u / Math.PI;

        // Avoid singularities at the poles
        const epsilon = 0.00001;
        const safeH = Math.max(
            epsilon,
            Math.min(a - epsilon, h)
        );

        // Radius of the surface
        const radius =
            safeH * Math.sqrt(safeH * (a - safeH)) / b;

        // Analytical derivative of height
        const dhdu = a / Math.PI;

        // Analytical derivative of radius by height
        const drdh =
            Math.sqrt(safeH) * (3 * a - 4 * safeH) /
            (2 * b * Math.sqrt(a - safeH));

        // Derivative of radius by U
        const drdu = drdh * dhdu;

        // Tangent vector along U
        const tangentU = [
            drdu * Math.cos(v),
            -dhdu,
            drdu * Math.sin(v)
        ];

        // Tangent vector along V
        const tangentV = [
            -radius * Math.sin(v),
            0,
            radius * Math.cos(v)
        ];

        // Cross product: tangentV x tangentU
        const nx =
            tangentV[1] * tangentU[2] -
            tangentV[2] * tangentU[1];

        const ny =
            tangentV[2] * tangentU[0] -
            tangentV[0] * tangentU[2];

        const nz =
            tangentV[0] * tangentU[1] -
            tangentV[1] * tangentU[0];

        // Normalize the resulting normal vector
        const length = Math.hypot(nx, ny, nz);

        return [
            nx / length,
            ny / length,
            nz / length
        ];
    };
    
    
    // Generate indexed triangle mesh with analytic normals
    this.GenerateTriangleMesh = function() {

        const vertices = [];
        const normals = [];
        const indices = [];

        const rowSize = this.vSegments + 1;

        // Generate vertices and normals
        for (let i = 0; i <= this.uSegments; i++) {

            const u = Math.PI * i / this.uSegments;

            for (let j = 0; j <= this.vSegments; j++) {

                const v = 2 * Math.PI * j / this.vSegments;

                // Vertex coordinates
                const point = this.GetPoint(u, v);
                vertices.push(...point);

                // Analytic vertex normal
                const normal = this.GetNormal(u, v);
                normals.push(...normal);
            }
        }

        // Generate triangle indices
        for (let i = 0; i < this.uSegments; i++) {

            for (let j = 0; j < this.vSegments; j++) {

                const a = i * rowSize + j;
                const b = (i + 1) * rowSize + j;
                const c = a + 1;
                const d = b + 1;

                indices.push(a, c, b);
                indices.push(b, c, d);
            }
        }

        return {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            indices: new Uint16Array(indices)
        };
    };
    
    // Upload geometry and normals to GPU
    this.BufferData = function(vertices, indices, normals) {

        // Upload vertex positions
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.iVertexBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            vertices,
            gl.STATIC_DRAW
        );

        // Upload analytic vertex normals
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.iNormalBuffer
        );

        gl.bufferData(
            gl.ARRAY_BUFFER,
            normals,
            gl.STATIC_DRAW
        );

        // Upload triangle indices
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this.iIndexBuffer
        );

        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            indices,
            gl.STATIC_DRAW
        );

        this.count = indices.length;
    };
    
    
    // Draw indexed triangles with vertex normals
    this.Draw = function() {

        // Vertex position attribute
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.iVertexBuffer
        );

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

        // Analytic normal attribute
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this.iNormalBuffer
        );

        gl.vertexAttribPointer(
            shProgram.iAttribNormal,
            3,
            gl.FLOAT,
            false,
            0,
            0
        );

        gl.enableVertexAttribArray(
            shProgram.iAttribNormal
        );

        // Indexed triangle rendering
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this.iIndexBuffer
        );

        gl.drawElements(
            gl.TRIANGLES,
            this.count,
            gl.UNSIGNED_SHORT,
            0
        );
    };

}
