import React, { useContext } from 'react';
import { AppContext } from '../App';

function CompetitionReport() {
  const { appState, updateState } = useContext(AppContext);
  const { competitorData, suggestionData, isLoading, errors, userData } = appState;

  const downloadReport = () => {
    if (!competitorData?.competitors?.length) return;
    const report = {
      date: new Date().toISOString(),
      competitors: competitorData.competitors,
      suggestedTimes: suggestionData?.suggestedTimes || [],
    };
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `competitor_analysis_${report.date.split('T')[0]}.json`);
    link.click();
  };

  const showMoreCompetitors = () => {
    const currentLength = competitorData.competitors.length;
    const newCompetitors = competitorData.allCompetitors.slice(0, currentLength + 10);
    updateState({ competitorData: { ...competitorData, competitors: newCompetitors } });
  };

  const hasMoreCompetitors = competitorData?.competitors?.length < competitorData?.allCompetitors?.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-blue-900 mb-3">Competitive Analysis</h2>
      <p className="text-base text-gray-600 mb-4">
        Tracking competitors for @{userData?.user?.username || 'No user selected'}.
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="ml-2 text-base text-gray-600">Loading competitors...</span>
        </div>
      ) : errors.competitorData ? (
        <p className="text-base text-red-600">Error: {errors.competitorData}</p>
      ) : !competitorData?.competitors || competitorData.competitors.length === 0 ? (
        <p className="text-base text-gray-600">No competitor data available. Please try analyzing a user.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-base text-gray-600 mb-2">
              Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-base text-gray-600">
              Suggested Posting Times: <span className="font-medium text-blue-600">{suggestionData?.suggestedTimes?.join(', ') || '12:00, 18:00, 20:00'}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitorData.competitors.map((comp) => (
              <div key={comp.username} className="border-t pt-4 sm:border sm:rounded-lg sm:p-6 sm:shadow-md">
                <p className="text-base font-medium text-gray-700">@{comp.username}</p>
                <p className="text-sm text-gray-600">Followers: {comp.follower_count || 0}</p>
                <p className="text-sm text-gray-600">Posts: {comp.media_count || 0}</p>
                <p className="text-sm text-gray-600">Photos: {comp.post_types?.photo || 0}%</p>
                <p className="text-sm text-gray-600">Videos: {comp.post_types?.video || 0}%</p>
                <p className="text-sm text-gray-600">Carousels: {comp.post_types?.carousel || 0}%</p>
                <p className="text-sm text-gray-600">Avg. Engagement: {comp.avg_engagement?.toFixed(2) || 0}</p>
                <p className="text-sm text-gray-600">Top Hashtags: {comp.hashtags?.join(', ') || 'None'}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              onClick={downloadReport}
              disabled={!competitorData.competitors.length}
            >
              Download Report
            </button>
            {hasMoreCompetitors && (
              <button
                className="px-4 py-2 bg-blue-600 text-white text-base rounded-md hover:bg-blue-700 transition-colors"
                onClick={showMoreCompetitors}
              >
                Show More
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompetitionReport;