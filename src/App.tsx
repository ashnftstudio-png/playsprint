/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PerfectCut from './pages/PerfectCut';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilters } from './components/CategoryFilters';
import { ExperienceGrid } from './components/ExperienceGrid';
import { ExperienceDetailModal } from './components/ExperienceDetailModal';
import { PlatformDashboard } from './components/PlatformDashboard';
import { Footer } from './components/Footer';
import { Experience, CategoryId } from './types';
import { EXPERIENCES } from './data/experiences';

export default function App() {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  // Automatically clear activeCategory if it has no games under the current search
  useEffect(() => {
    if (!activeCategory) return;
    
    const categoryHasGames = EXPERIENCES.some((exp) => {
      if (exp.category !== activeCategory) return false;
      if (!searchText) return true;
      
      const searchLower = searchText.toLowerCase();
      return (
        exp.title.toLowerCase().includes(searchLower) ||
        exp.description.toLowerCase().includes(searchLower) ||
        exp.category.toLowerCase().includes(searchLower) ||
        (exp.learningOutcomes && exp.learningOutcomes.some(outcome => outcome.toLowerCase().includes(searchLower)))
      );
    });
    
    if (!categoryHasGames) {
      setActiveCategory(null);
    }
  }, [searchText, activeCategory]);

  // Deep-link routing for slugs /gravity and /lucky-button
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (
      path === '/gravity' || 
      path.endsWith('/gravity') || 
      hash === '#/gravity' || 
      hash.endsWith('/gravity') || 
      search.includes('gravity')
    ) {
      const gravityExp = EXPERIENCES.find((exp) => exp.id === 'gravity-lab');
      if (gravityExp) {
        setSelectedExperience(gravityExp);
      }
    } else if (
      path === '/lucky-button' ||
      path.endsWith('/lucky-button') ||
      hash === '#/lucky-button' ||
      hash.endsWith('/lucky-button') ||
      search.includes('lucky-button')
    ) {
      const luckyExp = EXPERIENCES.find((exp) => exp.id === 'lucky-button');
      if (luckyExp) {
        setSelectedExperience(luckyExp);
      }
    } else if (
      path === '/dont-press-the-red-button' ||
      path.endsWith('/dont-press-the-red-button') ||
      hash === '#/dont-press-the-red-button' ||
      hash.endsWith('/dont-press-the-red-button') ||
      search.includes('dont-press-the-red-button')
    ) {
      const dontPressExp = EXPERIENCES.find((exp) => exp.id === 'dont-press-the-red-button');
      if (dontPressExp) {
        setSelectedExperience(dontPressExp);
      }
    } else if (
      path === '/catch-the-dot' ||
      path.endsWith('/catch-the-dot') ||
      hash === '#/catch-the-dot' ||
      hash.endsWith('/catch-the-dot') ||
      search.includes('catch-the-dot')
    ) {
      const catchDotExp = EXPERIENCES.find((exp) => exp.id === 'catch-the-dot');
      if (catchDotExp) {
        setSelectedExperience(catchDotExp);
      }
    } else if (
      path === '/reaction-rush' ||
      path.endsWith('/reaction-rush') ||
      hash === '#/reaction-rush' ||
      hash.endsWith('/reaction-rush') ||
      search.includes('reaction-rush')
    ) {
      const reactionRushExp = EXPERIENCES.find((exp) => exp.id === 'reaction-rush');
      if (reactionRushExp) {
        setSelectedExperience(reactionRushExp);
      }
    } else if (
      path === '/one-second-challenge' ||
      path.endsWith('/one-second-challenge') ||
      hash === '#/one-second-challenge' ||
      hash.endsWith('/one-second-challenge') ||
      search.includes('one-second-challenge')
    ) {
      const oneSecChallengeExp = EXPERIENCES.find((exp) => exp.id === 'one-second-challenge');
      if (oneSecChallengeExp) {
        setSelectedExperience(oneSecChallengeExp);
      }
    } else if (
      path === '/color-panic' ||
      path.endsWith('/color-panic') ||
      hash === '#/color-panic' ||
      hash.endsWith('/color-panic') ||
      search.includes('color-panic')
    ) {
      const colorPanicExp = EXPERIENCES.find((exp) => exp.id === 'color-panic');
      if (colorPanicExp) {
        setSelectedExperience(colorPanicExp);
      }
    } else if (
      path === '/shape-switch' ||
      path.endsWith('/shape-switch') ||
      hash === '#/shape-switch' ||
      hash.endsWith('/shape-switch') ||
      search.includes('shape-switch')
    ) {
      const shapeSwitchExp = EXPERIENCES.find((exp) => exp.id === 'shape-switch');
      if (shapeSwitchExp) {
        setSelectedExperience(shapeSwitchExp);
      }
    } else if (
      path === '/perfect-timing' ||
      path.endsWith('/perfect-timing') ||
      hash === '#/perfect-timing' ||
      hash.endsWith('/perfect-timing') ||
      search.includes('perfect-timing')
    ) {
      const perfectTimingExp = EXPERIENCES.find((exp) => exp.id === 'perfect-timing');
      if (perfectTimingExp) {
        setSelectedExperience(perfectTimingExp);
      }
    } else if (
      path === '/gravity-escape' ||
      path.endsWith('/gravity-escape') ||
      hash === '#/gravity-escape' ||
      hash.endsWith('/gravity-escape') ||
      search.includes('gravity-escape')
    ) {
      const gravityEscapeExp = EXPERIENCES.find((exp) => exp.id === 'gravity-escape');
      if (gravityEscapeExp) {
        setSelectedExperience(gravityEscapeExp);
      }
    } else if (
      path === '/laser-maze' ||
      path.endsWith('/laser-maze') ||
      hash === '#/laser-maze' ||
      hash.endsWith('/laser-maze') ||
      search.includes('laser-maze')
    ) {
      const laserMazeExp = EXPERIENCES.find((exp) => exp.id === 'laser-maze');
      if (laserMazeExp) {
        setSelectedExperience(laserMazeExp);
      }
    }
  }, []);
useEffect(() => {
  const title = selectedExperience
    ? `${selectedExperience.title} | PlaySprint`
    : "PlaySprint - Interactive Browser Games";

  document.title = title;

  const description =
    selectedExperience?.description ||
    "Play free interactive browser games on PlaySprint.";

  let meta = document.querySelector(
    'meta[name="description"]'
  ) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  meta.content = description;
const updateMeta = (
  selector: string,
  value: string,
  attr: "property" | "name"
) => {
  let tag = document.querySelector(selector) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, selector.match(/"(.*)"/)?.[1] || "");
    document.head.appendChild(tag);
  }

  tag.content = value;
};

const socialTitle = title;
const socialDescription = description;

updateMeta('meta[property="og:title"]', socialTitle, "property");
updateMeta('meta[property="og:description"]', socialDescription, "property");
updateMeta('meta[name="twitter:title"]', socialTitle, "name");
updateMeta('meta[name="twitter:description"]', socialDescription, "name");
let schema = document.querySelector(
  'script[type="application/ld+json"][data-game-schema]'
) as HTMLScriptElement | null;

if (!schema) {
  schema = document.createElement("script");
  schema.type = "application/ld+json";
  schema.setAttribute("data-game-schema", "true");
  document.head.appendChild(schema);
}

schema.text = JSON.stringify(
  selectedExperience
    ? {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        name: selectedExperience.title,
        description: selectedExperience.description,
        url: `${window.location.origin}/${selectedExperience.id}`,
        genre: selectedExperience.category,
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        operatingSystem: "Any",
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PlaySprint",
        url: window.location.origin,
      }
);
  let canonical = document.querySelector(
    'link[rel="canonical"]'
  ) as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = selectedExperience
    ? `${window.location.origin}/${selectedExperience.id}`
    : window.location.origin;
}, [selectedExperience]);
  return (
<Routes>
  <Route path="/home" element={<HomePage />} />
<Route path="/about" element={<About />} />
<Route path="/contact" element={<Contact />} />
<Route path="/privacy" element={<Privacy />} />
<Route path="/terms" element={<Terms />} />
<Route path="/perfect-cut" element={<PerfectCut />} />
  <Route
    path="*"
    element={
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <Navbar />

        {/* Hero title & Search bar */}
        <Hero 
          searchText={searchText} 
          setSearchText={setSearchText}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />

        {/* Categories Grid Filter */}
        <CategoryFilters 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
          searchText={searchText}
        />

        {/* Global Player Hub and achievements */}
        <PlatformDashboard onSelectExperience={setSelectedExperience} />

        {/* Structured Experience sections and search results */}
        <ExperienceGrid 
          searchText={searchText}
          activeCategory={activeCategory}
          onSelectExperience={setSelectedExperience}
          setSearchText={setSearchText}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Experience popup detail modal & Sandbox simulator wrapper */}
      <ExperienceDetailModal 
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        onSelectExperience={setSelectedExperience}
      />
    </div>
      }
    />
  </Routes>
);
}
