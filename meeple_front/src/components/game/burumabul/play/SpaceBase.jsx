import React from "react";

const SpaceBase = ({ position, color, visible }) => {
  const adjustedPosition = [position[0], position[1] + 0.3, position[2]]; // y축을 살짝 띄움
  const size = [1, 1.5, 0.6];
  return (
    <mesh position={adjustedPosition} visible={visible}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

export default SpaceBase;
