"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Subtle, premium 3D object: a slowly rotating distorted icosahedron with a
 * soft iridescent material. Deliberately understated — depth + glow, not gadget.
 */
function Knot() {
  const mesh = React.useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.16;
    const t = state.clock.getElapsedTime();
    mesh.current.position.y = Math.sin(t * 0.6) * 0.08;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={mesh} scale={1.7}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#a78bfa"
          roughness={0.35}
          metalness={0.45}
          emissive="#4f46e5"
          emissiveIntensity={0.45}
          flatShading
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-4, -2, -2]} intensity={2} color="#ec4899" />
      <pointLight position={[4, 2, 2]} intensity={2} color="#6366f1" />
      <Knot />
    </Canvas>
  );
}
