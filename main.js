'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.

function deg2rad(angle) {
    return angle * Math.PI / 180;
}


// Constructor

function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    // Vertex attributes
    this.iAttribVertex = -1;
    this.iAttribNormal = -1;

    // Uniform variables
    this.iColor = null;
    this.iModelViewMatrix = null;
    this.iModelViewProjectionMatrix = null;
    this.iLightPosition = null;

    this.Use = function() {
        gl.useProgram(this.prog);
    };
}

function resizeCanvas() {
    const canvas = gl.canvas;
    const rect = canvas.getBoundingClientRect();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const width = Math.max(
        1,
        Math.round(rect.width * dpr)
    );

    const height = Math.max(
        1,
        Math.round(rect.height * dpr)
    );

    if (canvas.width !== width ||
        canvas.height !== height) {

        canvas.width = width;
        canvas.height = height;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
}


/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    resizeCanvas();

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    /* Set the values of the projection transformation */
    let aspect = gl.canvas.width / gl.canvas.height;

    let projection = m4.perspective(
        Math.PI / 8,
        aspect,
        8,
        12
    ); 
    
    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707,0.707,0], 0.7);
    let translateToPointZero = m4.translation(0,0,-10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView );
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0 );
        
    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1 );

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection );

    // Send ModelView matrix to the vertex shader
    gl.uniformMatrix4fv(
        shProgram.iModelViewMatrix,
        false,
        matAccum1
    );

    // Rotating point light around the surface
    const time = performance.now() * 0.001;

    // Rotation speed (radians per second)
    const speed = 0.7;

    const angle = time * speed;

    // Circular path radius
    const radius = 3.0;

    // Light position in model coordinates
    const lightModel = [
        radius * Math.cos(angle),
        2.0,
        radius * Math.sin(angle)
    ];

    // Transform light position into eye coordinates
    const lightEye = [
        matAccum1[0] * lightModel[0] +
        matAccum1[4] * lightModel[1] +
        matAccum1[8] * lightModel[2] +
        matAccum1[12],

        matAccum1[1] * lightModel[0] +
        matAccum1[5] * lightModel[1] +
        matAccum1[9] * lightModel[2] +
        matAccum1[13],

        matAccum1[2] * lightModel[0] +
        matAccum1[6] * lightModel[1] +
        matAccum1[10] * lightModel[2] +
        matAccum1[14]
    ];

    // Pass light position to GPU
    gl.uniform3fv(
        shProgram.iLightPosition,
        lightEye
    );
    
    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [0.4, 0.85, 0.8, 1.0] );

    surface.Draw();
}

// Continuous rendering animation
function animate() {
    draw();
    requestAnimationFrame(animate);
}

// Rebuild the surface when U or V changes
function updateSurface() {

    // Read slider values
    const u = Number(
        document.getElementById("u-slider").value
    );

    const v = Number(
        document.getElementById("v-slider").value
    );

    // Update surface granularity
    surface.uSegments = u;
    surface.vSegments = v;

    // Regenerate vertices, normals and indices
    const mesh = surface.GenerateTriangleMesh();

    // Upload new data to existing GPU buffers
    surface.BufferData(
        mesh.vertices,
        mesh.indices,
        mesh.normals
    );

    // Update slider labels
    document.getElementById("u-value").textContent = u;
    document.getElementById("v-value").textContent = v;

    // Update statistics
    document.getElementById("u-stat").textContent = u;
    document.getElementById("v-stat").textContent = v;

    document.getElementById("triangles-stat").textContent =
        mesh.indices.length / 3;
}

// Initialize U and V sliders
function initSurfaceControls() {

    const uSlider =
        document.getElementById("u-slider");

    const vSlider =
        document.getElementById("v-slider");

    // Set initial values from the model
    uSlider.value = surface.uSegments;
    vSlider.value = surface.vSegments;

    // Rebuild surface when slider changes
    uSlider.addEventListener("input", updateSurface);
    vSlider.addEventListener("input", updateSurface);

    // Synchronize labels and statistics
    updateSurface();
}

/* Initialize the WebGL context. Called from init() */
function initGL() {
    let prog = createProgram( gl, vertexShaderSource, fragmentShaderSource );

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    
    // Vertex attributes
    shProgram.iAttribVertex =
        gl.getAttribLocation(prog, "vertex");

    shProgram.iAttribNormal =
        gl.getAttribLocation(prog, "normal");

    // Matrices
    shProgram.iModelViewMatrix =
        gl.getUniformLocation(
            prog,
            "ModelViewMatrix"
        );

    shProgram.iModelViewProjectionMatrix =
        gl.getUniformLocation(
            prog,
            "ModelViewProjectionMatrix"
        );

    // Light and material color
    shProgram.iLightPosition =
        gl.getUniformLocation(
            prog,
            "LightPosition"
        );

    shProgram.iColor =
        gl.getUniformLocation(prog, "color");

    
    surface = new Model('Pear Surface', 40, 48);

    // Generate indexed triangle mesh
    const mesh = surface.GenerateTriangleMesh();

    // Upload geometry to GPU
    surface.BufferData(
        mesh.vertices,
        mesh.indices,
        mesh.normals
    );

    console.log(
        "Vertices:",
        mesh.vertices.length / 3
    );

    console.log(
        "Triangles:",
        mesh.indices.length / 3
    );

    gl.enable(gl.DEPTH_TEST);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vShader);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
     }
    let fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
       throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    window.addEventListener("resize", draw);

    // Initialize interactive sliders
    initSurfaceControls();

    // Start continuous light animation
    requestAnimationFrame(animate);
}
