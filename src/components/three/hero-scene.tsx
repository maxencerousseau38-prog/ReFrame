"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Subtle, premium 3D object for a dark hero: a slowly rotating faceted
 * icosahedron with an emissive iridescent material and a faint wireframe shell.
 * Depth + glow, deliberately understated.
 */
function Crystal() {
  const mesh = React.useRef<THREE.Mesh>(null);
  const wire = React.useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    for (const m of [mesh.current, wire.current]) {
      if (!m) continue;
      m.rotation.x += delta * 0.1;
      m.rotation.y += delta * 0.14;
    }
    if (mesh.current) mesh.current.position.y = Math.sin(t * 0.6) * 0.1;
  });

  return (
    <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.7}>
      <mesh ref={mesh} scale={1.05}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#7c5cff"
          roughness={0.25}
          metalness={0.6}
          emissive="#6d28d9"
          emissiveIntensity={0.6}
          flatShading
        />
      </mesh>
      <mesh ref={wire} scale={1.24}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.12} />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 4]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-5, -2, -2]} intensity={6} color="#ec4899" />
      <pointLight position={[5, 3, 2]} intensity={6} color="#6366f1" />
      <pointLight position={[0, -4, 3]} intensity={3} color="#22d3ee" />
      {/* float the accent above the headline rather than behind it */}
      <group position={[0, 1.15, 0]}>
        <Crystal />
      </group>
    </Canvas>
  );
}
