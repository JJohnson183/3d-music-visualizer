"use client"; // Needed since Three.js runs only client-side

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { useEffect, useState } from "react";
import { initScene } from "../lib/scene/threeSetup"; // Three.js setup
import { createStarInstances } from "../lib/scene/geometry"; // Shapes to add to the scene
import { computeSpherePlacement, computeRingPlacement } from "../lib/scene/placements"; // Placement math for scene layouts
import { shapeReactions } from "../lib/scene/reactions"; // Audio reaction logic
import { formatTime } from "../lib/utils"; // Utility functions
import { debugPerformanceMonitor } from "../lib/debug"; // For testing and debugging the scene
import Menu from "../components/Menu"; // Menu UI component
import { 
  uploadFile, 
  playAudio,
  stopAudio,
  resumeAudio,
  getIsPlaying,
  getFileName,
  clearAudioData,
  getPlaybackTime
} from "../lib/audio"; // For handling audio files

//=================//
//=== Scene Data ===//
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

let starMesh: THREE.InstancedMesh; // Instanced mesh for all stars
let glowMesh: THREE.InstancedMesh; // Instanced mesh for all star glows
let shapeHues: number[] = []; // Color hue for each shape (0-1)
let shapeAngles: number[] = []; // Orbit angle per shape (radians), incremented each frame
let shapeRadii: number[] = []; // Spawn radius per shape, kept fixed so orbit path never drifts
let shapeBaseY: number[] = []; // Spawn Y per shape, fixed so pulse never drifts

// Camera parameters
let controls: OrbitControls; // For user interaction with the scene (e.g., zoom, pan, rotate)
let composer: EffectComposer; // Post-processing composer for bloom effect

// Star parameters
let starCount = 300; // Number of stars to populate the scene with
let starSpread = 100; // The range in which to randomly place the stars (e.g., -25 to 25 on each axis)
let starOrbitSpeed = 0.001; // How fast the stars orbit around their center in radians per frame
let starPulseIntensity = 1.5; // How much the stars pulse in response to the bass frequencies (mutiplier for radius)


// Reusable matrix to avoid per-frame allocation in populateScene and resetShapes
const _matrix = new THREE.Matrix4();

//=====================//

//=== Debug Flags ===//
const showPerfMonitor = false; // Toggle FPS counter in the top-right corner


export default function Home() {
  const [menuOpen, setMenuOpen] = useState(true);

  // Initialize the Three.js scene on startup
  useEffect(() => {
    const init = initScene(); // Used to set up the scene, camera, and renderer
    scene = init.scene;
    camera = init.camera;
    renderer = init.renderer;
    composer = init.composer;
    controls = init.controls;

    populateScene(); // Populate the scene with stars

    animate(); // Start the animation loop
    
    return () => { disposeScene(); }; // Dispose of the scene when done
  }, []);

  return (
    <>
      {/* Performance Monitor */}
      {showPerfMonitor && (
        <div id="fps-counter" className="fixed top-4 right-4 text-white text-xs font-mono bg-black/40 px-2 py-1 rounded">
          -- FPS
        </div>
      )}

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
      {menuOpen && (
        <Menu
          onFileInputClick={onFileInputClick}
          onFileUpload={onFileUpload}
          onPlaybackToggle={onPlaybackToggle}
          onAudioClear={onAudioClear}
          onDemoPlay={onDemoPlay}
        />
      )}
    </div>
    </>
  );
}

//=============================================================//
//===================== Scene Helpers =========================//
/** Animation loop to continuously render the scene and update things every frame */
function animate() {
  requestAnimationFrame(animate); // Request the next frame to keep the animation going

  if (showPerfMonitor) debugPerformanceMonitor();
  updatePlaybackBar();
  updatePlaybackControls();

  // Update how the shapes react to the audio data
  shapeReactions({ starMesh, glowMesh, shapeHues, shapeAngles, shapeRadii, shapeBaseY, starOrbitSpeed, starPulseIntensity });

  controls.update(); // To ensure the control changes are shown in the scene
  composer.render(); // Render using the post-processing composer that applies bloom
}

// Add the stars to the scene at random positions and store their properties for later use in reactions
function populateScene() {
  // 1) Create instanced meshes for stars and glow
  const instances = createStarInstances(starCount);
  starMesh = instances.starMesh;
  glowMesh = instances.glowMesh;
  scene.add(starMesh);
  scene.add(glowMesh);

  // 2) Place each star and store properties
  for (let i = 0; i < starCount; i++) {
    createSphereScene(i);
    // createRingScene(i);
  }

  // 3) Tell Three.js to update the instance colors and matrices on the GPU after initial placement
  starMesh.instanceMatrix.needsUpdate = true;
  glowMesh.instanceMatrix.needsUpdate = true;
  if (starMesh.instanceColor) starMesh.instanceColor.needsUpdate = true;
  if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;
}

function createSphereScene(index: number){
  // 1) Compute a random position inside a sphere
  const { position, angle, radius, baseY } = computeSpherePlacement(starSpread);

  // 2) Store the star's properties for later use in reactions
  shapeAngles.push(angle);
  shapeRadii.push(radius);
  shapeBaseY.push(baseY);

  // 3) Set initial random color
  const hue = Math.random();
  const color = new THREE.Color().setHSL(hue, 1, 0.5);
  starMesh.setColorAt(index, color);
  glowMesh.setColorAt(index, color);
  shapeHues.push(hue);

  // 4) Set the initial position for this instance
  _matrix.setPosition(position.x, position.y, position.z);
  starMesh.setMatrixAt(index, _matrix);
  glowMesh.setMatrixAt(index, _matrix);
}

// function createRingScene(index: number) {
//   // 1) Compute a random position around a flat ring
//   const { position, angle, radius, baseY } = computeRingPlacement(starSpread);

//   // 2) Store the star's properties for later use in reactions
//   shapeAngles.push(angle);
//   shapeRadii.push(radius);
//   shapeBaseY.push(baseY);

//   // 3) Set initial random color
//   const hue = Math.random();
//   const color = new THREE.Color().setHSL(hue, 1, 0.5);
//   starMesh.setColorAt(index, color);
//   glowMesh.setColorAt(index, color);
//   shapeHues.push(hue);

//   // 4) Set the initial position for this instance
//   _matrix.setPosition(position.x, position.y, position.z);
//   starMesh.setMatrixAt(index, _matrix);
//   glowMesh.setMatrixAt(index, _matrix);
// }

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
  const result = await uploadFile(event.target.files[0]);
  if(result?.error) return alert(result.error);

  // 3) Play the audio
  playAudio();
}

//==========================================================//
//===================== Helpers ============================//
/** Update the playback bar UI with an id reference. (Avoids rerendering react elements 60 times per second) */
function updatePlaybackBar() {
  // 1) Get current playback time and total duration from the audio controller
  const { current, total } = getPlaybackTime();
  
  // 2) Calculate progress as a percentage (0-100) for the progress bar fill
  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  // 3) Update the progress bar fill width and time displays directly with id refrences where found
  const fillElement = document.getElementById('playback-fill');
  const currentTimeElement = document.getElementById('playback-current');
  const totalTimeElement = document.getElementById('playback-total');

  if (fillElement) fillElement.style.width = `${progressPercent}%`;
  if (currentTimeElement) currentTimeElement.textContent = formatTime(current);
  if (totalTimeElement) totalTimeElement.textContent = formatTime(total);

  // 4) Update the track title
  const titleElement = document.getElementById('playback-title');
  if (titleElement) titleElement.textContent = getFileName();
}

/** Update the pause/resume button state with an id reference. (Avoids rerendering react elements 60 times per second) */
function updatePlaybackControls() {
  // 1) Get total duration to check if audio is loaded
  const { total } = getPlaybackTime();

  // 2) Get the playback toggle button by id 
  const btn = document.getElementById('playback-toggle-btn') as HTMLButtonElement | null;
  if (!btn) return;

  // 3) Enable the button if audio is loaded, disable if not. Set text to ⏸ when playing and ▶ when paused
  const audioLoaded = total > 0;
  btn.disabled = !audioLoaded; // Disable when no audio is loaded
  btn.textContent = getIsPlaying() ? '\u23F8' : '\u25B6'; // ⏸ when playing, ▶ when paused

  // 4) Enable the clear button if audio is loaded, disable if not
  const clearBtn = document.getElementById('playback-clear-btn') as HTMLButtonElement | null;
  if (clearBtn) clearBtn.disabled = !audioLoaded;
}

/** Toggle between pause and resume */
function onPlaybackToggle() {
  getIsPlaying() ? stopAudio() : resumeAudio();
}

/** Clear audio data and return to idle animation */
function onAudioClear() {
  clearAudioData();
  resetShapes();

  // Clear the file input so the filename no longer shows
  const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
  if (fileInput) fileInput.value = '';
}

/** Load and play the built-in demo track */
async function onDemoPlay() {
  clearAudioData();
  resetShapes();

  // Fetch demo file, convert to a File object, and upload it like a normal file input
  const response = await fetch('/Cipher.mp3');
  const blob = await response.blob();
  const result = await uploadFile(new File([blob], 'Cipher', { type: 'audio/mpeg' }));
  if (result?.error) return alert(result.error);

  playAudio();
}

//==========================================================//
//===================== Cleanup ============================//
function disposeScene() {
  // Dispose of mesh instances and their materials to free up GPU memory 
  starMesh.geometry.dispose();
  (starMesh.material as THREE.Material).dispose();

  glowMesh.geometry.dispose();
  (glowMesh.material as THREE.Material).dispose();

  renderer.dispose(); // Dispose of the renderer
}

/** Reset shape properties to random default when audio is stopped or reset */
function resetShapes(){
  const color = new THREE.Color();

  for (let index = 0; index < starCount; index++) {
    //=== Reset colors for star ===//
    shapeHues[index] = Math.random(); // Random starting hue for each star
    color.setHSL(shapeHues[index], 1, 0.5);
    starMesh.setColorAt(index, color);
    glowMesh.setColorAt(index, color);

    //=== Reset position for star ===//
    const x = Math.cos(shapeAngles[index]) * shapeRadii[index];
    const z = Math.sin(shapeAngles[index]) * shapeRadii[index];
    _matrix.setPosition(x, shapeBaseY[index], z);
    starMesh.setMatrixAt(index, _matrix);
    glowMesh.setMatrixAt(index, _matrix);
  }

  // Tell Three.js to update the instance colors and matrices on the GPU after resetting
  if (starMesh.instanceColor) starMesh.instanceColor.needsUpdate = true;
  if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;
  starMesh.instanceMatrix.needsUpdate = true;
  glowMesh.instanceMatrix.needsUpdate = true;
}
