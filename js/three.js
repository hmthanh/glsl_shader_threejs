import * as Three from "three";
import { SavePass } from "three/examples/jsm/postprocessing/SavePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { BlendShader } from "three/examples/jsm/shaders/BlendShader.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// import vertexShader from '../glsl/vertex.glsl'
// import fragmentShader from '../glsl/fragment.glsl'

const scene = new Three.Scene();
const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const render = new Three.WebGLRenderer();
render.setSize(window.innerWidth, window.innerHeight);
render.setPixelRatio(1);
document.body.appendChild(render.domElement);

// ******************************************************

// Load a GLTF model
const loader = new GLTFLoader();
loader.load("model.gltf", (gltf) => {
  scene.add(gltf.scene);
});

// ******************************************************

const maxParticleCount = 1000;
const particleCount = 500;
const r = 10;
const rHalf = r / 2;
const maxConnections = 20;
const minDistance = 2.5;
let vertexpos = 0;
let colorpos = 0;
let numConnected = 0;

const segments = maxParticleCount * maxParticleCount;

// Geometry
const positions = new Float32Array(segments * 3);
const colors = new Float32Array(segments * 3);

// Particles
const particlePositions = new Float32Array(maxParticleCount * 3);
const particleData = [];
const v = new Three.Vector3();

for (let i = 0; i < maxParticleCount; i++) {
  const x = Math.random() * r - r / 2;
  const y = Math.random() * r - r / 2;
  const z = Math.random() * r - r / 2;

  particlePositions[i * 3] = x;
  particlePositions[i * 3 + 1] = y;
  particlePositions[i * 3 + 2] = z;

  const v = new Three.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2);
  particleData.push({ velocity: v.normalize().divideScalar(50), numConnections: 0 });
}

// particlesRef.current.setDrawRange(0, particleCount)

// Vertex shader GLSL code
const vertexShader = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader GLSL code
const fragmentShader = `
  void main() {
    gl_FragColor = vec4(0.0, 0.5, 0.5, 1.0); 
  } 
`;
// Create the shader material
const material = new Three.ShaderMaterial({
  vertexShader,
  fragmentShader,
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// const geometry = new Three.BoxGeometry();
const geometry = new Three.IcosahedronGeometry(1, 5);
// const material = new Three.MeshStandardMaterial({ color: 0x00ff00 });
const ico = new Three.Mesh(geometry, material);
scene.add(ico);

camera.position.z = 5;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// lighting
const dirLight = new Three.DirectionalLight("#ffffff", 0.75);
dirLight.position.set(5, 5, 5);

const ambientLight = new Three.AmbientLight("#ffffff", 0.2);
scene.add(dirLight, ambientLight);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  render.setSize(window.innerWidth, window.innerHeight);
}

function animation() {
  requestAnimationFrame(animation);
  ico.rotation.x += 0.01;
  ico.rotation.y += 0.01;
  render.render(scene, camera);
}

animation();
window.addEventListener("resize", resize);
