import React, { useEffect, useState } from "react";
import { getRandomObject } from "../games/perfectCutObjects";
import { getDifficulty } from "../games/perfectCutEngine";
import { getHitMessage, getComboBonus } from "../games/perfectCutEffects";
export default function PerfectCutGame() {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Tap anywhere to stop the block");
const [currentObject, setCurrentObject] = useState(getRandomObject());

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setPosition((prev) => {
        let next = prev + direction * difficulty.speed;

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
    }, 12);

    return () => clearInterval(timer);
  }, [running, direction]);

  function handleTap() {
    if (!running) return;

    setRunning(false);

    const distance = Math.abs(position - 45);
const difficulty = getDifficulty(score);
const multiplier = getComboBonus(score);

    if (distance <= 5) {
      setScore((s) => s + multiplier);
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
     className="w-full min-h-[80vh] max-w-5xl mx-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-10 text-center cursor-pointer select-none flex flex-col justify-center"
    >
      <h2 className="text-3xl font-bold mb-2">Perfect Cut</h2>

      <p className="text-slate-400 mb-4">
        Stop the moving block exactly in the center.
      </p>

      <div className="text-xl font-bold mb-3">
        Score: {score}
      </div>

      <div className="relative h-28 md:h-36 bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl overflow-hidden mb-6 border border-slate-600">
        <div className="absolute left-1/2 top-0 h-full w-1 bg-red-500 -translate-x-1/2"></div>
<div
 className="absolute top-1/2 -translate-y-1/2 transition-all text-6xl"
  style={{ left: `${position}%` }}
>
  {currentObject}
</div>
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
