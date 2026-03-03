"use client"; // Needed since Three.js runs only client-side

import { useEffect } from "react";
import { initScene } from "../lib/threeSetup"; // Three.js setup

export default function Home() {
  // Initialize the Three.js scene on startup
  useEffect(() => {
    const { scene, camera, renderer } = initScene();
    
    // Dispose of the renderer when done
    return () => {renderer.dispose();};
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="flex flex-col items-center gap-4">
        3D Particle Music Visualizer
      </h1>
    </div>
  );
}
