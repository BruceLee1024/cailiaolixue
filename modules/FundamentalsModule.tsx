import React, { useState } from "react";
import { Scaling, Sigma, Calculator } from "lucide-react";
import { SliderControl, LatexRenderer, MaterialSelector } from "../components";
import { SimulationState } from "../types";
import { CommonDefs } from "./CommonDefs";

export const FundamentalsModule = ({ state, onChange }: { state: SimulationState; onChange: (s: Partial<SimulationState>) => void }) => {
  const [strainLevel, setStrainLevel] = useState(0.1); 

  const nu = state.poissonRatio;
  const epsAxial = strainLevel;
  const epsTrans = -nu * strainLevel;

  const w0 = 100;
  const h0 = 100;
  const wCurrent = w0 * (1 + epsTrans); 
  const hCurrent = h0 * (1 + epsAxial); 

  const generateChartData = () => {
      const points = [];
      for(let e = 0; e <= 0.5; e += 0.01) {
          let sigEng = 0;
          if (e < 0.05) {
             sigEng = e * 4000; 
          } else {
             const ep = e - 0.05;
             sigEng = 200 + 300 * Math.pow(ep, 0.4) - 100 * Math.pow(ep, 2); 
          }
          const sigTrue = sigEng * (1 + e);
          points.push({ e, sigEng, sigTrue });
      }
      return points;
  }
  const chartData = generateChartData();
  
  const width = 300;
  const height = 180;
  const padding = 30;
  const maxStrain = 0.5;
  const maxStress = 600; 
  
  const mapX = (val: number) => padding + (val / maxStrain) * (width - 2 * padding);
  const mapY = (val: number) => height - padding - (val / maxStress) * (height - 2 * padding);
  
  const pathEng = chartData.map((p, i) => `${i===0?'M':'L'} ${mapX(p.e)},${mapY(p.sigEng)}`).join(" ");
  const pathTrue = chartData.map((p, i) => `${i===0?'M':'L'} ${mapX(p.e)},${mapY(p.sigTrue)}`).join(" ");

  const currentSigEng = strainLevel < 0.05 ? strainLevel * 4000 : 200 + 300 * Math.pow(strainLevel - 0.05, 0.4) - 100 * Math.pow(strainLevel - 0.05, 2);
  const currentSigTrue = currentSigEng * (1 + strainLevel);
  const cx = mapX(strainLevel);

  return (
    <div className="flex flex-col h-full space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Poisson Effect Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col relative h-[400px]">
                <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Scaling className="w-4 h-4"/> 泊松效应 (Poisson Effect)
                </div>
                <div className="flex-grow min-h-0 flex items-center justify-center pt-4">
                    <svg width="100%" height="100%" viewBox="0 0 300 320" preserveAspectRatio="xMidYMid meet">
                        <CommonDefs />
                        
                        {/* Center Guides */}
                        <line x1="150" y1="20" x2="150" y2="300" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="160" x2="280" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                        <g transform="translate(0, 10)">
                            {/* Original Shape (Dashed) */}
                            <rect x={150 - w0/2} y={150 - h0/2} width={w0} height={h0} 
                                  fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                            
                            {/* Deformed Shape (Transparent Indigo with Solid Border) */}
                            <rect x={150 - wCurrent/2} y={150 - hCurrent/2} width={wCurrent} height={hCurrent}
                                  fill="rgba(79, 70, 229, 0.1)" 
                                  stroke="#4f46e5"
                                  strokeWidth="2"
                                  style={{ transition: "all 0.1s linear" }}/>
                            
                            {/* Dimensions */}
                            <line x1={150 - wCurrent/2} y1={150} x2={150 - wCurrent/2 - 10} y2={150} stroke="#e11d48" />
                            <line x1={150 + wCurrent/2} y1={150} x2={150 + wCurrent/2 + 10} y2={150} stroke="#e11d48" />
                            
                            {/* Force Arrows (Rose) */}
                            <line x1="150" y1={150 - hCurrent/2} x2="150" y2={150 - hCurrent/2 - 30} stroke="#e11d48" strokeWidth="2" markerEnd="url(#arrowForce)" />
                            <line x1="150" y1={150 + hCurrent/2} x2="150" y2={150 + hCurrent/2 + 30} stroke="#e11d48" strokeWidth="2" markerEnd="url(#arrowForce)" />

                            <text x={150 + w0/2 + 15} y={145} fontSize="11" fill="#94a3b8">Original</text>
                            <text x={150 + wCurrent/2 + 15} y={165} fontSize="11" fill="#4f46e5" fontWeight="bold">Deformed</text>
                        </g>
                    </svg>
                </div>
                <div className="bg-slate-50 p-3 rounded text-sm space-y-2 border border-slate-200 z-10">
                     <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-600 truncate" title="轴向应变">
                            轴向应变 <span className="text-xs text-slate-400 font-normal">(Axial)</span>
                        </span> 
                        <span className="font-mono font-bold text-emerald-600 whitespace-nowrap">
                            {(epsAxial*100).toFixed(1)}%
                        </span>
                     </div>
                     <div className="flex justify-between items-center gap-2">
                        <span className="text-slate-600 truncate" title="横向应变">
                            横向应变 <span className="text-xs text-slate-400 font-normal">(Trans)</span>
                        </span> 
                        <span className="font-mono font-bold text-rose-600 whitespace-nowrap">
                            {(epsTrans*100).toFixed(1)}%
                        </span>
                     </div>
                     <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1 gap-2">
                        <span className="text-slate-600 truncate">
                            理论泊松比 <span className="text-xs text-slate-400 font-normal">(ν)</span>
                        </span> 
                        <span className="font-bold text-slate-700 whitespace-nowrap">{nu}</span>
                     </div>
                </div>
           </div>

           {/* Stress-Strain Curve Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col relative h-[400px]">
                <div className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Sigma className="w-4 h-4"/> 工程应力 vs 真应力
                </div>
                <div className="flex-grow min-h-0 flex items-center justify-center">
                    <svg width="100%" height="100%" viewBox="0 0 300 180">
                        {/* Grid */}
                        <path d="M30,30 L30,150 L270,150" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                        {[120, 90, 60].map(y => <line key={y} x1="30" y1={y} x2="270" y2={y} stroke="#f1f5f9" />)}
                        {[90, 150, 210].map(x => <line key={x} x1={x} y1="30" x2={x} y2="150" stroke="#f1f5f9" />)}

                        <text x={275} y={154} fontSize="10" fill="#94a3b8">ε</text>
                        <text x={20} y={25} fontSize="10" fill="#94a3b8">σ</text>

                        <path d={pathEng} fill="none" stroke="#4f46e5" strokeWidth="2" />
                        <text x={mapX(0.4)} y={mapY(220)} fontSize="10" fill="#4f46e5">Eng.</text>

                        <path d={pathTrue} fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 2"/>
                        <text x={mapX(0.4)} y={mapY(450)} fontSize="10" fill="#e11d48">True</text>

                        {/* Points */}
                        <circle cx={cx} cy={mapY(currentSigEng)} r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
                        <circle cx={cx} cy={mapY(currentSigTrue)} r="4" fill="#fff" stroke="#e11d48" strokeWidth="2" />
                        
                        <line x1={cx} y1={mapY(currentSigEng)} x2={cx} y2={mapY(currentSigTrue)} stroke="#94a3b8" strokeDasharray="2 2" />
                    </svg>
                </div>
                <div className="bg-slate-50 p-3 rounded text-sm space-y-2 border border-slate-200 z-10">
                    <div className="flex items-center gap-4 justify-center text-xs">
                         <div className="flex items-center gap-1"><span className="w-3 h-1 bg-indigo-600 rounded"></span> 工程应力 (F/A₀)</div>
                         <div className="flex items-center gap-1"><span className="w-3 h-1 border-t-2 border-rose-600 border-dashed"></span> 真应力 (F/A)</div>
                    </div>
                </div>
           </div>
       </div>

       {/* Controls */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-indigo-500" /> 实验参数控制</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <MaterialSelector 
                        currentE={state.bendModulus} 
                        currentYield={state.materialYield}
                        currentPoisson={state.poissonRatio}
                        onSelect={(mat) => onChange({ 
                            materialName: mat.name, 
                            bendModulus: mat.E, 
                            materialYield: mat.yield,
                            poissonRatio: mat.poisson
                        })} 
                    />
                    <div className="mt-4">
                        <SliderControl label="加载应变 (Strain)" value={parseFloat(strainLevel.toFixed(2))} min={0} max={0.5} step={0.01} unit="" onChange={(v) => setStrainLevel(v)} />
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-700">关键数值对比</h4>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-sm text-slate-600">面积收缩比 (A/A₀)</span>
                        <span className="font-mono font-bold text-slate-700">{(1 / (1 + strainLevel)).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-indigo-50 rounded border border-indigo-100">
                        <span className="text-sm text-indigo-800">工程应力 σ_eng</span>
                        <span className="font-mono font-bold text-indigo-700">{currentSigEng.toFixed(1)} MPa</span>
                    </div>
                     <div className="flex justify-between items-center p-2 bg-rose-50 rounded border border-rose-100">
                        <span className="text-sm text-rose-800">真应力 σ_true</span>
                        <span className="font-mono font-bold text-rose-700">{currentSigTrue.toFixed(1)} MPa</span>
                    </div>
                </div>
           </div>
       </div>
    </div>
  );
};