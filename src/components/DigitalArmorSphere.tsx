import { useRef, useEffect, useCallback } from 'react';

interface DigitalArmorSphereProps {
  className?: string;
}

interface Point {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  oz: number;
}

const COLOR1 = { r: 37, g: 99, b: 235 };   // #2563EB
const COLOR2 = { r: 56, g: 189, b: 248 };  // #38BDF8

function lerpColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number
) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function buildIcosahedronPoints(subdivisions: number): Point[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const verts: [number, number, number][] = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];

  const faces: [number, number, number][] = [
    [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
    [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
    [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
  ];

  const midCache = new Map<string, number>();

  function getMid(a: number, b: number): number {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (midCache.has(key)) return midCache.get(key)!;
    const va = verts[a], vb = verts[b];
    verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]);
    const idx = verts.length - 1;
    midCache.set(key, idx);
    return idx;
  }

  let currentFaces = faces;
  for (let s = 0; s < subdivisions; s++) {
    const newFaces: [number, number, number][] = [];
    for (const [a, b, c] of currentFaces) {
      const ab = getMid(a, b), bc = getMid(b, c), ca = getMid(c, a);
      newFaces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    currentFaces = newFaces;
  }

  return verts.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    const nx = x / len, ny = y / len, nz = z / len;
    return { x: nx, y: ny, z: nz, ox: nx, oy: ny, oz: nz };
  });
}

function rotateX(p: Point, sin: number, cos: number) {
  const y = p.y * cos - p.z * sin;
  const z = p.y * sin + p.z * cos;
  p.y = y; p.z = z;
}

function rotateY(p: Point, sin: number, cos: number) {
  const x = p.x * cos + p.z * sin;
  const z = -p.x * sin + p.z * cos;
  p.x = x; p.z = z;
}

export function DigitalArmorSphere({ className }: DigitalArmorSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.36;

    const points = buildIcosahedronPoints(2);
    const time = { value: 0 };
    const proxy = { x: 0, y: 0 };
    const target = mouseRef;
    let lastTime = 0;

    function frame(ts: number) {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(frame); return; }

      const dt = Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      time.value += dt;

      proxy.x += (target.current.x - proxy.x) * 0.04;
      proxy.y += (target.current.y - proxy.y) * 0.04;

      const autoY = time.value * 0.15;
      const autoX = Math.sin(time.value * 0.1) * 0.15;
      const mouseRotX = 0.5 + proxy.y * 0.8;
      const mouseRotY = 0.3 + proxy.x * 1.2;

      const totalX = autoX + mouseRotX;
      const totalY = autoY + mouseRotY;

      const sinX = Math.sin(totalX), cosX = Math.cos(totalX);
      const sinY = Math.sin(totalY), cosY = Math.cos(totalY);

      for (const p of points) {
        p.x = p.ox; p.y = p.oy; p.z = p.oz;
        rotateX(p, sinX, cosX);
        rotateY(p, sinY, cosY);
      }

      ctx.clearRect(0, 0, W, H);

      const pulse = 0.9 + 0.1 * Math.sin(time.value * 0.5);

      const sorted = [...points].sort((a, b) => b.z - a.z);

      for (const p of sorted) {
        const depth = (p.z + 1) / 2;
        const t = (p.x + 1) / 2;
        const col = lerpColor(COLOR1, COLOR2, t);
        const alpha = (0.15 + depth * 0.7) * pulse * 0.85;
        const dotR = 1.5 + depth * 2.5;
        const sx = cx + p.x * radius;
        const sy = cy + p.y * radius;

        ctx.beginPath();
        ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent!.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    draw();

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });

    const handleVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Respect prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', background: 'transparent' }}
      aria-hidden="true"
    />
  );
}
