import * as THREE from "three";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "lil-gui";

gsap.registerPlugin(ScrollTrigger);

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#fff0f0",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Models

const gltfLoader = new GLTFLoader();

let mixer = null;
const objectDistance = 4;

gltfLoader.load("/models/source/tesla_2018_model_3.glb", (gltf) => {
  //   console.log(gltf.scene);
  // mixer = new THREE.AnimationMixer(gltf.scene);
  // const action = mixer.clipAction(gltf.animations[0]);

  // action.play();
  const model = gltf.scene;

  model.scale.set(0.01, 0.01, 0.01);
  model.rotation.set(0, Math.PI, 0);
  model.position.set(2, -objectDistance * 0, 0);
  scene.add(model);

  //   const children = [...gltf.scene.children];

  //   for (const child of children) {
  //     scene.add(child);
  //   }

  const modelAnimation = gsap.timeline();

  modelAnimation
    .to(camera.position, {
      z: "7",
    })
    .to(
      model.position,
      {
        duration: 0.6,
        y: -4,
        x: -2.5,
        z: 1.5,
      },
      "<"
    )
    .to(
      model.rotation,
      {
        // duration: 1.2,
        y: 0,
        x: 0.8,
      },
      "<"
    )
    .to(camera.position, {
      z: "10",
    })
    .to(
      model.position,
      {
        duration: 0.6,
        y: -11,
        x: 6,
        // z: 0,
      },
      "<"
    )
    .to(
      model.rotation,
      {
        // duration: 1.2,
        y: 4,
        x: -0.5,
      },
      "<"
    );

  ScrollTrigger.create({
    animation: modelAnimation,
    trigger: "scrollY",
    scrub: 1,
    start: "top top",
    end: () => `+=${document.documentElement.scrollHeight}`,
    // end: "+=1000%",
    toggleActions: "play none none reverse",
  });
});

/**
 * Objects
 */
// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");
const particleTexture = textureLoader.load("/textures/particles/4.png");
const matcapTexture = textureLoader.load("/textures/matcaps/3.png");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
// console.log(particleTexture);
gradientTexture.magFilter = THREE.NearestFilter;

const enviromentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/1/px.jpg",
  "/textures/environmentMaps/1/nx.jpg",
  "/textures/environmentMaps/1/py.jpg",
  "/textures/environmentMaps/1/ny.jpg",
  "/textures/environmentMaps/1/pz.jpg",
  "/textures/environmentMaps/1/nz.jpg",
]);

// Material
const material = new THREE.MeshStandardMaterial({
  color: parameters.materialColor,
  // gradientMap: gradientTexture,
});
material.metalness = 0.95;
material.roughness = 0.14;
material.envMap = enviromentMapTexture;

// gui.add(material, "metalness").min(0).max(1).step(0.0001);
// gui.add(material, "roughness").min(0).max(1).step(0.0001);

// Meshes
// const objectDistance = 4;
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 20),
  material
);

mesh1.visible = false;
mesh2.visible = false;
mesh3.visible = false;

mesh1.position.y = -objectDistance * 0;
mesh2.position.y = -objectDistance * 1;
mesh3.position.y = -objectDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

// Particles
const particlesCount = 300;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Materials
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.11,
  alphaMap: particleTexture,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  // vertexColors: true,
});

// points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
(pointLight.position.x = 2),
  (pointLight.position.y = 3),
  (pointLight.position.z = 4);
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  40,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 10;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// mesh animation

const mesh1Animation = gsap.timeline();

mesh1Animation
  .to(camera.position, {
    z: "7",
  })
  .to(
    mesh1.position,
    {
      duration: 0.6,
      y: -4,
      x: -2.5,
      // z: 2,
    },
    "<"
  )
  .to(
    mesh1.rotation,
    {
      // duration: 1.2,
      y: 4,
      x: 2,
    },
    "<"
  )
  .to(camera.position, {
    z: "10",
  })
  .to(
    mesh1.position,
    {
      duration: 0.6,
      y: -11,
      x: 5,
      // z: 0,
    },
    "<"
  )
  .to(
    mesh1.rotation,
    {
      // duration: 1.2,
      y: -2.5,
      x: -1,
    },
    "<"
  );

ScrollTrigger.create({
  animation: mesh1Animation,
  trigger: "scrollY",
  scrub: 1,
  start: "top top",
  end: () => `+=${document.documentElement.scrollHeight}`,
  // end: "+=1000%",
  toggleActions: "play none none reverse",
});

// Scroll
// let scrollY = window.scrollY;
// let currentSection = 0;

// window.addEventListener("scroll", () => {
//   scrollY = window.scrollY;

//   // console.log(scrollY);

//   // const newSection = Math.round(scrollY / sizes.height);

//   // if (newSection != currentSection) {
//   //   currentSection = newSection;

//   // }
// });

// Cursor
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime; // Delta is used to make the animation speed same for all screen FPS
  previousTime = elapsedTime;
  // console.log(deltaTime);

  // update mixer

  if (mixer !== null) {
    mixer.update(deltaTime);
  }

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectDistance;

  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate Meshes
  // for (const mesh of sectionMeshes) {
  //   mesh.rotation.x += deltaTime * 0.1;
  //   mesh.rotation.y += deltaTime * 0.12;
  // }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
