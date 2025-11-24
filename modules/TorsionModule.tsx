import React from "react";
import { Calculator, Sigma } from "lucide-react";
import { SliderControl, LatexRenderer, MaterialSelector } from "../components";
import { SimulationState } from "../types";
import { CommonDefs } from "./CommonDefs";

export const TorsionModule = ({ state, onChange }: { state: SimulationState; onChange: (s: Partial<SimulationState>) => void }) => {
  const Ip = (Math.PI * Math.pow(state.torqRadius, 4)) / 2;
  const T_Nmm = state.torqTorque * 1000;
  const maxShear = (T_Nmm * state.torqRadius) / Ip;
  const G_MPa = state.torqModulus * 1000;
  const L_mm = state.torqLength * 1000;
  const twistAngleRad = (T_Nmm * L_mm) / (G_MPa * Ip);
  const twistAngleDeg = twistAngleRad * (180 / Math.PI);

  const visualTwistDeg = Math.min(Math.max(twistAngleDeg, 0), 60); 
  const centerY = 150;
  const r = state.torqRadius * 2;

  const formulaIp = `I_p = \\frac{\\pi r^4}{2} = ${(Ip/10000).toFixed(2)} \\times 10^4 \\text{ mm}^4`;
  const formulaShear = `\\tau_{max} = \\frac{T \\cdot r}{I_p} = ${maxShear.toFixed(2)} \\text{ MPa}`;
  const formulaAngle = `\\varphi = \\frac{T \\cdot L}{G \\cdot I_p} = ${twistAngleDeg.toFixed(2)}^\\circ`;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-grow flex items-center justify-center relative min-h-[300px]">
        <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
            <CommonDefs />
            
            {/* Wall Support */}
            <rect x="50" y="50" width="20" height="200" fill="url(#hatchPattern)" stroke="#94a3b8" strokeWidth="2" />
            <line x1="70" y1="50" x2="70" y2="250" stroke="#94a3b8" strokeWidth="2" />
            
            {/* Shaft - Transparent Indigo with Solid Borders */}
            <rect 
                x="70" 
                y={centerY - r} 
                width={400} 
                height={r*2} 
                fill="rgba(79, 70, 229, 0.1)" 
                stroke="#4f46e5"
                strokeWidth="2"
                style={{ transition: "all 0.3s ease-out" }} 
            />
            
            {/* Longitudinal Line (Deformed) - Solid Indigo */}
            <path d={`M 70,${centerY - r/2} L 470,${centerY - r/2 + visualTwistDeg}`} stroke="#4f46e5" strokeWidth="2" fill="none" style={{ transition: "d 0.3s ease-out" }} />
            
            {/* Longitudinal Line (Original) - Faint Dashed */}
            <line x1="70" y1={centerY - r/2} x2={470} y2={centerY - r/2} stroke="#4f46e5" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.3" />
            
            {/* End Face Cap - Transparent with Solid Border */}
            <ellipse 
                cx={470} cy={centerY} 
                rx={10} ry={r} 
                fill="rgba(79, 70, 229, 0.2)" 
                stroke="#4f46e5" 
                strokeWidth="2"
                style={{ transition: "all 0.3s ease-out" }} 
            />
            
            {/* Twist Arrow (Rose for Load) */}
            <g transform={`translate(${490}, ${centerY}) rotate(${visualTwistDeg})`} style={{ transition: "transform 0.3s ease-out" }}>
                <path d="M -10,-30 A 30,30 0 0,1 10,30" fill="none" stroke="#e11d48" strokeWidth="3" markerEnd="url(#arrowForce)" />
                <text x="15" y="0" fill="#e11d48" fontSize="14" fontWeight="bold" style={{ transform: `rotate(${-visualTwistDeg}deg)` }}>T</text>
            </g>
            
            <text x={470} y={centerY - r - 15} fill="#e11d48" fontSize="12" textAnchor="middle" fontWeight="bold">φ = {visualTwistDeg.toFixed(1)}°</text>
        </svg>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-indigo-500" /> 实验参数</h3>
            <div className="space-y-4">
              <div>
                  <MaterialSelector 
                    currentG={state.torqModulus} 
                    onSelect={(mat) => onChange({ torqModulus: mat.G })} 
                  />
                  <SliderControl label="扭矩 (Torque)" value={state.torqTorque} min={100} max={2000} step={50} unit="Nm" onChange={(v) => onChange({ torqTorque: v })} />
                  <SliderControl label="轴半径 (Radius)" value={state.torqRadius} min={10} max={50} step={1} unit="mm" onChange={(v) => onChange({ torqRadius: v })} />
                  <SliderControl label="轴长 (Length)" value={state.torqLength} min={0.5} max={3.0} step={0.1} unit="m" onChange={(v) => onChange({ torqLength: v })} />
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sigma className="w-3 h-3" /> 计算过程演示
                  </h4>
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-2 overflow-x-auto">
                    <div key="Ip"><LatexRenderer formula={formulaIp} /></div>
                    <div key="tau"><LatexRenderer formula={formulaShear} /></div>
                    <div key="phi"><LatexRenderer formula={formulaAngle} /></div>
                  </div>
              </div>
            </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
            <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Sigma className="w-4 h-4 text-indigo-500" /> 结果</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">切变模量 (G)</span>
              <span className="font-mono font-bold text-slate-600">{state.torqModulus} GPa</span>
            </div>
             <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">极惯性矩 (I_p)</span>
              <span className="font-mono font-bold text-slate-700">{(Ip/10000).toFixed(1)} cm⁴</span>
            </div>
             <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">最大切应力 (τ_max)</span>
              <span className="font-mono font-bold text-indigo-600">
                {maxShear.toFixed(2)} MPa
              </span>
            </div>
             <div className="flex justify-between items-center p-2 bg-white rounded border border-slate-200">
              <span className="text-sm text-slate-600">扭转角 (φ)</span>
              <span className="font-mono font-bold text-rose-600">
                {twistAngleDeg.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};