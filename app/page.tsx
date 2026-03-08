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
  getBass,
  getMid,
  getTreble
} from "../lib/audio"; // For handling audio files

//=================//
//=== Scene Data ===//
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let shapes: THREE.Mesh[] = []; // All shapes in the scene
let shapeHues: number[] = []; // Color hue for each shape (0-1)
let shapeAngles: number[] = []; // Current orbit angle for each shape (radians), derived from spawn position

// Camera parameters
let controls: OrbitControls; // For user interaction with the scene (e.g., zoom, pan, rotate)

// Star parameters
let starCount = 300; // Number of stars to populate the scene with
let starSpread = 100; // The range in which to randomly place the stars (e.g., -25 to 25 on each axis)
let starOrbitSpeed = 0.0005; // How fast the stars orbit around their center in radians per frame
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
              onClick={(event) => onFileInputClick(event)}
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

/** Defines how the shapes react to the audio data */
function shapeReactions(){
  // 1) Get real-time audio data
  const bass = getBass(); // 0-255
  const mid = getMid(); // 0-255
  const treble = getTreble(); // 0-255

  // 2) Make stars react
  shapes.forEach((shape, index) => {
    //===== Position (bass) =====//
    
    //===== Color (Mid) =====//
    handleShapeColors(shape, index, mid);

    // Constant orbit
    handleShapeOrbit(shape, index);
  });
}

/** Handle shape colors based on Mid frequencies. If no audio is present, randomly change colors over time */
function handleShapeColors(shape: THREE.Mesh, index: number, mid: number | null) {
  if(mid === null) { // If a Mid is not present in the audio randomly change color
    shapeHues[index] += 0.001; // Increment hue slowly
    if (shapeHues[index] > 1) shapeHues[index] = 0; // Wrap around at 1

    // Update the star color and children to it
    const hue = shapeHues[index];
    (shape.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    for (let i = 0; i < shape.children.length; i++) {
      ((shape.children[i] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    }
  } 
  else{ // If a Mid is present in the audio react to it
    // Map mid (0-255) to hue (0-1)
    const hue = mid / 255;
    
    // Update both star and children to it
    (shape.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    for (let i = 0; i < shape.children.length; i++) {
      ((shape.children[i] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    }
  }
}

function handleShapeOrbit(shape: THREE.Mesh, index: number) {
  // 1) Get current radius from center (0, 0, 0) in the XZ plane to always orbit around the center. 
  //    Use Pythagorean theorem (Wow) to get the radius from the shape's current position
  const radius = Math.sqrt(shape.position.x ** 2 + shape.position.z ** 2);

  // 2) Increment the angle each frame
  shapeAngles[index] += starOrbitSpeed; 

  // 3) Orbit around (0, 0, 0) at the current radius.
  shape.position.x = Math.cos(shapeAngles[index]) * radius;
  shape.position.z = Math.sin(shapeAngles[index]) * radius;
}

// Add the stars to the scene at random positions
function populateScene() {
  for (let i = 0; i < starCount; i++) {
    const star = createStar();

    // Get random x, y, and z positions in the range of -25 to 25
    const [x, y, z] = Array(3).fill(0).map(() => THREE.MathUtils.randFloatSpread(starSpread));
    star.position.set(x, y, z);
    
    // Get the inital angle from (0, 0, 0) to the star's position in the XZ (horizontal) plane to use as the starting point for orbiting
    shapeAngles.push(Math.atan2(z, x));

    // Random starting hue for each star
    shapeHues.push(Math.random());

    shapes.push(star);
    scene.add(star);
  }
}

//=============================================================//
//===================== Logic Helpers =========================//
/** Called when user clicks the file input button */
function onFileInputClick(event: React.MouseEvent<HTMLInputElement>) {
  // 1) Clear input value so selecting the same file triggers onChange
  event.currentTarget.value = '';

  // 2) Clear and stop any existing audio data
  clearAudioData();

  // 3) Reset shapes to default
  resetShapes();
}

/** Called only when a file is selected */
async function onFileUpload(event: React.ChangeEvent<HTMLInputElement>) {  
  // 1) Check if file was actually selected
  if(!event.target.files || event.target.files.length === 0) return;

  // 2) Process the new audio file and store it
  const result = await uploadFile(event);
  if(result?.error) return alert(result.error);

  // 3) Play the audio
  playAudio();
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
    //=== Reset colors for star ===//
    shapeHues[index] = Math.random(); // Random starting hue for each star
    const hue = shapeHues[index];

    (shape.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    for (let i = 0; i < shape.children.length; i++) {
      ((shape.children[i] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);
    }
  });
}