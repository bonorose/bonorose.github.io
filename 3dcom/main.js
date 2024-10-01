import './style.css';
import * as THREE from 'three';

import { OrbitControls } from './OrbitControls.js';
import { checkRayIntersections, getMouseVector2 } from './RayCastHelper.js';
import { RoomEnvironment } from './RoomEnvironment.js';

import { GLTFLoader } from './GLTFLoader.js';
import { DRACOLoader } from './DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

import { lerp } from 'three/src/math/MathUtils.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Papa from 'papaparse';
import { EffectComposer, RenderPass, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { getOutlineEffect, configureOutlineEffectSettings_Default, configureOutlineEffectSettings_Hover, addOutlinesBasedOnIntersections, addOutlinesBasedOnIntersections2, addOutlinesBasedOnIntersections_hover, removeOutlines } from './OutlineHelper.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';

let loading = true;
const urlParams = new URLSearchParams(window.location.search);

let exrCubeRenderTarget;
let exrBackground;

const scene = new THREE.Scene();

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Setup the renderer with PMREM support
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25; // Slight exposure increase for a soft white look
renderer.outputEncoding = THREE.ACESFilmicToneMapping;
renderer.antialias = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // High-quality soft shadows


container.appendChild(renderer.domElement);

let model;
let composer = new EffectComposer(renderer);

// Use PMREM for smooth environment lighting
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let hdri_texture;


const hdri = urlParams.get('hdri');
let material_sky;

// function loadEXRTexture(url) {
//   return new Promise((resolve, reject) => {
//     new EXRLoader().load(url, (texture) => {
//       texture.mapping = THREE.EquirectangularReflectionMapping;
//       texture.minFilter = THREE.LinearFilter;
//       texture.magFilter = THREE.LinearFilter;
//       texture.encoding = THREE.LinearEncoding;

//       const pmremGenerator = new THREE.PMREMGenerator(renderer);
//       pmremGenerator.compileEquirectangularShader();

//       const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

//       scene.environment = exrCubeRenderTarget.texture;
//       resolve({ texture, exrCubeRenderTarget });
//     }, undefined, (error) => {
//       reject(error);
//     });
//   });
// }

// const { texture } = await loadEXRTexture('kloofendal_48d_partly_cloudy_puresky_2k.exr');
new EXRLoader().load( 'kloofendal_48d_partly_cloudy_puresky_2k.exr', function ( texture ) {

  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.minFilter = THREE.LinearFilter; // Ensure proper filtering for the texture
  texture.magFilter = THREE.LinearFilter;
  texture.encoding = THREE.LinearEncoding; // EXR typically uses linear encoding


  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);

  scene.environment = exrCubeRenderTarget.texture;
  hdri_texture = exrCubeRenderTarget.texture;

// Create the sky material
material_sky = new THREE.MeshBasicMaterial({
  map: texture, // Use the HDRI texture as the skydome material
  side: THREE.BackSide
});

// Test if working
if (hdri == 1) {
  scene.background = texture;
} else if (hdri==2) {
  // Create the skydome geometry and material
const geometry2 = new THREE.SphereGeometry(
  25,       // Radius
  50,      // Width segments
  50,      // Height segments
  // 0,        // phiStart: 0 means start at the default position
  // Math.PI * 2, // phiLength: Full circle in the horizontal direction
  // 0,        // thetaStart: Start at the top
  // Math.PI / 2 // thetaLength: Only the top half of the sphere (cut at the equator)
);
geometry2.scale(1, 1, 1); // Invert the sphere to view from inside

const skydome = new THREE.Mesh(geometry2, material_sky);
skydome.position.set(0, 0, 0);
scene.add(skydome);

// Set up a clipping plane to cut the sphere
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1); // Normal pointing upwards
renderer.clippingPlanes = [plane]; // Set the clipping planes for the renderer
renderer.localClippingEnabled = true; // Enable local clipping
} else {
  // Set a soft, white studio-like background
  scene.background = new THREE.Color(0xf8f8f8); // Light gray or white for soft backdrop
}
} );

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const percentComplete = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = percentComplete + '%';
    progressText.textContent = `Loading... ${Math.round(percentComplete)}%`;
};

// Hide the progress bar once all resources are loaded
loadingManager.onLoad = () => {
    setTimeout(() => {
        document.getElementById('progress-bar-container').style.display = 'none';
    }, 500);
};


// Create diffused studio-like lighting
const hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 2.6 ); 
// hemisphereLight.position.set(400, 80, 200);
scene.add(hemiLight);

let mousePointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100); // Adjust near and far clipping planes
camera.position.set(4, 8, 2);


const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128);
const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
scene.add(cubeCamera);

// SSAO Pass
const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
ssaoPass.kernelRadius = 20;  // Adjust to control the softness of the shadows
composer.addPass(ssaoPass);


// 
// Add GridHelper for the floor
const gridHelper = new THREE.GridHelper(50, 40);
scene.add(gridHelper);

// Create a compass with smaller, same-colored arrows
const arrowSize = 4;  // Smaller arrow size
const origin = new THREE.Vector3(0, 0, 0);  // Center at origin

// X-axis for East
const eastDir = new THREE.Vector3(1, 0, 0);  // Points along X-axis
const eastArrow = new THREE.ArrowHelper(eastDir, origin, arrowSize, 0x0ff000);
scene.add(eastArrow);

// Z-axis for North
const northDir = new THREE.Vector3(0, 0, 1);  // Points along Z-axis
const northArrow = new THREE.ArrowHelper(northDir, origin, arrowSize, 0xff0000);
scene.add(northArrow);

// -Z-axis for South
const southDir = new THREE.Vector3(0, 0, -1);  // Points along -Z-axis
const southArrow = new THREE.ArrowHelper(southDir, origin, arrowSize, 0x00ff00);
scene.add(southArrow);

// -X-axis for West
const westDir = new THREE.Vector3(-1, 0, 0);  // Points along -X-axis
const westArrow = new THREE.ArrowHelper(westDir, origin, arrowSize, 0x0000ff);
scene.add(westArrow);

function createTextSprite(text, color) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '40px Arial';
  context.fillStyle = color;
  context.fillText(text, 0, 40);  // Draw text on the canvas

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(2, 1, 1);  // Adjust the size of the sprite

  return sprite;
}

// Create sprites for each direction
const eastSprite = createTextSprite('E', 'white');
eastSprite.position.set(4, 0, 0);  // Position near the east arrow
scene.add(eastSprite);

const northSprite = createTextSprite('N', 'white');
northSprite.position.set(0, 0, 4);  // Position near the north arrow
scene.add(northSprite);

const southSprite = createTextSprite('S', 'white');
southSprite.position.set(0, 0, -4);  // Position near the south arrow
scene.add(southSprite);

const westSprite = createTextSprite('W', 'white');
westSprite.position.set(-4, 0, 0);  // Position near the west arrow
scene.add(westSprite);

// Raycaster for detecting clicks
const mouse = new THREE.Vector2();

// List of arrows for easier raycasting checks
const arrows = [eastArrow, northArrow, southArrow, westArrow];


// Update the cube camera to reflect changes in the scene
cubeCamera.update(renderer, scene);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

let outlinePass = getOutlineEffect(window, scene, camera);
configureOutlineEffectSettings_Default(outlinePass);
composer.addPass(outlinePass);

let outlinePassHover = getOutlineEffect(window, scene, camera);
configureOutlineEffectSettings_Hover(outlinePassHover);
composer.addPass(outlinePassHover);

// const gammaCorrection = new ShaderPass(GammaCorrectionShader);
// composer.addPass(gammaCorrection);


// Create the render target size for bloom
const bloomParams = {
  strength: 1.5,      // Bloom intensity (increase for more glow)
  radius: 0.4,        // Bloom radius (blur spread)
  threshold: 30     // Threshold: Only pixels above this brightness are bloomed
};

// Add UnrealBloomPass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), // Size
  bloomParams.strength,
  bloomParams.radius,
  bloomParams.threshold
);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.update();
controls.enablePan = true;
controls.enableDamping = true;  // Enables smooth motion
controls.dampingFactor = 0.05;  // Adjust damping for a more natural feel
controls.minDistance = 4;   // Minimum distance from the target (zoom in limit)
controls.maxDistance = 10;  // Maximum distance from the target (zoom out limit)
controls.minPolarAngle = Math.PI / 4;  // Limit upward view (0 is straight up)
controls.maxPolarAngle = Math.PI / 2;  // Limit downward view (Math.PI is straight down)
controls.rotateSpeed = 1.0;  // Default is 1, you can increase or decrease it
controls.zoomSpeed = 1.2;  // Increases the zoom responsiveness
controls.enableRotate = true;  // Allow rotation
controls.enableZoom = true;    // Allow zooming
// controls.autoRotate = true;       // Enable auto-rotation
// controls.autoRotateSpeed = 2.0;   // Adjust auto-rotate speed (default is 2)




document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('dblclick', onMouseDoubleClick, false);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '10';
document.body.appendChild(labelRenderer.domElement);


// Tooltip
const labelDiv = document.getElementById("labelDiv");
labelDiv.className = 'tooltip';

// Top Data
const labelBodyContainer = document.createElement('div');
labelBodyContainer.className = 'tooltip-header';
const pApartment = document.createElement('h2');
pApartment.textContent = "1 דירה";
const pFloor = document.createElement('h3');
pFloor.textContent = "קומה 1";
const pModel = document.createElement('h3');
pModel.textContent = "דגם Y.NW";

labelBodyContainer.appendChild(pApartment);
labelBodyContainer.appendChild(pFloor);
labelBodyContainer.appendChild(pModel);

// Icons
const labelIconContainer = document.createElement('div');
labelIconContainer.className = 'tooltip-icons';

const iconItemContainer_1 = document.createElement('div');
iconItemContainer_1.className = 'icon-item';

const pBalcony_icon = document.createElement('img');
pBalcony_icon.src = '/flower.svg'; // Replace with the actual path
pBalcony_icon.alt = 'Balcony icon';
pBalcony_icon.className = 'icon-svg'; // Optional: Add a class for styling

const pBalcony_data = document.createElement('p');
pBalcony_data.textContent = "מרפסת";

iconItemContainer_1.appendChild(pBalcony_icon);
iconItemContainer_1.appendChild(pBalcony_data);

const iconItemContainer_2 = document.createElement('div');
iconItemContainer_2.className = 'icon-item';

const pSize_icon = document.createElement('img');
pSize_icon.src = '/ruler.svg'; // Replace with the actual path
pSize_icon.alt = 'Size icon';
pSize_icon.className = 'icon-svg'; // Optional: Add a class for styling

const pSize_data = document.createElement('p');
pSize_data.textContent = '138 מ"ר';

iconItemContainer_2.appendChild(pSize_icon);
iconItemContainer_2.appendChild(pSize_data);

const iconItemContainer_3 = document.createElement('div');
iconItemContainer_3.className = 'icon-item';

const pBeds_icon = document.createElement('img');
pBeds_icon.src = '/bed.svg'; // Replace with the actual path
pBeds_icon.alt = 'Rooms icon';
pBeds_icon.className = 'icon-svg'; // Optional: Add a class for styling

const pBeds_data = document.createElement('p');
pBeds_data.textContent = "5 חדרים";

iconItemContainer_3.appendChild(pBeds_icon);
iconItemContainer_3.appendChild(pBeds_data);

labelIconContainer.appendChild(iconItemContainer_1);
labelIconContainer.appendChild(iconItemContainer_2);
labelIconContainer.appendChild(iconItemContainer_3);

// Buttons
const buttonItemContainer = document.createElement('div');
buttonItemContainer.className = 'buttons';

// Create Visit Button
const visitButton = document.createElement('button');
visitButton.className = "program-btn";

// Create an img element for the icon
const visitIcon = document.createElement('img');
visitIcon.src = '/plan.svg'; // Replace with actual path to the SVG file
visitIcon.alt = 'Visit Icon';
visitIcon.className = 'icon'; // Optional class for styling

// Append the icon and text to the button
visitButton.appendChild(document.createTextNode(" תוכניות דירה ")); // Add a space before the text
visitButton.appendChild(visitIcon);

// Create Floor Data Button
const floorDataButton = document.createElement('button');
floorDataButton.className = "tour-btn";

// Create an img element for the icon
const tourIcon = document.createElement('img');
tourIcon.src = '/arrow.svg'; // Replace with actual path to the SVG file
tourIcon.alt = 'Tour Icon';
tourIcon.className = 'icon'; // Optional class for styling

// Append the icon and text to the button
floorDataButton.appendChild(document.createTextNode(" סיור ")); // Add a space before the text
floorDataButton.appendChild(tourIcon);

// Append buttons to the DOM (Example)
document.body.appendChild(visitButton);
document.body.appendChild(floorDataButton);

buttonItemContainer.appendChild(visitButton);
buttonItemContainer.appendChild(floorDataButton);

labelDiv.appendChild(labelBodyContainer);
labelDiv.appendChild(labelIconContainer);
labelDiv.appendChild(buttonItemContainer);


var visitUrl = "https://example.com/visit";
var tourUrl = "https://example.com/tour";

let data;

let active_apartment = {
  apartment_id: "",
  rooms: "",
  Model: "",
  Floor: "",
  size: "",
  balcony: "",
  availability: "",
  floorplan_url: "",
  tour_url: ""
};
let isSelected = false;
let isDragging = false;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 49) {
        window.selectApartment(1);
    } else if (keyCode == 50) {
        window.selectApartment(2);
    } else if (keyCode == 51) {
        window.selectApartment(3);
    } else if (keyCode == 52) {
        window.selectApartment(4);
    } else if (keyCode == 53) {
        window.selectApartment(5);
    }
}

const ktx2Loader = new KTX2Loader()
    .setTranscoderPath('jsm/libs/basis/')
    .detectSupport(renderer);

const loader = new GLTFLoader(loadingManager);
loader.setCrossOrigin('anonymous');
loader.setKTX2Loader(ktx2Loader);
loader.setMeshoptDecoder(MeshoptDecoder);

const building = urlParams.get('building');
const load_model = urlParams.get('load_model');
if(load_model==1){
  if (building == "0") {
      loader.load('./house7.glb', function (gltf) {
          model = gltf.scene;
          model.position.set(0, -0.1, 0);
          model.scale.set(0.1, 0.1, 0.1);
          model.traverse(function (obj) { obj.frustumCulled = false; });
          scene.add(model);

          Papa.parse("./data.csv", {
              delimiter: "",
              newline: "",
              download: true,
              header: true,
              complete: function (results) {
                  data = results.data;
                  setData();
              }
          });
      }, undefined, function (e) {
          console.error(e);
      });
  } else if (building == "1") {
      loader.load('./scene_newBuilding_v2.glb', function (gltf) {
          model = gltf.scene;
          model.position.set(0, -0.1, 0);
          model.scale.set(0.1, 0.1, 0.1);
          model.traverse(function (obj) { obj.frustumCulled = false; });
          scene.add(model);

          Papa.parse("./datav2.csv", {
              delimiter: "",
              newline: "",
              download: true,
              header: true,
              complete: function (results) {
                  data = results.data;
                  setData();
              }
          });
      }, undefined, function (e) {
          console.error(e);
      });
  } else if (building == "2") {
    loader.load('./scene_building_prod_v6.glb', function (gltf) {
        model = gltf.scene;
        model.position.set(0, -0.1, 0);
        model.scale.set(0.1, 0.1, 0.1);
        model.traverse(function (obj) { obj.frustumCulled = false; });
        scene.add(model);

        Papa.parse("./data_prod_updated.csv", {
            delimiter: "",
            newline: "",
            download: true,
            header: true,
            complete: function (results) {
                data = results.data;
                setData();
            }
        });
    }, undefined, function (e) {
        console.error(e);
    });
  } else if (building == "3") {
    loader.load('./scene_building_prod_v5.glb', function (gltf) {
        model = gltf.scene;
        model.position.set(0, -0.1, 0);
        model.scale.set(0.1, 0.1, 0.1);
        model.traverse(function (obj) { obj.frustumCulled = false; });
        scene.add(model);

        Papa.parse("./data_prod_updated.csv", {
            delimiter: "",
            newline: "",
            download: true,
            header: true,
            complete: function (results) {
                data = results.data;
                setData();
            }
        });
    }, undefined, function (e) {
        console.error(e);
    });
  } else if (building == "4") {
    loader.load('./building.glb', function (gltf) {
        model = gltf.scene;
        model.position.set(0, -0.1, 0);
        model.scale.set(0.1, 0.1, 0.1);
        model.traverse(function (obj) { obj.frustumCulled = false; });
        scene.add(model);

        Papa.parse("./data_prod_updated.csv", {
            delimiter: "",
            newline: "",
            download: true,
            header: true,
            complete: function (results) {
                data = results.data;
                setData();
            }
        });
    }, undefined, function (e) {
        console.error(e);
    });
  }else {
    loader.load('./ExportV6.glb', function (gltf) {
        model = gltf.scene;
        model.position.set(0, -0.1, 0);
        model.scale.set(0.1, 0.1, 0.1);
        model.traverse(function (obj) { obj.frustumCulled = false; });
        scene.add(model);

        Papa.parse("./data_prod_updated_v2.csv", {
            delimiter: "",
            newline: "",
            download: true,
            header: true,
            complete: function (results) {
                data = results.data;
                setData();
            }
        });
    }, undefined, function (e) {
        console.error(e);
    });
  }
  }

// Get the compass needle element
// const compassNeedle = document.getElementById("compass-needle");

// Helper function to calculate the angle between the camera's direction and the North
// function getCameraCompassAngle() {
//   const cameraDirection = new THREE.Vector3();
//   camera.getWorldDirection(cameraDirection);

//   // Calculate the angle in the XZ plane
//   const angle = Math.atan2(cameraDirection.x, cameraDirection.z); // Yaw angle in radians
//   let degrees = THREE.MathUtils.radToDeg(angle); // Convert to degrees

//   if (degrees < 0) {
//     degrees = 360 + degrees; // Normalize to 0-360 range
//   }

//   return degrees;
// }

// Update compass needle based on camera's world direction
// function updateCompass() {
//   const compassAngle = getCameraCompassAngle(); // Get compass angle

//   compassNeedle.style.transform = `rotate(${-compassAngle}deg)`; // Rotate needle (invert direction)
// }

// Event listener for mouse clicks
document.addEventListener('click', onDocumentMouseClick, false);

function onDocumentMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with the arrows
  const intersects = raycaster.intersectObjects(arrows.map(a => a.line));  // Use the line geometry for detection

  if (intersects.length > 0) {
      const intersectedArrow = intersects[0].object;

      // Rotate the camera based on the clicked arrow's direction
      if (intersectedArrow === eastArrow.line) {
          rotateCameraToDirection(2);  // East
      } else if (intersectedArrow === northArrow.line) {
          rotateCameraToDirection(0);  // North
      } else if (intersectedArrow === southArrow.line) {
          rotateCameraToDirection(3);  // South
      } else if (intersectedArrow === westArrow.line) {
          rotateCameraToDirection(-2);  // West
      }
  }
}

// Function to rotate the camera smoothly to the target direction
function rotateCameraToDirection(direction) {
  resetTargetAngle = direction; // Set the target angle to 0 (North)
  isResetting = true;   // Start the reset process
}

function animate() {
  if (loading)
      return;

  if (smoothReset) doSmoothReset();

  if (isResetting) smoothResetCamera();

  camera.updateMatrixWorld();
  var vec = new THREE.Vector3(); // create once and reuse
  var pos = new THREE.Vector3(); // create once and reuse

  vec.set(
      (200 / window.innerWidth) * 2 - 1,
      -(200 / window.innerHeight) * 2 + 1,
      0.5,
  );

  vec.unproject(camera);

  vec.sub(camera.position).normalize();

  var distance = -camera.position.z / vec.z;

  pos.copy(camera.position).add(vec.multiplyScalar(distance));

  // Update the compass needle based on camera rotation
  // updateCompass();

  setData();

  model.castShadow = true;
  model.receiveShadow = true;

  renderer.render(scene, camera);
  controls.update(); 
  composer.render();
  labelRenderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
};




function setData() {
    model.traverse((item) => {
        if (item.isMesh) {

          if (item.material) {
            const material = item.material;
    


            item.material.envMap = scene.environment;  // Apply environment map
            // item.material.envMapIntensity = 1;          // Control reflection intensity
            item.material.needsUpdate = true;           // Ensure the material updates

            // material.envMap = exrCubeRenderTarget;
          }
            if (item.name.includes("apart")) {
                // console.log(item.name);
                for (let i = 0; i < data.length; i++) {
                    if (item.name.replace('apartment_', '') == data[i].apartment_id) {
                        let baseMaterial;
                        if (data[i].availability == "available") {
                            baseMaterial = new THREE.MeshPhysicalMaterial({
                                color: new THREE.Color("rgb(90, 130, 255)"),
                                metalness: 0,
                                roughness: 1,
                                transparent: true,
                                opacity: 0.1
                            });
                        } else {
                            baseMaterial = new THREE.MeshPhysicalMaterial({
                                color: new THREE.Color("rgb(255, 90, 130)"),
                                metalness: 0,
                                roughness: 1,
                                transparent: true,
                                opacity: 0.1
                            });
                        }

                        // Create outline mesh and add it to the scene
                        // let outlineMaterial = createOutlineMaterial();
                        // let outlineMesh = new THREE.Mesh(item.geometry, outlineMaterial);
                        // outlineMesh.scale.multiplyScalar(1.05);
                        // scene.add(outlineMesh);

                        item.material = baseMaterial;
                    }
                }
            }
        }
    });

    //console.log("loaded");
    loading = false;
}


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// SHADOWS
const light = new THREE.RectAreaLight(0xffffff, 5, 10, 10);
light.position.set(5, 5, 5);
light.lookAt(0, 0, 0);
scene.add(light);



let labelSet = false;

function onMouseMove(event) {
  if (loading || isDragging)
    return;
  // //console.log(smoothReset)
  mousePointer = getMouseVector2(event, window);
  mouseMoved = true
  const getFirstValue = true;

  model.traverse((item) => {
    if (item.isMesh) {
      if (item.name.includes("apart")) {
        if (item.userData.isSelected != true) {
          item.material.transparent = true;
          item.material.opacity = 0.3;
        }
      }
    }
  });

  const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue, false);
  let active = false;
  removeOutlines(outlinePassHover);
  if (intersections) {
    for (let i = 0; i < data.length; i++) {
      if (intersections.object.name.replace('apartment_', '') === data[i].apartment_id.toString()) {
        addOutlinesBasedOnIntersections_hover(intersections.object, outlinePassHover);
        ////console.log(data[i])
        pApartment.textContent = "דירה " + data[i].apartment_id;
        pBeds_data.textContent = "חדרים: " + data[i].rooms;
        pModel.textContent = "דגם " + data[i].Model;
        pFloor.textContent = "קומה: " + data[i].Floor;
        pSize_data.textContent = "מ״ר " + data[i].size;
        pBalcony_data.textContent = "מרפסת " + data[i].balcony;
        // pAvailable.textContent = "Status: " + data[i].availability;
        labelDiv.className = "tooltip show"
        active = true;
        
        visitUrl = data[i].floorplan_url;
        tourUrl = data[i].tour_url;
      }
    }
  } else if (isSelected) {
    pApartment.textContent = "דירה " + active_apartment.apartment_id;
    pBeds_data.textContent = "חדרים: " + active_apartment.rooms;
    pModel.textContent = "דגם " + active_apartment.Model;
    pFloor.textContent = "קומה: " + active_apartment.Floor;
    pSize_data.textContent = "מ״ר " + active_apartment.size;
    pBalcony_data.textContent = "מרפסת " + active_apartment.balcony;
    // pAvailable.textContent = "Status: " + active_apartment.availability;
    labelDiv.className = "tooltip show"
    
    visitUrl = active_apartment.floorplan_url;
    tourUrl = active_apartment.tour_url;
  } else if (!active && !isSelected) {
    labelDiv.className = "tooltip hide"
  } 

}

var targetAngle;
var smoothReset = false;

window.loadBuilding = function (files){

  console.log("Building = "+files.glb);
  console.log("Data = "+files.csv);

  loader.load(files.glb, function (gltf) {

    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(0.1, 0.1, 0.1);
    scene.add(model);
  
  
    Papa.parse(files.csv, {
      delimiter: "",
      newline: "",
      download: true,
      header: true,
      complete: function (results) {
        //console.log(results);
        data = results.data;
        setData();
      }
  
    })
  
  
  }, undefined, function (e) {
  
    console.error(e);
  
  });


}

window.closeApartment = function(){

  if (loading)
    return;
  
  removeOutlines(outlinePass);
}

window.selectApartment = function (num) {

  if (loading)
    return;
  model.traverse((item) => {
    if (item.isMesh) {
      if (item.name.includes("apart")) {
        let active = false;
        let i = num - 1;

        if (item.userData.isSelected) {
          item.userData.isSelected = false;
          isSelected = false;
        }

        if (item.name.replace('apartment_', '') === data[i].apartment_id.toString()) {
          isSelected = true;
          item.userData.isSelected = true;
          item.material.transparent = true;
          item.material.opacity = 0.9;

          addOutlinesBasedOnIntersections2(item, outlinePass);
          pApartment.textContent = "דירה " + data[i].apartment_id;
          pBeds_data.textContent = "חדרים: " + data[i].rooms;
          pModel.textContent = "דגם: " + data[i].Model;
          pFloor.textContent = "קומה: " + data[i].Floor;
          pSize_data.textContent = "מ״ר " + data[i].size;
          pBalcony_data.textContent = "מרפסת " + data[i].balcony;
          // pAvailable.textContent = "Status: " + data[i].availability;
          labelDiv.className = "tooltip show"

          active_apartment.apartment_id = data[i].apartment_id;
          active_apartment.rooms = data[i].rooms;
          active_apartment.Model = data[i].Model;
          active_apartment.Floor = data[i].Floor;
          active_apartment.size = data[i].size;
          active_apartment.balcony = data[i].balcony;
          active_apartment.availability = data[i].availability;
          active_apartment.floorplan_url = data[i].floorplan_url;
          active_apartment.tour_url = data[i].tour_url;

          visitUrl = data[i].floorplan_url;
          tourUrl = data[i].tour_url;

          active = true;
          
          // Set the camera's target based on the origin point
          smoothReset = true;

        }
      }
    }


  });

}

function calculateAngleBetweenVectors(a, b) {
  return Math.acos(a.dot(b) / (a.length() * b.length()))
}

function radiansToDegrees(radians) {
  return radians * 180 / Math.PI
}

let mouseMoved = false;

function onMouseDown(event) {

  if (loading)
    return;
  mouseMoved = false;
  isDragging = true;

}

function onMouseUp(event) {

  if (loading)
    return;

  isDragging = false;

  if (mouseMoved) {
    mouseMoved = false
    return;
  }
  mouseMoved = false
  mousePointer = getMouseVector2(event, window);

  const getFirstValue = true;
  const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue, true);

  if (!intersections)
    return;
  if (!intersections.object.name.includes("apart"))
    return;
  addOutlinesBasedOnIntersections(intersections, outlinePass);
  var center = new THREE.Vector3();

  if (parent) {
    let concat = intersections.object.name.replace('apartment_', '')
    parent.selectApartment(concat);
  }

  intersections.object.geometry.boundingBox.getCenter(center);
  intersections.object.localToWorld( center );
  ////console.log(intersections.object)
  center = new THREE.Vector3(intersections.object.position.x, intersections.object.position.y, intersections.object.position.z);
  //center = center.normalize()
  smoothReset = true;


  // const xDist = center.x;
  // const zDist = center.z;
  // const angle = -Math.atan2(center.x, center.y);


  var dir = new THREE.Vector3();
  dir = dir.angleTo(center)

  if (center.x >= 0 && center.z >= 0) {
    targetAngle = 1.2;
  } else if (center.x >= 0 && center.z < 0) {
    targetAngle = 2.2;
  } else if (center.x < 0 && center.z >= 0 && center.z < 0.5) {
    targetAngle = -1.6;
  } else if (center.x < 0 && center.z >= 0.8) {
    targetAngle = -0.7;
  } else if (center.x < 0 && center.z < 0) {
    targetAngle = -2.2;
  }

  return
}

function onMouseDoubleClick(event) {

  if (loading || isDragging)
    return;


  model.traverse((item) => {
    if (item.isMesh) {
      if (item.name.includes("apart") && item.name.includes(active_apartment.apartment_id)) {
          item.userData.isSelected = false;
          isSelected = false;
          isDragging = false;
          active_apartment.apartment_id = null;
          active_apartment.rooms = null;
          active_apartment.Model = null;
          active_apartment.Floor = null;
          active_apartment.size = null;
          active_apartment.balcony = null;
          active_apartment.availability = null;
          removeOutlines(outlinePass);
      }
    }
  });

  resetTargetAngle = 0; // Set the target angle to 0 (North)
  isResetting = true;   // Start the reset process

}

let minA = controls.minAzimuthAngle;
let maxA = controls.maxAzimuthAngle


let resetTargetAngle = 0; // Target yaw angle to reset the camera to (North)
let isResetting = false;  // Flag to indicate if resetting is in progress

// // Event listener to start the smooth reset when the compass is clicked
// document.getElementById("compass-container").addEventListener("click", function () {
//     resetTargetAngle = 0; // Set the target angle to 0 (North)
//     isResetting = true;   // Start the reset process
// });


visitButton.addEventListener('click', function() {
  const iframe = document.getElementById('iframePopup');
  iframe.src = visitUrl;
  

  const modal = new bootstrap.Modal(document.getElementById('iframeModal'));
  modal.show();
});


floorDataButton.addEventListener('click', function() {
  const iframe = document.getElementById('iframePopup');
  iframe.src = tourUrl;
  
  const modal = new bootstrap.Modal(document.getElementById('iframeModal'));
  modal.show();
});

// Smoothly reset the camera's rotation
function smoothResetCamera() {
  if (!isResetting) return;

  // Get the current azimuthal angle (yaw) of the camera
  let currentAngle = controls.getAzimuthalAngle();

  // Smoothly interpolate between current angle and target angle (0) using lerp
  let newAngle = THREE.MathUtils.lerp(currentAngle, resetTargetAngle, 0.05);

  // Set the new camera rotation
  controls.minAzimuthAngle = newAngle;
  controls.maxAzimuthAngle = newAngle;
  controls.update();

  // If the angle is close enough to the target, stop resetting
  if (Math.abs(newAngle - resetTargetAngle) < 0.01) {
      isResetting = false; // Stop the reset process
      controls.minAzimuthAngle = -Infinity; // Reset the limits
      controls.maxAzimuthAngle = Infinity;
      controls.update();
  }
}

function doSmoothReset() {

function lerp(start, end, t) {
  return start + t * (end - start);
}


var alpha = controls.getAzimuthalAngle();


controls.minAzimuthAngle = lerp(alpha, targetAngle, 0.1);
controls.maxAzimuthAngle = controls.minAzimuthAngle;
controls.update();


const tolerance = 0.01;
if (Math.abs(alpha - targetAngle) < tolerance) {
  alpha = targetAngle;
  smoothReset = false;

  controls.minAzimuthAngle = Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.update();
}

if (Math.abs(alpha - 0.5) < tolerance) {
  onStart();
}
}

function onStart(event) {
  controls.minAzimuthAngle = minA;
  controls.maxAzimuthAngle = maxA;
  smoothReset = false;
  // controls.update()animate
}
