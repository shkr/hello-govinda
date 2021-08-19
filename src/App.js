import {Canvas, extend, useFrame, useLoader} from '@react-three/fiber'
import './App.css';
import React, { useRef, Suspense } from "react";
import { shaderMaterial } from '@react-three/drei';
import glsl from "babel-plugin-glsl/macro";
import * as THREE from 'three';


const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {uClock: 0, uColor: new THREE.Color(0.0, 1.0, 0.0), uTexture: new THREE.Texture()},
  // Vertex Shader
  glsl`
    precision mediump float;
    uniform float uClock;
    varying vec2 vUv;
    varying float vWave;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);
    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp = 0.25;
      vec3 noisePos = vec3(pos.x * noiseFreq + uClock, pos.y, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uClock;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    varying float vWave;
    void main() {
      float wave = vWave * 0.1;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture, 1.0);
    }
  `,
);

extend({ WaveShaderMaterial })

const Wave = () => {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    ref.current.uClock = clock.getElapsedTime();
  });

  const [image] = useLoader(THREE.TextureLoader, [process.env.PUBLIC_URL + "/govinda.jpg"])
  return (
    <mesh>
    <planeBufferGeometry args={[0.4, 0.6, 10, 10]}/>
    <waveShaderMaterial uColor="hotpink" ref={ref} uTexture={image} />
  </mesh>
  );
}

const Scene = () => {
  return (
    <Canvas camera={{ fov: 10, position: [0, 0, 5] }}>
      <Suspense fallback={null}>
      <pointLight position={10, 10, 10}/>
      <Wave/>
      </Suspense>
    </Canvas>
  )
}

const App = ()  => {
  return <>
  <h1>Hello Govinda!</h1>
  <Scene />
  </>
}

export default App;
