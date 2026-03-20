import { useState } from 'react';
import { Navbar } from '../components/layout/Navbar.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const AdminPage = () => {
  const [scrapingJobId, setScrapingJobId] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const handleStartScraping = async () => {
    setLoading(true);

    try {
      const response = await api.post('/scholarships/admin/scraper/start');
      setScrapingJobId(response.data.jobId);
      toast.success('Scraping job started!');

      // Start polling
      pollScrapingStatus(response.data.jobId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start scraping');
    } finally {
      setLoading(false);
    }
  };

  const pollScrapingStatus = async (jobId) => {
    setPolling(true);

    const poll = async () => {
      try {
        const response = await api.get(`/scholarships/admin/scraper/${jobId}`);
        setScrapingStatus(response.data);

        if (response.data.status === 'processing') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else if (response.data.status === 'completed') {
          toast.success(
            `✓ Scraping completed! ${response.data.resultCount} scholarships saved.`
          );
          setPolling(false);
        } else if (response.data.status === 'failed') {
          toast.error(`✗ Scraping failed: ${response.data.errorMessage}`);
          setPolling(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setPolling(false);
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scraping Control */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Scholarship Scraping</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Start the scholarship scraping job to populate the database with 100+
                scholarships from various sources.
              </p>

              <button
                onClick={handleStartScraping}
                disabled={loading || polling}
                className="btn-primary w-full mb-4"
              >
                {loading ? 'Starting...' : polling ? 'Scraping in progress...' : 'Start Scraping'}
              </button>

              {scrapingJobId && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Job ID:</p>
                  <p className="font-mono text-sm text-gray-900 break-all mb-4">{scrapingJobId}</p>

                  {scrapingStatus && (
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Status:</p>
                        <p
                          className={`font-semibold ${
                            scrapingStatus.status === 'completed'
                              ? 'text-green-600'
                              : scrapingStatus.status === 'failed'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {scrapingStatus.status.toUpperCase()}
                        </p>
                      </div>

                      {scrapingStatus.resultCount > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Scholarships Saved:</p>
                          <p className="font-semibold text-gray-900">
                            {scrapingStatus.resultCount}
                          </p>
                        </div>
                      )}

                      {scrapingStatus.errorMessage && (
                        <div className="p-3 bg-red-50 rounded text-red-700 text-sm">
                          {scrapingStatus.errorMessage}
                        </div>
                      )}

                      {scrapingStatus.startedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Started at:</p>
                          <p className="text-sm text-gray-900">
                            {new Date(scrapingStatus.startedAt).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {scrapingStatus.completedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Completed at:</p>
                          <p className="text-sm text-gray-900">
                            {new Date(scrapingStatus.completedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Status</h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
                <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                  <li>Click "Start Scraping" button</li>
                  <li>Background worker processes the job</li>
                  <li>Scholarships are extracted and tagged with AI</li>
                  <li>Results appear in the Scholarships page</li>
                  <li>Users can search and filter by tags</li>
                </ol>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Requirements</h3>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                  <li>Backend worker running: <code className="bg-yellow-100 px-1 rounded">npm run worker</code></li>
                  <li>Ollama running with llama2:7b model</li>
                  <li>Redis and PostgreSQL running</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">✓ Features</h3>
                <ul className="text-sm text-green-800 space-y-1 ml-4 list-disc">
                  <li>Auto-tag extraction with Llama2</li>
                  <li>Deduplication by URL</li>
                  <li>Deadline tracking</li>
                  <li>Eligibility criteria extraction</li>
                  <li>Amount filtering</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
