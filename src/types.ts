/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId =
  | 'brain'
  | 'science'
  | 'space'
  | 'visual'
  | 'random'
  | 'creative'
  | 'experiments'
  | 'logic'
  | 'discovery'
  | 'fun';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string; // Key for Lucide icon
  color: string;    // Tailwind text class e.g. "text-indigo-400"
  bgColor: string;   // Tailwind bg class with opacity e.g. "bg-indigo-500/10"
  borderColor: string; // Tailwind border class e.g. "border-indigo-500/20"
  hoverBg: string;   // Tailwind hover bg e.g. "hover:bg-indigo-500/20"
}

export interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  category: CategoryId;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  featured: boolean;
  trending: boolean;
  themeColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'teal' | 'fuchsia' | 'sky' | 'orange';
  isNew?: boolean;
  learningOutcomes: string[];
  howToPlay: string;
}
