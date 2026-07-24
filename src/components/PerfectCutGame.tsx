import React, { useEffect, useState } from "react";
export default function PerfectCutGame() {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Tap anywhere to stop the block");

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setPosition((prev) => {
        let next = prev + direction * 2;

        if (next >= 90) {
          setDirection(-1);
          next = 90;
        }

        if (next <= 0) {
          setDirection(1);
          next = 0;
        }

        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [running, direction]);

  function handleTap() {
    if (!running) return;

    setRunning(false);

    const distance = Math.abs(position - 45);

    if (distance <= 5) {
      setScore((s) => s + 1);
      setMessage("🔥 PERFECT!");
    } else if (distance <= 15) {
      setMessage("✅ Good");
    } else {
      setMessage("❌ Miss");
    }
  }

  function restart() {
    setPosition(0);
    setDirection(1);
    setRunning(true);
    setMessage("Tap anywhere to stop the block");
  }

  return (
    <div
      onClick={handleTap}
      className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center cursor-pointer select-none"
    >
      <h2 className="text-3xl font-bold mb-2">Perfect Cut</h2>

      <p className="text-slate-400 mb-4">
        Stop the moving block exactly in the center.
      </p>

      <div className="text-xl font-bold mb-3">
        Score: {score}
      </div>

      <div className="relative h-10 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="absolute left-1/2 top-0 h-full w-1 bg-red-500 -translate-x-1/2"></div>

        <div
          className="absolute top-1 h-8 w-8 bg-indigo-500 rounded transition-all"
          style={{ left: `${position}%` }}
        ></div>
      </div>

      <div className="text-lg font-semibold mb-4">
        {message}
      </div>

      {!running && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            restart();
          }}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
