import * as THREE from 'three';

// Performance monitor state (only used when showPerfMonitor is true)
let _frameCount = 0;
let _lastFpsTime = performance.now();

//=============================================================//
//=================== Debug Helpers ========================//

export function debugSetup(scene: THREE.Scene) {
  const gridhelper = new THREE.GridHelper(50, 10);
  scene.add(gridhelper);
}

export function debugPerformanceMonitor() {
  _frameCount++;
  const now = performance.now();

  // Update FPS every second
  if (now - _lastFpsTime >= 1000) {
    // Calculate FPS as the number of frames since the last update divided by the time elapsed in seconds
    const fps = Math.round(_frameCount * 1000 / (now - _lastFpsTime));

    // Update the FPS counter element
    const el = document.getElementById('fps-counter');
    if (el) el.textContent = `${fps} FPS`;

    // Reset frame count and last update time for the next calculation
    _frameCount = 0;
    _lastFpsTime = now;
  }
}