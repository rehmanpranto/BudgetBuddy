import OpenAI from 'openai';

// DeepSeek AI service configuration
const deepseek = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-fab7c3e43b7a4a2e8ac3eddd65dd99a8',
  baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
});

export interface ExpenseAnalysis {
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
  tags: string[];
}

export interface BudgetInsight {
  type: 'warning' | 'tip' | 'congratulation';
  title: string;
  message: string;
  actionItems?: string[];
}

export interface FinancialAdvice {
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

export class DeepSeekAIService {
  
  // Analyze expense description and suggest category
  async analyzeExpense(description: string, amount: number): Promise<ExpenseAnalysis> {
    try {
      const prompt = `
        Analyze this expense and suggest the most appropriate category:
        
        Description: "${description}"
        Amount: $${amount}
        
        Available categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Education, Travel, Other
        
        Respond with a JSON object containing:
        - suggestedCategory: the best fitting category
        - confidence: percentage (0-100)
        - reasoning: brief explanation
        - tags: array of relevant tags
        
        Example response:
        {
          "suggestedCategory": "Food",
          "confidence": 95,
          "reasoning": "Restaurant purchase during lunch hours",
          "tags": ["restaurant", "dining", "lunch"]
        }
      `;

      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing expense:', error);
      return {
        suggestedCategory: 'Other',
        confidence: 0,
        reasoning: 'Could not analyze expense',
        tags: []
      };
    }
  }

  // Generate personalized budget insights
  async generateBudgetInsights(
    income: number,
    expenses: number,
    transactions: Array<{type: string, amount: number, category: string, date: string}>
  ): Promise<BudgetInsight[]> {
    try {
      const expenseByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      const prompt = `
        Analyze this user's financial data and provide 3-5 personalized insights:
        
        Monthly Income: $${income}
        Monthly Expenses: $${expenses}
        Savings Rate: ${((income - expenses) / income * 100).toFixed(1)}%
        
        Expense Breakdown:
        ${Object.entries(expenseByCategory)
          .map(([cat, amount]) => `- ${cat}: $${amount} (${(amount/expenses*100).toFixed(1)}%)`)
          .join('\n')}
        
        Provide insights as JSON array with objects containing:
        - type: "warning", "tip", or "congratulation"
        - title: short descriptive title
        - message: detailed insight (2-3 sentences)
        - actionItems: array of specific action suggestions (optional)
        
        Focus on:
        - Spending patterns and trends
        - Budget optimization opportunities
        - Financial health indicators
        - Practical money-saving tips
      `;

      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating insights:', error);
      return [
        {
          type: 'tip',
          title: 'Keep Tracking',
          message: 'Continue monitoring your expenses to build better financial habits.'
        }
      ];
    }
  }

  // Get financial advice based on goals
  async getFinancialAdvice(
    currentSavings: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    goal: string
  ): Promise<FinancialAdvice> {
    try {
      const prompt = `
        Provide financial advice for this situation:
        
        Current Savings: $${currentSavings}
        Monthly Income: $${monthlyIncome}
        Monthly Expenses: $${monthlyExpenses}
        Monthly Savings: $${monthlyIncome - monthlyExpenses}
        Goal: "${goal}"
        
        Provide advice as JSON object with:
        - summary: brief overview of financial situation
        - recommendations: array of specific actionable advice
        - riskLevel: "low", "medium", or "high" based on financial health
        - priority: "low", "medium", or "high" for urgency of action needed
        
        Make recommendations practical and achievable.
      `;

      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 600
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting financial advice:', error);
      return {
        summary: 'Continue tracking your finances for better insights.',
        recommendations: ['Keep monitoring your spending habits'],
        riskLevel: 'low',
        priority: 'low'
      };
    }
  }

  // Smart categorization of transaction note
  async categorizeTransaction(note: string, amount: number): Promise<string> {
    try {
      const prompt = `
        Categorize this transaction into one of these categories based on the description:
        Categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Education, Travel, Other
        
        Transaction: "${note}" - $${amount}
        
        Respond with only the category name.
      `;

      const response = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 20
      });

      return response.choices[0]?.message?.content?.trim() || 'Other';
    } catch (error) {
      console.error('Error categorizing transaction:', error);
      return 'Other';
    }
  }
}

export const deepseekAI = new DeepSeekAIService();
