import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import LoadingSpinner, { SkeletonCard, SkeletonTable } from '../components/LoadingSpinner';

type Tx = { id: string; type: 'income'|'expense'; amount: number; category: string; date: string; note?: string };

type Summary = { income: number; expenses: number; balance: number };

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16'];

export default function Dashboard() {
  const { currentCurrency, isLoading: currencyLoading } = useCurrency();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [summary, setSummary] = useState<Summary>({ income: 0, expenses: 0, balance: 0 });
  const [filter, setFilter] = useState<{category?: string; startDate?: string; endDate?: string}>({});
  const [form, setForm] = useState<{id?: string; type: 'income'|'expense'; amount: string; category: string; date: string; note?: string}>({ type: 'expense', amount: '', category: 'Food', date: new Date().toISOString().slice(0,10) });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      setIsLoading(true);
      const { data: list } = await api.get('/transactions', { params: filter });
      const { data: sum } = await api.get('/summary');
      setTxs(list);
      setSummary(sum);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.response?.data?.message || 'Failed to load data. Please try again.');
      // Set empty data as fallback
      setTxs([]);
      setSummary({ income: 0, expenses: 0, balance: 0 });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, [JSON.stringify(filter)]);

  function edit(tx?: Tx) {
    if (!tx) { setForm({ type: 'expense', amount: '', category: 'Food', date: new Date().toISOString().slice(0,10) }); return; }
    setForm({ id: tx.id, type: tx.type, amount: String(tx.amount), category: tx.category, date: tx.date.slice(0,10), note: tx.note });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    const payload = { ...form, amount: Number(form.amount) } as any;
    try {
      if (form.id) await api.put(`/transactions/${form.id}`, payload);
      else await api.post('/transactions', payload);
      edit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: string) {
    console.log('Remove function called with ID:', id);
    console.log('Current token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        setError(null);
        setDeletingId(id);
        console.log('Starting delete process for transaction:', id);
        
        const response = await api.delete(`/transactions/${id}`);
        console.log('Delete response:', response);
        console.log('Delete response status:', response.status);
        
        await load();
        console.log('Transaction deleted successfully, data reloaded');
      } catch (err: any) {
        console.error('Delete error:', err);
        console.error('Error response:', err?.response);
        console.error('Error status:', err?.response?.status);
        console.error('Error data:', err?.response?.data);
        console.error('Request headers:', err?.config?.headers);
        
        let errorMessage = 'Failed to delete transaction. Please try again.';
        if (err?.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          // Redirect to login if auth failed
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('authChange'));
          window.location.href = '/login';
        } else if (err?.response?.status === 404) {
          errorMessage = 'Transaction not found. It may have been already deleted.';
        } else if (err?.response?.status === 403) {
          errorMessage = 'You do not have permission to delete this transaction.';
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        console.error('Final error message set:', errorMessage);
      } finally {
        setDeletingId(null);
        console.log('Delete process completed, clearing deletingId');
      }
    } else {
      console.log('Delete cancelled by user');
    }
  }

  const recent = useMemo(() => txs.slice(0, 8), [txs]);
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    txs.forEach(t => { 
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.amount; 
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [txs]);

  const byMonth = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    txs.forEach(t => {
      const m = format(new Date(t.date), 'MMM yyyy');
      map[m] ||= { income: 0, expense: 0 };
      map[m][t.type] += t.amount;
    });
    return Object.entries(map).slice(-6).map(([month, v]) => ({ month, ...v }));
  }, [txs]);

  if (currencyLoading || isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="text-center py-4 sm:py-8">
          <div className="h-8 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mx-auto animate-pulse"></div>
        </div>

        {/* Loading Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </section>

        {/* Loading Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="glass rounded-3xl p-4 sm:p-8 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="glass rounded-3xl p-4 sm:p-8 animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </section>

        {/* Loading Table */}
        <SkeletonTable />
      </div>
    );
  }

  // Custom tooltip formatter for charts
  const formatTooltipValue = (value: any) => formatCurrency(Number(value), currentCurrency);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-4 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
          Financial Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">Track your income and expenses with beautiful insights</p>
        <div className="mt-4 inline-flex items-center px-3 sm:px-4 py-2 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600 rounded-xl">
          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">Currency: </span>
          <span className="ml-2 text-base sm:text-lg font-bold text-blue-700 dark:text-blue-300">{getCurrencySymbol(currentCurrency)} {currentCurrency}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard 
          title="Total Income" 
          value={formatCurrency(summary.income, currentCurrency)}
          icon="💰"
          gradient="gradient-success"
          shadowColor="shadow-emerald-500/25"
        />
        <SummaryCard 
          title="Total Expenses" 
          value={formatCurrency(summary.expenses, currentCurrency)}
          icon="💸"
          gradient="gradient-danger"
          shadowColor="shadow-rose-500/25"
        />
        <SummaryCard 
          title="Net Balance" 
          value={formatCurrency(summary.balance, currentCurrency)}
          icon="📊"
          gradient={summary.balance >= 0 ? "gradient-primary" : "gradient-warning"}
          shadowColor={summary.balance >= 0 ? "shadow-blue-500/25" : "shadow-amber-500/25"}
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="glass-card p-4 sm:p-8 card-hover">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
            <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3">📈</span>
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={byCategory} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80}
                innerRadius={30}
                paddingAngle={2}
              >
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [formatTooltipValue(value), 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-4 sm:p-8 card-hover">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
            <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3">📊</span>
            Monthly Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byMonth}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [formatTooltipValue(value), '']} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Transactions and Form Section */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-8">
        {/* Recent Transactions */}
        <div className="xl:col-span-2 glass-card p-4 sm:p-8 card-hover">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
            <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3">📋</span>
            Recent Transactions
          </h3>
          
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">Date</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">Type</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">Category</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">Amount</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">Note</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(t => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{format(new Date(t.date), 'MMM dd')}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        t.type === 'income' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                      }`}>
                        {t.type === 'income' ? '💰' : '💸'} {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{t.category}</td>
                    <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(t.amount, currentCurrency)}</td>
                    <td className="py-3 px-2 text-slate-500 dark:text-slate-400 text-sm">{t.note || '-'}</td>
                    <td className="py-3 px-2">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => edit(t)} 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                          disabled={deletingId === t.id}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => remove(t.id)} 
                          disabled={deletingId === t.id}
                          className={`text-sm font-medium transition-colors duration-200 ${
                            deletingId === t.id 
                              ? 'text-slate-400 cursor-not-allowed' 
                              : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
                          }`}
                        >
                          {deletingId === t.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {recent.map(t => (
              <div key={t.id} className="glass rounded-xl p-4 space-y-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    t.type === 'income' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                  }`}>
                    {t.type === 'income' ? '💰' : '💸'} {t.type}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{format(new Date(t.date), 'MMM dd')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{formatCurrency(t.amount, currentCurrency)}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{t.category}</p>
                    {t.note && <p className="text-slate-500 dark:text-slate-400 text-sm">{t.note}</p>}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button 
                      onClick={() => edit(t)} 
                      disabled={deletingId === t.id}
                      className={`text-sm font-medium transition-colors duration-200 px-3 py-1 rounded-lg ${
                        deletingId === t.id
                          ? 'text-slate-400 bg-slate-100 dark:bg-slate-700 cursor-not-allowed'
                          : 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30'
                      }`}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => remove(t.id)} 
                      disabled={deletingId === t.id}
                      className={`text-sm font-medium transition-colors duration-200 px-3 py-1 rounded-lg ${
                        deletingId === t.id
                          ? 'text-slate-400 bg-slate-100 dark:bg-slate-700 cursor-not-allowed'
                          : 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30'
                      }`}
                    >
                      {deletingId === t.id ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Deleting...</span>
                        </div>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="glass-card p-4 sm:p-8 card-hover">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
            <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm mr-2 sm:mr-3">➕</span>
            {form.id ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Type</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} 
                  className="w-full px-3 py-3 glass rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-slate-100"
                >
                  <option value="expense">💸 Expense</option>
                  <option value="income">💰 Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Amount ({getCurrencySymbol(currentCurrency)})
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={form.amount} 
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
                  placeholder="0.00" 
                  className="w-full px-3 py-3 glass rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Category</label>
              <select 
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} 
                className="w-full px-3 py-3 glass rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-slate-100"
              >
                {['Food','Transport','Rent','Salary','Shopping','Health','Entertainment','Education','Other'].map(c => 
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Date</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} 
                className="w-full px-3 py-3 glass rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Note (optional)</label>
              <input 
                value={form.note || ''} 
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))} 
                placeholder="Add a note..." 
                className="w-full px-3 py-3 glass rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 gradient-primary text-white rounded-xl font-semibold btn-hover shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  `${form.id ? 'Update' : 'Add'} Transaction`
                )}
              </button>
              {form.id && (
                <button 
                  type="button" 
                  onClick={() => edit()} 
                  className="px-6 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Filters */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md flex items-center justify-center text-white text-xs mr-2">🔍</span>
              Filters
            </h4>
            <div className="space-y-3">
              <select 
                value={filter.category || ''} 
                onChange={e => setFilter(f => ({ ...f, category: e.target.value || undefined }))} 
                className="w-full px-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="">All Categories</option>
                {['Food','Transport','Rent','Salary','Shopping','Health','Entertainment','Education','Other'].map(c => 
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={filter.startDate || ''} 
                  onChange={e => setFilter(f => ({ ...f, startDate: e.target.value || undefined }))} 
                  className="w-full px-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 text-sm"
                  placeholder="From"
                />
                <input 
                  type="date" 
                  value={filter.endDate || ''} 
                  onChange={e => setFilter(f => ({ ...f, endDate: e.target.value || undefined }))} 
                  className="w-full px-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 bg-white/50 dark:bg-slate-800/50 text-sm"
                  placeholder="To"
                />
              </div>
              <button 
                onClick={() => setFilter({})} 
                className="w-full py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, icon, gradient, shadowColor }: { 
  title: string; 
  value: string; 
  icon: string; 
  gradient: string; 
  shadowColor: string; 
}) {
  return (
    <div className="glass rounded-3xl p-4 sm:p-6 card-hover scale-in">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{value}</p>
        </div>
        <div className={`w-12 h-12 sm:w-16 sm:h-16 ${gradient} rounded-2xl flex items-center justify-center text-white text-lg sm:text-2xl shadow-lg ${shadowColor} flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
