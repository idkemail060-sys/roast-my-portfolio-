export interface CreateRendererOptions {
  canvas: HTMLCanvasElement;
}

export interface Renderer {
  ready: Promise<void>;
  dispose: () => void;
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Relativistic Black Hole Raymarching Fragment Shader
const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

varying vec2 v_uv;

#define MAX_STEPS 64
#define STEP_SIZE 0.08
#define RS 0.72            // Schwarzschild radius (Event Horizon)
#define DISK_R_IN 1.2
#define DISK_R_OUT 3.4

// Hash and noise functions for accretion disk turbulence
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

// Background starfield with gravitational deflection
vec3 getStarfield(vec3 dir) {
  vec2 uv = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
  float n = hash(floor(uv * 180.0));
  float star = step(0.994, n) * pow(hash(floor(uv * 180.0) + 1.0), 4.0);
  
  // Subtle deep cosmic dust color
  vec3 nebula = vec3(0.04, 0.02, 0.06) * (noise(uv * 3.0) * 0.5 + 0.5);
  return vec3(star * 1.8) + nebula;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  // Smooth camera orbit & subtle mouse influence
  float mouseX = (u_mouse.x / u_resolution.x - 0.5) * 0.8;
  float mouseY = (u_mouse.y / u_resolution.y - 0.5) * 0.4;
  
  float camYaw = u_time * 0.06 + mouseX;
  float camPitch = 0.28 + mouseY;
  
  // Camera setup
  float camDist = 5.2;
  vec3 ro = vec3(
    camDist * cos(camYaw) * cos(camPitch),
    camDist * sin(camPitch),
    camDist * sin(camYaw) * cos(camPitch)
  );
  
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.6 * ww);

  vec3 col = vec3(0.0);
  vec3 p = ro;
  vec3 v = rd;

  float diskAlphaAcc = 0.0;
  vec3 diskColorAcc = vec3(0.0);
  bool hitHole = false;

  // Numerical geodesic integration around Schwarzschild black hole
  for (int i = 0; i < MAX_STEPS; i++) {
    float r = length(p);

    // Absorbed by the Event Horizon
    if (r < RS) {
      hitHole = true;
      break;
    }

    // Gravitational light deflection toward singularity
    vec3 grav = -1.5 * RS * normalize(p) / (r * r);
    v = normalize(v + grav * STEP_SIZE);
    
    vec3 pNext = p + v * STEP_SIZE;

    // Check for accretion disk plane crossing (y = 0)
    if ((p.y * pNext.y < 0.0) && (diskAlphaAcc < 0.96)) {
      float t = -p.y / v.y;
      vec3 pDisk = p + v * t;
      float rDisk = length(pDisk.xz);

      if (rDisk >= DISK_R_IN && rDisk <= DISK_R_OUT) {
        // Orbital motion (Keplerian angular velocity ~ 1 / r^1.5)
        float theta = atan(pDisk.z, pDisk.x);
        float omega = 1.4 / pow(rDisk, 1.5);
        float diskAngle = theta - u_time * omega * 0.8;

        // Swirling plasma texture
        float n = fbm(vec2(diskAngle * 2.5, rDisk * 3.5));
        float intensity = smoothstep(DISK_R_IN, DISK_R_IN + 0.3, rDisk) * 
                          (1.0 - smoothstep(DISK_R_OUT - 0.6, DISK_R_OUT, rDisk));
        intensity *= (0.6 + 0.8 * n);

        // Relativistic Doppler beaming
        // Matter moves along tangent (-sin(theta), cos(theta))
        vec3 orbitalVel = normalize(vec3(-pDisk.z, 0.0, pDisk.x));
        float doppler = dot(normalize(v), orbitalVel);
        // Beaming boosts the approaching side (doppler < 0)
        float beaming = clamp(1.0 - doppler * 0.65, 0.3, 2.2);
        intensity *= beaming;

        // Fiery accretion disk palette: deep red -> intense orange -> golden incandescent
        vec3 diskCol = mix(vec3(0.95, 0.25, 0.02), vec3(1.0, 0.65, 0.15), clamp(intensity, 0.0, 1.0));
        diskCol = mix(diskCol, vec3(1.0, 0.92, 0.7), clamp((intensity - 0.9) * 2.0, 0.0, 1.0));
        
        float stepAlpha = clamp(intensity * 0.42, 0.0, 1.0);
        diskColorAcc += diskCol * stepAlpha * (1.0 - diskAlphaAcc);
        diskAlphaAcc += stepAlpha * (1.0 - diskAlphaAcc);
      }
    }

    p = pNext;
  }

  // Photon Sphere glow (Einstein Ring)
  float minR = length(p);
  float photonRing = 0.0;
  if (!hitHole) {
    float distFromHorizon = minR - RS;
    if (distFromHorizon > 0.0 && distFromHorizon < 0.3) {
      photonRing = pow(1.0 - (distFromHorizon / 0.3), 6.0) * 0.85;
    }
  }

  vec3 background = vec3(0.0);
  if (!hitHole) {
    background = getStarfield(v);
  }

  // Composite background, accretion disk, and photon sphere
  col = background * (1.0 - diskAlphaAcc) + diskColorAcc;
  col += vec3(1.0, 0.72, 0.3) * photonRing;

  // Vignette and subtle contrast curve
  float vignette = 1.0 - 0.25 * dot(uv, uv);
  col *= clamp(vignette, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function createRenderer({ canvas }: CreateRendererOptions): Renderer {
  let disposed = false;
  let animationFrameId = 0;
  let resizeObserver: ResizeObserver | null = null;

  const mouse = { x: 0, y: 0 };
  let startTime = performance.now();

  const handleMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  };

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });

  const readyPromise = new Promise<void>((resolve) => {
    // Attempt WebGL initialization
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    }) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      console.warn('[black-hole] WebGL not supported, falling back to 2D canvas simulation.');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const render2D = (now: number) => {
          if (disposed) return;
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, w, h);

          const cx = w / 2;
          const cy = h / 2;
          const t = now * 0.001;

          // Accretion disk halo
          const gradient = ctx.createRadialGradient(cx, cy, 30, cx, cy, 220);
          gradient.addColorStop(0, 'rgba(255, 120, 20, 0.8)');
          gradient.addColorStop(0.3, 'rgba(255, 80, 10, 0.4)');
          gradient.addColorStop(0.7, 'rgba(180, 40, 0, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(0.2 + Math.sin(t * 0.2) * 0.05);
          ctx.scale(1.0, 0.32);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, 220, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Event Horizon
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(cx, cy, 50, 0, Math.PI * 2);
          ctx.fill();

          animationFrameId = requestAnimationFrame(render2D);
        };
        animationFrameId = requestAnimationFrame(render2D);
      }
      resolve();
      return;
    }

    // Compile helper
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertShader || !fragShader) {
      resolve();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      resolve();
      return;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      resolve();
      return;
    }

    gl.useProgram(program);

    // Quad geometry covering the clip space
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(canvas.clientWidth * dpr) || 300;
      const height = Math.floor(canvas.clientHeight * dpr) || 150;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    updateSize();

    resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(canvas);

    // Initial mouse center
    mouse.x = window.innerWidth / 2;
    mouse.y = window.innerHeight / 2;

    const render = (time: number) => {
      if (disposed) return;

      const elapsed = (time - startTime) * 0.001;

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    resolve();
  });

  return {
    ready: readyPromise,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    },
  };
}
