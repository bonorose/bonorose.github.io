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

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
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

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const labelDiv = document.createElement('div');
labelDiv.className = 'tooltip';
labelDiv.style.marginTop = '-1em';

const pApartment = document.createElement('p');
pApartment.textContent = "1";
labelDiv.appendChild(pApartment);

const pRooms = document.createElement('p');
pRooms.textContent = "1";
labelDiv.appendChild(pRooms);

const pModel = document.createElement('p');
pModel.textContent = "A";
labelDiv.appendChild(pModel);

const pFloor = document.createElement('p');
pFloor.textContent = "Testing";
labelDiv.appendChild(pFloor);

const pSize = document.createElement('p');
pSize.textContent = "Testing";
labelDiv.appendChild(pSize);

const pBalcony = document.createElement('p');
pBalcony.textContent = "Testing";
labelDiv.appendChild(pBalcony);

const pAvailable = document.createElement('p');
pAvailable.textContent = "Testing";
labelDiv.appendChild(pAvailable);

const label = new CSS2DObject(labelDiv);
label.visible = true;
scene.add(label);
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
  loader.load('./scene_building_prod_v2.glb', function (gltf) {
      model = gltf.scene;
      model.position.set(0, -0.1, 0);
      model.scale.set(0.1, 0.1, 0.1);
      model.traverse(function (obj) { obj.frustumCulled = false; });
      scene.add(model);

      Papa.parse("./data_prod.csv", {
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
    label.position.set(pos.x, pos.y, pos.z);

    // Update the compass needle based on camera rotation
    updateCompass();

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
                                opacity: 0.2
                            });
                        } else {
                            baseMaterial = new THREE.MeshStandardMaterial({
                                color: new THREE.Color("rgb(255, 36, 154)"),
                                metalness: 0,
                                roughness: 0.2,
                                transparent: true,
                                opacity: 0.2
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
          item.material.opacity = 0.2;
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
        pApartment.textContent = "Apartment: " + data[i].apartment_id;
        pRooms.textContent = "Rooms: " + data[i].rooms;
        pModel.textContent = "Model: " + data[i].Model;
        pFloor.textContent = "Floor: " + data[i].Floor;
        pSize.textContent = "Size: " + data[i].size + "sqm";
        pBalcony.textContent = "Balcony: " + data[i].balcony;
        pAvailable.textContent = "Status: " + data[i].availability;
        labelDiv.className = "tooltip show"
        active = true;
      }
    }
  }
  else if (!active && !isSelected) {
    labelDiv.className = "tooltip hide"
  } else if (isSelected) {
    pApartment.textContent = "Apartment: " + active_apartment.apartment_id;
    pRooms.textContent = "Rooms: " + active_apartment.rooms;
    pModel.textContent = "Model: " + active_apartment.Model;
    pFloor.textContent = "Floor: " + active_apartment.Floor;
    pSize.textContent = "Size: " + active_apartment.size + " sqm";
    pBalcony.textContent = "Balcony: " + active_apartment.balcony;
    pAvailable.textContent = "Status: " + active_apartment.availability;
    labelDiv.className = "tooltip show"
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
        //label.position.set(0, 0, 0);
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
          item.material.opacity = 0.4;

          addOutlinesBasedOnIntersections2(item, outlinePass);
          ////console.log(data[i])
          pApartment.textContent = "Apartment: " + data[i].apartment_id;
          pRooms.textContent = "Rooms: " + data[i].rooms;
          pModel.textContent = "Model: " + data[i].Model;
          pFloor.textContent = "Floor: " + data[i].Floor;
          pSize.textContent = "Size: " + data[i].size + " sqm";
          pBalcony.textContent = "Balcony: " + data[i].balcony;
          pAvailable.textContent = "Status: " + data[i].availability;
          labelDiv.className = "tooltip show"

          active_apartment.apartment_id = data[i].apartment_id;
          active_apartment.rooms = data[i].rooms;
          active_apartment.Model = data[i].Model;
          active_apartment.Floor = data[i].Floor;
          active_apartment.size = data[i].size;
          active_apartment.balcony = data[i].balcony;
          active_apartment.availability = data[i].availability;

          active = true;
          var center = new THREE.Vector3();
          center = new THREE.Vector3(item.position.x, item.position.y, item.position.z);

          smoothReset = true;

          const angle = Math.atan2(center.z, center.x);

          if (center.x >= 0 && center.z >= 0) {
            targetAngle = 2;
          } else if (center.x >= 0 && center.z < 0) {

            targetAngle = 1.2;

          } else if (center.x < 0 && center.z >= 0) {
            targetAngle = -1.5;
          } else if (center.x < 0 && center.z < 0) {
            targetAngle = -1.2;
          }
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
  var origin = new THREE.Vector3();
  var center = new THREE.Vector3();



  if (parent) {
    //console.log(intersections.object.name);
    let concat = intersections.object.name.replace('apartment_', '')
    //console.log(concat)
    parent.selectApartment(concat);


  }
  //  intersections.object.geometry.boundingBox.getCenter(center);
  //intersections.object.localToWorld( center );
  ////console.log(intersections.object)
  center = new THREE.Vector3(intersections.object.position.x, intersections.object.position.y, intersections.object.position.z);
  //center = center.normalize()


  smoothReset = true;


  const xDist = center.x;
  const zDist = center.z;
  const angle = -Math.atan2(center.x, center.y);


  var dir = new THREE.Vector3();
  dir = dir.angleTo(center)
  // //console.log(center)
  ////console.log(dir)
  // dir.subVectors(new THREE.Vector3(), intersections.geometry.boundingSphere.center);
  //dir = dir.normalize()
  //-1903 17 2
  //-1901  -294 1.2
  //-1106 17 -1.2
  //-1106 -294

  if (center.x >= 0 && center.z >= 0) {
    targetAngle = 2;
  } else if (center.x >= 0 && center.z < 0) {

    targetAngle = 1.2;

  } else if (center.x < 0 && center.z >= 0) {
    targetAngle = -2;
  } else if (center.x < 0 && center.z < 0) {
    targetAngle = -1.2;
  }

  //targetAngle = -2;//  Math.atan(center.x, center.z)



  return

  var dir = new THREE.Vector3();
  //console.log(intersections.geometry.boundingSphere.center)
  dir.subVectors(new THREE.Vector3(), intersections.geometry.boundingSphere.center);
  //console.log(dir.normalize())
  dir = dir.normalize();
  camera.position.x = dir.x * -10;
  camera.position.y = dir.y;
  camera.position.z = dir.z * 10;
  controls.update();


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
  // get current angles
  var alpha = controls.getAzimuthalAngle();



  // smooth change using manual lerp
  controls.minAzimuthAngle = lerp(alpha, targetAngle, 0.1);
  controls.maxAzimuthAngle = controls.minAzimuthAngle;
  controls.update()
  // if they are close to the reset values, just set these values
  if (alpha < targetAngle + 0.01 && alpha > targetAngle - 0.01) {
    alpha = targetAngle;
    smoothReset = false;

    controls.minAzimuthAngle = Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.update()
  }
  // if the reset values are reached, exit smooth reset
  if (alpha == 0.5) onStart()
}

function onStart(event) {
  controls.minAzimuthAngle = minA;
  controls.maxAzimuthAngle = maxA;
  smoothReset = false;
  // controls.update()animate
}
