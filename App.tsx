import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<TreeMode>(TreeMode.SCATTERED);

  const toggleMode = () => {
    setMode((prev) => 
      prev === TreeMode.SCATTERED ? TreeMode.TREE_SHAPE : TreeMode.SCATTERED
    );
  };

  const isTree = mode === TreeMode.TREE_SHAPE;

  return (
    <div className="relative w-full h-screen bg-[#001a12] text-[#e0e0e0]">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene mode={mode} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-start space-y-2 pointer-events-auto">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-0.5 bg-yellow-500/80"></div>
             <h3 className="font-serif text-sm tracking-[0.3em] text-yellow-500 uppercase">Arix Signature</h3>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-white drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            The Interactive <br/> <span className="italic text-emerald-400">Christmas</span> Tree
          </h1>
        </header>

        {/* Controls */}
        <footer className="flex flex-col md:flex-row items-end md:items-center justify-between pointer-events-auto w-full">
          <div className="max-w-md text-sm text-gray-400 font-light mb-8 md:mb-0">
            <p>Experience the magic of the season. 
            Toggle between chaos and harmony to assemble the Arix Signature centerpiece.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={toggleMode}
              className={`
                group relative px-8 py-4 bg-transparent border border-yellow-500/30 
                hover:border-yellow-500 transition-all duration-500
                overflow-hidden
              `}
            >
              <div className={`
                absolute inset-0 bg-yellow-500/10 scale-x-0 group-hover:scale-x-100 
                origin-left transition-transform duration-500 ease-out
              `}></div>
              
              <span className="relative z-10 font-serif text-xl tracking-widest text-yellow-100 group-hover:text-yellow-400 transition-colors">
                {isTree ? 'SCATTER MAGIC' : 'ASSEMBLE TREE'}
              </span>
            </button>
            <span className="text-xs tracking-widest text-white/30 uppercase">
              {isTree ? 'Interactive Mode: Active' : 'Waiting for Assembly'}
            </span>
          </div>
        </footer>
      </div>

      {/* Aesthetic Border/Frame */}
      <div className="absolute inset-0 z-20 pointer-events-none border-[1px] border-white/5 m-4"></div>
    </div>
  );
};

export default App;
