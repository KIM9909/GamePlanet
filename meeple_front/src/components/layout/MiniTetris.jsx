import React, { useState, useEffect, useCallback } from "react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 15;
const SHAPES = [
  [[1, 1, 1, 1]], // I - 0
  [
    [1, 1],
    [1, 1],
  ], // O - 1
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T - 2
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J - 3
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L - 4
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z - 5
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S - 6
];

const COLORS = [
  "bg-yellow-200", // I - 0
  "bg-yellow-300", // O - 1
  "bg-purple-400", // T - 2
  "bg-emerald-400", // J - 3
  "bg-orange-400", // L - 4
  "bg-red-400", // Z - 5
  "bg-red-400", // S - 6
];

const MiniTetris = () => {
  const [board, setBoard] = useState(
    Array(BOARD_HEIGHT)
      .fill()
      .map(() => Array(BOARD_WIDTH).fill(-1))
  );
  const [piece, setPiece] = useState(null);
  const [pieceColor, setPieceColor] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const createNewPiece = useCallback(() => {
    const index = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[index];
    setPiece(shape);
    setPieceColor(index);
    setPosition({ x: Math.floor((BOARD_WIDTH - shape[0].length) / 2), y: 0 });
  }, []);

  const checkCollision = useCallback(
    (newX, newY, currentPiece) => {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x]) {
            const boardX = newX + x;
            const boardY = newY + y;

            if (
              boardX < 0 ||
              boardX >= BOARD_WIDTH ||
              boardY >= BOARD_HEIGHT ||
              (boardY >= 0 && board[boardY][boardX] !== -1)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  const mergePiece = useCallback(() => {
    const newBoard = board.map((row) => [...row]);

    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] && position.y + y >= 0) {
          newBoard[position.y + y][position.x + x] = pieceColor;
        }
      }
    }

    let clearedLines = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== -1)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(-1));
        clearedLines++;
      }
    }

    setScore((prev) => prev + clearedLines * 100);
    setBoard(newBoard);
    createNewPiece();
  }, [board, piece, pieceColor, position, createNewPiece]);

  const moveDown = useCallback(() => {
    if (!piece || gameOver) return;

    if (checkCollision(position.x, position.y + 1, piece)) {
      if (position.y <= 0) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }
      mergePiece();
    } else {
      setPosition((prev) => ({ ...prev, y: prev.y + 1 }));
    }
  }, [piece, position, checkCollision, mergePiece, gameOver]);

  const moveHorizontal = useCallback(
    (direction) => {
      if (!piece || gameOver) return;
      const newX = position.x + direction;
      if (!checkCollision(newX, position.y, piece)) {
        setPosition((prev) => ({ ...prev, x: newX }));
      }
    },
    [piece, position, checkCollision, gameOver]
  );

  const rotatePiece = useCallback(() => {
    if (!piece || gameOver) return;
    const rotated = piece[0].map((_, i) =>
      piece.map((row) => row[i]).reverse()
    );
    if (!checkCollision(position.x, position.y, rotated)) {
      setPiece(rotated);
    }
  }, [piece, position, checkCollision, gameOver]);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyPress = (e) => {
      if (
        ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)
      ) {
        e.preventDefault();

        switch (e.key) {
          case "ArrowLeft":
            moveHorizontal(-1);
            break;
          case "ArrowRight":
            moveHorizontal(1);
            break;
          case "ArrowDown":
            moveDown();
            break;
          case "ArrowUp":
            rotatePiece();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    const interval = setInterval(moveDown, 800);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(interval);
    };
  }, [isPlaying, moveDown, moveHorizontal, rotatePiece]);

  const startGame = () => {
    setBoard(
      Array(BOARD_HEIGHT)
        .fill()
        .map(() => Array(BOARD_WIDTH).fill(-1))
    );
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    createNewPiece();
  };

  return (
    <div className="flex flex-col items-center px-2">
      <div className="relative border border-cyan-500/60 bg-gray-900/90 p-1 rounded">
        <div className="absolute -top-3 left-2 px-2 bg-gray-900/90 border border-cyan-500/60 rounded text-cyan-400 text-xs">
          Score: {score}
        </div>
        {board.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => {
              let isCurrent = false;
              let currentColor = "";

              if (piece) {
                const pieceY = y - position.y;
                const pieceX = x - position.x;

                // 수정된 부분: pieceY >= 0 조건 제거
                if (
                  pieceX >= 0 &&
                  pieceX < piece[0].length &&
                  pieceY < piece.length
                ) {
                  // piece 배열 범위 내에 있는지 확인
                  if (pieceY >= 0 && piece[pieceY] && piece[pieceY][pieceX]) {
                    isCurrent = true;
                    currentColor = COLORS[pieceColor];
                  }
                }
              }

              return (
                <div
                  key={x}
                  className={`w-4 h-4 border border-gray-800/40 
                    ${
                      cell !== -1
                        ? COLORS[cell] + " shadow-sm shadow-cyan-500/20"
                        : "bg-gray-900/60"
                    }
                    ${
                      isCurrent
                        ? currentColor + " shadow-sm shadow-cyan-500/20"
                        : ""
                    }
                  `}
                />
              );
            })}
          </div>
        ))}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <button
              onClick={startGame}
              className="px-3 py-1 bg-cyan-500 text-white text-xs rounded 
                        hover:bg-cyan-600 transition-colors duration-300
                        shadow-sm shadow-cyan-500/50"
            >
              {gameOver ? "Try Again" : "Play"}
            </button>
          </div>
        )}
      </div>
      <div className="mt-1 text-[15px] text-cyan-400/60">
        ← → ↓ move • ↑ rotate
      </div>
    </div>
  );
};

export default MiniTetris;
