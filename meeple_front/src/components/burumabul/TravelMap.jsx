import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Canvas, render, useThree, useFrame, useLoader, } from "@react-three/fiber"
import { Center, OrbitControls, RoundedBox, Text, Edges } from "@react-three/drei";
import Dice from "./Dice"
import { TextureLoader, BoxGeometry } from "three";
import spaceBackground from "../../assets/burumabul_images/space.jpg"

import earthTexture from "../../assets/burumabul_images/earth.jpg"
import marsTexture from "../../assets/burumabul_images/mars.jpg"


const Cell = ({ position, isHighlight, name, textureUrl, topTextureUrl }) => {
  const textRef = useRef();
  const { camera } = useThree();

  // TextureLoader로 텍스쳐 로드
  const texture = textureUrl ? useLoader(TextureLoader, textureUrl) : null ;
  const topTexture = topTextureUrl ? useLoader(TextureLoader, topTextureUrl) : null ;

  useFrame(() => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <mesh position={position}>
      {/* 셀 박스 + 둥근 직육면체 */}
      <boxGeometry args={[1.5, 0.2, 1.4]} />
      {/* 각 면의 텍스처 및 색상 설정 */}
      <meshStandardMaterial color={isHighlight ? "#ff6b6b" : "white"} />

      <Edges
        scale={1}
        threshold={15} // 모서리 표시 임계값
        color="black"
      />

      {/* 윗면에만 텍스쳐 적용 */}
      {topTexture && (
        <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 1.4]} />
          <meshStandardMaterial
            map={topTexture}
            transparent={true}
          />
        </mesh>
      )}




      {/* 셀 이름 */}
      <Text
        ref={textRef}
        position={[0, 0.8, 0]} // 박스 위에 텍스트 표시
        fontSize={0.2}
        color="gray"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </mesh>
  )
}


const TravelMap = () => {
  // cities 배열
  const cities = [
    "지구 Start", "화성", "텔레파시 카드", "목성", "토성", "뉴런의 골짜기", "천왕성", "텔레파시 카드", "해왕성", "명왕성",
    "타임머신", "궁수자리", "물병자리", "텔레파시 카드", "쌍둥이 자리", "직녀성", "시리우스", "UFO", "헤라클레스 자리", "카시오페아 자리",
    "공포의 블랙홀", "백조자리", "처녀자리", "텔레파시 카드", "천칭자리", "뉴런의 골짜기", "오리온 자리", "전갈 자리", "큰곰자리",
    "텔레파시 카드", "우주조난기지", "황소자리", "사자자리", "텔레파시 카드", "안드로메다 자리", "견우성", "페가수스 자리", "헬리 혜성", "수성", "금성",
  ];

  
  const size = 11; // 각 변의 칸 수
  const totalCells = size * 4 - 4; // 전체 칸 개수
  const cells = Array.from({ length: totalCells }, (_, i) => i); // 칸 번호
  const [currentPosition, setCurrentPosition] = useState(0); // 현재 말 위치
  const [isFirstMove, setIsFirstMove] = useState(true)
  const [showModal, setShowModal] = useState(false);

  // 주사위 점수 저장
  const [totalScore, setTotalScore] = useState(0);

  const handleDiceComplete = (score) => {
    setTotalScore(score); //점수 업데이트
    setShowModal(false);
  }

  // 칸 스타일
  const cellClass =
    "flex justify-center items-center border border-gray-400 text-xs h-20 w-20 bg-white relative";

  // 보드판 스타일
  const boardClass = "flex flex-col";

  // 말 이동 함수
  const moveToken = () => {
    setCurrentPosition((prev) => {
      setIsFirstMove(false);
      return (prev + 1) % totalCells;
    });
  };


  // 칸별 내용 생성
  const renderCells = () => {
    const positions = [];
    const step = 1.495;
    const centerOffset = (size - 1) * step / 2; // 중심 좌표 계산

    let x = -centerOffset;
    let z = -centerOffset;

    const topTextures = [
      earthTexture, marsTexture
    ]

    for (let i = 0; i < size -1; i++) positions.push([x + i * step, 0, z]);
    for (let i = 0; i < size - 1; i++) positions.push([x + (size - 1) * step, 0, z + i * step]);
    for (let i = 0; i < size - 1; i++) positions.push([x + (size - 1 - i) * step, 0, z + (size - 1) * step]);
    for (let i = 0; i < size - 1; i++) positions.push([x, 0, z + (size - 1 - i) * step]);

    return positions.map((pos, index) => (
      <Cell 
        key={index} 
        position={pos} 
        isHighlight={index === currentPosition} 
        name={cities[index]}
        topTextureUrl = {topTextures[index]} />

    ))
  };


  const rollDice = () => {
    setShowModal(true);
  }

  return (
    <>
      <div style={{
          display: "flex", 
          justifyContent: "center",
          alignItems: "center"
          }}>
        <div style={{ 
          height: "100vh", 
          width : "80vw",
        }}>
          <Canvas
            camera={{
              position: [0, 15, 25], // 카메라 초기 위치
              fov: 80, // 시야각 조절
            }}
            onCreated={({ scene }) => {
              const texture = new TextureLoader().load(spaceBackground);
              scene.background = texture;
            }}>
            <ambientLight intensity={5} />
            <pointLight position={[10, 10, 10]} intensity={2}/>

            {/* 바닥 생성 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[16.5, 16.5]} />
              <meshStandardMaterial color="#d1d1d1" />
            </mesh>

            {/* OrbitControls로 카메라 이동 및 확대/축소 제어 */}
            <OrbitControls 
              target={[0, 0, 0]} 
              makeDefault
              maxPolarAngle={Math.PI / 2.5} // 위쪽으로 카메라 제한
              minDistance={10} // 최소 줌 거리
              maxDistance={15} // 최대 줌 거리
            />
            {renderCells()}
          </Canvas>
        </div>
      </div>
          {/* 이동 버튼 + 주사위 버튼 */}
          <div className="flex justify-center mb-5">
            <button
              onClick={moveToken}
              className="mt-5 mx-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Move Token
            </button>
            <button 
              onClick={rollDice}
              className="mt-5 mx-3 px-4 py-2 bg-red-300 text-white rounded hover:bg-blue-600"
            >
              Roll the Dice
            </button>
          </div>
          {totalScore !== 0 && (
            <p className="mt-5 text-lg">마지막 주사위 점수 : <strong>{totalScore}</strong></p>
          )}
          {showModal && createPortal(
            <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                <Dice onComplete={handleDiceComplete} onClose={() => setShowModal(false)} />,
            </div>,
            document.body
          )}
    </>
  );
};

export default TravelMap;