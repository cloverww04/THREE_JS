import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import getStarfield from "./src/getStarfield.js";

// --- Scene & Camera ---
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.2);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Lights ---
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 3, 5);
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// --- Sphere (Earth) ---
const loader = new THREE.TextureLoader();
const globeTexture = loader.load('./src/world.png'); // your globe texture

const sphereGeo = new THREE.SphereGeometry(2, 64, 64);
const sphereMat = new THREE.MeshPhongMaterial({
  map: globeTexture,
  shininess: 30,
  specular: 0x555555,
  emissive: 0x223366,
  emissiveIntensity: 0.3
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);

// --- Wireframe edges (optional) ---
const edges = new THREE.EdgesGeometry(sphereGeo);
const lineMat = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.05
});
const line = new THREE.LineSegments(edges, lineMat);
sphere.add(line);

// --- Cloud layer ---
const cloudTexture = loader.load('./src/cloud.png'); // transparent cloud PNG
const cloudGeo = new THREE.SphereGeometry(2.05, 64, 64);
const cloudMat = new THREE.MeshPhongMaterial({
  map: cloudTexture,
  alphaMap: cloudTexture,
  transparent: true,
  opacity: 2,
  depthWrite: false,
  shininess: 0
});
const clouds = new THREE.Mesh(cloudGeo, cloudMat);
sphere.add(clouds);

// --- Stars ---
const stars = getStarfield({ numStars: 1000, fog: false });
scene.add(stars);

// --- Countries (children of sphere) ---
// Uncomment below to load and display countries from GeoJSON
// fetch("./geojson/countries.json")
//   .then(res => res.json())
//   .then(data => {
//     const countries = drawThreeGeo({
//       json: data,
//       radius: 2.01, // slightly above water to prevent z-fighting
//       materialOptions: { side: THREE.DoubleSide },
//       fill: true,
//       border: true,
//       getColor: (feature) => {
//         const coords = feature.geometry.coordinates[0];
//         const avgLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
//         if (avgLat > 60 || avgLat < -60) return 0xffffff; // polar ice
//         const greens = [0x2ca02c, 0x3cb371, 0x556b2f];
//         const browns = [0x8c564b, 0xa0522d, 0x6b4226];
//         return Math.random() < 0.6
//           ? greens[Math.floor(Math.random() * greens.length)]
//           : browns[Math.floor(Math.random() * browns.length)];
//       }
//     });
//     sphere.add(countries);
//   });

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);

  sphere.rotation.y += 0.0005;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Handle Resize ---
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
