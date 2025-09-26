import React, { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

function App() {
  const START_TIME = 450;
  const [mode, setMode] = useState("2v2");
  const [scores, setScores] = useState({ A: [], B: [] });
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const gameRef = doc(db, "games", "nerf-war"); // single shared game

  // Sync Firestore → Local
  useEffect(() => {
    const unsub = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setMode(data.mode);
        setScores(data.scores);
        setTimeLeft(data.timeLeft);
        setIsRunning(data.isRunning);
      }
    });
    return () => unsub();
  }, []);

  // Initialize if empty
  useEffect(() => {
    const initGame = async () => {
      const snap = await getDoc(gameRef);
      if (!snap.exists()) {
        await setDoc(gameRef, {
          mode: "2v2",
          scores: { A: [0, 0], B: [0, 0] },
          timeLeft: START_TIME,
          isRunning: false,
        });
      }
    };
    initGame();
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(async () => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          updateDoc(gameRef, { timeLeft: prev - 1 });
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Update Firestore when scores change
  const handleScoreChange = async (team, index, delta) => {
    const updated = [...scores[team]];
    updated[index] = Math.max(0, updated[index] + delta);
    await updateDoc(gameRef, {
      scores: { ...scores, [team]: updated },
    });
  };

  const resetScores = async () => {
    const reset = {
      A: scores.A.map(() => 0),
      B: scores.B.map(() => 0),
    };
    await updateDoc(gameRef, { scores: reset });
  };

  const resetTimer = async () => {
    clearInterval(timerRef.current);
    await updateDoc(gameRef, { timeLeft: START_TIME, isRunning: false });
  };

  const toggleMatch = async () => {
    await updateDoc(gameRef, { isRunning: !isRunning });
  };

  const teamTotal = (team) => scores[team]?.reduce((a, b) => a + b, 0) || 0;

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60));
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-4 text-pink-400">NERF WARS: TEAM DUEL</h1>

      <div className="flex items-center gap-4 mb-6">
        <span>Points to Win: <span className="text-blue-400 font-bold">50</span></span>
        <button
          onClick={() => updateDoc(gameRef, { mode: "2v2", scores: { A: [0,0], B: [0,0] } })}
          className={`px-4 py-2 rounded ${mode === "2v2" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          2v2
        </button>
        <button
          onClick={() => updateDoc(gameRef, { mode: "3v3", scores: { A: [0,0,0], B: [0,0,0] } })}
          className={`px-4 py-2 rounded ${mode === "3v3" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          3v3
        </button>
      </div>

      {/* Scoreboard */}
      <div className="flex justify-between w-full max-w-3xl bg-gray-900 rounded-xl p-6 mb-6">
        <div className="text-blue-400 text-center flex-1">
          <h2 className="text-xl font-bold">TEAM A</h2>
          <p className="text-5xl">{teamTotal("A")}</p>
        </div>
        <div className="text-red-400 text-center flex-1">
          <h2 className="text-xl font-bold">TEAM B</h2>
          <p className="text-5xl">{teamTotal("B")}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="text-yellow-400 text-4xl font-bold mb-6">
        Time Remaining: {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        <button onClick={toggleMatch} className="bg-green-600 px-4 py-2 rounded">
          {isRunning ? "Pause Match" : timeLeft < START_TIME ? "Resume Match" : "Start Match"}
        </button>
        <button onClick={resetTimer} className="bg-yellow-600 px-4 py-2 rounded">
          Reset Timer
        </button>
        <button onClick={resetScores} className="bg-red-600 px-4 py-2 rounded">
          Reset Scores
        </button>
      </div>

      {/* Player Inputs */}
      <div className="flex gap-10 w-full max-w-5xl">
        {/* Team A */}
        <div className="flex-1 bg-gray-800 p-4 rounded-xl">
          <h3 className="text-blue-400 font-bold mb-4">TEAM A</h3>
          {scores.A?.map((score, idx) => (
            <div key={idx} className="flex items-center gap-3 mb-3">
              <input
                type="text"
                placeholder={`Player ${idx + 1} Name`}
                className="flex-1 px-2 py-1 rounded bg-gray-900 text-white"
              />
              <button
                onClick={() => handleScoreChange("A", idx, -1)}
                className="bg-red-600 px-2 py-1 rounded"
              >
                -
              </button>
              <span className="w-8 text-center">{score}</span>
              <button
                onClick={() => handleScoreChange("A", idx, 1)}
                className="bg-green-600 px-2 py-1 rounded"
              >
                +
              </button>
            </div>
          ))}
        </div>

        {/* Team B */}
        <div className="flex-1 bg-gray-800 p-4 rounded-xl">
          <h3 className="text-red-400 font-bold mb-4">TEAM B</h3>
          {scores.B?.map((score, idx) => (
            <div key={idx} className="flex items-center gap-3 mb-3">
              <input
                type="text"
                placeholder={`Player ${idx + 1} Name`}
                className="flex-1 px-2 py-1 rounded bg-gray-900 text-white"
              />
              <button
                onClick={() => handleScoreChange("B", idx, -1)}
                className="bg-red-600 px-2 py-1 rounded"
              >
                -
              </button>
              <span className="w-8 text-center">{score}</span>
              <button
                onClick={() => handleScoreChange("B", idx, 1)}
                className="bg-green-600 px-2 py-1 rounded"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
