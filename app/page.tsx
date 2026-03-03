"use client"; // Needed since Three.js runs only client-side

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect } from "react";
import { initScene } from "../lib/threeSetup"; // Three.js setup
import { createCube } from "../lib/geometry"; // Shapes to add to the scene

//=== Scene Data ===//
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let controls: OrbitControls; // For user interaction with the scene (e.g., zoom, pan, rotate)

let shapes: THREE.Mesh[] = []; // All shapes in the scene
//=====================//


export default function Home() {
  // Initialize the Three.js scene on startup
  useEffect(() => {
    const init = initScene(); // Used to set up the scene, camera, and renderer
    scene = init.scene;
    camera = init.camera;
    renderer = init.renderer;
    controls = init.controls;

    debugSetup(); // For testing only, will be removed in the future

    animate(); // Start the animation loop
    
    return () => { disposeScene(); }; // Dispose of the scene when done
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="flex flex-col items-center gap-4">
        3D Particle Music Visualizer
      </h1>
    </div>
  );
}

//=============================================================//
//===================== Scene Helpers =========================//
// Animation loop to continuously render the scene
function animate() {
  requestAnimationFrame(animate);

  // Rotate each shape (For proof things are 3d and animating)
  shapes.forEach((shape) => {
    shape.rotation.x += 0.01; // Rotate the shape on the x-axis
    shape.rotation.y += 0.01; // Rotate the shape on the y-axis
  });

  controls.update(); // To ensure the control changes are shown in the scene

  renderer.render(scene, camera);
}

//==========================================================//
//===================== Cleanup & Helpers ============================//
function disposeScene() {
  shapes.forEach((shape) => {
    shape.geometry.dispose(); // Dispose of the geometry

    if (shape.material instanceof THREE.Material) {
      shape.material.dispose(); // Dispose of the material if it's a single material
    } 
    else if (Array.isArray(shape.material)) {
      shape.material.forEach((mat) => mat.dispose()); // Dispose of each material if it's an array
    }
  });

  renderer.dispose(); // Dispose of the renderer
}

function debugSetup() {
  shapes.push(createCube()); // Add the cube to the list of shapes
  scene.add(...shapes); // Add the shapes to the scene

  const gridhelper = new THREE.GridHelper(50, 10);
  scene.add(gridhelper);
}
