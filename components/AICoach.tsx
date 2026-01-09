import React, { useState } from 'react';
import { Habit, HabitLogs, AIAnalysisResponse } from '../types';
import { analyzeProgress, suggestHabits } from '../services/geminiService';
import { Sparkles, Brain, Loader2, ArrowRight, Target } from 'lucide-react';

interface AICoachProps {
  habits: Habit[];
  logs: HabitLogs;
  onAddHabits: (habits: Habit[]) => void;
}

export const AICoach: React.FC<AICoachProps> = ({ habits, logs, onAddHabits }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [activeTab, setActiveTab] = useState<'analyze' | 'create'>('analyze');

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeProgress(habits, logs);
    setAnalysis(result);
    setLoading(false);
  };

  const handleCreateHabits = async () => {
    if (!goalInput.trim()) return;
    setLoading(true);
    const suggested = await suggestHabits(goalInput);
    if (suggested.length > 0) {
        onAddHabits(suggested);
        setGoalInput("");
        alert(`Added ${suggested.length} new habits!`);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-800 rounded-lg self-start">
        <button 
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analyze' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Analyze Progress
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
        >
          Generate Habits
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        
        {/* Analyze Mode */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <Brain className="text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Gemini 3 Pro Analyst</h3>
                  <p className="text-indigo-200 text-sm">Deep learning analysis of your habit logs.</p>
                </div>
              </div>
              
              {!analysis && !loading && (
                <button
                  onClick={handleAnalyze}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Analyze My Performance
                </button>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-indigo-300">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p className="animate-pulse">Consulting the neural network...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
                    <span className="text-slate-300">Consistency Score</span>
                    <span className={`text-4xl font-black ${analysis.score >= 80 ? 'text-emerald-400' : analysis.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {analysis.score}
                    </span>
                  </div>

                  <div className="prose prose-invert prose-p:text-slate-300">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-400" /> Insight
                    </h4>
                    <p>{analysis.insight}</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-xl border-l-4 border-emerald-500 italic text-slate-200">
                    "{analysis.motivationalQuote}"
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Suggested Actions</h4>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                          <ArrowRight size={16} className="mt-0.5 text-indigo-400 shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={handleAnalyze}
                    className="w-full mt-4 py-2 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    Refresh Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Mode */}
        {activeTab === 'create' && (
          <div className="space-y-6">
             <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Goal to Habits</h3>
                  <p className="text-slate-400 text-sm">Describe a big goal (e.g., "Run a marathon in 6 months" or "Learn Python"), and AI will generate a daily habit plan.</p>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="I want to achieve..."
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                  
                  <button
                    onClick={handleCreateHabits}
                    disabled={loading || !goalInput.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Target size={18} />}
                    Generate Daily Routine
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
