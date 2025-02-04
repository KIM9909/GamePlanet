import React, { Suspense, useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const BlueRobot = ({ position, scale = 0.08 }) => {
  const { gl } = useThree();
  const { scene } = useGLTF("/assets/burumabul_robots/BlueRobot.gltf");

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    return cloned.children[0]?.children[0] || cloned.children[0] || cloned;
  }, [scene]);
  useEffect(() => {
    const onContextLost = (event) => {
      console.warn("⚠️ WebGL Context Lost!", event);
      event.preventDefault();
      gl.forceContextRestore(); // 🔄 컨텍스트 복구 시도
    };

    gl.domElement.addEventListener("webglcontextlost", onContextLost);

    return () => {
      gl.domElement.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [gl]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // 기존 재질 유지하면서 조명 영향 조절
        child.material.metalness = 0.1; // 금속성 낮춤
        child.material.roughness = 0.8; // 거칠기 증가
        child.material.envMapIntensity = 0.5; // 환경맵 강도 조절

        // 그림자 설정
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.material) {
          console.log("⚠️ Material 없음! 기본 Material 적용");
          child.material = new THREE.MeshStandardMaterial({ color: "white" });
        }
        if (child.material.map) {
          child.material.map.colorSpace = THREE.SRGBColorSpace;
        }
        child.castShadow = true;
        child.receiveShadow = false;
      }
    });
  }, [clonedScene]);

  return (
    <>
      {/* 조명 추가 */}
      {/* ✅ 그림자 부드럽게 조정 */}
      <pointLight
        position={[position[0], position[1] + 2, position[2]]}
        intensity={2}
        distance={3}
        decay={2}
      />

      <pointLight position={[3, 8, 3]} intensity={1.2} castShadow />

      {/* ✅ 주변광 추가해서 그림자 대비 줄이기 */}
      <hemisphereLight intensity={1} groundColor={"#444"} />
      <primitive
        castShadow
        receiveShadow
        object={clonedScene}
        position={position}
        scale={scale}
      />
    </>
  );
};

export default BlueRobot;
