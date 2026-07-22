/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Github, Twitter, Mail, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-900/80 bg-slate-950 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Mission and Logo Section */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-sans text-base font-extrabold tracking-tight text-white">
                PlaySprint
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              PlaySprint is a premium visual platform engineered to stimulate discovery. We combine scientific mathematics, kinetic mechanics, and digital design into elegant browser-based micro-simulators.
            </p>
          </div>

          {/* Quick Access links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
                Navigation
              </span>
              <ul className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
                <li>
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Back to Top
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Featured Labs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-white transition-colors"
                  >
                    Category Index
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
                Paradigms
              </span>
              <ul className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
                <li>
                  <span className="cursor-default hover:text-white transition-colors">Physical Mechanics</span>
                </li>
                <li>
                  <span className="cursor-default hover:text-white transition-colors">Optical Physics</span>
                </li>
                <li>
                  <span className="cursor-default hover:text-white transition-colors">Boolean Logic</span>
                </li>
              </ul>
            </div>
          </div>

<div className="flex flex-col gap-3">
  <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
    Company
  </span>

  <ul className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
    <li>
      <a href="/about" className="hover:text-white transition-colors">
        About Us
      </a>
    </li>

    <li>
      <a href="/contact" className="hover:text-white transition-colors">
        Contact
      </a>
    </li>

    <li>
      <a href="/privacy" className="hover:text-white transition-colors">
        Privacy Policy
      </a>
    </li>

    <li>
      <a href="/terms" className="hover:text-white transition-colors">
        Terms & Conditions
      </a>
    </li>
  </ul>
</div>
          {/* Connect Column */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
              Secure Sandbox Node
            </span>
            <div className="flex gap-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-800 transition-all"
              >
                <Github size={15} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-800 transition-all"
              >
                <Twitter size={15} />
              </a>
              <a 
                href="mailto:contact@playsprint.io" 
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-800 transition-all"
              >
                <Mail size={15} />
              </a>
            </div>
            <span className="text-[9px] font-mono text-slate-500 leading-normal">
              Nodes connected via secure client-side sandbox environments. No trackers or cookies injected.
            </span>
          </div>

        </div>

        {/* Sub-footer copyrights */}
        <div className="mt-12 border-t border-slate-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] font-mono text-slate-500">
            © {currentYear} PlaySprint. Apache-2.0 License.
          </span>
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <HelpCircle size={10} />
            designed with premium aesthetic mathematics
          </span>
        </div>

      </div>
    </footer>
  );
};
