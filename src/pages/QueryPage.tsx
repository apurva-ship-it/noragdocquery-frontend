import React from 'react';
import { useNavigate } from 'react-router-dom';
import QueryPane from '../components/QueryPane';

const QueryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">Document Query</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-3 py-1 transition"
        >
          Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-57px)] flex flex-col">
        <QueryPane />
      </main>
    </div>
  );
};

export default QueryPage;
