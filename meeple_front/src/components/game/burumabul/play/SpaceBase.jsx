import React from "react";

const SpaceBase = ({ position, color, visible, width, height, depth }) => {
  return (
    <mesh position={position} visible={visible}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

export default SpaceBase;
