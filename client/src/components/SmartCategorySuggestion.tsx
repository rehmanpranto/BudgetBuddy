import { useState } from 'react';
import { deepseekAI } from '../services/deepseekAI';

interface SmartCategorySuggestionProps {
  note: string;
  amount: number;
  onSuggestion: (category: string) => void;
  currentCategory: string;
}

export default function SmartCategorySuggestion({ 
  note, 
  amount, 
  onSuggestion, 
  currentCategory 
}: SmartCategorySuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const getSuggestion = async () => {
    if (!note.trim() || amount <= 0) return;
    
    setLoading(true);
    try {
      const suggestedCategory = await deepseekAI.categorizeTransaction(note, amount);
      setSuggestion(suggestedCategory);
    } catch (error) {
      console.error('Failed to get category suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      onSuggestion(suggestion);
      setSuggestion(null);
    }
  };

  // Only show if we have a note and the suggestion is different from current category
  if (!note.trim() || !suggestion || suggestion === currentCategory) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
      <span className="text-xs text-blue-600 dark:text-blue-400">🤖 AI suggests:</span>
      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{suggestion}</span>
      <button
        onClick={applySuggestion}
        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Apply
      </button>
      <button
        onClick={() => setSuggestion(null)}
        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        Dismiss
      </button>
    </div>
  );

  // You can add this JSX after the note input field
  /*
  {note.trim() && amount > 0 && (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={getSuggestion}
        disabled={loading}
        className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
      >
        {loading ? '🤖 Analyzing...' : '🤖 Suggest Category'}
      </button>
    </div>
  )}
  */
}
