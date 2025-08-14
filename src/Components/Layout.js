import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Instagram } from 'lucide-react';
import { AppContext } from '../App';
import { debounce } from 'lodash';

function Layout() {
  const { appState, updateState } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [retryAfter, setRetryAfter] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('recentUsers') || '[]');
    setRecentUsers(storedUsers);
  }, []);

  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const analyzeUser = useCallback(async (usernameToAnalyze) => {
    console.log('Analyze button clicked for username:', usernameToAnalyze);
    if (isFetching) {
      console.log('Fetch already in progress, ignoring request');
      return;
    }

    setIsFetching(true);
    const timeoutId = setTimeout(() => setIsFetching(false), 90000); // Fallback reset
    setError(null);
    updateState({ isLoading: true, errors: {} });

    const trimmedUsername = usernameToAnalyze.trim();
    if (!trimmedUsername) {
      setError('Please enter a valid Instagram username');
      updateState({ isLoading: false });
      setIsFetching(false);
      clearTimeout(timeoutId);
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    console.log('Attempting to fetch:', `${process.env.REACT_APP_BACKEND_URL}/api/analyze-user`, 'with username:', trimmedUsername);

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analyze-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUsername }),
          signal: AbortSignal.timeout(90000),
        });

        const data = await response.json();
        console.log('Fetch response:', data, 'Status:', response.status, 'Headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
          throw Object.assign(new Error(data.error || 'Failed to analyze user'), {
            status: response.status,
            retryAfter: response.headers.get('Retry-After'),
          });
        }

        const newState = {
          isLoading: false,
          errors: {},
          userData: data,
        };

        const updatedUsers = [...new Set([trimmedUsername, ...recentUsers])].slice(0, 5);
        setRecentUsers(updatedUsers);
        localStorage.setItem('recentUsers', JSON.stringify(updatedUsers));

        setUsername('');
        setIsModalOpen(false);
        setError(null);
        updateState(newState);
        navigate('/');
        clearTimeout(timeoutId);
        setIsFetching(false);
        return;
      } catch (err) {
        retryCount++;
        let errorMessage = 'An unexpected error occurred. Please try again later.';
        const status = err.status;
        const retryAfterHeader = err.retryAfter ? parseInt(err.retryAfter) : null;

        console.log('Fetch error:', err.message, 'Status:', status, 'Retry-After:', retryAfterHeader);

        if (err.name === 'TimeoutError' || err.message.includes('Failed to fetch')) {
          errorMessage = `Connection to server failed. Retrying (${retryCount}/${maxRetries})...`;
          if (retryCount < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 5000 * retryCount));
            continue;
          }
          errorMessage = 'Failed to connect to the server. Please ensure the server is running and try again.';
        } else if (status === 429 || err.message.includes('Rate limit')) {
          const retryTime = retryAfterHeader || 30;
          errorMessage = `Rate limit reached. Please wait ${retryTime} seconds.`;
          setRetryAfter(retryTime);
        } else if (status === 404) {
          errorMessage = `Instagram user '${trimmedUsername}' not found or is private.`;
        } else if (status === 500) {
          errorMessage = 'Server error occurred. Please try again or contact support.';
        }

        setError(errorMessage);
        updateState({ isLoading: false, errors: { userData: errorMessage } });
        clearTimeout(timeoutId);
        setIsFetching(false);
        break;
      }
    }
  }, [isFetching, recentUsers, updateState, navigate]);

  const debouncedAnalyzeUser = useCallback(debounce(analyzeUser, 500), [analyzeUser]);

  const handleAnalyzeUser = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log('Form submitted with username:', username);
    debouncedAnalyzeUser(username);
  };

  const handleSelectUser = (selectedUsername) => {
    setUsername(selectedUsername);
    debouncedAnalyzeUser(selectedUsername);
  };

  const handleDeleteUser = (userToDelete) => {
    const updatedUsers = recentUsers.filter((user) => user !== userToDelete);
    setRecentUsers(updatedUsers);
    localStorage.setItem('recentUsers', JSON.stringify(updatedUsers));

    if (username === userToDelete) {
      setUsername('');
      updateState({ userData: null, errors: {} });
      setError(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">🌐 I-Scraper</h1>
          <button
            aria-label="Close sidebar"
            className="lg:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <nav className="mt-6 space-y-2 px-4">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
        </nav>
        <div className="mt-6 px-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Recent Users</h3>
          <select
            value={username}
            onChange={(e) => handleSelectUser(e.target.value)}
            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a user</option>
            {recentUsers.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
          {username && (
            <div className="flex items-center space-x-2 mt-2">
              <button
                aria-label="View Instagram profile"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => window.open(`https://www.instagram.com/${username}/`, '_blank')}
              >
                <Instagram className="w-5 h-5 text-gray-600 hover:text-[#bc1888]" />
              </button>
              <button
                aria-label="Delete user"
                className="p-1 rounded hover:bg-red-100"
                onClick={() => handleDeleteUser(username)}
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}
          <button
            className="w-full mt-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Analyze New User
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-blue-600">Analyze Instagram User</h2>
              <button
                aria-label="Close modal"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setIsModalOpen(false);
                  setUsername('');
                  setError(null);
                }}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAnalyzeUser} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Username</label>
                <input
                  type="text"
                  placeholder="e.g., _the_jats__"
                  className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {error && (
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-red-600">{error}</p>
                  {error.includes('Rate limit') && retryAfter > 0 && (
                    <button
                      onClick={() => debouncedAnalyzeUser(username)}
                      className="px-2 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      disabled={retryAfter > 0 || isFetching}
                    >
                      Retry ({retryAfter}s)
                    </button>
                  )}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                  onClick={() => {
                    setIsModalOpen(false);
                    setUsername('');
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appState.isLoading || retryAfter > 0 || isFetching}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {appState.isLoading || isFetching ? 'Analyzing...' : retryAfter > 0 ? `Retry in ${retryAfter}s` : 'Analyze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 w-full flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white shadow-sm flex justify-between items-center p-4">
          <div className="flex items-center space-x-4">
            <button
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded bg-gray-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">Instagram Analysis Dashboard</h2>
          </div>
          <h2 className="text-sm text-gray-600">
            {new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
          </h2>
        </header>

        <main className="flex-grow bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="sticky bottom-0 z-20 bg-white shadow-inner p-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} 🌐I-Scraper. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default Layout;