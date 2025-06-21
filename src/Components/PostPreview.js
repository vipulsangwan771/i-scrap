import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {  X } from 'lucide-react';
import { AppContext } from '../App';

function PostPreview() {
  const { appState, setAppState } = useContext(AppContext);
  const { post } = appState;
  const [caption, setCaption] = useState(post?.caption || '');
  const [isEditing, setIsEditing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (!post) {
      navigate('/');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handlePostAction('approve');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [post]);

  const handlePostAction = async (action, newCaption) => {
    try {
      const payload = {
        ...post,
        approved: action === 'approve' || action === 'edit',
        caption: action === 'edit' ? newCaption : post.caption,
      };
      const response = await fetch('http://localhost:5000/api/approve-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setAppState(prev => ({ ...prev, post: null }));
        navigate('/');
      } else {
        console.error('Post rejected');
      }
    } catch (err) {
      console.error('Error processing post action:', err);
    }
  };

  if (!post) return null;

  const handleReject = () => {
    handlePostAction('reject');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={handleReject}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Post Preview</h2>
        <p className="text-sm text-gray-500 mb-4">Review and approve this Instagram post.</p>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <img
              src={post.imageUrl}
              alt={post.topic}
              className="w-full aspect-square object-cover rounded-md mb-2"
            />
            <p className="text-sm text-gray-600 break-words">{isEditing ? 'Editing...' : caption}</p>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="font-medium text-gray-600">Topic:</span> <span className="capitalize">{post.topic}</span></p>
            <p><span className="font-medium text-gray-600">Theme:</span> {post.theme}</p>
            <p><span className="font-medium text-gray-600">Suggested Time:</span> <span className="text-green-600">{post.suggestedTime}</span></p>
          </div>
          {isEditing && (
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              placeholder="Edit caption..."
            />
          )}
          <p className="text-xs text-red-500">Auto-publishing in {timeLeft} seconds</p>
        </div>
        <div className="flex justify-end mt-6 space-x-2">
          <button
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            onClick={() => isEditing ? handlePostAction('edit', caption) : handlePostAction('approve')}
          >
            {isEditing ? 'Save & Publish' : 'Approve'}
          </button>
          <button
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            onClick={() => handlePostAction('reject')}
          >
            Reject
          </button>
          {!isEditing && (
            <button
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostPreview;