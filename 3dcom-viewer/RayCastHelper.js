import * as THREE from 'three';

export function getMouseVector2(event, window) {
    let mousePointer = new THREE.Vector2()

    mousePointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    return mousePointer;
}

export function checkRayIntersections(mousePointer, camera, raycaster, scene, getFirstValue, click) {
    raycaster.setFromCamera(mousePointer, camera);


    let intersections = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersections.length; i++) {

        if (intersections[i].object.name.includes("apart")) {
            if (click) {
           //     console.log(intersections[i].object.position)

                return intersections[i]
            }
            else{
                intersections[i].object.material.opacity = 0.4;
                return intersections[i]
            }


        }

    }


    intersections = getFirstValue ? intersections[0] : intersections;

    //return intersections;
}