"use client"; // Needed since Three.js runs only client-side

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect, useState } from "react";
import { initScene } from "../lib/scene/threeSetup"; // Three.js setup
import { createCube, createStar } from "../lib/scene/geometry"; // Shapes to add to the scene
import { 
  uploadFile, 
  playAudio,
  clearAudioData,
  getAverageVolume,
  getBass,
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
              // Clear and reset data on click
              onClick={onFileInputClick}
              // Process audio file on selection
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
  requestAnimationFrame(animate); // Request the next frame to keep the animation going

  shapeReactions(); // Update how the shapes react to the audio data

  controls.update(); // To ensure the control changes are shown in the scene
  renderer.render(scene, camera);
}

/** Defines how the shapes react to the audio data (e.g., volume, bass, treble) */
function shapeReactions(){
  // 1) Get real-time audio data
  const volume = getAverageVolume(); // 0-255
  const bass = getBass(); // 0-255

  // 2) Make stars react
  shapes.forEach((shape) => {
    // Temp rotation
    shape.rotation.x += 0.01; // Rotate the shape on the x-axis
    shape.rotation.y += 0.01; // Rotate the shape on the y-axis

    // Scale
    const scale = 1 + (volume / 255) * 3.5; // Scale between 1 and 4.5 based on volume
    shape.scale.set(scale, scale, scale);
    
    // Position
    
    // Color
    
  });
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
/** Called when user clicks the file input */
function onFileInputClick() {
  // 1) Clear and stop any existing audio data
  clearAudioData();

  // 2) Reset shapes to default
  resetShapes();
}

/** Called only when a file is selected */
async function onFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  console.log("File selected:", event.target.files);
  
  // 1) Check if file was actually selected (user didn't cancel)
  if(!event.target.files || event.target.files.length === 0) {
    console.log("No file selected");
    return;
  }

  // 2) Process the new audio file and store it
  const result = await uploadFile(event);
  if(result?.error) return alert(result.error);

  // 3) Play the audio
  playAudio();
  
  // 4) Clear input so selecting the same file again triggers onChange
  event.target.value = '';
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

/** Reset shape properties to random default when audio is stopped or reset */
function resetShapes(){
  shapes.forEach((shape, index) => {
    // Reset colors
    shapeHues[index] = Math.random(); // Random starting hue for each star
    (shape.material as THREE.MeshStandardMaterial).color.setHSL(shapeHues[index], 1, 0.5); // Update color based on treble
  });
}