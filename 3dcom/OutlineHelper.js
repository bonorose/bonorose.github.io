import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

export function getOutlineEffect(window, scene, camera){
    let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );

    return outlinePass;
}

export function configureOutlineEffectSettings_Default(outlinePass){
    outlinePass.edgeStrength = 5;
    outlinePass.edgeGlow = 0.4;
    outlinePass.edgeThickness = 1;
    outlinePass.pulsePeriod = 0;

    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#ffffff'); // ffff00
}

export function configureOutlineEffectSettings_Hover(outlinePass){
    outlinePass.edgeStrength = 3;
    outlinePass.edgeGlow = 0.2;
    outlinePass.edgeThickness = 1.2;
    outlinePass.pulsePeriod = 0;

    outlinePass.visibleEdgeColor.set('#a0ffa0');
    outlinePass.hiddenEdgeColor.set('#a0ffa0'); // ffff00
}


export function addOutlinesBasedOnIntersections(intersections, outlinePass){

// console.log(intersections)
    outlinePass.selectedObjects = [];

        let firstObject = intersections.object
        //let objectName = firstObject.userData.name;
// console.log(objectName)
        
            outlinePass.selectedObjects = [firstObject];
        
    
}
export function removeOutlines(outlinePass){

outlinePass.selectedObjects = [];
}

export function addOutlinesBasedOnIntersections2(intersections, outlinePass){


        
            outlinePass.selectedObjects = [intersections];
        
    
}

export function addOutlinesBasedOnIntersections_hover(intersections, outlinePass){

        
    outlinePass.selectedObjects = [intersections];

}
