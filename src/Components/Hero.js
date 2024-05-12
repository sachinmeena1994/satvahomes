
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import React, { Suspense, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';



function ThreeComponent() {
    const gltf = useLoader(GLTFLoader, '/room/scene.gltf');
  
    const cameraRef = useRef();
    const controlsRef = useRef();
  
    return (
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
  
        <Suspense fallback={null}>
          <primitive object={gltf.scene} />
        </Suspense>
  
        <OrbitControls ref={controlsRef} />
      </Canvas>
    );
  }
  

export default ThreeComponent;
