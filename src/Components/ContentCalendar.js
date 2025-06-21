import React, { useContext } from 'react';
import { AppContext } from '../App';

function ContentCalendar() {
  const { appState } = useContext(AppContext);
  const { suggestionData, isLoading, errors, userData } = appState;

  const downloadSuggestion = (suggestion) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(suggestion, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `suggestion_${suggestion.id}.json`);
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-blue-900 mb-3">Content Suggestions</h2>
      <p className="text-base text-gray-600 mb-4">
        AI-suggested posts for @{userData?.user?.username || 'No user selected'}.
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="ml-2 text-base text-gray-600">Loading suggestions...</span>
        </div>
      ) : errors.suggestionData ? (
        <p className="text-base text-red-600">Error: {errors.suggestionData}</p>
      ) : !suggestionData?.suggestions || suggestionData.suggestions.length === 0 ? (
        <p className="text-base text-gray-600">No suggestions available.</p>
      ) : (
        <div className="space-y-6">
          {suggestionData.suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-blue-50 p-6 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="mb-4 sm:mb-0">
                <p className="text-base font-medium text-blue-900">
                  Post about <span className="capitalize">{suggestion.topic || 'Unknown topic'}</span> (
                  {suggestion.theme || 'Unknown theme'}) on{' '}
                  {new Date(suggestion.date || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at {suggestion.suggestedTime || 'Unknown time'}
                </p>
                <p className="text-base text-gray-700 mt-1">{suggestion.caption || 'No caption available'}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Hashtags: {Array.isArray(suggestion.hashtags) ? suggestion.hashtags.join(', ') : 'No hashtags'}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Growth Tip: {suggestion.growthTip || 'No growth tip available'}
                </p>
                <img
                  src={suggestion.imageUrl || 'https://via.placeholder.com/150'}
                  alt={suggestion.topic || 'Image'}
                  className="mt-3 w-full sm:w-48 aspect-square object-cover rounded-md"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => downloadSuggestion(suggestion)}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContentCalendar;