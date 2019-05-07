let c, gl;
let aLoc = [];
let uLoc = [];
let mx = 0.5, my = 0.5;

function initWebGL() {
    c = document.getElementById("c");
    gl = c.getContext("webgl");
    resizeCanvas();
    window.addEventListener("resize", function(){
        resizeCanvas();
    });
    c.addEventListener('mousemove', mouseMove, true);
}

function resizeCanvas() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    gl.viewport(0, 0, c.width, c.height);
}

function mouseMove(e){
    mx = e.offsetX / c.width - 0.5;
    my = 1.0 - e.offsetY / c.height;
}

function initShaders() {
    let p = gl.createProgram();
    let v = document.getElementById("vs").textContent;
    let f = document.getElementById("fs").textContent;
    let vs = gl.createShader(gl.VERTEX_SHADER);
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vs, v);
    gl.shaderSource(fs, f);
    gl.compileShader(vs);
    gl.compileShader(fs);
    console.log(gl.getShaderInfoLog(vs));
    console.log(gl.getShaderInfoLog(fs));
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.useProgram(p);
    aLoc[0] = gl.getAttribLocation(p, "position");
    aLoc[1] = gl.getAttribLocation(p, "textureCoord");
    uLoc[0]  = gl.getUniformLocation(p, 'texture');
    uLoc[1]  = gl.getUniformLocation(p, 'time');
    uLoc[2]  = gl.getUniformLocation(p, 'mouse');
    uLoc[3]  = gl.getUniformLocation(p, 'resolution');
    gl.enableVertexAttribArray(aLoc[0]);
    gl.enableVertexAttribArray(aLoc[1]);
}

let positionBuffer;
let coordBuffer;
let indexBuffer;
let texture;

function initBuffers() {
    const positions = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    
    const textureCoords = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
    
    const indices  = [
        0, 1, 2,
        3, 2, 1
    ];
    
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);
    
    coordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aLoc[1], 2, gl.FLOAT, false, 0, 0);
    
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    const img = new Image();
    img.onload = function(){
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        animate();
    };
    img.src = "../../assets/textures/frog.jpg";
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

let baseTime = +new Date;

function draw() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // uniform sampler2D texture
    gl.uniform1i(uLoc[0], 0);
    
    // uniform float time;
    time = (+new Date - baseTime) / 1000;
    gl.uniform1f(uLoc[1], time);
    
    // uniform vec2 mouse;
    gl.uniform2f(uLoc[2], mx, my);
    
    // uniform vec2 resolution;
    gl.uniform2f(uLoc[3], c.width, c.height);

    gl.drawElements(gl.TRIANGLE_STRIP, 6, gl.UNSIGNED_SHORT, 0);
    gl.flush();
}

initWebGL();
initShaders();
initBuffers();
