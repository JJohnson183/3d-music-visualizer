import * as THREE from "three";

/** Create multiple star instances (Not full individual meshes) */
export function createStarInstances(count: number): { starMesh: THREE.InstancedMesh, glowMesh: THREE.InstancedMesh } {
    const starSize = 0.4;

    // Star instanced mesh
    const starGeometry = new THREE.SphereGeometry(starSize, 8, 8);
    const starMaterial = new THREE.MeshBasicMaterial();
    const starMesh = new THREE.InstancedMesh(starGeometry, starMaterial, count);
    starMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Updated every frame

    // Glow instanced mesh (larger, semi-transparent. Acts as child mesh for bloom effect)
    const glowGeometry = new THREE.SphereGeometry(starSize * 1.5, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 });
    const glowMesh = new THREE.InstancedMesh(glowGeometry, glowMaterial, count);
    glowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Updated every frame

    return { starMesh, glowMesh };
}