'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Tetromino shapes and colors
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00F0F0', // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000F0', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#F0A000', // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#F0F000', // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00F000', // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#A000F0', // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#F00000', // Red
  },
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

type TetrominoType = keyof typeof TETROMINOS;
type Board = (string | null)[][];

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  color: string;
  position: Position;
}

const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
};

const getRandomTetromino = (): { type: TetrominoType; piece: Piece } => {
  const types = Object.keys(TETROMINOS) as TetrominoType[];
  const type = types[Math.floor(Math.random() * types.length)];
  const tetromino = TETROMINOS[type];
  return {
    type,
    piece: {
      shape: tetromino.shape,
      color: tetromino.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
    },
  };
};

const rotatePiece = (piece: Piece): Piece => {
  const newShape = piece.shape[0].map((_, index) =>
    piece.shape.map(row => row[index]).reverse()
  );
  return { ...piece, shape: newShape };
};

const checkCollision = (board: Board, piece: Piece, offset: Position = { x: 0, y: 0 }): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.position.x + x + offset.x;
        const newY = piece.position.y + y + offset.y;

        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const mergePieceToBoard = (board: Board, piece: Piece): Board => {
  const newBoard = board.map(row => [...row]);
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  return newBoard;
};

const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { newBoard, linesCleared };
};

export default function TetrisPage() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const spawnNewPiece = useCallback(() => {
    if (nextPiece) {
      const newNext = getRandomTetromino();
      setCurrentPiece(nextPiece);
      setNextPiece(newNext.piece);

      if (checkCollision(board, nextPiece)) {
        setGameOver(true);
        return false;
      }
      return true;
    } else {
      const current = getRandomTetromino();
      const next = getRandomTetromino();
      setCurrentPiece(current.piece);
      setNextPiece(next.piece);
      return true;
    }
  }, [board, nextPiece]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const newPosition = { x: 0, y: 1 };

    if (!checkCollision(board, currentPiece, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          x: currentPiece.position.x + newPosition.x,
          y: currentPiece.position.y + newPosition.y,
        },
      });
    } else {
      const newBoard = mergePieceToBoard(board, currentPiece);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);
      spawnNewPiece();
    }
  }, [currentPiece, board, gameOver, isPaused, spawnNewPiece]);

  const moveLeft = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const newPosition = { x: -1, y: 0 };
    if (!checkCollision(board, currentPiece, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          x: currentPiece.position.x + newPosition.x,
          y: currentPiece.position.y + newPosition.y,
        },
      });
    }
  }, [currentPiece, board, gameOver, isPaused]);

  const moveRight = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const newPosition = { x: 1, y: 0 };
    if (!checkCollision(board, currentPiece, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          x: currentPiece.position.x + newPosition.x,
          y: currentPiece.position.y + newPosition.y,
        },
      });
    }
  }, [currentPiece, board, gameOver, isPaused]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const rotated = rotatePiece(currentPiece);
    if (!checkCollision(board, rotated)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, board, gameOver, isPaused]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let dropDistance = 0;
    while (!checkCollision(board, currentPiece, { x: 0, y: dropDistance + 1 })) {
      dropDistance++;
    }

    const droppedPiece = {
      ...currentPiece,
      position: {
        x: currentPiece.position.x,
        y: currentPiece.position.y + dropDistance,
      },
    };

    const newBoard = mergePieceToBoard(board, droppedPiece);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * 100 + dropDistance * 2);
    spawnNewPiece();
  }, [currentPiece, board, gameOver, isPaused, spawnNewPiece]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPiece(null);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnNewPiece();
    }
  }, [currentPiece, gameOver, spawnNewPiece]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        moveDown();
      }, 1000);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveDown, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, gameOver]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return (
      <div className="inline-block bg-gray-800 p-2 rounded">
        {nextPiece.shape.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className="border border-gray-700"
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  backgroundColor: cell ? nextPiece.color : 'transparent',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  const displayBoard = renderBoard();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">Tetris</h1>

      <div className="flex gap-8 items-start">
        {/* Main game board */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
          <div className="border-2 border-gray-600">
            {displayBoard.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    className="border border-gray-700"
                    style={{
                      width: `${CELL_SIZE}px`,
                      height: `${CELL_SIZE}px`,
                      backgroundColor: cell || '#1a1a1a',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Score</h2>
            <p className="text-3xl font-bold text-cyan-400">{score}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Next</h2>
            {renderNextPiece()}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Controls</h2>
            <div className="text-sm space-y-1 text-gray-300">
              <p>← → : Move</p>
              <p>↓ : Soft Drop</p>
              <p>↑ : Rotate</p>
              <p>Space : Hard Drop</p>
              <p>P : Pause</p>
            </div>
          </div>

          {gameOver && (
            <div className="bg-red-900 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Game Over!</h2>
              <button
                onClick={resetGame}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
              >
                Play Again
              </button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div className="bg-yellow-900 p-4 rounded-lg">
              <h2 className="text-xl font-semibold">Paused</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
