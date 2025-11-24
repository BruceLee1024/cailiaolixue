import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Menu } from "lucide-react";

import { ModuleType, SimulationState, DEFAULT_STATE, THEORY_INFO } from "./types";
import { Sidebar, TheoryPanel } from "./components";
import { AxialModule, BendingModule, TorsionModule, BucklingModule, StressModule, CombinedModule, FundamentalsModule } from "./modules";
import { AITutor } from "./ai";

// --- Main App ---

const App = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>("axial");
  const [simState, setSimState] = useState<SimulationState>(DEFAULT_STATE);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStateChange = (changes: Partial<SimulationState>) => {
    setSimState((prev) => ({ ...prev, ...changes }));
  };

  const currentTheory = THEORY_INFO[activeModule];

  const renderModule = () => {
    switch (activeModule) {
      case "fundamentals": return <FundamentalsModule state={simState} onChange={handleStateChange} />;
      case "axial": return <AxialModule state={simState} onChange={handleStateChange} />;
      case "bending": return <BendingModule state={simState} onChange={handleStateChange} />;
      case "torsion": return <TorsionModule state={simState} onChange={handleStateChange} />;
      case "buckling": return <BucklingModule state={simState} onChange={handleStateChange} />;
      case "stress": return <StressModule state={simState} onChange={handleStateChange} />;
      case "combined": return <CombinedModule state={simState} onChange={handleStateChange} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 font-sans bg-slate-50">
      {/* Sidebar Component */}
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile) */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden">
            <h1 className="font-bold text-lg">材料力学可视化实验室</h1>
            <button onClick={() => setIsMenuOpen(true)} className="text-slate-600">
                <Menu className="w-6 h-6" />
            </button>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-indigo-900">{currentTheory.title}</h2>
                <p className="text-slate-500 mt-2 text-lg">{currentTheory.definition}</p>
            </div>

            {/* Layout Container: Added items-start to prevent left column stretching */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* Left Column: Visualization & Controls (2/3) */}
                <div className="flex-grow xl:w-2/3 min-w-0 space-y-6">
                    {renderModule()}
                </div>

                {/* Right Column: AI & Theory (1/3) */}
                <div className="xl:w-1/3 min-w-[300px] space-y-6">
                    
                    {/* AI Tutor Panel Component */}
                    <AITutor activeModule={activeModule} state={simState} />

                    {/* Theory Guide Panel Component */}
                    <TheoryPanel activeModule={activeModule} />
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);