import { useState } from 'react';
import { deepseekAI, FinancialAdvice } from '../services/deepseekAI';

interface AIFinancialAdvisorProps {
  currentSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

export default function AIFinancialAdvisor({ 
  currentSavings, 
  monthlyIncome, 
  monthlyExpenses 
}: AIFinancialAdvisorProps) {
  const [goal, setGoal] = useState('');
  const [advice, setAdvice] = useState<FinancialAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    if (!goal.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const financialAdvice = await deepseekAI.getFinancialAdvice(
        currentSavings,
        monthlyIncome,
        monthlyExpenses,
        goal
      );
      setAdvice(financialAdvice);
    } catch (err: any) {
      setError('Failed to get financial advice');
      console.error('Financial advisor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-green-200 dark:border-green-700';
      case 'medium': return 'border-yellow-200 dark:border-yellow-700';
      case 'high': return 'border-red-200 dark:border-red-700';
      default: return 'border-slate-200 dark:border-slate-600';
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 card-hover">
      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
        <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3">🎯</span>
        AI Financial Advisor
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            What's your financial goal?
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Save for a house down payment, pay off debt, build emergency fund, retire early..."
            className="w-full px-3 py-3 glass rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={getAdvice}
          disabled={loading || !goal.trim()}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Getting AI Advice...</span>
            </div>
          ) : (
            'Get Personalized Advice'
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {advice && (
          <div className={`border-2 rounded-xl p-4 ${getPriorityColor(advice.priority)}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskColor(advice.riskLevel)}`}>
                {advice.riskLevel.toUpperCase()} RISK
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Priority: {advice.priority.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Financial Summary</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {advice.summary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {advice.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!advice && !loading && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Tell us your financial goal and get personalized AI-powered advice
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
