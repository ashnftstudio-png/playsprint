/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Brain, 
  Atom, 
  Orbit, 
  Sparkles, 
  Dices, 
  Palette, 
  FlaskConical, 
  Cpu, 
  Compass,
  Layers,
  PartyPopper
} from 'lucide-react';
import { CATEGORIES, EXPERIENCES } from '../data/experiences';
import { CategoryId } from '../types';

interface CategoryFiltersProps {
  activeCategory: CategoryId | null;
  setActiveCategory: (category: CategoryId | null) => void;
  searchText: string;
}

// Helper to map icon string names to Lucide icons
const getCategoryIcon = (iconName: string, size = 18) => {
  switch (iconName) {
    case 'Brain':
      return <Brain size={size} />;
    case 'Atom':
      return <Atom size={size} />;
    case 'Orbit':
      return <Orbit size={size} />;
    case 'Sparkles':
      return <Sparkles size={size} />;
    case 'Dices':
      return <Dices size={size} />;
    case 'Palette':
      return <Palette size={size} />;
    case 'FlaskConical':
      return <FlaskConical size={size} />;
    case 'Cpu':
      return <Cpu size={size} />;
    case 'Compass':
      return <Compass size={size} />;
    case 'PartyPopper':
      return <PartyPopper size={size} />;
    default:
      return <Layers size={size} />;
  }
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  activeCategory,
  setActiveCategory,
  searchText,
}) => {
  // Filter categories that have at least one playable game matching search text
  const availableCategories = CATEGORIES.filter((cat) => {
    return EXPERIENCES.some((exp) => {
      if (exp.category !== cat.id) return false;
      if (!searchText) return true;
      
      const searchLower = searchText.toLowerCase();
      return (
        exp.title.toLowerCase().includes(searchLower) ||
        exp.description.toLowerCase().includes(searchLower) ||
        exp.category.toLowerCase().includes(searchLower) ||
        (exp.learningOutcomes && exp.learningOutcomes.some(outcome => outcome.toLowerCase().includes(searchLower)))
      );
    });
  });

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <div id="categories-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-900/60">
      
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Filter by Category
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a logical, physical, or creative paradigm to filter your interactive experiences.
          </p>
        </div>
        
        {activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-mono font-medium text-indigo-400 border border-indigo-500/10 hover:bg-slate-800 transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Categories Grid Layout */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center">
        {availableCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className={`group relative flex flex-col items-center justify-center rounded-xl p-4 text-center border transition-all duration-300 cursor-pointer md:w-[130px] md:flex-shrink-0 ${
                isActive
                  ? `${cat.bgColor} ${cat.borderColor} text-white shadow-lg`
                  : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
              }`}
            >
              {/* Pulsing Active indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              )}
              
              <div className={`mb-2 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : cat.color}`}>
                {getCategoryIcon(cat.iconName, 20)}
              </div>
              
              <span className="text-xs font-bold tracking-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
