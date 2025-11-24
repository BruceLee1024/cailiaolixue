import React from "react";
import { Calculator, Sigma, AlertTriangle } from "lucide-react";
import { SliderControl, LatexRenderer, MaterialSelector } from "../components";
import { SimulationState } from "../types";
import { CommonDefs } from "./CommonDefs";

export const AxialModule = ({ state, onChange }: { state: SimulationState; onChange: (s: Partial<SimulationState>) => void }) => {
  const stress = state.axialForce / state.axialArea; 
  const E_MPa = state.bendModulus * 1000; 
  const yieldStrength = state.materialYield;
  
  let strain = 0;
  let isPlastic = false;
  let isFailure = false;
  
  const strainAtYield = yieldStrength / E_MPa;
  const utsStrength = yieldStrength * 1.5; 
  const failureStrength = yieldStrength * 1.4; 
  const strainAtUTS = strainAtYield * 10; 
  const strainAtFailure = strainAtYield * 15;

  if (stress <= yieldStrength) {
      strain = stress / E_MPa;
  } else {
      isPlastic = true;
      if (stress > utsStrength) {
         isFailure = true;
         strain = strainAtFailure; 
      } else {
         const ratio = (stress - yieldStrength) / (utsStrength - yieldStrength);
         strain = strainAtYield + (strainAtUTS - strainAtYield) * Math.pow(ratio, 2); 
      }
  }
  
  const deformation = strain * state.axialLength * 1000; 
  const originalLength = state.axialLength * 1000; 

  const visualDeformation = Math.min(deformation * 100, 150); 
  
  // Color Logic for Transparent/Solid
  let strokeColor = "#4f46e5"; // Indigo
  let fillColor = "rgba(79, 70, 229, 0.1)";

  if (isFailure) {
    strokeColor = "#e11d48"; // Rose
    fillColor = "rgba(225, 29, 72, 0.1)";
  } else if (isPlastic) {
    strokeColor = "#f59e0b"; // Amber
    fillColor = "rgba(245, 158, 11, 0.1)";
  }

  const baseWidth = 200;
  const currentWidth = baseWidth + visualDeformation;
  
  const gx = (val: number) => 40 + (val / strainAtFailure) * 240; 
  const gy = (val: number) => 170 - (val / utsStrength) * 140;    

  const pOrigin = "40,170";
  const pYield = `${gx(strainAtYield)},${gy(yieldStrength)}`;
  const pUTS = `${gx(strainAtUTS)},${gy(utsStrength)}`;
  const pFail = `${gx(strainAtFailure)},${gy(failureStrength)}`;
  
  const curvePath = `M ${pOrigin} L ${pYield} Q ${gx((strainAtYield+strainAtUTS)/2)},${gy(utsStrength)} ${pUTS} L ${pFail}`;
  
  const dotX = gx(strain);
  const dotY = gy(Math.min(stress, utsStrength)); 

  const formulaStress = `\\sigma = \\frac{F}{A} = ${stress.toFixed(1)} \\text{ MPa}`;
  const formulaHooke = `\\varepsilon = \\sigma / E = ${(strain*100).toFixed(3)} \\%`;
  const formulaPlastic = `\\sigma > \\sigma_{yield} (${yieldStrength} \\text{ MPa}) \\rightarrow \\text{Plastic!}`;

  const barHeight = Math.sqrt(state.axialArea) * 4;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Visualizer */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden h-[300px]">
             <div className="absolute top-2 left-2 text-xs font-bold text-slate-400 uppercase">试件变形演示</div>
             <svg width="100%" height="100%" viewBox="0 0 400 200" className="z-10">
                <CommonDefs />
                
                {/* Wall Fixed Support - Transparent with Hatch */}
                <rect x="10" y="20" width="20" height="160" fill="url(#hatchPattern)" stroke="#64748b" strokeWidth="2" />
                <line x1="30" y1="20" x2="30" y2="180" stroke="#64748b" strokeWidth="2" />
                
                {/* Bar Specimen */}
                <g>
                    {/* Fixed part (reference) */}
                     <rect
                        x="30"
                        y={100 - barHeight/2}
                        width={10}
                        height={barHeight}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="2"
                    />
                    {/* Main Bar */}
                    <rect 
                        x="40" 
                        y={100 - barHeight/2} 
                        width={currentWidth} 
                        height={barHeight} 
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="2"
                        style={{ transition: "width 0.1s linear, fill 0.3s, stroke 0.3s" }}
                    />
                     {/* Centerline */}
                     <line x1="30" y1="100" x2={40 + currentWidth} y2="100" stroke={strokeColor} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />
                     
                     {/* Measuring Points */}
                     <line x1={40} y1={100 - barHeight/2} x2={40} y2={100 + barHeight/2} stroke={strokeColor} strokeOpacity="0.5" />
                     <line x1={40 + currentWidth} y1={100 - barHeight/2} x2={40 + currentWidth} y2={100 + barHeight/2} stroke={strokeColor} strokeOpacity="0.5" />
                </g>

                {/* Force Arrow (Rose) */}
                <g transform={`translate(${40 + currentWidth}, 100)`} style={{ transition: "transform 0.1s linear" }}>
                    <line x1="0" y1="0" x2="60" y2="0" stroke="#e11d48" strokeWidth="2" markerEnd="url(#arrowForce)" />
                    <text x="5" y="-10" fill="#e11d48" fontWeight="bold">F = {state.axialForce} N</text>
                </g>

                {/* Dimensions */}
                <g transform="translate(0, 160)">
                    <line x1="40" y1="0" x2={40} y2="20" stroke="#94a3b8" />
                    <line x1={40 + currentWidth} y1="0" x2={40 + currentWidth} y2="20" stroke="#94a3b8" />
                    <line x1="40" y1="10" x2={40 + currentWidth} y2="10" stroke="#94a3b8" markerEnd="url(#arrowDim)" />
                    <text x={40 + currentWidth/2} y="25" fill="#64748b" fontSize="12" textAnchor="middle">L + ΔL</text>
                </g>
             </svg>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative h-[300px]">
             <div className="absolute top-2 left-2 text-xs font-bold text-slate-400 uppercase">应力-应变曲线</div>
             <svg width="100%" height="100%" viewBox="0 0 300 200">
                {/* Grid */}
                <path d="M40,30 L40,170 L280,170" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                
                {/* Curve */}
                <path d={curvePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
                <path d={curvePath} fill="none" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

                {/* Current Point */}
                <circle cx={dotX} cy={dotY} r="6" fill={fillColor} stroke={strokeColor} strokeWidth="2" className="shadow-sm" />
                
                {/* Drop lines */}
                <line x1={dotX} y1={dotY} x2={dotX} y2="170" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
                <line x1={dotX} y1={dotY} x2="40" y2={dotY} stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />

                <text x="280" y="185" fontSize="12" fill="#64748b" textAnchor="end">Strain (ε)</text>
                <text x="30" y="25" fontSize="12" fill="#64748b">Stress (σ)</text>
             </svg>
          </div>
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
               <SliderControl label="轴向拉力 (Force)" value={state.axialForce} min={1000} max={50000} step={1000} unit="N" onChange={(v) => onChange({ axialForce: v })} />
               <SliderControl label="横截面积 (Area)" value={state.axialArea} min={10} max={500} step={10} unit="mm²" onChange={(v) => onChange({ axialArea: v })} />
               <SliderControl label="原长 (Length)" value={state.axialLength} min={0.1} max={5.0} step={0.1} unit="m" onChange={(v) => onChange({ axialLength: v })} />
             </div>

             <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sigma className="w-3 h-3" /> 计算过程演示
                </h4>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2 overflow-x-auto">
                   <div key="stress"><LatexRenderer formula={formulaStress} /></div>
                   <div key="constitutive">
                     {isPlastic ? (
                         <LatexRenderer formula={formulaPlastic} />
                     ) : (
                         <LatexRenderer formula={formulaHooke} />
                     )}
                   </div>
                </div>
             </div>
           </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
            <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Sigma className="w-4 h-4 text-indigo-500" /> 结果分析</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                  <span className="text-sm text-slate-600">当前应力 (Stress)</span>
                  <span className={`font-mono font-bold ${isPlastic ? 'text-rose-600' : 'text-indigo-600'}`}>{stress.toFixed(1)} MPa</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                  <span className="text-sm text-slate-600">当前应变 (Strain)</span>
                  <span className="font-mono font-bold text-slate-700">{(strain*100).toFixed(3)} %</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
                  <span className="text-sm text-slate-600">总伸长量 (ΔL)</span>
                  <span className="font-mono font-bold text-slate-700">{deformation.toFixed(2)} mm</span>
                </div>
                
                <div className={`mt-4 p-3 rounded text-sm font-bold text-center transition-colors ${isFailure ? "bg-rose-100 text-rose-700" : (isPlastic ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}`}>
                    {isFailure ? "结构断裂 (Fracture)" : (isPlastic ? "塑性屈服 (Yielding)" : "弹性状态 (Elastic)")}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};