import './style.css';
import * as THREE from 'three';

import { OrbitControls } from './OrbitControls.js';
import { checkRayIntersections, getMouseVector2 } from './RayCastHelper.js';
import { RoomEnvironment } from './RoomEnvironment.js';

import { GLTFLoader } from './GLTFLoader.js';
import { DRACOLoader } from './DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

import { lerp } from 'three/src/math/MathUtils.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Papa from 'papaparse';
import { EffectComposer, RenderPass, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { getOutlineEffect, configureOutlineEffectSettings_Default, addOutlinesBasedOnIntersections, addOutlinesBasedOnIntersections2, removeOutlines } from './OutlineHelper.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let loading = true;

const scene = new THREE.Scene();

new RGBELoader().load('bg_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Adding tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;

container.appendChild(renderer.domElement);

let composer = new EffectComposer(renderer);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
let model;

scene.background = new THREE.Color(0xefefef);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture;

let mousePointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100); // Adjust near and far clipping planes
camera.position.set(4, 8, 2);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
let outlinePass = getOutlineEffect(window, scene, camera);
configureOutlineEffectSettings_Default(outlinePass);
composer.addPass(outlinePass);
const gammaCorrection = new ShaderPass(GammaCorrectionShader);
composer.addPass(gammaCorrection);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.5, 0);
controls.update();
controls.enablePan = true;
controls.enableDamping = false;

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

const labelDiv = document.getElementById("labelDiv");
labelDiv.className = 'tooltip';
// labelDiv.style.marginTop = '-1em';

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

{/* <button type="button" class="btn btn-lg btn-outline-danger">
                <i class="fa fa-bug"></i> Report Bug
            </button> */}

const visitButton = document.createElement('button');
visitButton.className = "program-btn";
visitButton.textContent = "תוכניות דירה";

const floorDataButton = document.createElement('button');
floorDataButton.className = "tour-btn";
floorDataButton.textContent = "סיור";

buttonItemContainer.appendChild(visitButton);
buttonItemContainer.appendChild(floorDataButton);

labelDiv.appendChild(labelBodyContainer);
labelDiv.appendChild(labelIconContainer);
labelDiv.appendChild(buttonItemContainer);


var visitUrl = "https://example.com/visit";
var tourUrl = "https://example.com/tour";

// const pApartment = document.createElement('p');
// pApartment.textContent = "1";
// labelDiv.appendChild(pApartment);

// const pRooms = document.createElement('p');
// pRooms.textContent = "1";
// labelDiv.appendChild(pRooms);

// const pModel = document.createElement('p');
// pModel.textContent = "A";
// labelDiv.appendChild(pModel);

// const pFloor = document.createElement('p');
// pFloor.textContent = "Testing";
// labelDiv.appendChild(pFloor);

// const pSize = document.createElement('p');
// pSize.textContent = "Testing";
// labelDiv.appendChild(pSize);

// const pBalcony = document.createElement('p');
// pBalcony.textContent = "Testing";
// labelDiv.appendChild(pBalcony);

// const pAvailable = document.createElement('p');
// pAvailable.textContent = "";
// labelDiv.appendChild(pAvailable);

// const label = new CSS2DObject(labelDiv);
// label.visible = true;
// label.frustumCulled = false; // Disable frustum culling
// scene.add(label);
let data;
let hover;

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
let cameraDistance;


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

const loader = new GLTFLoader();
loader.setCrossOrigin('anonymous');
loader.setKTX2Loader(ktx2Loader);
loader.setMeshoptDecoder(MeshoptDecoder);

const urlParams = new URLSearchParams(window.location.search);
const building = urlParams.get('building');

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
} else {
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
}


// Get the compass needle element
const compassNeedle = document.getElementById("compass-needle");

// Helper function to calculate the angle between the camera's direction and the North
function getCameraCompassAngle() {
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);

  // Calculate the angle in the XZ plane
  const angle = Math.atan2(cameraDirection.x, cameraDirection.z); // Yaw angle in radians
  let degrees = THREE.MathUtils.radToDeg(angle); // Convert to degrees

  if (degrees < 0) {
    degrees = 360 + degrees; // Normalize to 0-360 range
  }

  return degrees;
}

// Update compass needle based on camera's world direction
function updateCompass() {
  const compassAngle = getCameraCompassAngle(); // Get compass angle

  compassNeedle.style.transform = `rotate(${-compassAngle}deg)`; // Rotate needle (invert direction)
}

function isLabelVisible() {
  var frustum = new THREE.Frustum();
  var cameraViewProjectionMatrix = new THREE.Matrix4();

  camera.updateMatrixWorld(); // Ensure the camera's world matrix is up-to-date
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert(); // Invert the camera's world matrix
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  // Return true if the label is inside the camera's frustum (should be visible)
  return frustum.containsPoint(label.position);
}

function updateLabelPosition() {
  var vector = new THREE.Vector3(); // Create a new vector for label position
  var canvas = renderer.domElement; // The canvas you're rendering on

  // Get the object's world position
  label.getWorldPosition(vector);

  // Project the object's position into screen space
  vector.project(camera);

  // Calculate the label's screen position
  var x = (vector.x * 0.5 + 0.5) * canvas.width;
  var y = -(vector.y * 0.5 - 0.5) * canvas.height;

  // Update the label's CSS position to match the 3D position
  labelDiv.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  labelDiv.style.display = "block"; // Ensure the label is always visible
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
  cameraDistance = distance;

  pos.copy(camera.position).add(vec.multiplyScalar(distance));
  // label.position.set(pos.x, pos.y, pos.z);

  // Update the compass needle based on camera rotation
  updateCompass();

  // Check if the label is visible
  // label.visible = isLabelVisible();
  // updateLabelPosition();

  renderer.render(scene, camera);
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
            if (item.name.includes("apart")) {
                //console.log(item.name);
                for (let i = 0; i < data.length; i++) {
                    if (item.name.replace('apartment_', '') == data[i].apartment_id) {
                        let baseMaterial;
                        if (data[i].availability == "available") {
                            baseMaterial = new THREE.MeshStandardMaterial({
                                color: new THREE.Color("rgb(15, 175, 198)"),
                                metalness: 0,
                                roughness: 0.2,
                                transparent: true,
                                opacity: 0.15
                            });
                        } else {
                            baseMaterial = new THREE.MeshStandardMaterial({
                                color: new THREE.Color("rgb(255, 36, 154)"),
                                metalness: 0,
                                roughness: 0.2,
                                transparent: true,
                                opacity: 0.15
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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

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
          item.material.opacity = 0.15;
        }
      }
    }
  });

  const intersections = checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue, false);
  let active = false;
  if (intersections) {
    for (let i = 0; i < data.length; i++) {
      if (intersections.object.name.replace('apartment_', '') === data[i].apartment_id.toString()) {
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
          item.material.opacity = 0.38;

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

// Event listener to start the smooth reset when the compass is clicked
document.getElementById("compass-container").addEventListener("click", function () {
    resetTargetAngle = 0; // Set the target angle to 0 (North)
    isResetting = true;   // Start the reset process
});

// Dynamically add a URL to the visit button
visitButton.addEventListener('click', function() {
  window.open(visitUrl, '_blank'); // Use dynamic variable
});


// // Dynamically add a URL to the floor tour button
// floorDataButton.addEventListener('click', function() {
//   window.location.href = tourUrl; // Use dynamic variable
// });

// Add the event listener to open the modal when the button is clicked
floorDataButton.addEventListener('click', function() {
  // Set the iframe source dynamically (replace with your actual URL)
  const iframe = document.getElementById('iframePopup');
  iframe.src = tourUrl; // Set the URL you want in the iframe
  
  // Trigger the Bootstrap modal
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
// Function for linear interpolation
function lerp(start, end, t) {
  return start + t * (end - start);
}

// Get current azimuthal angle
var alpha = controls.getAzimuthalAngle();

// Smooth change using manual lerp
controls.minAzimuthAngle = lerp(alpha, targetAngle, 0.1);
controls.maxAzimuthAngle = controls.minAzimuthAngle;
controls.update();

// Check if current angle is close enough to the target angle
const tolerance = 0.01; // Define a tolerance for floating-point comparison
if (Math.abs(alpha - targetAngle) < tolerance) {
  alpha = targetAngle; // Snap to target angle
  smoothReset = false;

  controls.minAzimuthAngle = Infinity;
  controls.maxAzimuthAngle = Infinity;
  controls.update();
}

// Check if we need to exit smooth reset
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
