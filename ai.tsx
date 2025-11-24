
import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Bot, Sparkles, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "./components";
import { ModuleType, SimulationState } from "./types";

export const AITutor = ({ activeModule, state }: { activeModule: ModuleType; state: SimulationState }) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAskAI = async () => {
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Prepare a context-aware prompt
      let promptContext = "";
      const materialInfo = `材料: ${state.materialName}, 弹性模量 E=${state.bendModulus}GPa, 屈服强度 σ_y=${state.materialYield}MPa`;

      switch (activeModule) {
        case "fundamentals":
          promptContext = `模块: 应力应变基础理论。${materialInfo}, 泊松比 ν=${state.poissonRatio}。
          用户正在观察泊松效应演示与真应力vs工程应力对比图。
          请解释为什么受拉时会发生横向收缩（微观层面），以及为什么大变形下真应力会比工程应力显著增大。`;
          break;
        case "axial":
          promptContext = `模块: 轴向拉伸。${materialInfo}。
          当前工况: 力 F=${state.axialForce}N, 面积 A=${state.axialArea}mm^2, 长度 L=${state.axialLength}m。
          计算应力: ${(state.axialForce/state.axialArea).toFixed(1)} MPa。
          请重点分析是否发生了塑性变形（应力是否超过屈服强度）。`;
          break;
        case "bending":
          promptContext = `模块: 梁的弯曲。${materialInfo}。
          当前工况: 载荷 P=${state.bendLoad}N, 跨度 L=${state.bendLength}m, 截面宽度 b=${state.bendWidth}mm, 高度 h=${state.bendHeight}mm。`;
          break;
        case "torsion":
          promptContext = `模块: 圆轴扭转。${materialInfo} (G=${state.torqModulus}GPa)。
          当前工况: 扭矩 T=${state.torqTorque}Nm, 半径 r=${state.torqRadius}mm, 长度 L=${state.torqLength}m。`;
          break;
        case "buckling":
          promptContext = `模块: 压杆稳定。${materialInfo}。
          当前工况: 压力 P=${state.buckleLoad}N, 长度 L=${state.buckleLength}m, 截面宽度 b=${state.buckleWidth}mm, 高度 h=${state.buckleHeight}mm。`;
          break;
        case "combined":
            promptContext = `模块: 组合变形(偏心拉伸)。${materialInfo}。
            当前工况: 轴向力 F=${state.combinedLoad}N, 偏心距 e=${state.combinedEccentricity}mm。截面尺寸 ${state.combinedWidth}x${state.combinedHeight}mm。
            请分析截面最大/最小应力，并判断是否超过屈服强度。`;
            break;
        case "stress":
          promptContext = `模块: 3D 应力状态。张量数据:
          Sigma X = ${state.stressSigX} MPa
          Sigma Y = ${state.stressSigY} MPa
          Sigma Z = ${state.stressSigZ} MPa
          Tau XY = ${state.stressTauXY} MPa
          Tau YZ = ${state.stressTauYZ} MPa
          Tau ZX = ${state.stressTauZX} MPa`;
          break;
      }

      const prompt = `你是一位风趣且专业的材料力学教授。当前学生正在进行如下虚拟实验：
      ${promptContext}
      
      请根据当前的参数值：
      1. 解释当前发生的物理现象。
      2. 重点关注：如果应力接近或超过屈服强度/临界载荷，请给予严重的警告和改进建议。
      3. 结合惯性矩、惯性半径等几何性质，提供一个直观的物理理解或生活案例。
      
      请用 Markdown 格式（使用加粗、列表等）用中文回答，格式清晰，字数控制在 300 字以内。`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setExplanation(response.text);
    } catch (err) {
      setError("AI 连接失败，请检查网络或 API Key。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" /> AI 智能助教
        </h3>
      </div>
      
      <button
          onClick={handleAskAI}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mb-4 shadow-sm shadow-indigo-200"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "正在分析中..." : "分析当前状态"}
      </button>
      
      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded border border-rose-100">
          {error}
        </div>
      )}

      {explanation && (
        <div className="prose prose-sm prose-indigo max-w-none bg-white p-4 rounded-lg border border-indigo-100/50 animate-in fade-in slide-in-from-bottom-2 shadow-sm max-h-96 overflow-y-auto">
           <MarkdownRenderer content={explanation} />
        </div>
      )}
      
      {!explanation && !loading && !error && (
        <div className="text-center p-6 text-indigo-300">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">点击按钮，让我为您解读实验现象</p>
        </div>
      )}
    </div>
  );
};
