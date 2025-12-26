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
  RotateCcw,
  Crown,
  Zap,
  Lightbulb
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

// Comprehensive Mantle documentation tips - shown on every move
const MANTLE_MOVE_TIPS: Record<PieceType, string[]> = {
  pawn: [
    "🏗️ PAWN MOVE: Like pawns moving forward, Mantle uses Optimistic Rollups to push transactions efficiently to Layer 1.",
    "⚡ PAWN ADVANCE: Each pawn step is like a Mantle transaction - low gas, high speed! Mantle reduces costs by 80%+.",
    "🔗 PAWN STRATEGY: Pawns work together like Mantle's modular architecture - Data Availability Layer + Execution Layer = efficiency.",
    "💎 PAWN POTENTIAL: Pawns can become Queens, just like building on Mantle can scale your dApp to millions of users.",
  ],
  knight: [
    "🐴 KNIGHT MOVE: Knights jump over pieces like Mantle jumps over L1 congestion with its Layer 2 scaling solution!",
    "⚔️ KNIGHT TACTICS: Unique L-shaped moves mirror Mantle's unique modular rollup design - different path, better results.",
    "🌐 KNIGHT FLEXIBILITY: Knights reach anywhere, like Mantle's EVM compatibility lets you deploy existing Solidity code instantly.",
    "🔥 KNIGHT POWER: The knight's surprise attacks are like Mantle's fast finality - transactions confirmed in seconds!",
  ],
  bishop: [
    "📐 BISHOP MOVE: Bishops travel diagonally like data flows through Mantle's specialized Data Availability layer.",
    "🎯 BISHOP RANGE: Long-range attacks mirror Mantle's cross-chain bridging capabilities to Ethereum mainnet.",
    "💡 BISHOP VISION: Bishops see the whole diagonal, like Mantle provides full visibility with block explorers and APIs.",
    "🏛️ BISHOP STRATEGY: Pair your bishops like Mantle pairs security (from Ethereum) with scalability (from rollups).",
  ],
  rook: [
    "🏰 ROOK MOVE: Rooks move in straight lines like Mantle's direct connection to Ethereum security guarantees.",
    "🔐 ROOK POWER: The rook's strength represents Mantle's inherited Ethereum security - rock solid foundation!",
    "📊 ROOK CONTROL: Control files and ranks like Mantle controls transaction ordering with its Sequencer.",
    "⚙️ ROOK EFFICIENCY: Rooks maximize board control efficiently, like Mantle maximizes throughput with minimal cost.",
  ],
  queen: [
    "👑 QUEEN MOVE: The Queen's versatility mirrors Mantle's full feature set - DeFi, NFTs, Gaming, all optimized!",
    "💫 QUEEN POWER: Most powerful piece = Most powerful L2. Mantle handles complex smart contracts effortlessly.",
    "🎪 QUEEN RANGE: Queens reach everywhere, like Mantle's ecosystem spans wallets, bridges, DEXs, and more.",
    "🌟 QUEEN STRATEGY: The queen dominates like $MNT token powers the entire Mantle ecosystem for gas and governance.",
  ],
  king: [
    "🏆 KING MOVE: The King is precious like your assets on Mantle - protected by Ethereum-grade security!",
    "🛡️ KING SAFETY: Protect your king like Mantle's fraud proofs protect your transactions from invalid state changes.",
    "👑 KING POSITION: Central king = central importance. Mantle keeps your funds secure at the protocol level.",
    "🔒 KING DEFENSE: Castle to protect the king, bridge to Mantle to protect your gas fees from L1 costs!",
  ],
};

// General Mantle tips for captures and special events
const MANTLE_CAPTURE_TIPS = [
  "⚔️ CAPTURE! Just like earning rewards in DeFi, Mantle lets you stack yields while keeping gas costs minimal.",
  "🎯 PIECE CAPTURED! On Mantle, every transaction is an opportunity. Explore dApps at mantle.xyz/ecosystem",
  "💰 NICE CAPTURE! Mantle's low fees mean more value stays in your pocket. Transaction costs often under $0.01!",
  "🏆 STRATEGIC CAPTURE! Like good chess strategy, Mantle uses data compression to optimize every operation.",
  "⚡ EXCELLENT MOVE! Mantle processes thousands of TPS - your dApp can handle any traffic surge.",
];

const MANTLE_CHECK_TIPS = [
  "♟️ CHECK! Putting pressure on like Mantle puts pressure on high gas fees - driving costs down for everyone.",
  "⚠️ CHECK! Your opponent is threatened, just like centralized solutions are threatened by Mantle's decentralization.",
  "🎯 CHECK! Targeting the king like Mantle targets inefficiency in the blockchain space.",
];

const MANTLE_CHECKMATE_TIPS = [
  "🏆 CHECKMATE! Victory through strategy, just like Mantle achieves scaling victory through modular architecture!",
  "👑 CHECKMATE! You've won! Celebrate on Mantle - deploy your victory NFT with near-zero gas fees!",
];

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

// Check if move is valid with improved logic
const isValidMove = (board: Board, from: Position, to: Position, piece: ChessPiece): boolean => {
  const dx = Math.abs(to.col - from.col);
  const dy = Math.abs(to.row - from.row);
  const targetPiece = board[to.row][to.col];
  
  // Can't capture own piece
  if (targetPiece && targetPiece.color === piece.color) return false;
  
  // Check path is clear for sliding pieces
  const isPathClear = (rowDir: number, colDir: number): boolean => {
    let r = from.row + rowDir;
    let c = from.col + colDir;
    while (r !== to.row || c !== to.col) {
      if (board[r][c]) return false;
      r += rowDir;
      c += colDir;
    }
    return true;
  };
  
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
      if (dx !== 0 && dy !== 0) return false;
      const rookRowDir = to.row > from.row ? 1 : to.row < from.row ? -1 : 0;
      const rookColDir = to.col > from.col ? 1 : to.col < from.col ? -1 : 0;
      return isPathClear(rookRowDir, rookColDir);
      
    case 'bishop':
      if (dx !== dy) return false;
      const bishopRowDir = to.row > from.row ? 1 : -1;
      const bishopColDir = to.col > from.col ? 1 : -1;
      return isPathClear(bishopRowDir, bishopColDir);
      
    case 'queen':
      if (dx !== dy && dx !== 0 && dy !== 0) return false;
      const queenRowDir = to.row > from.row ? 1 : to.row < from.row ? -1 : 0;
      const queenColDir = to.col > from.col ? 1 : to.col < from.col ? -1 : 0;
      return isPathClear(queenRowDir, queenColDir);
      
    case 'king':
      return dx <= 1 && dy <= 1;
      
    case 'knight':
      return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      
    default:
      return false;
  }
};

// Check if a king is in check
const isKingInCheck = (board: Board, kingColor: PieceColor): boolean => {
  let kingPos: Position | null = null;
  
  // Find the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === kingColor) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  // Check if any enemy piece can attack the king
  const enemyColor = kingColor === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === enemyColor) {
        if (isValidMove(board, { row, col }, kingPos, piece)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// AI move with improved strategy
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
  
  // Prioritize captures
  const captureMoves: { from: Position; to: Position; value: number }[] = [];
  const regularMoves: { from: Position; to: Position }[] = [];
  
  const pieceValue: Record<PieceType, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100
  };
  
  for (const { pos, piece } of blackPieces) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(board, pos, { row, col }, piece)) {
          const targetPiece = board[row][col];
          if (targetPiece) {
            captureMoves.push({ from: pos, to: { row, col }, value: pieceValue[targetPiece.type] });
          } else {
            regularMoves.push({ from: pos, to: { row, col } });
          }
        }
      }
    }
  }
  
  // Prioritize high-value captures
  if (captureMoves.length > 0) {
    captureMoves.sort((a, b) => b.value - a.value);
    return { from: captureMoves[0].from, to: captureMoves[0].to };
  }
  
  // Random regular move with preference for center control
  if (regularMoves.length > 0) {
    regularMoves.sort((a, b) => {
      const aCenter = Math.abs(3.5 - a.to.row) + Math.abs(3.5 - a.to.col);
      const bCenter = Math.abs(3.5 - b.to.row) + Math.abs(3.5 - b.to.col);
      return aCenter - bCenter + (Math.random() - 0.5) * 2;
    });
    return regularMoves[0];
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
  const [mantleTip, setMantleTip] = useState<string | null>(null);
  const [isInCheck, setIsInCheck] = useState(false);
  const [lastMovedPiece, setLastMovedPiece] = useState<PieceType | null>(null);

  // Show Mantle tip based on move type
  const showMantleTip = useCallback((pieceType: PieceType, wasCapture: boolean, wasCheck: boolean) => {
    let tip: string;
    
    if (wasCheck) {
      tip = MANTLE_CHECK_TIPS[Math.floor(Math.random() * MANTLE_CHECK_TIPS.length)];
    } else if (wasCapture) {
      tip = MANTLE_CAPTURE_TIPS[Math.floor(Math.random() * MANTLE_CAPTURE_TIPS.length)];
    } else {
      const pieceTips = MANTLE_MOVE_TIPS[pieceType];
      tip = pieceTips[Math.floor(Math.random() * pieceTips.length)];
    }
    
    setMantleTip(tip);
    setTimeout(() => setMantleTip(null), 5000);
  }, []);

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

  // Check for check status
  useEffect(() => {
    setIsInCheck(isKingInCheck(board, 'white'));
  }, [board]);

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
    }, 800);
    
    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board]);

  const makeMove = useCallback((from: Position, to: Position, color: PieceColor) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    const capturedPiece = newBoard[to.row][to.col];
    
    if (!piece) return;
    
    const wasCapture = !!capturedPiece;
    
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
    
    // Pawn promotion
    if (piece.type === 'pawn') {
      if ((piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7)) {
        newBoard[to.row][to.col] = { type: 'queen', color: piece.color };
      }
    }
    
    setBoard(newBoard);
    setMoveCount(prev => prev + 1);
    setLastMovedPiece(piece.type);
    
    // Check if opponent is in check after move
    const opponentColor = color === 'white' ? 'black' : 'white';
    const wasCheck = isKingInCheck(newBoard, opponentColor);
    
    // Show Mantle tip on every player move
    if (color === 'white') {
      showMantleTip(piece.type, wasCapture, wasCheck);
    }
    
    setIsPlayerTurn(color !== 'white');
    setSelectedSquare(null);
  }, [board, showMantleTip]);

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
    
    if (gameWinner === 'player') {
      setMantleTip(MANTLE_CHECKMATE_TIPS[Math.floor(Math.random() * MANTLE_CHECKMATE_TIPS.length)]);
    }
    
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
    setMantleTip(null);
    setIsInCheck(false);
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
          {/* Mantle Tip Banner - Always visible during game */}
          <AnimatePresence mode="wait">
            {mantleTip && (
              <motion.div
                key={mantleTip}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 flex items-start gap-3"
              >
                <Lightbulb className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">{mantleTip}</p>
                  <p className="text-xs text-foreground/50 mt-1">docs.mantle.xyz</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Check Warning */}
          <AnimatePresence>
            {isInCheck && !gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-center"
              >
                <span className="text-red-400 font-bold">⚠️ YOUR KING IS IN CHECK!</span>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Captured</span>
                    <span className="font-semibold text-foreground">{capturedPieces.white.length} pieces</span>
                  </div>
                </div>
              </div>

              {/* Mantle Learning Progress */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">📚 Mantle Learning</h3>
                <p className="text-xs text-foreground/60 mb-3">Every move teaches you about Mantle Network!</p>
                <div className="text-sm text-foreground/80">
                  <div className="flex justify-between mb-1">
                    <span>Moves made</span>
                    <span className="font-bold">{moveCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tips learned</span>
                    <span className="font-bold">{Math.floor(moveCount / 2) + capturedPieces.white.length}</span>
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
              </div>
            </div>

            {/* Chess Board */}
            <div className="lg:col-span-2">
              <div className="aspect-square max-w-lg mx-auto">
                {/* Deep Green Chess Board */}
                <div className="grid grid-cols-8 gap-0 border-4 border-emerald-800 rounded-lg overflow-hidden shadow-2xl">
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
                            ${isLight ? 'bg-emerald-200' : 'bg-emerald-800'}
                            ${isSelected ? 'ring-4 ring-yellow-400 z-10' : ''}
                            ${isValidMoveSquare ? 'after:absolute after:inset-0 after:bg-yellow-400/40' : ''}
                          `}
                        >
                          {piece && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`text-4xl md:text-5xl select-none drop-shadow-lg`}
                              style={{ 
                                color: piece.color === 'white' ? 'hsl(0 0% 100%)' : 'hsl(0 0% 10%)',
                                textShadow: piece.color === 'white' ? '2px 2px 4px rgba(0,0,0,0.5)' : '2px 2px 4px rgba(255,255,255,0.3)'
                              }}
                            >
                              {PIECE_SYMBOLS[piece.type][piece.color]}
                            </motion.span>
                          )}
                          {isValidMoveSquare && !piece && (
                            <div className="w-4 h-4 rounded-full bg-yellow-400/70 shadow-lg" />
                          )}
                          {isValidMoveSquare && piece && (
                            <div className="absolute inset-1 border-4 border-red-500 rounded-sm opacity-70" />
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Captured Pieces */}
              <div className="mt-6 flex justify-between max-w-lg mx-auto">
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs text-foreground/50 w-full mb-1">You captured:</span>
                  {capturedPieces.white.map((p, i) => (
                    <span key={i} className="text-2xl" style={{ color: 'hsl(0 0% 20%)' }}>
                      {PIECE_SYMBOLS[p.type][p.color]}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1 flex-wrap text-right">
                  <span className="text-xs text-foreground/50 w-full mb-1">AI captured:</span>
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
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">CHECKMATE!</h2>
                  <p className="text-foreground/60 mb-2">Excellent strategy!</p>
                  <p className="text-sm text-emerald-400 mb-4">
                    🎓 You've learned {Math.floor(moveCount / 2) + capturedPieces.white.length} facts about Mantle!
                  </p>
                </>
              ) : (
                <>
                  <Crown className="w-16 h-16 text-foreground/50 mx-auto mb-4" />
                  <h2 className="font-display text-3xl font-bold text-foreground mb-2">DEFEAT</h2>
                  <p className="text-foreground/60 mb-4">Better luck next time!</p>
                </>
              )}
              
              <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-foreground/10 rounded-lg">
                <Zap className="w-5 h-5 text-foreground" />
                <span className="font-bold text-foreground">+{xpEarned} XP Earned</span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/journey')}
                  variant="outline"
                  className="flex-1 border-border text-foreground hover:bg-foreground/10"
                >
                  View Journey
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
                <p><strong className="text-foreground">Goal:</strong> Capture the opponent's King to win!</p>
                <p><strong className="text-foreground">XP Rewards:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Win: 100 XP × difficulty multiplier</li>
                  <li>Loss: 25 XP × difficulty multiplier</li>
                </ul>
                <div className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
                  <p className="text-emerald-400 font-semibold">📚 Learn While You Play!</p>
                  <p className="text-foreground/60 text-xs mt-1">
                    Every move you make teaches you about Mantle Network - the more you play, the more you learn!
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowTutorial(false)}
                className="w-full mt-6 bg-foreground text-background hover:bg-foreground/90"
              >
                Start Playing!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}