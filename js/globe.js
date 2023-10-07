import * as THREE from "three";

import ThreeGlobe from "three-globe";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "../file/custom.geo.json";
import travelHistory from "../file/flights.json";
import airportHistory from "../file/airports.json";
// import airportHistory from "../files/airports.json";

var renderer, camera, scene, controls, globe;

let mouseX = 0,
  mouseY = 0;
let windowHalfX = window.innerWidth / 2,
  windowHalfY = window.innerHeight / 2;

console.log("hello");

init();
initGlobe();
onWindowResize();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  var ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
  scene.add(ambientLight);
  scene.background = new THREE.Color(0x040d21);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dLight1.position.set(-800, 2000, 400);
  camera.add(dLight1);

  var dLight2 = new THREE.DirectionalLight(0x7982f6, 1);
  dLight2.position.set(-200, 500, 200);
  camera.add(dLight2);

  var dLight3 = new THREE.PointLight(0x8566cc, 0.5);
  dLight3.position.set(-200, 500, 200);
  camera.add(dLight3);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  scene.fog = new THREE.Fog("#0535ef3", 400, 2000);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01; // dampingFactor
  controls.enablePan = false;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const maxParticleCount = 1000;
  const particleCount = 500;
  const r = 10;
  const rHalf = r / 2;
  const maxConnections = 20;
  const minDistance = 2.5;
  let vertexpos = 0;
  let colorpos = 0;
  let numConnected = 0;
  // Particles
  const positions = [];
  const particlePositions = new Float32Array(maxParticleCount * 3);
  const particlesData = [];

  const v = new THREE.Vector3();

  for (let i = 0; i < particleCount; i++) {
    // create particle
    const x = Math.random() * r - r / 2;
    const y = Math.random() * r - r / 2;
    const z = Math.random() * r - r / 2;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    const v = new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2);
    particlesData.push({ velocity: v.normalize().divideScalar(50), numConnections: 0 });
  }

  const particles = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(positions),
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      blending: THREE.AdditiveBlending,
    })
  );

  scene.add(particles);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove, false);
}

function initGlobe() {
  globe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: true })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.2)
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.25)
    .hexPolygonColor((e) => {
      if (["KGZ", "KOR", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(e.properties.ISO_A3)) {
        return "rgba(255,255,255, 1)";
      } else return "rgba(255,255,255, 0.7)";
    });

  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    globe
      .arcsData(travelHistory.flights)
      .arcColor((e) => {
        return e.status ? "#9cff00" : "#FF4000";
      })
      .arcAltitude((e) => {
        return e.arcAlt;
      })
      .arcStroke((e) => {
        return e.status ? 0.5 : 0.3;
      })
      .arcDashLength(0.9)
      .arcDashGap(4)
      .arcDashAnimateTime(1000)
      .arcsTransitionDuration(1000)
      .arcDashInitialGap((e) => e.order * 1)
      .labelsData(airportHistory.airports)
      .labelColor(() => "#ffcb21")
      .labelDotOrientation((e) => {
        return e.text === "ALA" ? "top" : "right";
      })
      .labelDotRadius(0.3)
      .labelSize((e) => e.size)
      .labelText("city")
      .labelResolution(6)
      .labelAltitude(0.01)
      .pointsData(airportHistory.airports)
      .pointColor(() => "#ffffff")
      .pointsMerge(true)
      .pointAltitude(0.07)
      .pointRadius(0.05);
  }, 1000);

  globe.rotateY(-Math.PI * (5 / 9));
  globe.rotateY(-Math.PI * 6);

  const globeMaterial = globe.globeMaterial();
  globeMaterial.color = new THREE.Color(0x3a228a);
  globeMaterial.emissive = new THREE.Color(0x040d21);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  // scene.add(globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  windowHalfX = window.innerWidth / 1.5;
  windowHalfY = window.innerHeight / 1.5;

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  camera.position.x += Math.abs(mouseX) <= windowHalfX / 2 ? (mouseX / 2 - camera.position.x) * 0.005 : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
