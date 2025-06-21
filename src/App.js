// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layout';
import Dashboard from './Components/Dashboard';

export const AppContext = React.createContext();

function App() {
  const [appState, setAppState] = useState({
    userData: null, // { username, posts, etc. }
    isLoading: false,
    errors: {}, // { userData: string }
  });

  const updateState = (newState) => {
    setAppState((prev) => ({
      ...prev,
      ...newState,
      errors: { ...prev.errors, ...(newState.errors || {}) },
    }));
  };

  return (
    <AppContext.Provider value={{ appState, updateState }}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;