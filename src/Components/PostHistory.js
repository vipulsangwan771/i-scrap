import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

function PostHistory() {
  const { appState } = useContext(AppContext);
  const navigate = useNavigate();

  const handlePreview = (post) => {
    appState.setAppState(prev => ({ ...prev, post }));
    navigate('/preview');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-blue-900 mb-2">Post History</h2>
      <p className="text-sm text-gray-500 mb-4">
        View past posts for @{appState.selectedAccount || 'No account selected'}.
      </p>
      {appState.history.posts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts in history.</p>
      ) : (
        <div className="space-y-3">
          {appState.history.posts.map((post, index) => (
            <div key={index} className="flex justify-between items-center border-t pt-3">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">{post.topic}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {post.suggestedTime}
                </p>
              </div>
              <button
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => handlePreview(post)}
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostHistory;