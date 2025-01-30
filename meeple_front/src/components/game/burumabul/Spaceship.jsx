import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Spaceship = ({ position, color }) => {
  const ufoRef = useRef();

  useFrame((state, delta) => {
    // 천천히 회전 애니메이션
    if (ufoRef.current) {
      ufoRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <group
      ref={ufoRef}
      position={[position[0], position[1] + 0.2, position[2]]}
      scale={[0.18, 0.18, 0.18]}
    >
      {/* 메인 바디 */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.2, 64]} />
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* 상단 돔 */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="white"
          emissive="white"
          emissiveIntensity={0.5}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* 창문 (더 자연스럽게 배치) */}
      {[
        [-0.5, 1.7, 0.65],
        [0, 1.7, 0.9],
        [0.5, 1.7, 0.65],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="black"
            emissive="aqua"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* 빔
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[2, 2.5, 32]} />
        <meshStandardMaterial
          color="#90EE90"
          transparent
          opacity={0.7}
          emissive="#90EE90"
          emissiveIntensity={1.5}
          depthWrite={false}
        />
      </mesh> */}
    </group>
  );
};

export default Spaceship;
