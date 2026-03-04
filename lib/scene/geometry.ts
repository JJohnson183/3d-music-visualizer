import * as THREE from "three";


export function createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1); // Define the shape of the object
    const material = new THREE.MeshBasicMaterial({ color: 0xFF6347, wireframe: true }); // Define the material of the object
    const cube = new THREE.Mesh(geometry, material); // Create the full shape by combining the geometry and material
    return cube;
}

export function createStar() {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const star = new THREE.Mesh(geometry, material);
    return star;
}