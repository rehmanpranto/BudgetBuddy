import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return effectiveTheme === 'dark' ? '🌙' : '☀️';
    }
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getTooltip = () => {
    if (theme === 'system') {
      return `System (${effectiveTheme}) - click to switch to light`;
    }
    return theme === 'light' ? 'Light mode - click for dark' : 'Dark mode - click for system';
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl glass transition-all duration-200 hover:shadow-lg group relative"
      title={getTooltip()}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* System indicator dot */}
        {theme === 'system' && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse shadow-lg"></div>
        )}
        
        {/* Sun Icon */}
        <svg
          className={`absolute inset-0 w-6 h-6 transition-all duration-500 ${
            effectiveTheme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          } ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
        </svg>
        
        {/* Moon Icon */}
        <svg
          className={`absolute inset-0 w-6 h-6 transition-all duration-500 ${
            effectiveTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          } ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12.1 22c-5.5 0-10-4.5-10-10 0-5.6 4.5-10 10-10 1.8 0 3.5.5 4.9 1.3.4.2.5.7.3 1.1-.2.4-.7.5-1.1.3-1.2-.7-2.6-1.1-4.1-1.1-4.4 0-8 3.6-8 8s3.6 8 8 8c2.2 0 4.2-.9 5.7-2.4.3-.3.8-.3 1.1 0s.3.8 0 1.1c-1.8 1.8-4.2 2.7-6.8 2.7z"/>
        </svg>
      </div>
    </button>
  );
}
