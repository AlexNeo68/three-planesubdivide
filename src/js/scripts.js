import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(6, 8, 14);
orbit.update();

// Sets a 12 by 12 gird helper
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

const planeGroundGeo = new THREE.PlaneGeometry(20, 20);
const planeGroundMat = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  visible: false,
});

const planeGroundMesh = new THREE.Mesh(planeGroundGeo, planeGroundMat);
planeGroundMesh.rotateX(-Math.PI / 2);

planeGroundMesh.name = "ground";

scene.add(planeGroundMesh);

const planeHighlightGeo = new THREE.PlaneGeometry(1, 1);
const planeHighlightMat = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  color: 0xff00ff,
  transparent: true,
});

const planeHighlightMesh = new THREE.Mesh(planeHighlightGeo, planeHighlightMat);
planeHighlightMesh.rotateX(-Math.PI / 2);
planeHighlightMesh.position.set(0.5, 0, 0.5);
scene.add(planeHighlightMesh);

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;
const spheres = [];

document.addEventListener("mousemove", function (event) {
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const findSphere = spheres.find(
    (sphere) =>
      sphere.position.x === planeHighlightMesh.position.x &&
      sphere.position.z === planeHighlightMesh.position.z
  );

  raycaster.setFromCamera(mousePosition, camera);
  intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((intersect) => {
    if (intersect.object.name == "ground") {
      const newHighlightPosition = new THREE.Vector3()
        .copy(intersect.point)
        .floor()
        .addScalar(0.5);
      planeHighlightMesh.position.set(
        newHighlightPosition.x,
        0,
        newHighlightPosition.z
      );
      if (findSphere) {
        planeHighlightMesh.material.color.setHex(0xff0000);
      } else {
        planeHighlightMesh.material.color.setHex(0xff00ff);
      }
    }
  });
});

const sphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 4, 2),
  new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0xffff00,
  })
);

document.addEventListener("mousedown", function () {
  intersects.forEach((intersect) => {
    const findSphere = spheres.find(
      (sphere) =>
        sphere.position.x === planeHighlightMesh.position.x &&
        sphere.position.z === planeHighlightMesh.position.z
    );

    if (!findSphere) {
      if (intersect.object.name == "ground") {
        const cloneSphere = sphereMesh.clone();
        cloneSphere.position.copy(planeHighlightMesh.position);
        scene.add(cloneSphere);
        spheres.push(cloneSphere);
      }
      //   planeHighlightMesh.material.color.setHex(0xff00ff);
    }
    planeHighlightMesh.material.color.setHex(0xff0000);
  });
});

function animate(time) {
  planeHighlightMesh.material.opacity = 1 + Math.sin(time / 120);
  spheres.forEach((sphere) => {
    sphere.rotation.x = time / 1000;
    sphere.rotation.z = time / 1000;
    sphere.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
  });
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
