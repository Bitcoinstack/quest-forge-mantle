import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  BookOpen, 
  Target,
  RotateCcw,
  Crown,
  Zap
} from 'lucide-react';

// Chess piece types
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

interface Position {
  row: number;
  col: number;
}

type Board = (ChessPiece | null)[][];

// Piece symbols
const PIECE_SYMBOLS: Record<PieceType, Record<PieceColor, string>> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

// Initialize chess board
const initializeBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Black pieces (top)
  board[0] = [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ];
  board[1] = Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'black' as PieceColor }));
  
  // White pieces (bottom)
  board[6] = Array(8).fill(null).map(() => ({ type: 'pawn' as PieceType, color: 'white' as PieceColor }));
  board[7] = [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ];
  
  return board;
};

// Check if move is valid (simplified for demo)
const isValidMove = (board: Board, from: Position, to: Position, piece: ChessPiece): boolean => {
  const dx = Math.abs(to.col - from.col);
  const dy = Math.abs(to.row - from.row);
  const targetPiece = board[to.row][to.col];
  
  // Can't capture own piece
  if (targetPiece && targetPiece.color === piece.color) return false;
  
  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Forward move
      if (to.col === from.col && !targetPiece) {
        if (to.row === from.row + direction) return true;
        if (from.row === startRow && to.row === from.row + 2 * direction && !board[from.row + direction][from.col]) return true;
      }
      // Capture
      if (dx === 1 && to.row === from.row + direction && targetPiece) return true;
      return false;
      
    case 'rook':
      return (dx === 0 || dy === 0);
      
    case 'bishop':
      return dx === dy;
      
    case 'queen':
      return dx === dy || dx === 0 || dy === 0;
      
    case 'king':
      return dx <= 1 && dy <= 1;
      
    case 'knight':
      return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      
    default:
      return false;
  }
};

// AI move (simple random valid move)
const getAIMove = (board: Board): { from: Position; to: Position } | null => {
  const blackPieces: { pos: Position; piece: ChessPiece }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === 'black') {
        blackPieces.push({ pos: { row, col }, piece });
      }
    }
  }
  
  // Shuffle pieces
  blackPieces.sort(() => Math.random() - 0.5);
  
  for (const { pos, piece } of blackPieces) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(board, pos, { row, col }, piece)) {
          return { from: pos, to: { row, col } };
        }
      }
    }
  }
  
  return null;
};

const DIFFICULTIES = [
  { id: 'beginner', name: 'Beginner', xpMultiplier: 1 },
  { id: 'intermediate', name: 'Intermediate', xpMultiplier: 1.5 },
  { id: 'advanced', name: 'Advanced', xpMultiplier: 2 },
  { id: 'master', name: 'Master', xpMultiplier: 3 },
];

export default function ChessGame() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [difficulty, setDifficulty] = useState('beginner');
  const [xpEarned, setXpEarned] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [capturedPieces, setCapturedPieces] = useState<{ white: ChessPiece[], black: ChessPiece[] }>({ white: [], black: [] });

  // Calculate valid moves for selected piece
  useEffect(() => {
    if (!selectedSquare) {
      setValidMoves([]);
      return;
    }
    
    const piece = board[selectedSquare.row][selectedSquare.col];
    if (!piece || piece.color !== 'white') {
      setValidMoves([]);
      return;
    }
    
    const moves: Position[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(board, selectedSquare, { row, col }, piece)) {
          moves.push({ row, col });
        }
      }
    }
    setValidMoves(moves);
  }, [selectedSquare, board]);

  // AI turn
  useEffect(() => {
    if (isPlayerTurn || gameOver) return;
    
    const timer = setTimeout(() => {
      const move = getAIMove(board);
      if (move) {
        makeMove(move.from, move.to, 'black');
      } else {
        // No valid moves - player wins
        endGame('player');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board]);

  const makeMove = useCallback((from: Position, to: Position, color: PieceColor) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    const capturedPiece = newBoard[to.row][to.col];
    
    if (capturedPiece) {
      setCapturedPieces(prev => ({
        ...prev,
        [color]: [...prev[color], capturedPiece]
      }));
      
      // Check for king capture
      if (capturedPiece.type === 'king') {
        endGame(color === 'white' ? 'player' : 'ai');
        return;
      }
    }
    
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
    
    setBoard(newBoard);
    setMoveCount(prev => prev + 1);
    setIsPlayerTurn(color !== 'white');
    setSelectedSquare(null);
  }, [board]);

  const handleSquareClick = (row: number, col: number) => {
    if (!isPlayerTurn || gameOver) return;
    
    const piece = board[row][col];
    
    // If no piece selected and clicked on player's piece
    if (!selectedSquare && piece && piece.color === 'white') {
      setSelectedSquare({ row, col });
      return;
    }
    
    // If piece selected and clicked on valid move
    if (selectedSquare && validMoves.some(m => m.row === row && m.col === col)) {
      makeMove(selectedSquare, { row, col }, 'white');
      return;
    }
    
    // If clicked on another player piece, select that
    if (piece && piece.color === 'white') {
      setSelectedSquare({ row, col });
    } else {
      setSelectedSquare(null);
    }
  };

  const endGame = async (gameWinner: 'player' | 'ai') => {
    setGameOver(true);
    setWinner(gameWinner);
    
    const difficultyData = DIFFICULTIES.find(d => d.id === difficulty)!;
    const baseXP = gameWinner === 'player' ? 100 : 25;
    const earnedXP = Math.floor(baseXP * difficultyData.xpMultiplier);
    setXpEarned(earnedXP);
    
    // Save to database
    if (address) {
      try {
        // Create game session
        const { data: session } = await supabase
          .from('game_sessions')
          .insert({
            wallet_address: address,
            game_type: 'chess',
            difficulty,
            status: 'completed',
            xp_earned: earnedXP,
            completed_at: new Date().toISOString(),
            game_data: { result: gameWinner === 'player' ? 'win' : 'loss', moves: moveCount }
          })
          .select()
          .single();
        
        if (session) {
          await supabase
            .from('chess_games')
            .insert({
              session_id: session.id,
              wallet_address: address,
              ai_difficulty: difficulty,
              game_result: gameWinner === 'player' ? 'win' : 'loss',
              move_history: []
            });
        }
        
        toast.success(`Game saved! +${earnedXP} XP earned`);
      } catch (error) {
        console.error('Error saving game:', error);
      }
    }
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setSelectedSquare(null);
    setValidMoves([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
    setMoveCount(0);
    setCapturedPieces({ white: [], black: [] });
    setXpEarned(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2 text-foreground hover:bg-foreground/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quests
          </Button>
          
          <h1 className="font-display text-xl font-bold text-foreground">CHESS QUEST</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/10 rounded-lg">
              <Star className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">{xpEarned} XP</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Game Info */}
            <div className="space-y-6">
              {/* Difficulty Selection */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Difficulty</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DIFFICULTIES.map((d) => (
                    <Button
                      key={d.id}
                      variant={difficulty === d.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setDifficulty(d.id); resetGame(); }}
                      className={difficulty === d.id ? 'bg-foreground text-background' : 'border-border text-foreground hover:bg-foreground/10'}
                    >
                      {d.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Game Stats */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Game Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Moves</span>
                    <span className="font-semibold text-foreground">{moveCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Turn</span>
                    <span className="font-semibold text-foreground">{isPlayerTurn ? 'Your Turn' : 'AI Thinking...'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full gap-2 border-border text-foreground hover:bg-foreground/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Game
                </Button>
                <Button
                  onClick={() => setShowTutorial(true)}
                  variant="outline"
                  className="w-full gap-2 border-border text-foreground hover:bg-foreground/10"
                >
                  <BookOpen className="w-4 h-4" />
                  Tutorial
                </Button>
                <a
                  href="https://docs.mantle.xyz/network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-border rounded-lg text-foreground hover:bg-foreground/10 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Learn Strategies
                </a>
              </div>
            </div>

            {/* Chess Board */}
            <div className="lg:col-span-2">
              <div className="aspect-square max-w-lg mx-auto">
                <div className="grid grid-cols-8 gap-0 border-4 border-foreground/20 rounded-lg overflow-hidden shadow-2xl">
                  {board.map((row, rowIndex) =>
                    row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
                      const isValidMoveSquare = validMoves.some(m => m.row === rowIndex && m.col === colIndex);
                      
                      return (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                          className={`
                            aspect-square flex items-center justify-center cursor-pointer relative transition-all duration-200
                            ${isLight ? 'bg-foreground/90' : 'bg-muted'}
                            ${isSelected ? 'ring-4 ring-primary z-10' : ''}
                            ${isValidMoveSquare ? 'after:absolute after:inset-0 after:bg-primary/30' : ''}
                          `}
                        >
                          {piece && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`text-4xl md:text-5xl select-none ${piece.color === 'white' ? 'drop-shadow-lg' : ''}`}
                              style={{ color: piece.color === 'white' ? 'hsl(0 0% 100%)' : 'hsl(0 0% 0%)' }}
                            >
                              {PIECE_SYMBOLS[piece.type][piece.color]}
                            </motion.span>
                          )}
                          {isValidMoveSquare && !piece && (
                            <div className="w-4 h-4 rounded-full bg-primary/50" />
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Captured Pieces */}
              <div className="mt-6 flex justify-between max-w-lg mx-auto">
                <div className="flex gap-1">
                  {capturedPieces.white.map((p, i) => (
                    <span key={i} className="text-2xl" style={{ color: 'hsl(0 0% 0%)' }}>
                      {PIECE_SYMBOLS[p.type][p.color]}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {capturedPieces.black.map((p, i) => (
                    <span key={i} className="text-2xl" style={{ color: 'hsl(0 0% 100%)' }}>
                      {PIECE_SYMBOLS[p.type][p.color]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 text-center"
            >
              {winner === 'player' ? (
                <>
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">VICTORY!</h2>
                </>
              ) : (
                <>
                  <Crown className="w-16 h-16 text-foreground/50 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">DEFEAT</h2>
                </>
              )}
              
              <p className="text-foreground/60 mb-6">
                {winner === 'player' ? 'Excellent strategy!' : 'Better luck next time!'}
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-foreground/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">+{xpEarned} XP Earned</span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-foreground/10"
                >
                  Exit
                </Button>
                <Button
                  onClick={resetGame}
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  Play Again
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Chess Tutorial</h2>
              
              <div className="space-y-4 text-sm text-foreground/80">
                <p>Click on your pieces (white) to select them, then click on a highlighted square to move.</p>
                <p><strong>Goal:</strong> Capture the opponent's King to win!</p>
                <p><strong>XP Rewards:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Win: 100 XP × difficulty multiplier</li>
                  <li>Loss: 25 XP × difficulty multiplier</li>
                </ul>
                <p className="text-foreground/60">
                  Learn advanced strategies at{' '}
                  <a 
                    href="https://docs.mantle.xyz/network" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Mantle Documentation
                  </a>
                </p>
              </div>
              
              <Button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-6 bg-foreground text-background hover:bg-foreground/90"
              >
                Got it!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
