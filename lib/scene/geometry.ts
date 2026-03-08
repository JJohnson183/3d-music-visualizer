import * as THREE from "three";


export function createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Define the shape of the object
    const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: true }); // Define the material of the object
    const cube = new THREE.Mesh(geometry, material); // Create the full shape by combining the geometry and material
    return cube;
}

export function createStar() {
    // Create star
    const size = 0.4; // Size of the star 
    const geometry = new THREE.SphereGeometry(size, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const star = new THREE.Mesh(geometry, material);

    // Add glow
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 });
    const glow = new THREE.Mesh(new THREE.SphereGeometry(size * 1.5, 24, 24), glowMaterial);
    star.add(glow);

    return star;
}