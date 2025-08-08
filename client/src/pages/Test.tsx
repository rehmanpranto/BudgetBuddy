export default function Test() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🔧 Debug Mode</h1>
        <div className="space-y-2 text-left bg-slate-800 p-6 rounded-lg">
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p><strong>Token:</strong> {localStorage.getItem('token')?.substring(0, 20) || 'None'}...</p>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        </div>
        <div className="mt-6 space-x-4">
          <button 
            onClick={() => localStorage.clear()} 
            className="px-4 py-2 bg-red-600 rounded"
          >
            Clear Storage
          </button>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
