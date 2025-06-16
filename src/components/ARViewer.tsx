import { useEffect, useRef } from "react";
import * as THREE from "three";

declare global {
  interface Window {
    ARjs: any;
  }
}

export default function ARViewer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.Camera;
    let arSource: any;
    let arContext: any;
    // let arMarkerControls: any;
    let cube: THREE.Mesh;

    scene = new THREE.Scene();
    camera = new THREE.Camera();
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color("lightgrey"), 0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "50%";
    renderer.domElement.style.left = "50%";
    renderer.domElement.style.transform = "translate(-50%, -50%)";

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // khởi tạo AR.js Sourse, lấy webcam làm nguồn chính
    arSource = new window.ARjs.Source({
      sourceType: "webcam", // dùng webcam làm input
    });

    arSource.init(() => {
      setTimeout(() => {
        onResize();
      }, 2000);
    });

    function onResize() {
      if (!arSource) return;
      arSource.onResizeElement();
      arSource.copyElementSizeTo(renderer.domElement);
      if (arContext && arContext.arController !== null) {
        arSource.copyElementSizeTo(arContext.arController.canvas);
      }
    }

    const onResizeHandler = () => {
      onResize();
    };

    window.addEventListener("resize", onResizeHandler);

    arContext = new window.ARjs.Context({
      cameraParametersUrl:
        "https://raw.githack.com/AR-js-org/AR.js/master/data/data/camera_para.dat",
      detectionMode: "mono",
    });

    arContext.init(() => {
      camera.projectionMatrix.copy(arContext.getProjectionMatrix());
    });

    // arMarkerControls = new window.ARjs.MarkerControls(arContext, camera, {
    //   type: "pattern",
    //   patternUrl:
    //     "https://raw.githack.com/AR-js-org/AR.js/master/data/data/patt.hiro",
    //   changeMatrixMode: "cameraTransformMatrix",
    // });

    scene.visible = false;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.5,
    });
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.5;
    scene.add(cube);

    const tick = () => {
      requestAnimationFrame(tick);

      if (arSource.ready === false) return;

      arContext.update(arSource.domElement);
      scene.visible = camera.visible;

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", onResizeHandler);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100vw", height: "100vh" }}
    />
  );
}
