import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, Trail } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveOrb({ isAnalyzing }) {
  const meshRef = useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse globally since container has pointer-events: none
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -1 to 1
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.x = state.clock.getElapsedTime() * (isAnalyzing ? 0.6 : 0.2);
      meshRef.current.rotation.y = state.clock.getElapsedTime() * (isAnalyzing ? 0.9 : 0.3);

      // Smooth mouse follow (lerping position)
      // Multiply by a factor to restrict movement radius
      const targetX = mousePosition.x * 2.5; 
      const targetY = mousePosition.y * 1.5;

      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 3 * delta);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 3 * delta);
    }
    
    // Slight camera parallax based on mouse
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mousePosition.x * 0.5, 2 * delta);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mousePosition.y * 0.5, 2 * delta);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <Float speed={isAnalyzing ? 4 : 2} rotationIntensity={1} floatIntensity={1}>
      <Trail 
        width={isAnalyzing ? 2 : 0.5} 
        color={isAnalyzing ? "#06b6d4" : "#7c3aed"} 
        length={8} 
        decay={1} 
        local={false}
      >
        <Sphere ref={meshRef} args={[isAnalyzing ? 1.0 : 0.7, 64, 64]}>
          <MeshDistortMaterial
            color={isAnalyzing ? "#06b6d4" : "#7c3aed"}
            emissive={isAnalyzing ? "#0891b2" : "#5b21b6"}
            emissiveIntensity={isAnalyzing ? 0.8 : 0.4}
            attach="material"
            distort={isAnalyzing ? 0.7 : 0.4}
            speed={isAnalyzing ? 5 : 2}
            roughness={0.1}
            metalness={0.8}
            wireframe={isAnalyzing}
          />
        </Sphere>
      </Trail>
    </Float>
  );
}

export default function Scene3D({ isAnalyzing }) {
  return (
    <div className="scene-container" style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color={isAnalyzing ? "#06b6d4" : "#7c3aed"} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#ec4899" />
        
        <Stars 
          radius={50} 
          depth={50} 
          count={isAnalyzing ? 3000 : 1500} 
          factor={4} 
          saturation={0} 
          fade 
          speed={isAnalyzing ? 2 : 0.5} 
        />
        
        <InteractiveOrb isAnalyzing={isAnalyzing} />
      </Canvas>
    </div>
  );
}
