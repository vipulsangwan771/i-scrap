import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';

const Dashboard = () => {
  const { appState } = useContext(AppContext);
  const { userData, isLoading, errors } = appState;
  const [profilePic, setProfilePic] = useState('/default-profile-pic.jpg');
  const [displayedPosts, setDisplayedPosts] = useState(10);

  useEffect(() => {
    console.log('App state:', appState);
    if (userData) {
      console.log('Dashboard received user data:', JSON.stringify(userData, null, 2));
      console.log('Total posts received:', userData.posts?.length || 0);
      console.log('Collaborative posts:', userData.posts?.filter(post => post.is_collaborative).length || 0);
      console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
      setProfilePic(
        userData.profile_pic_path
          ? `${process.env.REACT_APP_BACKEND_URL}${userData.profile_pic_path}`
          : userData.profile_pic_url || '/default-profile-pic.jpg'
      );
      setDisplayedPosts(10);
    }
  }, [userData]);

  const loadMorePosts = () => {
    setDisplayedPosts(prev => prev + 10);
  };

  if (isLoading) {
    return (
      <div className="text-center p-6">
        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4" />
        </svg>
        <p className="text-gray-600 mt-2">Loading analysis...</p>
      </div>
    );
  }

  // Only show error if no userData
  if (errors.userData && !userData) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{errors.userData}</p>
        <p>Please try another user or check the username.</p>
      </div>
    );
  }

  if (!userData || !userData.username) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No data available.</p>
        <p>Please analyze a user to see results.</p>
        <p className="mt-2 text-sm text-gray-500">
          Note: Currently, only the top 12 posts are available for analysis.
        </p>
      </div>
    );
  }

  const allPosts = Array.isArray(userData.posts)
    ? [...userData.posts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    : [];
  const latestThreePosts = [...allPosts].slice(0, 3);
  const collaborativePosts = allPosts.filter(post => post.is_collaborative);
  const hasCollaborativePosts = collaborativePosts.length > 0;
  const topLikedPosts = [...allPosts]
    .filter(post => post.like_count > 0)
    .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    .slice(0, 5);
  const hasTopLikedPosts = topLikedPosts.length > 0;
  const visiblePosts = allPosts.slice(0, displayedPosts);
  const hasMorePosts = displayedPosts < allPosts.length;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption) return 'No caption';
    return caption.length > maxLength ? caption.slice(0, maxLength) + '...' : caption;
  };

  const handleMediaError = (e) => {
    if (!e.target.dataset.errorHandled) {
      e.target.src = '/default-post-thumbnail.jpg';
      e.target.dataset.errorHandled = true;
    }
  };

  const renderMedia = (post, index, sizeClass = 'w-full h-48') => {
    if (post.thumbnail_path) {
      return (
        <img
          src={`${process.env.REACT_APP_BACKEND_URL}${post.thumbnail_path}`}
          alt={`Post ${index + 1}`}
          className={`${sizeClass} object-cover`}
          loading="lazy"
          onError={handleMediaError}
        />
      );
    } else if (post.is_video && post.video_url) {
      return (
        <video
          src={`${process.env.REACT_APP_BACKEND_URL}${post.video_url}`}
          className={`${sizeClass} object-cover`}
          muted
          loop
          autoPlay
          playsInline
          onError={handleMediaError}
        />
      );
    } else {
      return (
        <div className={`${sizeClass} bg-gray-200 flex items-center justify-center`}>
          <span className="text-gray-500 text-sm">No Thumbnail Available</span>
        </div>
      );
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Profile Analysis for @{userData.username}
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={profilePic}
            alt={`${userData.username}'s profile picture`}
            className="w-24 h-24 object-cover rounded-full border-2 border-blue-600"
            loading="lazy"
            onError={handleMediaError}
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">User Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong>Full Name:</strong> {userData.full_name || 'Unknown'}</p>
              <p><strong>Username:</strong> @{userData.username}</p>
              <p><strong>Followers:</strong> {userData.follower_count?.toLocaleString() || '0'}</p>
              <p><strong>Following:</strong> {userData.following_count?.toLocaleString() || '0'}</p>
              <p><strong>Posts:</strong> {userData.media_count?.toLocaleString() || '0'}</p>
              <p><strong>Category:</strong> {userData.category || 'None'}</p>
              <p><strong>Verified:</strong> {userData.is_verified ? 'Yes' : 'No'}</p>
              <p><strong>Private Account:</strong> {userData.is_private ? 'Yes' : 'No'}</p>
            </div>
            <p className="mt-4">
              <strong>Biography:</strong> {userData.biography || 'None'}
            </p>
            {userData.bio_links?.length > 0 && (
              <div className="mt-4">
                <strong>Bio Links:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {userData.bio_links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.url || link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {userData.is_private && (
          <div className="mt-6">
            <p className="text-red-600">{userData.message}</p>
          </div>
        )}

        {!userData.is_private && (
          <>
            {latestThreePosts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">Recent Posts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {latestThreePosts.map((post, index) => (
                    <a
                      key={index}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-gray-100"
                    >
                      {renderMedia(post, index)}
                      <div className="p-2 bg-gray-100">
                        <p className="text-sm text-blue-600 truncate">{post.url}</p>
                        <p className="text-xs text-gray-600 mt-1">Caption: {truncateCaption(post.accessibility_caption)}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Posted: {formatTimestamp(post.timestamp)}
                        </p>
                        {post.like_count > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            Likes: {post.like_count.toLocaleString()}
                          </p>
                        )}
                        {post.is_collaborative && (
                          <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded mt-1 inline-block">Collab</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-blue-600 mb-4">Top 5 Most Liked Posts</h3>
              {hasTopLikedPosts ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {topLikedPosts.map((post, index) => (
                    <a
                      key={index}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-gray-100"
                    >
                      {renderMedia(post, index)}
                      <div className="p-2 bg-gray-100">
                        <p className="text-sm text-blue-600 truncate">{post.url}</p>
                        <p className="text-xs text-gray-600 mt-1">Caption: {truncateCaption(post.accessibility_caption)}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Posted: {formatTimestamp(post.timestamp)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Likes: {post.like_count.toLocaleString()}
                        </p>
                        {post.is_collaborative && (
                          <span className="text-xs text-white bg-blue-500 px-2 py-1 rounded mt-1 inline-block">Collab</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No like data available. Try analyzing again to fetch like counts via web scraping.
                </p>
              )}
            </div>

            {hasCollaborativePosts && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">Collaborative Posts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {collaborativePosts.map((post, index) => (
                    <div key={index} className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-gray-100">
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        {renderMedia(post, index)}
                      </a>
                      <div className="p-2 bg-gray-100">
                        <p className="text-sm text-blue-600 truncate">{post.url}</p>
                        <p className="text-xs text-gray-600 mt-1">Caption: {truncateCaption(post.accessibility_caption)}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Posted: {formatTimestamp(post.timestamp)}
                        </p>
                        {post.like_count && (
                          <p className="text-xs text-gray-600 mt-1">
                            Likes: {post.like_count.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs font-semibold mt-1">
                          Integrations: {post.coauthors.length > 0 ? post.coauthors.join(', ') : 'Tagged in caption'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {allPosts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">All Posts</h3>
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {visiblePosts.map((post, index) => (
                      <div key={index} className="border rounded p-2 shadow-sm bg-gray-50 hover:bg-white transition">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Posted: ${formatTimestamp(post.timestamp)}`}
                          className="block mb-2"
                        >
                          {renderMedia(post, index, 'w-full h-[100px] object-cover rounded')}
                        </a>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p className="truncate">Caption: {truncateCaption(post.accessibility_caption)}</p>
                          <p>Posted: {formatTimestamp(post.timestamp)}</p>
                          {post.like_count > 0 && (
                            <p>Likes: {post.like_count.toLocaleString()}</p>
                          )}
                          {post.is_collaborative && (
                            <span className="inline-block text-white bg-blue-500 px-2 py-0.5 rounded text-xs">Collab</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    {hasMorePosts ? (
                      <button
                        onClick={loadMorePosts}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Load More Posts
                      </button>
                    ) : (
                      <p className="text-blue-600 text-sm font-medium">
                        All {allPosts.length} post(s) loaded.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;