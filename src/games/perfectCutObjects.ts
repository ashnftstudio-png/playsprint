export type PerfectCutObject = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  effect: "juice" | "crumbs" | "ice" | "sparkle";
};

export const perfectCutObjects: PerfectCutObject[] = [
  {
    id: "watermelon",
    name: "Watermelon",
    emoji: "🍉",
    color: "#22c55e",
    effect: "juice",
  },
  {
    id: "pizza",
    name: "Pizza",
    emoji: "🍕",
    color: "#f97316",
    effect: "crumbs",
  },
  {
    id: "cake",
    name: "Cake",
    emoji: "🎂",
    color: "#ec4899",
    effect: "crumbs",
  },
  {
    id: "burger",
    name: "Burger",
    emoji: "🍔",
    color: "#f59e0b",
    effect: "crumbs",
  },
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    color: "#ef4444",
    effect: "juice",
  },
  {
    id: "orange",
    name: "Orange",
    emoji: "🍊",
    color: "#fb923c",
    effect: "juice",
  },
  {
    id: "chocolate",
    name: "Chocolate",
    emoji: "🍫",
    color: "#78350f",
    effect: "crumbs",
  },
  {
    id: "ice",
    name: "Ice Cube",
    emoji: "🧊",
    color: "#60a5fa",
    effect: "ice",
  },
  {
    id: "diamond",
    name: "Diamond",
    emoji: "💎",
    color: "#38bdf8",
    effect: "sparkle",
  },
  {
    id: "gift",
    name: "Gift",
    emoji: "🎁",
    color: "#a855f7",
    effect: "sparkle",
  },
];

export function getRandomObject(): PerfectCutObject {
  return perfectCutObjects[
    Math.floor(Math.random() * perfectCutObjects.length)
  ];
}
