import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/register', { email, password });
      localStorage.setItem('token', data.token);
      nav('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 card-hover">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              ✨
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Join BudgetBuddy
            </h1>
            <p className="text-slate-600">Create your account and start tracking expenses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input 
                type="email"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                placeholder="Enter your email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                placeholder="Create a password (min 6 characters)" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-slate-500 mt-2">Password must be at least 6 characters long</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-3 gradient-success text-white rounded-xl font-semibold btn-hover shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center space-x-1">
            <span>Developed with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by BudgetBuddy Team</span>
          </p>
        </div>
      </div>
    </div>
  );
}
