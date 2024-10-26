import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei'; // Use OrbitControls from drei
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import React, { Suspense, useRef } from 'react';

function ThreeComponent() {
  const gltf = useLoader(GLTFLoader, '/room/scene.gltf');
  const cameraRef = useRef();
  const controlsRef = useRef();

  return (
    <div style={{ width: '100vw', height: '100vh' }}> {/* Full-screen width and height */}
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

      <Suspense fallback={null}>
        <primitive object={gltf.scene} />
      </Suspense>

      <OrbitControls ref={controlsRef} />
    </Canvas>
  </div>
  );
}

export default ThreeComponent;
