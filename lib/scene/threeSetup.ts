import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const maxCameraZoom = 200; // Maximum distance the camera can zoom out
const minCameraZoom = 2; // Minimum distance the camera can zoom in

// Bloom parameters
const useBloom = true; // Toggle bloom post-processing on/off
const bloomStrength = 1.2; // How intense the bloom glow is
const bloomRadius = 0.4; // How far the bloom spreads
const bloomThreshold = 0.2; // Minimum brightness to trigger bloom (0 = everything glows)


export function initScene() {
  //==== Core scene setup ===//
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Determine minimum render distance
    1000 // Determine maximum render distance
  );
  
  // Create the renderer to display the scene and camera. Connected to the canvas component in layout.tsx with the id "bg"
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg") as HTMLCanvasElement,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance on high-DPI screens
  renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the renderer to fill the entire screen
  camera.position.setZ(100); // Start the camera pointed at the center of the scene

  renderer.render(scene, camera); // Render the scene and camera

  //==== Post-processing (Bloom) ===//
  // Post-processing pipeline: renders the scene, then optionally applies bloom glow
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera)); // Base render pass
  if (useBloom) { // Add bloom pass if enabled
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    ));
  }

  //==== User controls ===//
  const controls = new OrbitControls(camera, renderer.domElement); // Allow zooming, panning, and rotating the scene with the mouse
  controls.enableDamping = true; // Add some inertia to make panning and rotating feel smoother
  controls.enablePan = false; // Disable panning to keep the focus on the center of the scene
  controls.maxDistance = maxCameraZoom; // Limit how far the user can zoom out
  controls.minDistance = minCameraZoom; // Limit how far the user can zoom in

  return { scene, camera, renderer, composer, controls };
}
