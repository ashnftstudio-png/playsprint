/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Star, Compass, HelpCircle, Layers } from 'lucide-react';
import { Experience, CategoryId } from '../types';
import { EXPERIENCES } from '../data/experiences';
import { ExperienceCard } from './ExperienceCard';

interface ExperienceGridProps {
  searchText: string;
  activeCategory: CategoryId | null;
  onSelectExperience: (experience: Experience) => void;
  setSearchText: (text: string) => void;
  setActiveCategory: (category: CategoryId | null) => void;
}

export const ExperienceGrid: React.FC<ExperienceGridProps> = ({
  searchText,
  activeCategory,
  onSelectExperience,
  setSearchText,
  setActiveCategory,
}) => {
  // Filter core experiences registry
  const filteredExperiences = EXPERIENCES.filter((exp) => {
    const matchesCategory = activeCategory ? exp.category === activeCategory : true;
    const matchesSearch = searchText
      ? exp.title.toLowerCase().includes(searchText.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchText.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchText.toLowerCase()) ||
        (exp.learningOutcomes && exp.learningOutcomes.some(outcome => outcome.toLowerCase().includes(searchText.toLowerCase())))
      : true;
    return matchesCategory && matchesSearch;
  });

  const featuredExperiences = EXPERIENCES.filter((exp) => exp.featured);
  const playNowExperiences = EXPERIENCES.filter((exp) => exp.category === 'fun');
  const labsExperiences = EXPERIENCES.filter((exp) => exp.category !== 'fun');

  const isFiltering = !!(searchText || activeCategory);

  const clearFilters = () => {
    setSearchText('');
    setActiveCategory(null);
  };

  // Motion variants for premium staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div id="experiences-grid" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      
      {isFiltering ? (
        /* -------------------------------------------------------------
           FILTERED RESULTS VIEW
           ------------------------------------------------------------- */
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
                <Layers className="text-indigo-400" size={20} />
                Search Results
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Showing <span className="text-white font-semibold">{filteredExperiences.length}</span> experience{filteredExperiences.length !== 1 ? 's' : ''} matching your configuration.
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors self-start sm:self-auto"
            >
              Clear Search Index
            </button>
          </div>

          {filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredExperiences.map((exp) => (
                <motion.div key={exp.id} variants={itemVariants}>
                  <ExperienceCard experience={exp} onSelect={onSelectExperience} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20"
            >
              <HelpCircle size={36} className="text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-slate-300 font-mono">No matching experiences located</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                We couldn't resolve any active sandbox simulations matching your queries. Adjust keywords or categories and try again.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-indigo-400 transition-colors"
              >
                Reset Filter Indexes
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* -------------------------------------------------------------
           DEFAULT CURATED LANDING LAYOUT (PLAY NOW & LABS)
           ------------------------------------------------------------- */
        <div className="flex flex-col gap-16">
          
          {/* 0. FEATURED MASTERPIECES */}
          <section id="featured-section" className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
                <Sparkles className="text-amber-400 h-5 w-5 animate-pulse" />
                Featured Masterpieces
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Our absolute highest engagement and most polished cognitive reflex challenges.
              </p>
            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={containerVariants}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {featuredExperiences.map((exp) => (
                <motion.div key={exp.id + '-featured'} variants={itemVariants}>
                  <ExperienceCard experience={exp} onSelect={onSelectExperience} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* 1. QUICK PLAY SECTION */}
          <section id="play-now-section" className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
                ⚡ Quick Play
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Jump straight into the action with these fun interactive micro-games!
              </p>
            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={containerVariants}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {playNowExperiences.map((exp) => (
                <motion.div key={exp.id} variants={itemVariants}>
                  <ExperienceCard experience={exp} onSelect={onSelectExperience} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* 2. LABS SECTION */}
          <section id="labs-section" className="flex flex-col gap-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
                🧪 Labs
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore hand-crafted interactive simulations and creative playgrounds.
              </p>
            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-100px' }}
              variants={containerVariants}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {labsExperiences.map((exp) => (
                <motion.div key={exp.id} variants={itemVariants}>
                  <ExperienceCard experience={exp} onSelect={onSelectExperience} />
                </motion.div>
              ))}
            </motion.div>
          </section>

        </div>
      )}

    </div>
  );
};
