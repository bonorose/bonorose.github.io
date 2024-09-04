import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

export function getOutlineEffect(window, scene, camera){
    let outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );

    return outlinePass;
}

export function configureOutlineEffectSettings_Default(outlinePass){

    outlinePass.edgeStrength = 10;
    outlinePass.edgeGlow = 0.59;
    outlinePass.edgeThickness = 4;
    outlinePass.pulsePeriod = 5;
    
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#ffff00');

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