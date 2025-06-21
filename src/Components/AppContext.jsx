// src/AppContext.jsx
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState({
    user: null,
    posts: [],
    postAnalysis: {},
    competitors: [],
    allCompetitors: [],
    suggestedTimes: [],
    suggestions: [],
    error: '',
    isLoading: false,
  });

  const updateAppState = (newState) => {
    setAppState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <AppContext.Provider value={{ appState, updateAppState }}>
      {children}
    </AppContext.Provider>
  );
};