import React, { useState, useEffect } from 'react';
import { Send, Settings, MessageSquare, Plus, RefreshCw, X, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface DataSource {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  error_message?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchDataSources();
    }
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'settings') {
        fetchDataSources();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchDataSources = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/data-sources`);
      const data = await response.json();
      setDataSources(data);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const addDataSource = async () => {
    if (!newSourceUrl.trim()) return;
    
    if (!newSourceUrl.includes('raw.githubusercontent.com')) {
      alert('Please provide a GitHub raw file URL');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/data-sources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newSourceUrl })
      });
      
      if (response.ok) {
        setNewSourceUrl('');
        fetchDataSources();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to add data source');
      }
    } catch (error) {
      console.error('Error adding data source:', error);
      alert('Failed to add data source');
    }
  };

  const deleteDataSource = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/data-sources/${id}`, { method: 'DELETE' });
      fetchDataSources();
    } catch (error) {
      console.error('Error deleting data source:', error);
    }
  };

  const triggerIngestion = async () => {
    setIsIngesting(true);
    try {
      const response = await fetch(`${API_BASE}/api/ingest`, { method: 'POST' });
      if (response.ok) {
        alert('Ingestion started successfully');
        fetchDataSources();
      } else {
        alert('Failed to start ingestion');
      }
    } catch (error) {
      console.error('Error triggering ingestion:', error);
      alert('Failed to start ingestion');
    } finally {
      setIsIngesting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Real Estate AI Assistant</h1>
            <p className="text-sm text-gray-600">RAG-powered property search</p>
          </div>
          
          <div className="flex border-t">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={20} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings size={20} />
              Data Sources
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'chat' ? (
            <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Start a conversation</p>
                    <p className="text-sm mt-2">Ask about available properties, locations, or booking details</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about properties..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Add Data Source</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    placeholder="GitHub raw file URL (CSV or Excel)"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addDataSource}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Example: https://raw.githubusercontent.com/user/repo/main/properties.csv
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Data Ingestion</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Process all data sources and update embeddings
                    </p>
                  </div>
                  <button
                    onClick={triggerIngestion}
                    disabled={isIngesting || dataSources.length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw size={20} className={isIngesting ? 'animate-spin' : ''} />
                    {isIngesting ? 'Processing...' : 'Re-Ingest Data'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Configured Data Sources</h2>
                </div>
                <div className="divide-y">
                  {dataSources.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <p>No data sources configured</p>
                      <p className="text-sm mt-2">Add a GitHub raw file URL to get started</p>
                    </div>
                  ) : (
                    dataSources.map((source) => (
                      <div key={source.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <ExternalLink size={16} className="text-gray-400 flex-shrink-0" />
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline truncate"
                              >
                                {source.url}
                              </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(source.status)}`}>
                                {source.status.toUpperCase()}
                              </span>
                              <span>Added: {new Date(source.created_at).toLocaleString()}</span>
                            </div>
                            {source.error_message && (
                              <p className="text-sm text-red-600 mt-2">Error: {source.error_message}</p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteDataSource(source.id)}
                            className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;