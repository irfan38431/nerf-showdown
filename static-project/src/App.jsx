import React, { useState, useEffect, useRef } from "react";

function App() {
  const START_TIME = 450; // 7 minutes 30 seconds in seconds
  const [mode, setMode] = useState("2v2"); // default 2v2
  const [scores, setScores] = useState({ A: [], B: [] });
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Update team players dynamically
  useEffect(() => {
    const players = mode === "2v2" ? 2 : 3;
    setScores({
      A: Array(players).fill(0),
      B: Array(players).fill(0),
    });
    resetTimer();
  }, [mode]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleScoreChange = (team, index, delta) => {
    setScores((prev) => {
      const updated = [...prev[team]];
      updated[index] = Math.max(0, updated[index] + delta); // no negative scores
      return { ...prev, [team]: updated };
    });
  };

  const resetScores = () => {
    setScores((prev) => ({
      A: prev.A.map(() => 0),
      B: prev.B.map(() => 0),
    }));
  };

  const resetTimer = () => {
    setTimeLeft(START_TIME);
    setIsRunning(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(1, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const teamTotal = (team) => scores[team].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-4 text-pink-400">NERF WARS: TEAM DUEL</h1>

      <div className="flex items-center gap-4 mb-6">
        <span>Points to Win: <span className="text-blue-400 font-bold">50</span></span>
        <button
          onClick={() => setMode("2v2")}
          className={`px-4 py-2 rounded ${mode === "2v2" ? "bg-blue-600" : "bg-gray-700"}`}
        >
          2v2
        </button>
        <button
          onClick={() => setMode("3v3")}
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
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-green-600 px-4 py-2 rounded"
        >
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
          {scores.A.map((score, idx) => (
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
          {scores.B.map((score, idx) => (
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
