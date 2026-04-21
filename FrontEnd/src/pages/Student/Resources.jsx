import React, { useState, useEffect } from 'react';
import { FileText, Video, ExternalLink, Download, BookOpen, Search } from 'lucide-react';
import apiFetch from '../../utils/api';

export default function Resources() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await apiFetch('/resources');
        setResources(data.data.resources || []);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    return resource.type?.toLowerCase() === activeFilter.toLowerCase() && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return <FileText size={22} />;
      case 'video': return <Video size={22} />;
      case 'link': return <ExternalLink size={22} />;
      default: return <BookOpen size={22} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return 'var(--danger)';
      case 'video': return 'var(--primary)';
      case 'link': return '#0984e3';
      default: return 'var(--text-secondary)';
    }
  };

  const handleAction = async (resource) => {
    try {
      await apiFetch(`/resources/${resource._id}/download`, { method: 'POST' });
    } catch (err) { /* silent - still open */ }
    if (resource.url) window.open(resource.url, '_blank');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Learning Resources</h1>
        <p>Access all your course materials and documentation</p>
      </div>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: '1', minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'PDF', 'Video', 'Link'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading resources...</div>
      ) : (
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredResources.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No resources found.</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div
              key={resource._id}
              className="card"
              style={{ padding: '20px', transition: 'var(--transition)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                {/* Icon */}
                <div style={{
                  height: '56px',
                  width: '56px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(resource.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      margin: 0 
                    }}>
                      {resource.title}
                    </h4>
                    <span 
                      className="badge"
                      style={{
                        background: 'var(--bg-hover)',
                        color: getTypeColor(resource.type),
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px'
                      }}
                    >
                      {resource.type}
                    </span>
                  </div>

                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.95rem', 
                    marginBottom: '8px',
                    lineHeight: '1.5'
                  }}>
                    {resource.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>{resource.division?.name || resource.type}</span>
                    <span>•</span>
                    <span>{new Date(resource.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="btn btn-secondary"
                  onClick={() => handleAction(resource)}
                  style={{
                    padding: '12px 24px',
                    whiteSpace: 'nowrap',
                    minWidth: '120px'
                  }}
                >
                  {resource.type === 'Link' ? (
                    <>
                      <ExternalLink size={18} style={{ marginRight: '8px' }} />
                      Open Link
                    </>
                  ) : (
                    <>
                      <Download size={18} style={{ marginRight: '8px' }} />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Info Footer */}
      <div style={{ 
        marginTop: '40px', 
        padding: '16px 20px', 
        background: 'var(--bg-input)', 
        borderRadius: 'var(--radius)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        All resources are regularly updated. Contact support if you can't access any material.
      </div>
    </div>
  );
}
