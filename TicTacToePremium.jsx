// TicTacToePremium.jsx
// Complete, working premium Tic Tac Toe React component
// - Glassmorphism + gold accents
// - Name prompt, difficulty (easy / medium / hard)
// - AI: easy=random, medium=heuristic (win/block), hard=minimax
// - Confetti + animated winner modal
// - Right-hand panel and match log removed

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function calculateWinner(board) {
  for (const [a,b,c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

function minimax(board, isMaximizing) {
  const winner = calculateWinner(board);
  if (winner === 'O') return { score: 1 };
  if (winner === 'X') return { score: -1 };
  if (winner === 'draw') return { score: 0 };

  if (isMaximizing) {
    let best = { score: -Infinity, index: null };
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const result = minimax(board, false);
        board[i] = null;
        if (result.score > best.score) best = { score: result.score, index: i };
      }
    }
    return best;
  } else {
    let best = { score: Infinity, index: null };
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const result = minimax(board, true);
        board[i] = null;
        if (result.score < best.score) best = { score: result.score, index: i };
      }
    }
    return best;
  }
}

function findWinningMove(bd, player) {
  for (const [a,b,c] of LINES) {
    const trio = [bd[a], bd[b], bd[c]];
    if (trio.filter(x => x === player).length === 2 && trio.includes(null)) {
      const idx = [a,b,c].find(i => bd[i] === null);
      return idx;
    }
  }
  return null;
}

export default function TicTacToePremium() {
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X'); // X = player, O = computer
  const [difficulty, setDifficulty] = useState('medium');
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [size, setSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 800, height: typeof window !== 'undefined' ? window.innerHeight : 600 });

  const status = useMemo(() => calculateWinner(board), [board]);

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => { if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize); };
  }, []);

  useEffect(() => {
    if (!started) return;
    if (status) {
      setWinner(status);
      if (status === 'X' || status === 'O') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4500);
      }
      return;
    }

    if (turn === 'O') {
      const t = setTimeout(() => {
        makeComputerMove();
      }, 450);
      return () => clearTimeout(t);
    }
  }, [status, turn, started]);

  function startGame() {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setStarted(true);
    setShowConfetti(false);
  }

  function cellClick(i) {
    if (!started) return;
    if (board[i] || winner || turn !== 'X') return;
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setTurn('O');
  }

  function makeComputerMove() {
    if (winner) return;
    const current = [...board];
    let move = null;

    const empties = current.flatMap((v, i) => (v ? [] : [i]));

    if (empties.length === 0) return;

    if (difficulty === 'easy') {
      move = empties[Math.floor(Math.random() * empties.length)];
    } else if (difficulty === 'medium') {
      move = findWinningMove(current, 'O');
      if (move == null) move = findWinningMove(current, 'X');
      if (move == null) move = empties[Math.floor(Math.random() * empties.length)];
    } else {
      const result = minimax(current.slice(), true);
      move = result.index;
      if (move == null || move === undefined) move = empties[Math.floor(Math.random() * empties.length)];
    }

    if (move !== null && move !== undefined) {
      current[move] = 'O';
      setBoard(current);
      setTurn('X');
    }
  }

  function resetAll() {
    setName('');
    setStarted(false);
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setShowConfetti(false);
  }

  const cellVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-black p-6">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-yellow-400/10 shadow-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">Tic Tac Toe — Premium</h1>
              {/* Removed descriptive label here as requested */}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Player</div>
              <div className="font-medium text-white">{name || 'Guest'}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            <div className="flex-1">
              <label className="block text-xs text-gray-300">Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" className="mt-1 w-full bg-white/3 border border-yellow-400/10 rounded-lg px-3 py-2 text-white placeholder-yellow-200 outline-none" />
            </div>

            <div className="w-44">
              <label className="block text-xs text-gray-300">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="mt-1 w-full bg-white/3 border border-yellow-400/10 rounded-lg px-3 py-2 text-white outline-none">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

    
            <div className="w-40 flex gap-2">
              {!started ? (
                <button onClick={startGame} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-yellow-400/90 to-yellow-300 text-black font-semibold shadow">Start</button>
              ) : (
                <button onClick={resetAll} className="flex-1 py-2 rounded-lg border border-yellow-300/30 text-white">Reset</button>
              )}
              <button onClick={() => { setBoard(Array(9).fill(null)); setTurn('X'); setWinner(null); }} className="py-2 px-3 rounded-lg bg-white/5 text-white">New Round</button>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-gradient-to-b from-white/3 to-white/5 border border-yellow-400/10 shadow-inner" style={{ width: Math.min(520, typeof window !== 'undefined' ? Math.max(320, window.innerWidth * 0.7) : 420) }}>
              {board.map((cell, i) => (
                <motion.button key={i} onClick={() => cellClick(i)} variants={cellVariants} initial="hidden" animate="visible" whileTap={{ scale: 0.95 }} className={`h-28 md:h-32 flex items-center justify-center rounded-lg text-4xl md:text-5xl font-extrabold ${cell ? (cell === 'X' ? 'text-amber-300' : 'text-white') : 'text-white/60'} bg-gradient-to-b from-black/20 to-white/2 border border-yellow-400/5`}>{cell === 'X' ? '✕' : cell === 'O' ? '◯' : ''}</motion.button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-300">
              {winner ? (winner === 'draw' ? "It's a draw!" : (winner === 'X' ? `${name || 'You'} won!` : 'Computer won')) : (turn === 'X' ? `${name || 'Your'} turn` : "Computer's turn")}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" />
            {showConfetti && <Confetti width={size.width} height={size.height} recycle={false} numberOfPieces={300} />}

            <motion.div initial={{ y: 40, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }} className="relative z-50 bg-gradient-to-br from-white/6 to-white/3 border border-yellow-300/20 rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
              <div className="mb-4">
                <div className="text-sm text-gray-300">Game Over</div>
                <div className="mt-2 text-3xl md:text-4xl font-extrabold text-yellow-300">
                  {winner === 'draw' ? "It's a Draw!" : (winner === 'X' ? `${name || 'You'} Win` : 'Computer Wins')}
                </div>
              </div>

              <div className="mt-2 text-gray-300">{winner === 'draw' ? 'No winners this time.' : (winner === 'X' ? `Congratulations, ${name || 'Player'}!` : 'Better luck next time.')}</div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => { setBoard(Array(9).fill(null)); setWinner(null); setTurn('X'); }} className="py-2 rounded-lg bg-gradient-to-r from-yellow-400/90 to-yellow-300 text-black font-semibold">Play Again</button>
                <button onClick={() => { setWinner(null); setStarted(false); }} className="py-2 rounded-lg border border-yellow-300/30 text-white">Exit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
