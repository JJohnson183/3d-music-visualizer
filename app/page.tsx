"use client"; // Needed since Three.js runs only client-side

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect, useState } from "react";
import { initScene } from "../components/threeSetup"; // Three.js setup
import { createCube, createStar } from "../components/geometry"; // Shapes to add to the scene
import { 
  uploadFile, 
  playAudio,
  clearAudioData
} from "../lib/audio"; // For handling audio files

//=================//
//=== Scene Data ===//
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let shapes: THREE.Mesh[] = []; // All shapes in the scene

// Camera parameters
let controls: OrbitControls; // For user interaction with the scene (e.g., zoom, pan, rotate)

// Star parameters
let starCount = 300; // Number of stars to populate the scene with
let starSpread = 100; // The range in which to randomly place the stars (e.g., -25 to 25 on each axis)
//=====================//


export default function Home() {
  const [menuOpen, setMenuOpen] = useState(true);

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
    <div className="fixed top-4 left-4 text-white">
      {/* Menu Button */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 hover:bg-white/10 rounded transition-colors"
        aria-label="Toggle menu"
      >
        <div className="w-6 space-y-1.5">
          <div className="h-0.5 bg-white"></div>
          <div className="h-0.5 bg-white"></div>
          <div className="h-0.5 bg-white"></div>
        </div>
      </button>

      {/* Menu Content */}
      {menuOpen && ( // Only show the menu content if the menu is open
        <div className="mt-4 bg-white/50 p-4">

          {/* Title */}
          <h1 className="text-xl font-bold mb-2">
            3D Particle Music Visualizer
          </h1>

          {/* MP3 add button */}
          <div className="space-y-2 text-sm">
            <p>Upload MP3 Here</p>
            <input 
              type="file" 
              accept="audio/mp3,audio/mpeg"
              className="block w-full text-sm text-gray-900 bg-gray-50 rounded border border-gray-300 cursor-pointer focus:outline-none"
              // Process audio file and and store the data
              onChange={async (event) => await onFileUpload(event)}
            />
          </div>

          {/* Credits */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span>Made by Jordan S. Johnson</span>
            <a 
              href="https://github.com/JJohnson183/3d-music-visualizer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
              aria-label="View on GitHub"
            >
              <img src="/github.svg" alt="GitHub" className="w-4 h-4" />
            </a>
          </div>

        </div>
      )}
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

//=============================================================//
//===================== Logic Helpers =========================//
async function onFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  // 1) Clear and stop any existing audio data
  clearAudioData();

  // 2) Process the new audio file and store it
  const result = await uploadFile(event); // Handle the file upload and processing
  if(result?.error) return alert(result.error); // Notify user on error

  // 3) Play the audio
  playAudio();

  // TODO: Add basic sound visualization
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