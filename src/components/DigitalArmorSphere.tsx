import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// Create dot pattern texture
function createDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Fill black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);

  // Draw white dots in grid
  const spacing = 16;
  const centerX = 256;
  const centerY = 256;
  const maxRadius = 240;

  for (let x = 0; x < 512; x += spacing) {
    for (let y = 0; y < 512; y += spacing) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxRadius;

      // Fade dots toward edges
      const alpha = Math.max(0, 1 - normalizedDist * 1.2);
      if (alpha > 0) {
        const radius = 2 + alpha * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  uniform vec3 uRotation;

  mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(
      oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s, 0.0,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s, 0.0,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,          0.0,
      0.0,                                  0.0,                                  0.0,                                 1.0
    );
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
    return (rotationMatrix(axis, angle) * vec4(v, 1.0)).xyz;
  }

  void main() {
    vUv = uv;
    vec3 newPosition = position;
    newPosition = rotate(newPosition, vec3(1.0, 0.0, 0.0), uRotation.x);
    newPosition = rotate(newPosition, vec3(0.0, 1.0, 0.0), uRotation.y);
    newPosition = rotate(newPosition, vec3(0.0, 0.0, 1.0), uRotation.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment shader
const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    vec3 color1 = vec3(0.149, 0.388, 0.922); // #2563EB
    vec3 color2 = vec3(0.22, 0.741, 0.972);  // #38BDF8

    // Subtle pulse effect
    float pulse = 0.9 + 0.1 * sin(uTime * 0.5);
    texColor.a *= pulse;

    vec3 finalColor = mix(color1, color2, texColor.r);
    gl_FragColor = vec4(finalColor, texColor.a * 0.85);
  }
`;

interface SphereMeshProps {
  onReady: () => void;
}

function SphereMesh({ onReady }: SphereMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const proxy = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const dotTexture = useMemo(() => createDotTexture(), []);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: dotTexture },
      uRotation: { value: new THREE.Vector3(0.5, 0.3, 0) },
      uTime: { value: 0 },
    }),
    [dotTexture]
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    // Smooth rotation with GSAP-like easing
    proxy.current.x += (target.current.x - proxy.current.x) * 0.03;
    proxy.current.y += (target.current.y - proxy.current.y) * 0.03;

    if (materialRef.current) {
      const rotationX = 0.5 + proxy.current.y * 0.8;
      const rotationY = 0.3 + proxy.current.x * 1.2;
      materialRef.current.uniforms.uRotation.value.set(rotationX, rotationY, 0);
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const scale = Math.min(viewport.width, viewport.height) * 0.35;

  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <icosahedronGeometry args={[1, 4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

interface DigitalArmorSphereProps {
  className?: string;
}

export function DigitalArmorSphere({ className }: DigitalArmorSphereProps) {
  const [isReady, setIsReady] = useState(false);

  return (
    <div
      className={className}
      style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 1.5s ease-out',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SphereMesh onReady={() => setIsReady(true)} />
        <EffectComposer>
          <Bloom intensity={1} luminanceThreshold={0.9} luminanceSmoothing={0.9} />
          <Noise opacity={0.08} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
