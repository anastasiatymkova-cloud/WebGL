"use strict";

// Load a texture from an image file
function LoadTexture(url, defaultColor = [255, 255, 255, 255]) {

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Texture parameters
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
    );

    // Temporary 1x1 pixel texture
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array(defaultColor)
    );

    // Load the image asynchronously
    const image = new Image();

    image.addEventListener("load", () => {

        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Match the image orientation with UV coordinates
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Copy image data to GPU texture memory
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        // Generate mipmaps for smoother texture rendering
        gl.generateMipmap(gl.TEXTURE_2D);

        // Use trilinear filtering
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR_MIPMAP_LINEAR
        );

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        console.log("Loaded texture:", url);
    });

    image.addEventListener("error", () => {
        console.error("Failed to load texture:", url);
    });

    image.src = url;

    return texture;
}