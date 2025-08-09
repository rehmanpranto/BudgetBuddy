export default function SimpleDashboard() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl">
        <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Dashboard Loaded!</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          You are successfully logged in and the dashboard is working.
        </p>
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p><strong>Current time:</strong> {new Date().toLocaleString()}</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('authChange'));
            window.location.href = '/login';
          }}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
