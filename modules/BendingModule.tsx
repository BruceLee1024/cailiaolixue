import React from "react";
import { Calculator, Sigma } from "lucide-react";
import { SliderControl, LatexRenderer, MaterialSelector } from "../components";
import { SimulationState } from "../types";
import { CommonDefs } from "./CommonDefs";

export const BendingModule = ({ state, onChange }: { state: SimulationState; onChange: (s: Partial<SimulationState>) => void }) => {
  const L_mm = state.bendLength * 1000;
  const E_MPa = state.bendModulus * 1000;
  const inertia = (state.bendWidth * Math.pow(state.bendHeight, 3)) / 12; 
  const maxDeflection = (state.bendLoad * Math.pow(L_mm, 3)) / (48 * E_MPa * inertia); 
  const maxMoment = (state.bendLoad * state.bendLength) / 4;
  const maxStress = ((maxMoment * 1000) * (state.bendHeight / 2)) / inertia;

  const visualSag = Math.min(maxDeflection * 2, 100); 
  const startX = 60;
  const endX = 540;
  const midX = (startX + endX) / 2;
  const floorY = 220;
  const supportHeight = 40;
  const baselineY = floorY - supportHeight; 
  
  const sagY = baselineY + visualSag;
  const controlY = 2 * sagY - baselineY; 

  const formulaInertia = `I_z = \\frac{b h^3}{12} = ${(inertia/10000).toFixed(2)} \\times 10^4 \\text{ mm}^4`;
  const formulaDeflection = `w_{max} = \\frac{P L^3}{48 E I} = ${maxDeflection.toFixed(2)} \\text{ mm}`;
  const formulaStress = `\\sigma_{max} = \\frac{M_{max} \\cdot y}{I_z} = ${maxStress.toFixed(2)} \\text{ MPa}`;

  const beamThick = Math.max(10, state.bendHeight / 5);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-grow flex items-center justify-center relative min-h-[300px]">
         <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
            <CommonDefs />
            
            {/* Floor */}
            <line x1="20" y1={floorY} x2="580" y2={floorY} stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            
            {/* Left Support */}
            <g transform={`translate(${startX}, ${floorY})`}>
                <path d={`M0,0 L-15,-${supportHeight} L15,-${supportHeight} Z`} fill="url(#hatchPattern)" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="0" cy={`-${supportHeight}`} r="4" fill="white" stroke="#94a3b8" strokeWidth="2"/>
            </g>
            
            {/* Right Support */}
            <g transform={`translate(${endX}, ${floorY})`}>
                 <path d={`M0,-8 L-15,-${supportHeight} L15,-${supportHeight} Z`} fill="url(#hatchPattern)" stroke="#94a3b8" strokeWidth="2" />
                 <circle cx="0" cy={`-${supportHeight}`} r="4" fill="white" stroke="#94a3b8" strokeWidth="2"/>
                 <circle cx="-8" cy="-4" r="3" fill="#cbd5e1" />
                 <circle cx="8" cy="-4" r="3" fill="#cbd5e1" />
            </g>

            {/* Original Beam (Dashed Outline) */}
            <path 
              d={`M ${startX},${baselineY} L ${endX},${baselineY}`} 
              stroke="#cbd5e1" 
              strokeWidth={beamThick} 
              strokeLinecap="butt" 
              fill="none"
              style={{ opacity: 0.5 }}
            />
             <path 
              d={`M ${startX},${baselineY} L ${endX},${baselineY}`} 
              stroke="#94a3b8" 
              strokeWidth="1" 
              strokeLinecap="butt" 
              strokeDasharray="4 4"
              fill="none"
            />

            {/* Deformed Beam (Transparent with Solid Outline Effect) */}
            {/* Main Body - Transparent Indigo */}
            <path 
              d={`M ${startX},${baselineY} Q ${midX},${controlY} ${endX},${baselineY}`} 
              stroke="rgba(79, 70, 229, 0.15)" 
              strokeWidth={beamThick} 
              fill="none" 
              strokeLinecap="butt" 
              style={{ transition: "d 0.3s ease-out, stroke-width 0.3s" }}
            />
             {/* Centerline - Solid Indigo Dashed */}
             <path 
              d={`M ${startX},${baselineY} Q ${midX},${controlY} ${endX},${baselineY}`} 
              stroke="#4f46e5" 
              strokeOpacity="0.5"
              strokeWidth="1" 
              fill="none" 
              strokeDasharray="6 6"
              style={{ transition: "d 0.3s ease-out" }}
            />
            {/* Cap Ends (Approximate) */}
            <rect x={startX} y={baselineY - beamThick/2} width={2} height={beamThick} fill="#4f46e5" style={{ opacity: 0.5 }} />
            <rect x={endX-2} y={baselineY - beamThick/2} width={2} height={beamThick} fill="#4f46e5" style={{ opacity: 0.5 }} />

            {/* Force Arrow (Rose) */}
            <g transform={`translate(${midX}, ${sagY - beamThick/2 - 2})`} style={{ transition: "transform 0.3s ease-out" }}>
                <line x1="0" y1="-60" x2="0" y2="-12" stroke="#e11d48" strokeWidth="2" markerEnd="url(#arrowForce)" />
                <text x="10" y="-35" fill="#e11d48" fontWeight="bold" fontSize="14">F = {state.bendLoad} N</text>
            </g>
            
            {/* Deflection Measurement (Indigo) */}
            <g style={{ opacity: visualSag > 5 ? 1 : 0, transition: "opacity 0.3s" }}>
                 <line x1={midX} y1={baselineY} x2={midX} y2={sagY} stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 2" />
                 <text x={midX + 10} y={(baselineY+sagY)/2} fill="#4f46e5" fontSize="12" fontWeight="bold">w_max</text>
            </g>
         </svg>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-indigo-500" /> 实验参数</h3>
           <div className="space-y-4">
             <div>
                <MaterialSelector 
                  currentE={state.bendModulus} 
                  currentYield={state.materialYield}
                  currentPoisson={state.poissonRatio}
                  onSelect={(mat) => onChange({ bendModulus: mat.E, materialYield: mat.yield, poissonRatio: mat.poisson })} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <SliderControl label="截面宽度 (b)" value={state.bendWidth} min={20} max={200} step={5} unit="mm" onChange={(v) => onChange({ bendWidth: v })} />
                  <SliderControl label="截面高度 (h)" value={state.bendHeight} min={20} max={300} step={5} unit="mm" onChange={(v) => onChange({ bendHeight: v })} />
                </div>
                <SliderControl label="载荷 (Load)" value={state.bendLoad} min={500} max={10000} step={500} unit="N" onChange={(v) => onChange({ bendLoad: v })} />
                <SliderControl label="梁跨度 (Length)" value={state.bendLength} min={1} max={10} step={0.5} unit="m" onChange={(v) => onChange({ bendLength: v })} />
                <SliderControl label="弹性模量 (E)" value={state.bendModulus} min={50} max={400} step={10} unit="GPa" onChange={(v) => onChange({ bendModulus: v })} />
             </div>

             <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sigma className="w-3 h-3" /> 计算过程演示
                </h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2 overflow-x-auto">
                  <div key="Iz"><LatexRenderer formula={formulaInertia} /></div>
                  <div key="wmax"><LatexRenderer formula={formulaDeflection} /></div>
                  <div key="sigmax"><LatexRenderer formula={formulaStress} /></div>
                </div>
             </div>
           </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
           <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Sigma className="w-4 h-4 text-indigo-500" /> 结构计算</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">截面惯性矩 (I_z)</span>
              <span className="font-mono font-bold text-indigo-600">{(inertia/10000).toFixed(1)} cm⁴</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">最大挠度 (w_max)</span>
              <span className="font-mono font-bold text-indigo-600">{maxDeflection.toFixed(2)} mm</span>
            </div>
             <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">最大弯矩 (M_max)</span>
              <span className="font-mono font-bold text-slate-600">{maxMoment.toFixed(0)} Nm</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">最大正应力 (σ_max)</span>
              <span className="font-mono font-bold text-rose-600">{maxStress.toFixed(1)} MPa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};