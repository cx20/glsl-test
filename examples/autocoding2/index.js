let baseTime = +new Date;
let pos = 0;
let codeCommon = "precision mediump float;\n\nuniform float time;\nuniform vec2 resolution;\nuniform sampler2D texture;\nvarying vec2 vTextureCoord;\n\n";
let codeSet = [
    "struct Ray {\n    vec3 origin;\n    vec3 direction;\n};\n\nvoid main(void) {\n    // fragment position\n    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\n\n    // ray init\n    Ray ray;\n    ray.origin = vec3(0.0, 0.0, 5.0);\n    ray.direction = normalize(vec3(p.x, p.y, -1.0));\n\n    gl_FragColor = vec4(ray.direction, 1.0);\n}\n",
    "struct Ray {\n    vec3 origin;\n    vec3 direction;\n};\n\nstruct Sphere {\n    float radius;\n    vec3 position;\n    vec3 color;\n};\n\nbool intersectSphere(Ray R, Sphere S) {\n    vec3 a = R.origin - S.position;\n    float b = dot(a, R.direction);\n    float c = dot(a, a) - (S.radius * S.radius);\n    float d = b * b - c;\n    if (d > 0.0) {\n        float t = -b - sqrt(d);\n        return (t > 0.0);\n    }\n    return false;\n}\n\nvoid main(void) {\n    // fragment position\n    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\n\n    // ray init\n    Ray ray;\n    ray.origin = vec3(0.0, 0.0, 5.0);\n    ray.direction = normalize(vec3(p.x, p.y, -1.0));\n\n    // sphere init\n    Sphere sphere;\n    sphere.radius = 1.0;\n    sphere.position = vec3(0.0);\n    sphere.color = vec3(1.0);\n\n    // hit check\n    vec3 destColor = vec3(0.0);\n    if (intersectSphere(ray, sphere)) {\n        destColor = sphere.color;\n    }\n\n    gl_FragColor = vec4(destColor, 1.0);\n}\n",
    "struct Ray {\n    vec3 origin;\n    vec3 direction;\n};\n\nstruct Sphere {\n    float radius;\n    vec3 position;\n    vec3 color;\n};\n\nstruct Intersection {\n    bool hit;\n    vec3 hitPoint;\n    vec3 normal;\n    vec3 color;\n};\n\nIntersection intersectSphere(Ray R, Sphere S) {\n    Intersection i;\n    vec3 a = R.origin - S.position;\n    float b = dot(a, R.direction);\n    float c = dot(a, a) - (S.radius * S.radius);\n    float d = b * b - c;\n    if (d > 0.0) {\n        float t = -b - sqrt(d);\n        if (t > 0.0) {\n            i.hit = true;\n            i.hitPoint = R.origin + R.direction * t;\n            i.normal = normalize(i.hitPoint - S.position);\n            float d = clamp(dot(normalize(vec3(1.0)), i.normal), 0.1, 1.0);\n            i.color = S.color * d;\n            return i;\n        }\n    }\n    i.hit = false;\n    i.hitPoint = vec3(0.0);\n    i.normal = vec3(0.0);\n    i.color = vec3(0.0);\n    return i;\n}\n\nvoid main(void) {\n    // fragment position\n    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\n\n    // ray init\n    Ray ray;\n    ray.origin = vec3(0.0, 0.0, 5.0);\n    ray.direction = normalize(vec3(p.x, p.y, -1.0));\n\n    // sphere init\n    Sphere sphere;\n    sphere.radius = 1.0;\n    sphere.position = vec3(cos(time), sin(time), cos(time * 3.0));\n    sphere.color = vec3(1.0);\n\n    // hit check\n    Intersection i = intersectSphere(ray, sphere);\n    gl_FragColor = vec4(i.color, 1.0);\n}\n",
    "struct Ray {\n    vec3 origin;\n    vec3 direction;\n};\n\nstruct Sphere {\n    float radius;\n    vec3 position;\n    vec3 color;\n};\n\nstruct Plane {\n    vec3 position;\n    vec3 normal;\n    vec3 color;\n};\n\nstruct Intersection {\n    vec3 hitPoint;\n    vec3 normal;\n    vec3 color;\n    float distance;\n};\n\nconst vec3 lightDirection = vec3(0.577);\n\nvoid intersectSphere(Ray R, Sphere S, inout Intersection I) {\n    vec3 a = R.origin - S.position;\n    float b = dot(a, R.direction);\n    float c = dot(a, a) - (S.radius * S.radius);\n    float d = b * b - c;\n    float t = -b - sqrt(d);\n    if (d > 0.0 && t > 0.0 && t < I.distance) {\n        I.hitPoint = R.origin + R.direction * t;\n        I.normal = normalize(I.hitPoint - S.position);\n        d = clamp(dot(lightDirection, I.normal), 0.1, 1.0);\n        I.color = S.color * d;\n        I.distance = t;\n    }\n}\n\nvoid intersectPlane(Ray R, Plane P, inout Intersection I) {\n    float d = -dot(P.position, P.normal);\n    float v = dot(R.direction, P.normal);\n    float t = -(dot(R.origin, P.normal) + d) / v;\n    if (t > 0.0 && t < I.distance) {\n        I.hitPoint = R.origin + R.direction * t;\n        I.normal = P.normal;\n        float d = clamp(dot(I.normal, lightDirection), 0.1, 1.0);\n        float m = mod(I.hitPoint.x, 2.0);\n        float n = mod(I.hitPoint.z, 2.0);\n        if ((m > 1.0 && n > 1.0) || (m < 1.0 && n < 1.0)) {\n            d *= 0.5;\n        }\n        float f = 1.0 - min(abs(I.hitPoint.z), 25.0) * 0.04;\n        I.color = P.color * d * f;\n        I.distance = t;\n    }\n}\n\nvoid main(void) {\n    // fragment position\n    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);\n\n    // ray init\n    Ray ray;\n    ray.origin = vec3(0.0, 2.0, 6.0);\n    ray.direction = normalize(vec3(p.x, p.y, -1.0));\n\n    // intersection init\n    Intersection i;\n    i.hitPoint = vec3(0.0);\n    i.normal = vec3(0.0);\n    i.color = vec3(0.0);\n    i.distance = 1.0e+30;\n\n    // sphere init\n    Sphere sphere[3];\n    sphere[0].radius = 0.5;\n    sphere[0].position = vec3(0.0, -0.5, sin(time));\n    sphere[0].color = vec3(1.0, 0.0, 0.0);\n    sphere[1].radius = 1.0;\n    sphere[1].position = vec3(2.0, 0.0, cos(time * 0.666));\n    sphere[1].color = vec3(0.0, 1.0, 0.0);\n    sphere[2].radius = 1.5;\n    sphere[2].position = vec3(-2.0, 0.5, cos(time * 0.333));\n    sphere[2].color = vec3(0.0, 0.0, 1.0);\n\n    // plane init\n    Plane plane;\n    plane.position = vec3(0.0, -1.0, 0.0);\n    plane.normal = vec3(0.0, 1.0, 0.0);\n    plane.color = vec3(1.0);\n\n    // hit check\n    intersectSphere(ray, sphere[0], i);\n    intersectSphere(ray, sphere[1], i);\n    intersectSphere(ray, sphere[2], i);\n    intersectPlane(ray, plane, i);\n    gl_FragColor = vec4(i.color, 1.0);\n}\n"
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
let index = 0;
function init() {
    editor.setValue(codeCommon);
    editor.setCursor(editor.lineCount());
    //codeHello = codeSet[Math.floor(Math.random() * codeSet.length)];
    codeHello = codeSet[index % codeSet.length];
    pos = 0;
    MAX = codeHello.length;
    timer = setInterval(typing, 10);
    index++;
}

function typing() {
    if (pos < MAX) {
/*
        var pos2 = codeHello.indexOf("\n", pos, 1);
        var str = codeHello.substr(pos, pos2 - pos + 1);
        var cursor = editor.getCursor();
        var line = editor.getLine(cursor.line);
        var pos3 = {
            line: cursor.line,
            ch: line.length - 1
        }
        editor.replaceRange(str, pos3);
        pos = pos2 + 1;
*/
        var str = codeHello.substr(pos, 1);
        var cursor = editor.getCursor();
        var line = editor.getLine(cursor.line);
        var pos3 = {
            line: cursor.line,
            ch: line.length
        }
        editor.replaceRange(str, pos3);
        pos++;
    } else {
        var value = editor.getValue();
        var scriptElement = document.getElementById("fs");
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
