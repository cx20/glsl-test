let baseTime = +new Date;
let pos = 0;
let codeCommon = "precision mediump float;\n\nuniform float time;\nuniform vec2 resolution;\nuniform sampler2D texture;\nvarying vec2 vTextureCoord;\n\n";
let codeSet = [
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    uv = floor(uv * 30.0)/30.0;\n    vec4 color = texture2D(texture, uv);\n    gl_FragColor = color;\n}",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    uv = fract(uv * 4.0);\n    vec4 color = texture2D(texture, uv);\n    gl_FragColor = color;\n}",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    uv = uv * abs(sin(time)) * 8.0;\n    vec4 color = texture2D(texture, uv);\n    gl_FragColor = color;\n}",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    uv -= vec2(0.5);\n    uv /= 5.0 * (0.75 - distance(uv, vec2(0.0)));\n    vec4 color = texture2D(texture, uv + vec2(0.5));\n    gl_FragColor = color;\n}\n",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    vec4 color = texture2D(texture, uv);\n    float mono = (color.r + color.g + color.b) / 3.0;\n    gl_FragColor = vec4( vec3( mono ), 1.0 );\n}\n\n",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    vec4 color = vec4(0.0);\n\n    float s = sin(time) * 0.01;\n    vec2 strenght = vec2(5, 2);\n\n    color.r = texture2D(texture, uv - vec2(s, 0.0) * strenght).r;\n    color.g = texture2D(texture, uv - vec2(0.005, s) * strenght).g;\n    color.b = texture2D(texture, uv).g;\n    color.a = 1.0;\n\n    gl_FragColor = color;\n}\n",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    vec4 color = texture2D(texture, uv);\n    vec2 center = vec2(0.5 + 0.5 * sin(time), 0.5);\n    float dist = 1.0 - smoothstep(0.35, 0.45, length(center - uv));\n    gl_FragColor = vec4(color.rgb * dist, 1.0);\n}\n",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    float t = time * 0.75;\n    mat2 rotation = mat2(\n        cos(t), sin(t), -sin(t), cos(t));\n    vec2 coord = uv * rotation;\n    vec4 color = texture2D(texture, coord);\n    gl_FragColor = color;\n}",
    "void main(void)\n{\n    vec2 pos = gl_FragCoord.xy / resolution.y * 2.0 - 1.0;\n    float t = time * 0.5;\n    float x = pos.x * cos(t) - pos.y * sin(t);\n    float y = pos.x * sin(t) + pos.y * cos(t);\n    vec2 uv = 0.2 * vec2(x, 1.0) / abs(y) + t;\n    vec4 color = texture2D(texture, uv);\n    float w = max(-0.1, 0.6 - abs(y));\n    gl_FragColor = vec4(color.rgb + w, 1.0);\n}\n",
    "void main(void)\n{\n    vec2 uv = vTextureCoord;\n    vec4 color = texture2D(texture, uv);\n    uv.x -= 0.5 * floor(mod(32.0 * uv.y + 0.5, 2.0)) / 32.0;\n    vec2 uv0 = floor(uv * 32.0 + 0.5) / 32.0;\n    float d = length(uv - uv0) * 16.0;\n    color.rgb = smoothstep(color.rgb, vec3(0.0), vec3(d));\n    gl_FragColor = color;\n}\n"
];
let codeHello = "";
let MAX = 0;
let editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    matchBrackets: true,
    autofocus: true,
    mode: "text/x-glsl"
});

let timer = 0;
function init() {
    editor.setValue(codeCommon);
    codeHello = codeSet[Math.floor(Math.random() * codeSet.length)];
    pos = 0;
    MAX = codeHello.length;
    timer = setInterval(typing, 50);
}

function typing() {
    if (pos < MAX) {
        let c = codeHello.substr(pos, 1);
        let value = editor.getValue();
        value += c;
        editor.setValue(value);
        editor.setCursor(editor.lineCount());
        pos++;
    } else {
        let value = editor.getValue();
        let scriptElement = document.getElementById("fs");
        scriptElement.text = value;
        clearInterval(timer);
        reload();
        setTimeout(init, 3000);
    }
}

let c, gl;
let aLoc = [];
let uLoc = [];
let mx = 0.5, my = 0.5;

function initWebGL() {
    c = document.getElementById("canvas");
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

function reload() {
    initWebGL();
    initShaders();
    initBuffers();
}

reload();
init();
