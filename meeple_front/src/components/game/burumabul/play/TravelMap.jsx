import React, {
  useEffect,
  useState,
  useRef,
  Suspense,
  useMemo,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

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
// import earthTexture from "../../../../assets/burumabul_images/earth.png";
// import moonTexture from "../../../../assets/burumabul_images/moon.png";
// import telepathyTexture1 from "../../../../assets/burumabul_images/telepathy.png";
// import marsTexture from "../../../../assets/burumabul_images/mars.png";
// import jupiterTexture from "../../../../assets/burumabul_images/jupiter.png";
// import vegaTexture from "../../../../assets/burumabul_images/vega.png";
// import saturnTexture from "../../../../assets/burumabul_images/saturn.png";
// import uranusTexture from "../../../../assets/burumabul_images/uranus.png";
// import neptuneTexture from "../../../../assets/burumabul_images/neptune.png";
// import timetravelTexture from "../../../../assets/burumabul_images/timetravel.png";
// import ariesTexture from "../../../../assets/burumabul_images/aries.png";
// import taurusTexture from "../../../../assets/burumabul_images/taurus.png";
// import telepathyTexture2 from "../../../../assets/burumabul_images/telepathy2.png";
// import geminiTexture from "../../../../assets/burumabul_images/gemini.png";
// import neuronsTexture1 from "../../../../assets/burumabul_images/neurons1.png";
// import cancerTexture from "../../../../assets/burumabul_images/cancer.png";
// import timemachineTexture from "../../../../assets/burumabul_images/timemachine.png";
// import leoTexture from "../../../../assets/burumabul_images/leo.png";
// import virgoTexture from "../../../../assets/burumabul_images/virgo.png";
// import blackholeTexture from "../../../../assets/burumabul_images/blackhole.png";
// import libraTexture from "../../../../assets/burumabul_images/libra.png";
// import scorpioTexture from "../../../../assets/burumabul_images/scorpio.png";
// import telepathyTexture3 from "../../../../assets/burumabul_images/telepathy3.png";
// import sagittariusTexture from "../../../../assets/burumabul_images/sagittarius.png";
// import altairTexture from "../../../../assets/burumabul_images/altair.png";
// import capricornTexture from "../../../../assets/burumabul_images/capricorn.png";
// import aquariusTexture from "../../../../assets/burumabul_images/aquarius.png";
// import piscesTexture from "../../../../assets/burumabul_images/pisces.png";
// import resquebaseTexture from "../../../../assets/burumabul_images/resquebase.png";
// import ursamajorTexture from "../../../../assets/burumabul_images/ursamajor.png";
// import andromedaTexture from "../../../../assets/burumabul_images/andromeda.png";
// import telepathyTexture4 from "../../../../assets/burumabul_images/telepathy4.png";
// import orionTexture from "../../../../assets/burumabul_images/orion.png";
// import neuronsTexture2 from "../../../../assets/burumabul_images/neurons2.png";
// import cygnusTexture from "../../../../assets/burumabul_images/cygnus.png";
// import halleyTexture from "../../../../assets/burumabul_images/halley.png";
// import mercuryTexture from "../../../../assets/burumabul_images/mercury.png";
// import venusTexture from "../../../../assets/burumabul_images/venus.png";
import floorTexture from "../../../../assets/burumabul_images/floor.png";
import timemachineStop from "../../../../assets/burumabul_images/timemachinestop.png";
import telepathyCard from "../../../../assets/burumabul_images/telepathycard.png";
import neuronsCard from "../../../../assets/burumabul_images/neuronscard.png";

import BlueRobot from "./BlueRobot";
import SpaceBase from "./SpaceBase";
import { SocketContext } from "../../../layout/SocketLayout";
import QuestBuildBase from "./burumabul_Modal/QuestBuildBase.";
import QuestBuyLand from "./burumabul_Modal/QuestBuyLand";
import PayTollModal from "./burumabul_Modal/PayTollModal";
import DiceVersion2 from "./DiceVersion2";
import HeartPlayer from "./HeartPlayer";
import PickedCardModal from "./burumabul_Modal/PickedCardModal";
import EndWinner from "./burumabul_Modal/EndWinner";
import ChoosePositionModal from "./burumabul_Modal/ChoosePositionModal";

// 토스트
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showGameToast } from "../BurumabulToast";

const Cell = ({
  position,
  name,
  textureUrl,
  topTextureUrl,
  size,
  ownerIndex,
  players,
}) => {
  const textRef = useRef();
  const { camera } = useThree();
  const colors = ["#FF3EA5", "#7695FF", "#00FF9C", "#EBF400"];
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

  const getColor = () => {
    if (ownerIndex !== null) {
      return colors[ownerIndex];
    }
  };

  return (
    <mesh position={position}>
      {/* 셀 박스 = 직육면체 */}
      <boxGeometry args={size} />
      {/* 각 면의 텍스처 및 색상 설정 */}
      <meshStandardMaterial color={getColor()} />

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

const TravelMap = ({
  onBasesInfo,
  gameData,
  roomId,
  setIsStart,
  onGameEnd,
  setGameStatus,
}) => {
  useEffect(() => {
    const preventClose = (e) => {
      e.preventDefault();
      e.returnValue = ""; // Chrome에서 필요
      showGameToast("게임을 나가시겠습니까?", "진행 중인 게임이 종료됩니다.");
      return (e.returnValue = "");
    };

    const preventGoBack = () => {
      window.history.pushState(null, "", window.location.href);
      showGameToast(
        "게임 진행 중",
        "게임 중에는 뒤로가기를 사용할 수 없습니다."
      );
    };

    const preventKeyboardRefresh = (e) => {
      if ((e.key === "r" && (e.ctrlKey || e.metaKey)) || e.key === "F5") {
        e.preventDefault();
        showGameToast("게임 진행 중", "게임 중에는 새로고침을 할 수 없습니다.");
        return false;
      }
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 새로고침, 창 닫기 이벤트
    window.addEventListener("beforeunload", preventClose);

    // 뒤로가기 방지
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventGoBack);

    // 키보드 새로고침 방지
    document.addEventListener("keydown", preventKeyboardRefresh);

    // 우클릭 메뉴 방지
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      window.removeEventListener("beforeunload", preventClose);
      window.removeEventListener("popstate", preventGoBack);
      document.removeEventListener("keydown", preventKeyboardRefresh);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);
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
  const userId = Number(useSelector((state) => state.user.userId));
  const colors = ["#FF3EA5", "#7695FF", "#00FF9C", "#EBF400"];
  const [textureUrls, setTextureUrls] = useState([]);
  const dispatch = useDispatch();
  // 소켓에서 받아오는 정보들
  const {
    connected,
    gamePlaySocketData,
    rollDice,
    buyLand,
    roll,
    buildBase,
    startTurn,
    payToll,
    drawCard,
    checkEnd,
    currentPlayerSocketIndex,
    rollDiceSocketData,
    socketBoard,
    socketCards,
    socketNext,
    socketEnd,
    socketUserUpdate,
    socketTileUpdate,
    buyLandSocketData,
    buildBaseSocketData,
    socketPayTollData,
    setBuyLandSocketData,
    setBuildBaseSocketData,
    setSocketDrawCardData,
    setSocketPayTollData,
    socketTollPrice,
    socketReceivedPlayer,
    setSocketNext,
    socketFirstDice,
    socketSecondDice,
    socketDouble,
    socketCurrentRound,
    socketRoll,
    socketDrawCardData,
    socketPickedCard,
    socketDrawPrevPosition,
    socketDrawNextPosition,
    setSocketDrawNextPosition,
    setSocketDrawPrevPosition,
    socketDrawPrevBalance,
    socketDrawNextBalance,
    setSocketDrawPrevBalance,
    setSocketDrawNextBalance,
    socketTravelData,
    socketTravelPrevPosition,
    setSocketTravelPrevPosition,
    socketTravelNextPosition,
    setSocketTravelNextPosition,
    socketWinner,
    endGame,
    choosePosition,
  } = useContext(SocketContext);

  const [playData, setPlayData] = useState(gamePlaySocketData);

  useEffect(() => {
    if (gamePlaySocketData) {
      setPlayData(gamePlaySocketData);
    }
    if (gamePlaySocketData?.board) {
      const urls = gamePlaySocketData.board.map((tile) => tile.imageUrl);
      setTextureUrls(urls);
    }
  }, [gamePlaySocketData]);

  useEffect(() => {
    console.log(buyLandSocketData);
  }, [buyLandSocketData]);

  // 플레이어 정보
  const [players, setPlayers] = useState(playData?.players);
  const numPlayers = players?.length;

  const myInfo = players?.find((player) => player.playerId === userId);
  const myColorIndex = players?.findIndex(
    (player) => Number(player.playerId) === Number(userId)
  );

  const [cards, setCards] = useState(null);
  const [board, setBoard] = useState(null);

  const [showBuyLand, setShowBuyLand] = useState(false);
  const [showBuildBase, setShowBuildBase] = useState(false);
  const [isBuyLand, setIsBuyLand] = useState(false);
  const [isBuildBase, setIsBuildBase] = useState(false);
  const [showCardId, setShowCardId] = useState(null);

  // 현재 플레이어는 인덱스 번호로
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const currentPlayer = players[currentPlayerIndex];
  // 주사위
  const [firstDice, setFirstDice] = useState(null);
  const [secondDice, setSecondDice] = useState(null);
  const isDouble = firstDice === secondDice;
  // 다음 행동
  const [nextAction, setNextAction] = useState(null);
  const [hasRolledDice, setHasRolledDice] = useState(false);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    setPlayData(gameData);
    setCards(socketCards);
    if (socketBoard) {
      setBoard((prevBoard) => {
        // 이전 board가 없는 경우에만 새로운 socketBoard로 설정
        if (!prevBoard) return socketBoard;

        // 기존 board 상태 유지하면서 필요한 부분만 업데이트
        return prevBoard.map((tile, index) => {
          const newTile = socketBoard[index];
          if (!newTile) return tile;

          return {
            ...tile,
            ownerId: newTile.ownerId || tile.ownerId,
            hasBase: newTile.hasBase || tile.hasBase,
            tollPrice: newTile.tollPrice || tile.tollPrice,
          };
        });
      });
    }
  }, [gameData, socketCards, socketBoard]);

  useEffect(() => {
    if (buyLandSocketData) {
      const { updatedPlayer, updatedTile } = buyLandSocketData;

      // 플레이어 정보 업데이트
      if (updatedPlayer) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((player) =>
              player.playerId === updatedPlayer.playerId
                ? {
                    ...player,
                    balance: updatedPlayer.balance,
                    cardOwned: updatedPlayer.cardOwned || [],
                    landOwned: updatedPlayer.landOwned || [],
                    position: updatedPlayer.position,
                  }
                : player
            ) || [];
          // console.log("Player update:", newPlayers);
          return newPlayers;
        });
      }

      // 보드(타일) 정보 업데이트
      if (updatedTile) {
        setBoard((prevBoard) => {
          const newBoard =
            prevBoard?.map((tile) =>
              tile.id === updatedTile.id
                ? {
                    ...tile,
                    ownerId: updatedTile.ownerId,
                    hasBase: updatedTile.hasBase,
                    tollPrice: updatedTile.tollPrice,
                  }
                : tile
            ) || [];
          // console.log("Board update:", newBoard);
          return [...newBoard];
        });
      }
      // setBuyLandSocketData(null);
    }
  }, [buyLandSocketData]);

  useEffect(() => {
    if (buildBaseSocketData) {
      const { updatedPlayer, updatedTile } = buildBaseSocketData;

      // 플레이어 정보 업데이트
      if (updatedPlayer) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((player) =>
              player.playerId === updatedPlayer.playerId
                ? {
                    ...player,
                    balance: updatedPlayer.balance,
                    cardOwned: updatedPlayer.cardOwned || [],
                    landOwned: updatedPlayer.landOwned || [],
                    position: updatedPlayer.position,
                  }
                : player
            ) || [];
          // console.log("Player update:", newPlayers);
          return newPlayers;
        });
      }

      // 보드(타일) 정보 업데이트
      if (updatedTile) {
        setBoard((prevBoard) => {
          const newBoard =
            prevBoard?.map((tile) =>
              tile.id === updatedTile.id
                ? {
                    ...tile,
                    ownerId: updatedTile.ownerId,
                    hasBase: updatedTile.hasBase,
                    tollPrice: updatedTile.tollPrice,
                  }
                : tile
            ) || [];
          // console.log("Board update:", newBoard);
          return newBoard;
        });
      }

      // 우주 기지 상태 업데이트
      setSpaceBases((prevBases) =>
        prevBases.map((base, index) => {
          if (index === updatedTile.id) {
            const ownerIndex = players.findIndex(
              (p) => p.playerId === updatedTile.ownerId
            );
            return {
              ...base,
              visible: true,
              color: colors[ownerIndex],
            };
          }
          return base; // ✅ 기존 값을 유지하면서 업데이트된 값만 변경
        })
      );

      // setBuildBaseSocketData(null);
    }
  }, [buildBaseSocketData]);

  // 통행료 지불 후 업데이트 정보
  const [tollPrice, setTollPrice] = useState(null);
  const [paidPlayer, setPaidPlayer] = useState(null);
  const [receivedPlayer, setReceivedPlayer] = useState(null);
  useEffect(() => {
    if (socketPayTollData) {
      const { paidPlayer, receivedPlayer, tollPrice } = socketPayTollData;

      if (paidPlayer) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((player) =>
              player.playerId === paidPlayer.playerId
                ? {
                    ...player,
                    balance: paidPlayer.balance,
                    cardOwned: paidPlayer.cardOwned || [],
                    landOwned: paidPlayer.landOwned || [],
                    position: paidPlayer.position,
                  }
                : player
            ) || [];
          // console.log("Player update:", newPlayers);
          return newPlayers;
        });
        setPaidPlayer(paidPlayer);
      }
      if (receivedPlayer) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((player) =>
              player.playerId === receivedPlayer.playerId
                ? {
                    ...player,
                    balance: receivedPlayer.balance,
                    cardOwned: receivedPlayer.cardOwned || [],
                    landOwned: receivedPlayer.landOwned || [],
                    position: receivedPlayer.position,
                  }
                : player
            ) || [];
          // console.log("Player update:", newPlayers);
          return newPlayers;
        });
        setReceivedPlayer(receivedPlayer);
      }
      setTollPrice(tollPrice);
    }
  }, [socketPayTollData]);

  // 카드 뽑고 나서 정보 업데이트

  const [pickedCardInfo, setPickedCardInfo] = useState(socketPickedCard);
  const [drawPrevPosition, setDrawPrevPosition] = useState(
    socketDrawPrevPosition
  );

  const [drawNextPosition, setDrawNextPosition] = useState(
    socketDrawNextPosition
  );
  const [drawPrevBalance, setDrawPrevBalance] = useState(socketDrawPrevBalance);
  const [drawNextBalance, setDrawNextBalance] = useState(socketDrawNextBalance);

  const prevPositionRef = useRef(drawPrevPosition);
  const nextPositionRef = useRef(drawNextPosition);

  useEffect(() => {
    if (socketDrawCardData) {
      console.log("socketPickedCard:", socketDrawCardData.pickedCard);
      console.log("카드뽑기 전 정보들", {
        drawPrevPosition,
        drawNextPosition,
      });

      // 기존 값 초기화
      setDrawPrevPosition(null);
      setDrawNextPosition(null);

      setPickedCardInfo(socketDrawCardData.pickedCard);
      setDrawPrevPosition(socketDrawCardData.prevPosition);
      setDrawNextPosition(socketDrawCardData.nextPosition);
      setDrawPrevBalance(socketDrawCardData.prevBalance);
      setDrawNextBalance(socketDrawCardData.nextBalance);
      console.log("카드뽑기 후 정보들", {
        drawPrevPosition,
        drawNextPosition,
      });

      // 🔵 업데이트된 값을 useRef에 저장 (불필요한 재렌더링 방지)
      prevPositionRef.current = socketDrawCardData.prevPosition;
      nextPositionRef.current = socketDrawCardData.nextPosition;
    }
  }, [socketDrawCardData]);

  useEffect(() => {
    if (socketDrawCardData) {
      const { player } = socketDrawCardData;

      if (player) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((prevPlayer) =>
              prevPlayer.playerId === player.playerId
                ? {
                    ...prevPlayer,
                    balance: player.balance,
                    cardOwned: player.cardOwned,
                    landOwned: player.landOwned,
                    position: player.position,
                  }
                : prevPlayer
            ) || [];

          return newPlayers;
        });
      }
      // setSocketDrawCardData(null);
    }
  }, [socketDrawCardData]);

  // 시간 여행 카드 뽑고 나서 위치
  const [travelPrevPosition, setTravelPrevPosition] = useState(
    socketTravelPrevPosition
  );
  const [travelNextPosition, setTravelNextPosition] = useState(
    socketTravelNextPosition
  );
  useEffect(() => {
    if (socketTravelData) {
      setTravelPrevPosition(socketTravelData.prevPosition);
      setTravelNextPosition(socketTravelData.nextPosition);
    }
  }, [socketTravelData]);

  // 초기화 함수
  const resetGameState = () => {
    setPlayData(null);
    setPlayers([]);
    setBoard(null);
    setCards(null);
    setCurrentPlayerIndex(0);
    setNextAction(null);
    setFirstDice(null);
    setSecondDice(null);
    setIsDiceRolling(false);
    setHasRolledDice(false);
    setIsEnd(false);
    setShowEndWinner(false);
    setShowBuyLand(false);
    setShowBuildBase(false);
    setShowPickedCardModal(false);
    setShowPayTollModal(false);
    setShowChoosePositionModal(false);
    setOnRollDice(false);
    setPlayersPositions(Array(numPlayers).fill(0));
    setSpaceBases([]);
    setSocketNext(null);
    setSocketDrawCardData(null);
    setSocketPayTollData(null);
    setSocketDrawNextPosition(null);
    setSocketDrawPrevPosition(null);
    setSocketDrawPrevBalance(null);
    setSocketDrawNextBalance(null);
    setSocketTravelPrevPosition(null);
    setSocketTravelNextPosition(null);
  };

  // 통행료 알림 모달 오픈
  const [showPayTollModal, setShowPayTollModal] = useState(false);

  // 뽑은 카드 모달 오픈
  const [showPickedCardModal, setShowPickedCardModal] = useState(false);

  // 나는 몇 번째 순서인지
  const myIndex = players.findIndex((player) => player.playerId === userId);

  const [nextxTurn, setNextTurn] = useState(Number(currentPlayerIndex) + 1);
  useEffect(() => {
    setNextTurn(Number(currentPlayerIndex) + 1);
  }, [currentPlayerIndex]);

  // 이전 위치 , 다음 위치
  const [prevPosition, setPrevPosition] = useState(null);
  const [nextPosition, setNextPosition] = useState(null);

  useEffect(() => {
    if (rollDiceSocketData) {
      setPrevPosition(rollDiceSocketData.prevPosition);
      setNextPosition(rollDiceSocketData.nextPosition);
    }
  }, [rollDiceSocketData]);

  const [onRollDice, setOnRollDice] = useState(false);

  // 이동 끝났는지 체크 (말)

  const [isMovementComplete, setIsMovementComplete] = useState(false);

  // 주사위 버튼을 눌렀는지 안 눌렀는지 추적
  useEffect(() => {
    if (onRollDice) {
      const alertRoll = async () => {
        try {
          const rollInfo = {
            playerId: currentPlayer.playerId,
            diceRolled: "true",
          };

          await roll(rollInfo);
          setOnRollDice(false);
          setIsDiceRolling(true);
          setHasRolledDice(true);
        } catch (error) {
          console.error("주사위 알림 전달 실패 :", error);
        }
      };
      alertRoll();
    }
  }, [onRollDice, currentPlayer]);
  useEffect(() => {
    setCurrentPlayerIndex(gamePlaySocketData.currentPlayerIndex);
    setIsDiceRolling(false);
    setHasRolledDice(false);
    setShowModal(false);
  }, [gamePlaySocketData]);

  // useEffect(() => {
  //   setCurrentPlayerIndex(currentPlayerSocketIndex);
  //   setIsDiceRolling(false);
  //   setHasRolledDice(false);
  //   setShowModal(false);
  // }, [currentPlayerSocketIndex]);

  // 다음행동 유추
  useEffect(() => {
    if (socketNext) {
      setNextAction(socketNext);
    }
  }, [socketNext]);

  // 턴 시작
  useEffect(() => {
    const turnStart = async () => {
      try {
        await startTurn();
        setFirstDice(null);
        setSecondDice(null);
      } catch (error) {
        console.error("턴 시작에 오류가 생겼습니다.", error);
        setSocketNext(null);
      }
    };
    if (
      nextAction &&
      nextAction === "START_TURN" &&
      myIndex === currentPlayerIndex
    ) {
      console.log("턴을 시작합니다!!!");
      turnStart();
    }
    console.log("현재 순서랑 내 차례", currentPlayerIndex, myIndex);
  }, [nextAction]);

  // 주사위 굴리기
  useEffect(() => {
    console.log("🔍 주사위 굴리기 감지:", {
      nextAction,
      isDiceRolling,
      hasRolledDice,
      firstDice,
      secondDice,
      myIndex,
      currentPlayerIndex,
      isMovementComplete,
    });
    const handleDiceResult = async () => {
      if (
        isDiceRolling &&
        hasRolledDice &&
        firstDice !== null &&
        secondDice !== null
      ) {
        try {
          const diceInfo = {
            playerId: currentPlayer.playerId,
            firstDice: firstDice,
            secondDice: secondDice,
          };
          console.log("주사위 정보 :", diceInfo);
          await rollDice(diceInfo);
          setIsDiceRolling(false);
        } catch (error) {
          console.error("주사위 굴리기에 실패했습니다.", error);
          setSocketNext(null);
        }
      }
    };
    if (
      nextAction &&
      nextAction === "ROLL_DICE" &&
      hasRolledDice &&
      firstDice !== null &&
      secondDice !== null &&
      myIndex === currentPlayerIndex
    ) {
      handleDiceResult();
    }
  }, [
    nextAction,
    isDiceRolling,
    hasRolledDice,
    firstDice,
    secondDice,
    currentPlayer,
    rollDice,
  ]);

  // 플레이어 위치 초기화
  const [playersPositions, setPlayersPositions] = useState(
    Array(numPlayers).fill(0)
  );

  const [isAnimating, setIsAnimating] = useState(false);
  // console.log(playersPositions);

  useEffect(() => {
    if (rollDiceSocketData && rollDiceSocketData.nextPosition !== undefined) {
      const playerIndex = players.findIndex(
        (player) => player.playerId === rollDiceSocketData.playerId
      );

      const startPosition = playersPositions[playerIndex];
      const targetPosition = rollDiceSocketData.nextPosition;
      console.log("🚀 이동 시작:", { startPosition, targetPosition });
      setIsMovementComplete(false); // 이동 시작 시 false 설정
      setIsAnimating(true);

      const animateMovement = async () => {
        let current = startPosition;

        while (current !== targetPosition) {
          current = (current + 1) % totalCells;
          setPlayersPositions((prev) => {
            const newPositions = [...prev];
            newPositions[playerIndex] = current;
            return newPositions;
          });
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        setIsAnimating(false);
        setTimeout(() => setIsMovementComplete(true), 200); // 이동이 끝난 후 true로 변경
      };

      animateMovement();
    }
  }, [rollDiceSocketData]);

  useEffect(() => {
    if (!isDiceRolling) {
      console.log("♻️ 주사위 값 초기화 (턴 종료 후)");
      setTimeout(() => {
        setFirstDice(null);
        setSecondDice(null);
      }, 1000); // 1초 후 초기화
    }
  }, [isDiceRolling]);

  // 땅 구매
  useEffect(() => {
    if (!isMovementComplete) return;

    if (
      nextAction === "DO_YOU_WANT_TO_BUY_THE_LAND" &&
      myIndex === currentPlayerIndex
    ) {
      // 중복 실행 방지
      setShowCardId(nextPosition);
      console.log(
        "땅 살거냐고 물어보고 모달 띄울 때 몇 번 카드 보여주는지:",
        showCardId,
        nextPosition
      );
      setShowBuyLand(true);
    }
  }, [isMovementComplete, nextAction, nextPosition]);

  useEffect(() => {
    const handleBuyLand = async () => {
      if (
        isBuyLand &&
        currentPlayer &&
        // nextPosition !== null &&
        myIndex === currentPlayerIndex
      ) {
        try {
          const buyInfo = {
            playerId: currentPlayer.playerId,
            tileId: nextPosition,
          };

          console.log("구매 요청 보내기 :", buyInfo);
          await buyLand(buyInfo);

          // 구매 요청이 성공적으로 보내진 후 상태 초기화
          setShowBuyLand(false);
          setShowCardId(null);
          setIsBuyLand(false);
        } catch (error) {
          console.error("땅 구매 요청 실패 :", error);
          setSocketNext(null);
          setShowBuyLand(false);
          setShowCardId(null);
          setIsBuyLand(false);
        }
      }
    };
    handleBuyLand();
  }, [isBuyLand, currentPlayer, nextPosition]);

  // 기지 건설
  useEffect(() => {
    if (!isMovementComplete) return;
    if (
      nextAction === "DO_YOU_WANT_TO_BUILD_THE_BASE" &&
      !showBuildBase &&
      myIndex === currentPlayerIndex
    ) {
      setShowCardId(nextPosition);
      console.log(
        "기지 살거냐고 물어보고 모달 띄울 때 몇 번 카드 보여주는지:",
        showCardId,
        nextPosition
      );
      setShowBuildBase(true);
      return;
    }
  }, [isMovementComplete, nextAction, showBuildBase]);

  useEffect(() => {
    const handleBuildBase = async () => {
      if (
        isBuildBase &&
        currentPlayer &&
        nextPosition !== null &&
        myIndex === currentPlayerIndex
      ) {
        try {
          const buildInfo = {
            playerId: currentPlayer.playerId,
            tileId: nextPosition,
          };
          console.log("기지 건설 요청:", buildInfo);
          await buildBase(buildInfo);
          setShowBuildBase(false);
          setShowCardId(null);
          setIsBuildBase(false);
        } catch (error) {
          console.error("기지 건설 요청 실패 :", error);
          setSocketNext(null);
          setShowBuildBase(false);
          setShowCardId(null);
          setIsBuildBase(false);
        }
      }
    };
    handleBuildBase();
  }, [isBuildBase, currentPlayer, nextPosition]);

  // 통행료 지불
  useEffect(() => {
    if (!isMovementComplete) return;
    if (
      nextAction &&
      nextAction === "PAY_TOLL" &&
      myIndex === currentPlayerIndex
    ) {
      try {
        const payInfo = {
          playerId: currentPlayer.playerId,
          tileId: nextPosition,
        };
        payToll(payInfo);
        console.log("통행료 지불 성공");
      } catch (error) {
        console.log("통행료 지불 실패: ", error);
        setSocketNext(null);
      }
      if (isMovementComplete) {
        setShowPayTollModal(true);
      }
    }
  }, [isMovementComplete, nextAction]);

  // 카드 뽑기 해서 나오는 애니매이션
  const [isCardDrawn, setIsCardDrawn] = useState(false);

  // 카드 뽑기 -> 모달

  useEffect(() => {
    console.log("🔍 카드 뽑기 useEffect 실행됨");
    console.log("nextAction:", nextAction);
    console.log("현재 플레이어 인덱스:", myIndex);
    console.log("현재 턴 플레이어:", currentPlayerIndex);
    console.log("이동 완료 여부:", isMovementComplete);
    console.log("카드 뽑기 여부:", isCardDrawn);
    const handleDrawCard = async () => {
      if (
        nextAction &&
        nextAction === "DRAW_CARD" &&
        myIndex === currentPlayerIndex &&
        !isCardDrawn &&
        isMovementComplete
      ) {
        try {
          setIsCardDrawn(true);
          const drawInfo = {
            playerId: currentPlayer.playerId,
            tileId: nextPosition,
          };
          drawCard(drawInfo);

          console.log("카드 뽑기 성공");
          setShowPickedCardModal(true);
        } catch (error) {
          console.error("카드 뽑기 실패 :", error);
          setSocketNext(null);
          setIsCardDrawn(false);
        }
      } else {
        console.log("❌ 카드 뽑기 조건 미충족");
      }
    };
    handleDrawCard();
  }, [nextAction, isMovementComplete]);

  // 시간 여행 -> 가고싶은 곳 정하기
  const [showChoosePositionModal, setShowChoosePositionModal] = useState(false);

  // useEffect(() => {
  //   if (!isMovementComplete) return;
  //   if (nextAction === "CHOOSE_POSITION" && myIndex === currentPlayerIndex) {
  //   }
  // }, [isMovementComplete, nextAction]);

  useEffect(() => {
    console.log("🔍 CHOOSE_POSITION 체크 시작");
    console.log("🟢 nextAction:", nextAction);
    console.log("🟢 isMovementComplete:", isMovementComplete);
    console.log(
      "🟢 내 인덱스:",
      myIndex,
      "현재 턴 플레이어:",
      currentPlayerIndex
    );
    console.log("🟢 showChoosePositionModal:", showChoosePositionModal);

    if (!isMovementComplete) return;
    console.log("nextAction 값", nextAction);
    if (nextAction === "CHOOSE_POSITION" && myIndex === currentPlayerIndex) {
      setShowChoosePositionModal(true);
      if (!showChoosePositionModal) {
        try {
          const chooseNextPosition = async () => {
            const chooseInfo = {
              nextPosition: 0,
              playerId: currentPlayer.playerId,
            };
            console.log(chooseInfo);
            await choosePosition(chooseInfo);
          };
          chooseNextPosition();
          console.log("가고 싶은 곳 뽑기");
        } catch (error) {
          console.error("가고 싶은 곳 뽑는 중 에러:", error);
        }
      }
    }
  }, [isMovementComplete, nextAction, myIndex, currentPlayerIndex]);

  useEffect(() => {
    if (socketTravelData) {
      setTravelPrevPosition(socketTravelData.prevPosition);
      setTravelNextPosition(socketTravelData.nextPosition);
    }
  }, [socketTravelData]);

  // 시간 여행 가고싶은 곳 고른 뒤 말 이동하는 로직
  const [chooseIsAnimating, setChooseIsAnimating] = useState(false);
  const [chooseIsMovementComplete, setChooseIsMovementComplete] =
    useState(true);

  useEffect(() => {
    if (
      socketTravelData &&
      socketTravelPrevPosition !== socketTravelNextPosition
    ) {
      const playerIndex = players.findIndex(
        (player) => player.playerId === socketTravelData.playerId
      );

      const startPosition = socketTravelData.prevPosition;
      const targetPosition = socketTravelData.nextPosition;
      console.log("🚀 시간여행 이동 시작:", { startPosition, targetPosition });
      setChooseIsMovementComplete(false); // 이동 시작 시 false 설정
      setChooseIsAnimating(true);

      const animateMovement = async () => {
        let current = startPosition;

        while (current !== targetPosition) {
          current = (current + 1) % totalCells;
          setPlayersPositions((prev) => {
            const newPositions = [...prev];
            newPositions[playerIndex] = current;
            return newPositions;
          });
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        setChooseIsAnimating(false);
        setTimeout(() => setChooseIsMovementComplete(true), 200); // 이동이 끝난 후 true로 변경
      };

      animateMovement();
    }
  }, [socketTravelData]);

  // 카드 뽑고 나서 position이 달라질 경우, 왔다갔다 이동하는 로직
  const [drawIsAnimating, setDrawIsAnimating] = useState(false);
  const [drawIsMovementComplete, setDrawIsMovementComplete] = useState(true);

  useEffect(() => {
    console.log("카드 이동 디버그:", {
      socketDrawCardData: !!socketDrawCardData,
      drawPrevPosition,
      drawNextPosition,
      현재상태: {
        drawIsMovementComplete,
        drawIsAnimating,
      },
    });
    if (socketDrawCardData) {
      console.log("카드 이동 디버그22222222222:", {
        socketDrawCardData: !!socketDrawCardData,
        drawPrevPosition,
        drawNextPosition,
        현재상태: {
          drawIsMovementComplete,
          drawIsAnimating,
        },
      });
      if (
        drawPrevPosition !== null &&
        drawNextPosition !== null &&
        drawPrevPosition !== drawNextPosition
      ) {
        const playerIndex = players.findIndex(
          (player) => player.playerId === socketDrawCardData.player.playerId
        );
        const startPosition = playersPositions[playerIndex];
        const targetPosition = drawNextPosition;
        console.log("카드 뽑고 이동전 플레이어들 위치 :", playersPositions);
        console.log("카드뽑고 이동 시작 위치:", startPosition);
        console.log("카드뽑고 이동 끝 위치:", drawNextPosition);
        setDrawIsMovementComplete(false);
        setDrawIsAnimating(true);

        if (drawPrevPosition < drawNextPosition) {
          const animateMovement = async () => {
            let current = startPosition;
            while (current !== targetPosition) {
              current = (current + 1) % totalCells;
              setPlayersPositions((prev) => {
                const newPositions = [...prev];
                newPositions[playerIndex] = current;
                return newPositions;
              });
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
            setDrawIsAnimating(false);
            setTimeout(() => {
              setDrawIsMovementComplete(true);
              // if (!showPickedCardModal) {
              // 모달이 이미 닫혀있을 때만
              setDrawNextPosition(null);
              setDrawPrevPosition(null);

              setSocketDrawNextPosition(null);
              setSocketDrawPrevBalance(null);
              setSocketDrawNextBalance(null);
              setSocketDrawCardData(null);
              setNextAction("CHECK_END");
              // }
            }, 200);
          };
          animateMovement();
          // 뒤로 이동
        } else if (drawPrevPosition > drawNextPosition) {
          const animateMovement = async () => {
            let current = startPosition;
            while (current !== targetPosition) {
              current = current === 0 ? totalCells - 1 : current - 1;
              // current = current - 1;
              console.log("뒤로 이동 중:", current);
              setPlayersPositions((prev) => {
                const newPositions = [...prev];
                newPositions[playerIndex] = current;
                return newPositions;
              });
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
            setDrawIsAnimating(false);
            setTimeout(() => {
              setDrawIsMovementComplete(true);
              setDrawNextPosition(null);
              setDrawPrevPosition(null);
              setSocketDrawPrevPosition(null);
              setSocketDrawNextPosition(null);
              setSocketDrawPrevBalance(null);
              setSocketDrawNextBalance(null);
              setNextAction("CHECK_END");
            }, 200);
          };
          animateMovement();
        }
      }
    }
  }, [socketDrawCardData, drawPrevPosition, drawNextPosition]);

  // 턴 종료 조건 확인
  useEffect(() => {
    console.log("🔍 CHECK_END 실행 조건 검사: ", {
      nextAction,
      isMovementComplete,
      drawIsMovementComplete,
      isDiceRolling,
      showPickedCardModal,
      showPayTollModal,
      showBuyLand,
      showBuildBase,
    });

    // 모든 모달이 닫혀있는지
    const allModalClosed =
      !showPickedCardModal &&
      !showPayTollModal &&
      !showBuildBase &&
      !showBuyLand &&
      !showChoosePositionModal;

    // 주사위를 굴렸고 말 이동이 완료되었는지 확인
    const allMovementsComplete =
      isMovementComplete &&
      !isDiceRolling &&
      drawIsMovementComplete &&
      !drawIsAnimating &&
      chooseIsMovementComplete &&
      !chooseIsAnimating;

    console.log("🔍 CHECK_END 실행 전 상태 확인:", {
      myIndex,
      currentPlayerIndex,
      nextAction,
      allModalClosed,
      allMovementsComplete,
    });
    if (
      nextAction === "CHECK_END" &&
      myIndex === currentPlayerIndex &&
      allModalClosed &&
      allMovementsComplete
    ) {
      try {
        const endInfo = {
          playerId: currentPlayer.playerId,
        };
        checkEnd(endInfo);
        console.log("종료 조건 체크");
      } catch (error) {
        console.error("종료 조건 체크 실패 : ", error);
        setSocketNext(null);
      }
    } else if (nextAction === "CHECK_END") {
      console.log("턴 종료 조건 미충족X :", {
        allModalClosed,
        allMovementsComplete,
      });
    }
  }, [
    nextAction,
    isMovementComplete,
    drawIsMovementComplete,
    isDiceRolling,
    drawIsAnimating,
    chooseIsAnimating,
    chooseIsMovementComplete,
    showPickedCardModal,
    showPayTollModal,
    showBuyLand,
    showBuildBase,
    myIndex,
    currentPlayerIndex,
  ]);

  // 게임 종료 확인

  const [isEnd, setIsEnd] = useState(false);
  const [showEndWinner, setShowEndWinner] = useState(false);

  useEffect(() => {
    if (socketWinner && nextAction && nextAction === "GAME_END") {
      setTimeout(() => {
        setIsEnd(true);
        setShowEndWinner(true);
      }, 1000);
    }
  }, [socketWinner, nextAction]);

  useEffect(() => {
    if (socketWinner && socketEnd === "게임 끝") {
      console.log("Game fully ended - preparing to return to waiting room");
      if (setIsStart) {
        setIsStart(false);
      }
      if (onGameEnd) {
        onGameEnd();
      }
    }
  });

  const closeBuyLand = () => {
    setShowBuyLand(false);
    setShowCardId(null);
  };

  const closeBuildBase = () => {
    setShowBuildBase(false);
    setShowCardId(null);
  };

  const closePayToll = () => {
    setShowPayTollModal(false);
    setPaidPlayer(null);
    setReceivedPlayer(null);
    setTollPrice(null);
  };

  const closePickedCard = () => {
    console.log("모달 닫기 전:", {
      nextAction,
      isCardDrawn,
      drawIsAnimating,
    });

    setShowPickedCardModal(false);
    setIsCardDrawn(false);

    console.log("모달 닫은 후:", {
      nextAction,
      isCardDrawn,
      drawIsAnimating,
    });
  };

  const closeEndWinner = () => {
    // 모달 닫고
    setShowEndWinner(false);
    // 서버로 게임 삭제 요청하고 난 뒤
    // 게임 초기화
    resetGameState();
    endGame();

    setTimeout(() => {
      if (setIsStart) {
        setIsStart(false);
      }
      setGameStatus("GAME_END");
      if (onGameEnd) {
        onGameEnd();
      }
    }, 100);
  };

  useEffect(() => {
    if (currentPlayerIndex === myIndex) {
      setOnRollDice(false);
    }
  }, [currentPlayerIndex]);

  const [positions, setPositions] = useState([]);
  const [cellSizes, setCellSizes] = useState([]);

  const size = 11; // 각 변의 칸 수
  const totalCells = size * 4 - 4; // 전체 칸 개수
  const cells = Array.from({ length: totalCells }, (_, i) => i); // 칸 번호
  // const [currentPosition, setCurrentPosition] = useState(0); // 현재 말 위치

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
    // const topTextures = [
    //   earthTexture,
    //   moonTexture,
    //   telepathyTexture1,
    //   marsTexture,
    //   jupiterTexture,
    //   vegaTexture,
    //   saturnTexture,
    //   telepathyTexture1,
    //   uranusTexture,
    //   neptuneTexture,
    //   timetravelTexture,
    //   ariesTexture,
    //   taurusTexture,
    //   telepathyTexture2,
    //   geminiTexture,
    //   neuronsTexture1,
    //   cancerTexture,
    //   timemachineTexture,
    //   leoTexture,
    //   virgoTexture,
    //   blackholeTexture,
    //   libraTexture,
    //   scorpioTexture,
    //   telepathyTexture3,
    //   sagittariusTexture,
    //   altairTexture,
    //   capricornTexture,
    //   aquariusTexture,
    //   piscesTexture,
    //   telepathyTexture3,
    //   resquebaseTexture,
    //   ursamajorTexture,
    //   andromedaTexture,
    //   telepathyTexture4,
    //   orionTexture,
    //   neuronsTexture2,
    //   cygnusTexture,
    //   halleyTexture,
    //   mercuryTexture,
    //   venusTexture,
    // ];

    return positions.map((pos, index) => {
      const tile = board?.[index];
      const ownerId = players?.findIndex(
        (player) => player.playerId === tile?.ownerId
      );

      return (
        <Cell
          key={index}
          position={pos}
          name={cities[index]}
          topTextureUrl={index < textureUrls.length ? textureUrls[index] : null}
          size={cellSizes[index]}
          ownerIndex={ownerId}
          players={players}
        />
      );
    });
  };

  // 플레이어 우주 기지를 세운!
  const [playerBases, setPlayerBases] = useState(Array(numPlayers).fill(0));

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
          color: null,
          size: baseSize,
          visible: false,
        };
      });
      setSpaceBases(initialBases);
    }
  }, [positions, cellSizes]);

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

  // positions 배열에서 각 플레이어의 위치 좌표 계산
  const getPlayerPosition = (playerPosition, playerIndex) => {
    if (!positions[playerPosition]) {
      return [0, 0, 0];
    }
    const basePosition = positions[playerPosition];
    // 말이 같은 칸에 있을 때 겹치지 않도록 약간의 오프셋 추가
    const offset = 0.5;
    switch (playerIndex) {
      case 0:
        return [
          basePosition[0] - offset,
          basePosition[1] + 0.7,
          basePosition[2] - offset,
        ];
      case 1:
        return [
          basePosition[0] + offset,
          basePosition[1] + 0.7,
          basePosition[2] - offset,
        ];
      case 2:
        return [
          basePosition[0] - offset,
          basePosition[1] + 0.7,
          basePosition[2] + offset,
        ];
      case 3:
        return [
          basePosition[0] + offset,
          basePosition[1] + 0.7,
          basePosition[2] + offset,
        ];
    }
  };

  // 우주 기지 렌더링 추가
  const renderSpaceBases = useMemo(() => {
    // console.log("render base");
    return spaceBases.map((base, index) => {
      let adjustedPosition;
      if (index >= 1 && index <= 9) {
        // 하단 1/3
        adjustedPosition = [
          base.position[0],
          base.position[1] + 0.3,
          base.position[2] + base.size.depth + 0.1,
        ];
      } else if (index >= 11 && index <= 19) {
        // 좌측 1/3
        adjustedPosition = [
          base.position[0] - base.size.width - 0.1,
          base.position[1] + 0.3,
          base.position[2],
        ];
      } else if (index >= 21 && index <= 29) {
        // 상단 1/3
        adjustedPosition = [
          base.position[0],
          base.position[1] + 0.3,
          base.position[2] - base.size.depth - 0.1,
        ];
      } else if (index >= 31 && index <= 39) {
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
          visible={base.visible}
        />
      );
    });
  }, [spaceBases]);

  // Portal을 위한 state
  const [mountPortal, setMountPortal] = useState(false);

  // 컴포넌트 마운트 후 Portal 활성화
  useEffect(() => {
    setTimeout(() => setMountPortal(true), 100);
  }, []);

  useEffect(() => {
    // Modal이 열릴 때 메인 Canvas의 렌더링 일시 중지
    if (showModal) {
      // Canvas 렌더링 일시 중지 로직
      return () => {
        // Canvas 렌더링 재개 로직
      };
    }
  }, [showModal]);

  return (
    <div className="h-full w-full flex flex-col bg-gray 900">
      <ToastContainer />
      {/* Controls Bar */}
      <div className="bg-gray-900/90 border-b border-cyan-500/30 p-4 flex justify-center items-center gap-4">
        <button
          onClick={resetCamera}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors"
        >
          Reset Camera
        </button>

        {currentPlayerIndex === myIndex && !isEnd && (
          <DiceVersion2
            setOnRollDice={setOnRollDice}
            setFirstDice={setFirstDice}
            setSecondDice={setSecondDice}
          />
        )}
      </div>

      {/* Game Board */}
      <div className="flex-1 relative">
        {!showModal && (
          <Canvas
            camera={{
              position: initialCameraPosition,
              fov: 75,
            }}
            style={{ width: "100%", height: "100%" }}
            gl={{
              powerPreference: "high-performance",
              antialias: false,
              depth: true,
            }}
            onCreated={({ gl, scene }) => {
              const texture = new TextureLoader().load(spaceBackground);
              scene.background = texture;
              gl.setClearColor("#000000", 0);

              if (gl.domElement) {
                gl.domElement.addEventListener("webglcontextlost", (event) => {
                  event.preventDefault();
                });

                gl.domElement.addEventListener("webglcontextrestored", () => {
                  gl.render(scene, camera);
                });
              }
            }}
          >
            <ambientLight intensity={1} />
            <directionalLight
              position={[10, 20, 10]}
              intensity={3}
              castShadow
            />
            <pointLight position={[10, 20, 10]} intensity={3} color="white" />
            <spotLight
              position={[0, 10, 0]}
              angle={0.6}
              penumbra={0.5}
              intensity={3}
            />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]}>
              <planeGeometry args={[16.5, 16.5]} />
              <meshStandardMaterial map={floor} color="#ffffff" />
            </mesh>

            {/* Special Areas */}
            <mesh position={[5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 5]} />
              <meshStandardMaterial
                map={timeMachineStopTexture}
                transparent={true}
              />
            </mesh>

            <mesh position={[5, 0.01, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3, 5]} />
              <meshStandardMaterial
                map={telepathyCardTexture}
                transparent={true}
              />
            </mesh>

            <mesh position={[-5, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[5, 5]} />
              <meshStandardMaterial
                map={neuronsCardTexture}
                transparent={true}
              />
            </mesh>

            <OrbitControls
              ref={orbitControlsRef}
              target={initialTarget}
              makeDefault
              maxPolarAngle={Math.PI / 2.5}
              minDistance={1}
              maxDistance={15}
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
              <HeartPlayer
                key={player.id}
                position={getPlayerPosition(playersPositions[index], index)}
                color={colors[index]}
                scale={0.6}
              />
            ))}
            {renderSpaceBases}
          </Canvas>
        )}
      </div>

      {/* {mountPortal &&
        showModal &&
        createPortal(
          <div className="fixed inset-0 z-50 w-2/3 text-center flex items-center justify-center">
            <Dice
              onComplete={handleDiceComplete}
              onClose={() => setShowModal(false)}
              roomId={roomId}
              setFirstDice={setFirstDice}
              setSecondDice={setSecondDice}
            />
          </div>,
          document.body
        )} */}
      {mountPortal &&
        showBuyLand &&
        showCardId &&
        currentPlayerIndex === myColorIndex && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <QuestBuyLand
              setIsBuyLand={setIsBuyLand}
              onClose={closeBuyLand}
              cardId={showCardId}
              cardInfo={cards?.find((card) => card.number === showCardId)}
            />
          </div>
        )}
      {mountPortal &&
        showBuildBase &&
        showCardId &&
        currentPlayerIndex === myColorIndex &&
        createPortal(
          <div className="fixed inset-0 z-50 w-2/3 text-center flex items-center justify-center">
            <QuestBuildBase
              setIsBuildBase={setIsBuildBase}
              onClose={closeBuildBase}
              cardId={showCardId}
              cardInfo={cards?.find((card) => card.number === showCardId)}
            />
          </div>,
          document.body
        )}
      {mountPortal &&
        showPayTollModal &&
        createPortal(
          <div className="fixed inset-0 z-50 w-2/3 text-center flex items-center justify-center">
            <PayTollModal
              onClose={closePayToll}
              tollPrice={tollPrice}
              receivedPlayer={receivedPlayer}
              paidPlayer={paidPlayer}
            />
          </div>,
          document.body
        )}
      {mountPortal &&
        showPickedCardModal &&
        createPortal(
          <div className="fixed inset-0 z-50 w-2/3 text-center flex items-center justify-center">
            <PickedCardModal
              onClose={closePickedCard}
              cardInfo={pickedCardInfo}
            />
          </div>,
          document.body
        )}

      {mountPortal &&
        showChoosePositionModal &&
        createPortal(
          <div className="fixed inset-0 z-50 w-2/3 text-center flex items-center justify-center">
            <ChoosePositionModal
              closeModal={() => setShowChoosePositionModal(false)}
            />
          </div>,
          document.body
        )}

      {mountPortal &&
        isEnd &&
        socketWinner &&
        showEndWinner &&
        createPortal(
          <div className="fixed inset-0 z-50 w-full text-center flex items-center justify-center">
            <EndWinner onClose={closeEndWinner} />
          </div>,
          document.body
        )}
    </div>
  );
};

export default TravelMap;
