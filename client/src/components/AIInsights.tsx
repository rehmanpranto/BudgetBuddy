import { useState, useEffect } from 'react';
import { deepseekAI, BudgetInsight } from '../services/deepseekAI';

interface AIInsightsProps {
  transactions: Array<{id: string; type: 'income'|'expense'; amount: number; category: string; date: string; note?: string}>;
  summary: {income: number; expenses: number; balance: number};
}

export default function AIInsights({ transactions, summary }: AIInsightsProps) {
  const [insights, setInsights] = useState<BudgetInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const aiInsights = await deepseekAI.generateBudgetInsights(
        summary.income,
        summary.expenses,
        transactions
      );
      setInsights(aiInsights);
    } catch (err: any) {
      setError('Failed to generate AI insights');
      console.error('AI Insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'tip': return '💡';
      case 'congratulation': return '🎉';
      default: return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700';
      case 'tip': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700';
      case 'congratulation': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700';
      default: return 'border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-600';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-800 dark:text-amber-200';
      case 'tip': return 'text-blue-800 dark:text-blue-200';
      case 'congratulation': return 'text-green-800 dark:text-green-200';
      default: return 'text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3">🤖</span>
          AI Financial Insights
        </h3>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Get Insights'
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mb-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg flex-shrink-0 mt-0.5">{getInsightIcon(insight.type)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm sm:text-base mb-1 ${getTextColor(insight.type)}`}>
                    {insight.title}
                  </h4>
                  <p className={`text-xs sm:text-sm leading-relaxed ${getTextColor(insight.type)} opacity-90`}>
                    {insight.message}
                  </p>
                  {insight.actionItems && insight.actionItems.length > 0 && (
                    <div className="mt-2">
                      <p className={`text-xs font-medium ${getTextColor(insight.type)} mb-1`}>Action Items:</p>
                      <ul className="text-xs space-y-1">
                        {insight.actionItems.map((item, idx) => (
                          <li key={idx} className={`flex items-start space-x-1 ${getTextColor(insight.type)} opacity-80`}>
                            <span className="text-[10px] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Click "Get Insights" to receive personalized financial advice powered by AI
          </p>
        </div>
      )}
    </div>
  );
}
