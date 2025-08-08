import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import CurrencySelector from '../components/CurrencySelector';
import ThemeToggle from '../components/ThemeToggle';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import SimpleDashboard from './SimpleDashboard';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Test from './Test';

function useAuth() {
  const token = localStorage.getItem('token');
  console.log('Auth check - token exists:', !!token); // Debug log
  console.log('Current URL:', window.location.href); // Debug log
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
  }
  return { isAuthed: !!token };
}

export default function App() {
  const { isAuthed } = useAuth();
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Floating decorative elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-3xl float"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/15 rounded-full blur-3xl float" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-purple-200/25 dark:bg-purple-800/20 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
          </div>

          <nav className="relative z-10 glass sticky top-0 border-b border-white/30 dark:border-slate-700/30">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-200">
                  💰
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  BudgetBuddy
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {isAuthed && <CurrencySelector />}
                {isAuthed ? (
                  <button 
                    onClick={() => { localStorage.removeItem('token'); location.href = '/login'; }} 
                    className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium btn-hover shadow-lg shadow-blue-500/25"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link 
                      to="/login" 
                      className="px-6 py-2.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium btn-hover shadow-lg shadow-blue-500/25"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>

          <main className="relative z-10 max-w-7xl mx-auto p-6">
            <div className="slide-up">
              <Routes>
                <Route path="/test" element={<Test />} />
                <Route path="/" element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace />} />
                <Route path="/login" element={isAuthed ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/register" element={isAuthed ? <Navigate to="/" replace /> : <Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </div>
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </CurrencyProvider>
    </ThemeProvider>
  );
}
