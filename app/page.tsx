"use client"; // Needed since Three.js runs only client-side

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect } from "react";
import { initScene } from "../lib/threeSetup"; // Three.js setup
import { createCube, createStar } from "../lib/geometry"; // Shapes to add to the scene

//=== Scene Data ===//
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let controls: OrbitControls; // For user interaction with the scene (e.g., zoom, pan, rotate)

let shapes: THREE.Mesh[] = []; // All shapes in the scene


// Star parameters
let starCount = 300; // Number of stars to populate the scene with
let starSpread = 100; // The range in which to randomly place the stars (e.g., -25 to 25 on each axis)
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
    populateScene(); // Populate the scene with stars

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

// Add the stars to the scene at random positions
function populateScene() {
  for (let i = 0; i < starCount; i++) {
    const star = createStar();

    // Get random x, y, and z positions in the range of -25 to 25
    const [x, y, z] = Array(3).fill(0).map(() => THREE.MathUtils.randFloatSpread(starSpread));
    star.position.set(x, y, z);

    shapes.push(star);
    scene.add(star);
  }
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
  const gridhelper = new THREE.GridHelper(50, 10);
  scene.add(gridhelper);
}
