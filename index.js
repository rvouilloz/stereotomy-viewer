import { models } from "./models.js";

import {
  Scene,
  WebGLRenderer,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils,
  MOUSE,
  Clock,
  EquirectangularReflectionMapping,
  ACESFilmicToneMapping,
  OrthographicCamera,
} from "three";

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import CameraControls from "camera-controls";

const subsetOfTHREE = {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp,
  },
};

const canvas = document.getElementById("three-canvas");

const scene = new Scene();

const camera = new OrthographicCamera();
camera.position.set(0, -1, 0.5);

scene.add(camera);

CameraControls.install({ THREE: subsetOfTHREE });
const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);
cameraControls.dollyToCursor = true;

// Models
const modelsList = document.getElementById("models-list");
const modelsItems = Array.from(modelsList.children);

const templateModelItem = modelsItems[0];

for (let model of models) {
  const newModel = templateModelItem.cloneNode(true);
  newModel.textContent = model.name;
  newModel.setAttribute("id", model.name);
  newModel.addEventListener("click", function onClick() {
    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => button.classList.remove("model-button-active"));
    newModel.classList.add("model-button-active");
    new RGBELoader().load(
      "./textures/abandoned_greenhouse_1k.hdr",
      function (texture) {
        texture.mapping = EquirectangularReflectionMapping;
        scene.environment = texture;
        const loader = new GLTFLoader();
        const loadingElem = document.getElementById("loader-container");
        const loadingText = document.getElementById("loader-text");
        loader.load(
          "./models/" + model.file,
          function (gltf) {
            loadingElem.style.display = "none";
            scene.remove.apply(scene, scene.children);
            scene.add(gltf.scene);
          },
          function (progress) {
            loadingElem.style.display = "flex";
            const current = (progress.loaded / progress.total) * 100;
            const formatted = Math.trunc(current * 100) / 100;
            loadingText.textContent = `Chargement: ${formatted}%`;
          }
        );
      }
    );
  });
modelsList.appendChild(newModel);
}
templateModelItem.remove();

// Load first Model
const firstModel = document.getElementById("1");
window.onload = function () {
  firstModel.click();
};

// SET CAMERA
/*
              const box = new Box3().setFromObject(scene);
              const center = box.getCenter(new Vector3());
              scene.position.x += scene.position.x - center.x;
              scene.position.y += scene.position.y - center.y;
              scene.position.z += scene.position.z - center.z;
              const boxSize = box.getSize(new Vector3());
              camera.position.z = boxSize.z + 10;
              const cameraFrustum = 1.3;
              camera.left = -cameraFrustum;
              camera.right = cameraFrustum;
              camera.top = cameraFrustum;
              camera.bottom = -cameraFrustum;
              camera.updateProjectionMatrix();

              */

// Renderer
const renderer = new WebGLRenderer({
  antialias: true,
  canvas: canvas,
});

renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
//renderer.outputColorSpace = sRGBEncoding;
renderer.setClearColor(0xffffff, 1);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});

// Animation
function animate() {
  const delta = clock.getDelta();
  cameraControls.update(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Sections
const textContainer = document.getElementById("text-container");
const sections = document.querySelectorAll(".section");
let upSections = [];
let currentSection = 1;
let currentModel = 1;

function getCurrentSection() {
  sections.forEach((section) => {
    const sectionId = section.id;
    const sectionNumber = parseInt(sectionId.split("section")[1]);
    const rect = section.getBoundingClientRect();
    if (rect.top <= 200) {
      if (!upSections.includes(sectionNumber)) {
        upSections.push(sectionNumber);
      }
    }
  });
  currentSection = upSections[upSections.length - 1];
  upSections = [];
}

function updateModelWhenNewSection() {
  sections.forEach((section) => {
    const sectionId = section.id;
    const sectionNumber = parseInt(sectionId.split("section")[1]);
    if (sectionNumber === currentSection) {
      section.style.color = "blue";
      if (currentModel !== currentSection) {
        currentModel = currentSection;
        const sectionButton = document.getElementById(currentSection);
        sectionButton.click();
      }
    } else {
      section.style.color = "black";
    }
  });
}

function updateModelOnScroll() {
  getCurrentSection();
  updateModelWhenNewSection();
}

textContainer.addEventListener("scroll", updateModelOnScroll);