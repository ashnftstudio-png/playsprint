export function getComboBonus(combo: number) {
  if (combo >= 20) return 5;
  if (combo >= 10) return 3;
  if (combo >= 5) return 2;
  return 1;
}

export function getHitMessage(distance: number) {
  if (distance <= 3) return "🔥 PERFECT!";
  if (distance <= 8) return "✨ Excellent!";
  if (distance <= 15) return "✅ Good!";
  return "❌ Miss!";
}
