import * as THREE from "three";

export function initScene() {
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
  camera.position.setZ(30); // Start the camera pointed at the center of the scene

  renderer.render(scene, camera); // Render the scene and camera

  return { scene, camera, renderer };
}
