import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const maxCameraZoom = 200; // Maximum distance the camera can zoom out
const minCameraZoom = 2; // Minimum distance the camera can zoom in

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

  renderer.setPixelRatio(window.devicePixelRatio); // Set the pixel ratio to the device's pixel ratio
  renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the renderer to fill the entire screen
  camera.position.setZ(100); // Start the camera pointed at the center of the scene

  renderer.render(scene, camera); // Render the scene and camera

  //==== User controls ===//
  const controls = new OrbitControls(camera, renderer.domElement); // Allow zooming, panning, and rotating the scene with the mouse
  controls.enableDamping = true; // Add some inertia to make panning and rotating feel smoother
  controls.maxDistance = maxCameraZoom; // Limit how far the user can zoom out
  controls.minDistance = minCameraZoom; // Limit how far the user can zoom in

  return { scene, camera, renderer, controls };
}
