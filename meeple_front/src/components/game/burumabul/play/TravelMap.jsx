import React, { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setGameData,
  addPlayer,
  removePlayer,
  movePlayer,
  handleDiceRoll,
  updateMinusBalance,
  updatePlusBalance,
  nextTurn,
  nextRound,
  changeDice,
} from "../../../../sources/store/slices/BurumabulGameSlice";
// 소켓 사용

import {
  Canvas,
  render,
  useThree,
  useFrame,
  useLoader,
} from "@react-three/fiber";
import { OrbitControls, Text, Edges } from "@react-three/drei";
import Dice from "./Dice";
import { TextureLoader } from "three";
import spaceBackground from "../../../../assets/burumabul_images/space.jpg";

// 셀 topTexture 이미지
import earthTexture from "../../../../assets/burumabul_images/earth.png";
import moonTexture from "../../../../assets/burumabul_images/moon.png";
import telepathyTexture1 from "../../../../assets/burumabul_images/telepathy.png";
import marsTexture from "../../../../assets/burumabul_images/mars.png";
import jupiterTexture from "../../../../assets/burumabul_images/jupiter.png";
import vegaTexture from "../../../../assets/burumabul_images/vega.png";
import saturnTexture from "../../../../assets/burumabul_images/saturn.png";
import uranusTexture from "../../../../assets/burumabul_images/uranus.png";
import neptuneTexture from "../../../../assets/burumabul_images/neptune.png";
import timetravelTexture from "../../../../assets/burumabul_images/timetravel.png";
import ariesTexture from "../../../../assets/burumabul_images/aries.png";
import taurusTexture from "../../../../assets/burumabul_images/taurus.png";
import telepathyTexture2 from "../../../../assets/burumabul_images/telepathy2.png";
import geminiTexture from "../../../../assets/burumabul_images/gemini.png";
import neuronsTexture1 from "../../../../assets/burumabul_images/neurons1.png";
import cancerTexture from "../../../../assets/burumabul_images/cancer.png";
import timemachineTexture from "../../../../assets/burumabul_images/timemachine.png";
import leoTexture from "../../../../assets/burumabul_images/leo.png";
import virgoTexture from "../../../../assets/burumabul_images/virgo.png";
import blackholeTexture from "../../../../assets/burumabul_images/blackhole.png";
import libraTexture from "../../../../assets/burumabul_images/libra.png";
import scorpioTexture from "../../../../assets/burumabul_images/scorpio.png";
import telepathyTexture3 from "../../../../assets/burumabul_images/telepathy3.png";
import sagittariusTexture from "../../../../assets/burumabul_images/sagittarius.png";
import altairTexture from "../../../../assets/burumabul_images/altair.png";
import capricornTexture from "../../../../assets/burumabul_images/capricorn.png";
import aquariusTexture from "../../../../assets/burumabul_images/aquarius.png";
import piscesTexture from "../../../../assets/burumabul_images/pisces.png";
import resquebaseTexture from "../../../../assets/burumabul_images/resquebase.png";
import ursamajorTexture from "../../../../assets/burumabul_images/ursamajor.png";
import andromedaTexture from "../../../../assets/burumabul_images/andromeda.png";
import telepathyTexture4 from "../../../../assets/burumabul_images/telepathy4.png";
import orionTexture from "../../../../assets/burumabul_images/orion.png";
import neuronsTexture2 from "../../../../assets/burumabul_images/neurons2.png";
import cygnusTexture from "../../../../assets/burumabul_images/cygnus.png";
import halleyTexture from "../../../../assets/burumabul_images/halley.png";
import mercuryTexture from "../../../../assets/burumabul_images/mercury.png";
import venusTexture from "../../../../assets/burumabul_images/venus.png";
import floorTexture from "../../../../assets/burumabul_images/floor.png";
import timemachineStop from "../../../../assets/burumabul_images/timemachinestop.png";
import telepathyCard from "../../../../assets/burumabul_images/telepathycard.png";
import neuronsCard from "../../../../assets/burumabul_images/neuronscard.png";
import BlueRobot from "./BlueRobot";
import SpaceBase from "./SpaceBase";
import useBurumabulSocket from "../../../../hooks/useBurumabulSocket";
import { color } from "framer-motion";
import { depth } from "three/tsl";

const Cell = ({
  position,
  isHighlight,
  name,
  textureUrl,
  topTextureUrl,
  size,
}) => {
  const textRef = useRef();
  const { camera } = useThree();

  // TextureLoader로 텍스쳐 로드
  const texture = textureUrl ? useLoader(TextureLoader, textureUrl) : null;
  const topTexture = topTextureUrl
    ? useLoader(TextureLoader, topTextureUrl)
    : null;

  useFrame(() => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  // 특정 셀의 크기 조정

  return (
    <mesh position={position}>
      {/* 셀 박스 = 직육면체 */}
      <boxGeometry args={size} />
      {/* 각 면의 텍스처 및 색상 설정 */}
      <meshStandardMaterial color={isHighlight ? "#ff6b6b" : "white"} />

      <Edges
        scale={1}
        threshold={15} // 모서리 표시 임계값
        color="black"
        thickness={5}
      />

      {/* 윗면에만 텍스쳐 적용 */}
      {topTexture && (
        <mesh
          position={[0, size[1] / 2 + 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[size[0], size[2]]} />
          <meshStandardMaterial
            map={topTexture}
            transparent={true}
            encoding={3000} // sRGB 인코딩 사용
            toneMapped={false} // 톤 매핑 비활성화
          />
        </mesh>
      )}

      {/* 셀 이름 */}
      {/* <Text
        ref={textRef}
        position={[0, size[1] + 0.4, 0]} // 박스 위에 텍스트 표시
        fontSize={0.3}
        color="gray"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text> */}
    </mesh>
  );
};

const TravelMap = ({ onRollDice, onBasesInfo, gameData, roomId }) => {
  // cities 배열
  const cities = [
    "지구 Start",
    "달",
    "텔레파시 카드",
    "화성",
    "목성",
    "직녀성",
    "토성",
    "텔레파시 카드",
    "천왕성",
    "해왕성",
    "시간 여행",
    "양자리",
    "황소자리",
    "텔레파시 카드",
    "쌍둥이 자리",
    "뉴런의 골짜기 카드",
    "게자리",
    "타임머신",
    "사자자리",
    "처녀자리",
    "공포의 블랙홀",
    "천칭자리",
    "전갈자리",
    "텔레파시 카드",
    "궁수자리",
    "견우성",
    "염소자리",
    "물병자리",
    "물고기자리",
    "텔레파시 카드",
    "우주조난기지",
    "큰곰자리",
    "안드로메다",
    "텔레파시 카드",
    "오리온 자리",
    "뉴런의 골짜기 카드",
    "백조자리",
    "헬리 혜성",
    "수성",
    "금성",
  ];
  const dispatch = useDispatch();
  const [positions, setPositions] = useState([]);
  const [cellSizes, setCellSizes] = useState([]);

  const size = 11; // 각 변의 칸 수
  const totalCells = size * 4 - 4; // 전체 칸 개수
  const cells = Array.from({ length: totalCells }, (_, i) => i); // 칸 번호
  // const [currentPosition, setCurrentPosition] = useState(0); // 현재 말 위치
  const [isFirstMove, setIsFirstMove] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 주사위 버튼을 눌렀는지 안 눌렀는지 추적
  useEffect(() => {
    if (onRollDice) {
      onRollDice(() => setShowModal(true));
    }
  }, [onRollDice]);

  // // 말 이동 함수
  // const moveToken = () => {
  //   setCurrentPosition((prev) => {
  //     setIsFirstMove(false);
  //     return (prev + 1) % totalCells;
  //   });
  // };

  // 카메라 위치 초기화하기 위한..
  const orbitControlsRef = useRef();
  const initialCameraPosition = [-20, 200, 0]; // 초기 카메라 위치
  const initialTarget = [0, 0, 0]; // 초기 카메라 타겟

  const resetCamera = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.object.position.set(...initialCameraPosition); // 카메라 위치 초기화
      orbitControlsRef.current.target.set(...initialTarget); // 타겟 초기화
      orbitControlsRef.current.update(); // OrbitControls 업데이트
    }
  };

  const cornerSize = [2.5, 0.2, 2.5]; // 코너 셀 크기
  const horizontalSize = [1.8, 0.2, 2.5]; // 가로 일반 셀 크기
  const verticalSize = [2.5, 0.2, 1.8]; // 세로 일반 셀 크기

  // 보드 전체 크기 계산 (간격 없이)
  const boardWidth = 2 * cornerSize[0] + (size - 2) * horizontalSize[0];
  const boardHeight = 2 * cornerSize[2] + (size - 2) * verticalSize[2];
  const centerOffsetX = boardWidth / 2;
  const centerOffsetZ = boardHeight / 2;

  // positions 초기화를 위한 useEffect 추가
  useEffect(() => {
    const newPositions = [];
    const newCellSizes = [];

    // 위쪽 면
    for (let i = 0; i < size; i++) {
      if (i === 0) {
        newCellSizes.push(cornerSize);
        newPositions.push([
          -centerOffsetX + cornerSize[0] / 2,
          0,
          -centerOffsetZ + cornerSize[2] / 2,
        ]);
      } else if (i === size - 1) {
        newCellSizes.push(cornerSize);
        newPositions.push([
          centerOffsetX - cornerSize[0] / 2,
          0,
          -centerOffsetZ + cornerSize[2] / 2,
        ]);
      } else {
        newCellSizes.push(horizontalSize);
        const xPos =
          -centerOffsetX +
          cornerSize[0] +
          (i - 1) * horizontalSize[0] +
          horizontalSize[0] / 2;
        newPositions.push([xPos, 0, -centerOffsetZ + horizontalSize[2] / 2]);
      }
    }

    // 오른쪽 면
    for (let i = 1; i < size - 1; i++) {
      newCellSizes.push(verticalSize);
      const zPos =
        -centerOffsetZ +
        cornerSize[2] +
        (i - 1) * verticalSize[2] +
        verticalSize[2] / 2;
      newPositions.push([centerOffsetX - verticalSize[0] / 2, 0, zPos]);
    }

    // 아래쪽 면
    for (let i = size - 1; i >= 0; i--) {
      if (i === 0) {
        newCellSizes.push(cornerSize);
        newPositions.push([
          -centerOffsetX + cornerSize[0] / 2,
          0,
          centerOffsetZ - cornerSize[2] / 2,
        ]);
      } else if (i === size - 1) {
        newCellSizes.push(cornerSize);
        newPositions.push([
          centerOffsetX - cornerSize[0] / 2,
          0,
          centerOffsetZ - cornerSize[2] / 2,
        ]);
      } else {
        newCellSizes.push(horizontalSize);
        const xPos =
          -centerOffsetX +
          cornerSize[0] +
          (i - 1) * horizontalSize[0] +
          horizontalSize[0] / 2;
        newPositions.push([xPos, 0, centerOffsetZ - horizontalSize[2] / 2]);
      }
    }

    // 왼쪽 면
    for (let i = size - 2; i > 0; i--) {
      newCellSizes.push(verticalSize);
      const zPos =
        -centerOffsetZ +
        cornerSize[2] +
        (i - 1) * verticalSize[2] +
        verticalSize[2] / 2;
      newPositions.push([-centerOffsetX + verticalSize[0] / 2, 0, zPos]);
    }

    setPositions(newPositions);
    setCellSizes(newCellSizes);
  }, []);

  // 칸별 내용 생성
  const renderCells = () => {
    const topTextures = [
      earthTexture,
      moonTexture,
      telepathyTexture1,
      marsTexture,
      jupiterTexture,
      vegaTexture,
      saturnTexture,
      telepathyTexture1,
      uranusTexture,
      neptuneTexture,
      timetravelTexture,
      ariesTexture,
      taurusTexture,
      telepathyTexture2,
      geminiTexture,
      neuronsTexture1,
      cancerTexture,
      timemachineTexture,
      leoTexture,
      virgoTexture,
      blackholeTexture,
      libraTexture,
      scorpioTexture,
      telepathyTexture3,
      sagittariusTexture,
      altairTexture,
      capricornTexture,
      aquariusTexture,
      piscesTexture,
      telepathyTexture3,
      resquebaseTexture,
      ursamajorTexture,
      andromedaTexture,
      telepathyTexture4,
      orionTexture,
      neuronsTexture2,
      cygnusTexture,
      halleyTexture,
      mercuryTexture,
      venusTexture,
    ];

    return positions.map((pos, index) => (
      <Cell
        key={index}
        position={pos}
        isHighlight={index === currentPosition}
        name={cities[index]}
        topTextureUrl={index < topTextures.length ? topTextures[index] : null}
        size={cellSizes[index]}
      />
    ));
  };

  const players = useSelector((state) => state.burumabul.players);
  const currentPosition = useSelector((state) => state.burumabul.prevPosition);
  const numPlayers = players.length;

  // 현재 플레이어는 인덱스 번호로
  const currentPlayerIndex = useSelector(
    (state) => state.burumabul.currentPlayerIndex
  );
  // 플레이어 위치 초기화
  const [playersPositions, setPlayersPositions] = useState(
    Array(numPlayers).fill(0)
  );
  console.log(playersPositions);
  // 플레이어 우주 기지를 세운!
  const [playerBases, setPlayerBases] = useState([[], [], [], []]);

  useEffect(() => {
    if (onBasesInfo) {
      onBasesInfo(playerBases);
    }
  }, [playerBases, onBasesInfo]); // playerBase가 변경될 때마다 실행

  // 우주기지 생성
  const [spaceBases, setSpaceBases] = useState(() => {
    //모든 포지션에 대해 초기 우주기지 생성
    // positions가 아직 설정되지 않았으므로 빈 배열로 시작
    return [];
  });

  // positions가 설정된 후 우주기지 초기화
  useEffect(() => {
    if (positions.length > 0) {
      // 모든 positions에 대해 우주기지 생성

      const initialBases = positions.map((position, index) => {
        const cellSize = cellSizes[index];
        let baseSize;
        // 인덱스  0-9, 20-29: 가로가 세로의 2배
        if ((index >= 0 && index <= 9) || (index >= 20 && index <= 29)) {
          baseSize = {
            width: cellSize[0] * 0.64,
            height: 1.3,
            depth: cellSize[2] * 0.28,
          };
        } else if (
          (index >= 10 && index <= 19) ||
          (index >= 30 && index <= 39)
        ) {
          baseSize = {
            width: cellSize[0] * 0.28,
            height: 1.3,
            depth: cellSize[2] * 0.64,
          };
        }
        return {
          position: position,
          color: "gray",
          size: baseSize,
        };
      });
      setSpaceBases(initialBases);
    }
  }, [positions, cellSizes, size]);

  // Preload textures
  const floor = useMemo(() => useLoader(TextureLoader, floorTexture), []);
  const timeMachineStopTexture = useMemo(
    () => useLoader(TextureLoader, timemachineStop),
    []
  );
  const telepathyCardTexture = useMemo(
    () => useLoader(TextureLoader, telepathyCard),
    []
  );
  const neuronsCardTexture = useMemo(
    () => useLoader(TextureLoader, neuronsCard),
    []
  );

  // 주사위 굴린 후 플레이어 이동 처리
  const handleDiceComplete = (score) => {
    const player = players[currentPlayerIndex];

    const targetPosition = player.position;

    console.log(`🎲 Player ${currentPlayerIndex + 1} rolled: ${score}`);
    console.log(`➡️ Moving to position: ${targetPosition}`);

    const animateMovement = (currentPosition, targetPosition) => {
      if (currentPosition !== targetPosition) {
        setPlayersPositions((prevPlayersPosition) => {
          const newPlayersPosition = [...prevPlayersPosition];
          newPlayersPosition[currentPlayerIndex] =
            (currentPosition + 1) % totalCells;
          return newPlayersPosition;
        });
        setTimeout(
          () =>
            animateMovement((currentPosition + 1) % totalCells, targetPosition),
          300
        );
      } else {
        // 우주기지 생성 로직
        const targetCity = cities[targetPosition];
        console.log("Building space base at:", positions[targetPosition]);
        setSpaceBases((prevBases) => {
          return prevBases.map((base) => {
            if (base.position === positions[targetPosition]) {
              return { ...base, color: player.color };
            }
            return base;
          });
        });

        // 플레이어의 우주기지 목록 업데이트
        setPlayerBases((prev) => {
          const newBases = [...prev];
          return prev.map((bases, index) =>
            index === currentPlayerIndex && !bases.includes(targetCity)
              ? [...bases, targetCity]
              : bases
          );
        });

        console.log(
          `player ${currentPlayerIndex + 1} built a base in ${targetCity}`
        );

        dispatch(nextTurn());
      }
    };
    animateMovement(player.position, targetPosition);

    setShowModal(false);
  };
  console.log(playerBases);

  // positions 배열에서 각 플레이어의 위치 좌표 계산
  const getPlayerPosition = (playerPosition, playerIndex) => {
    if (!positions[playerPosition]) {
      return playersPositions;
    }
    const basePosition = positions[playerPosition];
    // 말이 같은 칸에 있을 때 겹치지 않도록 약간의 오프셋 추가
    const offset = 0.4;
    switch (playerIndex) {
      case 0:
        return [
          basePosition[0] - offset,
          basePosition[1],
          basePosition[2] - offset,
        ];
      case 1:
        return [
          basePosition[0] + offset,
          basePosition[1],
          basePosition[2] - offset,
        ];
      case 2:
        return [
          basePosition[0] - offset,
          basePosition[1],
          basePosition[2] + offset,
        ];
      case 3:
        return [
          basePosition[0] + offset,
          basePosition[1],
          basePosition[2] + offset,
        ];
    }
  };

  // // Canvas 내부에 우주선 렌더링 추가
  // const renderSpaceships = () => {
  //   return players
  //     .slice(0, numPlayers)
  //     .map((player, index) => (
  //       <BlueRobot
  //         key={player.id}
  //         position={getPlayerPosition(player.position, index)
  //           scale={0.2}
  //         }
  //       />
  //     ));
  // };

  // 우주 기지 렌더링 추가
  const renderSpaceBases = useMemo(() => {
    console.log("render base");
    return spaceBases.map((base, index) => {
      let adjustedPosition;
      if (index >= 0 && index <= 9) {
        // 하단 1/3
        adjustedPosition = [
          base.position[0],
          base.position[1] + 0.3,
          base.position[2] + base.size.depth + 0.1,
        ];
      } else if (index >= 10 && index <= 19) {
        // 좌측 1/3
        adjustedPosition = [
          base.position[0] - base.size.width - 0.1,
          base.position[1] + 0.3,
          base.position[2],
        ];
      } else if (index >= 20 && index <= 29) {
        // 상단 1/3
        adjustedPosition = [
          base.position[0],
          base.position[1] + 0.3,
          base.position[2] - base.size.depth - 0.1,
        ];
      } else if (index >= 30 && index <= 39) {
        // 우측 1/3
        adjustedPosition = [
          base.position[0] + base.size.width + 0.1,
          base.position[1] + 0.3,
          base.position[2],
        ];
      }

      return (
        <SpaceBase
          position={adjustedPosition}
          key={index}
          color={base.color}
          width={base.size.width}
          height={base.size.height}
          depth={base.size.depth} // 3D 크기
          visible={true}
        />
      );
    });
  }, [spaceBases]);

  return (
    <div className="h-[100%] flex flex-col">
      {/* 이동 버튼 + 주사위 버튼 */}
      <div className="flex justify-center mb-5">
        {/* <button
          onClick={moveToken}
          className="mt-5 mx-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Move Token
        </button> */}

        <button
          onClick={resetCamera}
          className="mt-5 mx-3 px-4 py-2 bg-yellow-300 text-white rounded hover:bg-blue-600"
        >
          Reset Camera
        </button>
        {/* <select
          value={numPlayers}
          onChange={(e) => handlePlayerCountChange(e.target.value)}
          className="mt-5 mx-3 px-4 py-2 bg-yellow-300 text-white rounded hover:bg-blue-600"
        >
          <option value={2}>2 players</option>
          <option value={3}>3 players</option>
          <option value={4}>4 players</option>
        </select> */}
      </div>
      <div className="flex w-full h-full">
        <div className=" w-full h-full">
          <Canvas
            camera={{
              position: initialCameraPosition, // 카메라 초기 위치
              fov: 75, // 시야각 조절
            }}
            onCreated={({ scene }) => {
              const texture = new TextureLoader().load(spaceBackground);
              scene.background = texture;
            }}
          >
            <ambientLight intensity={2} />
            <pointLight position={[10, 20, 10]} intensity={0.8} color="white" />

            {/* 바닥 생성 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
              <planeGeometry args={[16.5, 16.5]} />
              <meshStandardMaterial map={floor} color="#ffffff" />
            </mesh>

            {/* 타임머신 탑승장 */}
            <mesh position={[5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 5]} />
              <meshStandardMaterial
                map={timeMachineStopTexture} // 추가 이미지 텍스처
                transparent={true}
              />
            </mesh>

            {/* 텔레파시 카드 */}
            <mesh position={[5, 0.01, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3, 5]} />
              <meshStandardMaterial
                map={telepathyCardTexture} // 추가 이미지 텍스처
                transparent={true}
              />
            </mesh>

            {/* 뉴런의 골짜기 */}
            <mesh position={[-5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 5]} />
              <meshStandardMaterial
                map={neuronsCardTexture} // 추가 이미지 텍스처
                transparent={true}
              />
            </mesh>

            {/* OrbitControls로 카메라 이동 및 확대/축소 제어 */}
            <OrbitControls
              ref={orbitControlsRef}
              target={initialTarget}
              makeDefault
              maxPolarAngle={Math.PI / 2.5} // 위쪽으로 카메라 제한
              minDistance={1} // 최소 줌 거리
              maxDistance={15} // 최대 줌 거리
              mouseButtons={{
                LEFT: 0,
                MIDDLE: 1,
                RIGHT: 2,
              }}
              enablePan={true}
              zoomToCursor={true}
              rotateSpeed={0.15}
            />

            {renderCells()}
            {players.slice(0, numPlayers).map((player, index) => (
              <BlueRobot
                key={player.id}
                position={getPlayerPosition(playersPositions[index], index)}
                scale={0.005}
              />
            ))}
            {renderSpaceBases}
          </Canvas>
        </div>
      </div>
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 w-2/3 text-center flex items-center justify-center">
            <Dice
              onComplete={handleDiceComplete}
              onClose={() => setShowModal(false)}
              roomId={roomId}
            />
            ,
          </div>,
          document.body
        )}
    </div>
  );
};

export default TravelMap;
