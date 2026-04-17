import React, { useState } from 'react';
import { FileText, Video, ExternalLink, Download, BookOpen, Filter } from 'lucide-react';

const RESOURCES = [
  {
    id: 1,
    title: 'React Fundamentals Guide',
    type: 'PDF',
    size: '2.4 MB',
    category: 'Development',
    description: 'Complete guide to React basics, hooks, and advanced concepts',
    date: 'Apr 10, 2026',
    url: '#'
  },
  {
    id: 2,
    title: 'Tailwind CSS Documentation',
    type: 'Link',
    category: 'Development',
    description: 'Official Tailwind CSS documentation and examples',
    date: 'Apr 9, 2026',
    url: 'https://tailwindcss.com'
  },
  {
    id: 3,
    title: 'JavaScript Advanced Patterns',
    type: 'PDF',
    size: '5.1 MB',
    category: 'Development',
    description: 'Advanced JavaScript design patterns and best practices',
    date: 'Apr 8, 2026',
    url: '#'
  },
  {
    id: 4,
    title: 'Design System Components',
    type: 'PDF',
    size: '1.2 MB',
    category: 'Design',
    description: 'Complete UI component library and design guidelines',
    date: 'Apr 7, 2026',
    url: '#'
  },
  {
    id: 5,
    title: 'Session Recordings - Week 1',
    type: 'Video',
    size: '245 MB',
    category: 'Video',
    description: 'Full recorded sessions from Week 1 of the bootcamp',
    date: 'Apr 6, 2026',
    url: '#'
  },
  {
    id: 6,
    title: 'API Integration Best Practices',
    type: 'PDF',
    size: '3.8 MB',
    category: 'Development',
    description: 'REST APIs, authentication, and error handling guide',
    date: 'Apr 5, 2026',
    url: '#'
  },
];

export default function Resources() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = RESOURCES
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeFilter === 'All') return matchesSearch;
      if (activeFilter === 'PDF') return resource.type === 'PDF' && matchesSearch;
      if (activeFilter === 'Video') return resource.type === 'Video' && matchesSearch;
      if (activeFilter === 'Link') return resource.type === 'Link' && matchesSearch;
      return matchesSearch;
    });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText size={22} />;
      case 'Video': return <Video size={22} />;
      case 'Link': return <ExternalLink size={22} />;
      default: return <BookOpen size={22} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'PDF': return 'var(--danger)';
      case 'Video': return 'var(--primary)';
      case 'Link': return 'var(--info)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleAction = (resource) => {
    if (resource.type === 'Link') {
      window.open(resource.url, '_blank');
    } else {
      alert(`Downloading: ${resource.title} (${resource.size})`);
      // In real app: trigger file download
    }
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

      {/* Resources Grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredResources.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No resources found matching your criteria.</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div 
              key={resource.id} 
              className="card"
              style={{ 
                padding: '20px',
                transition: 'var(--transition)',
              }}
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

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span>{resource.category}</span>
                    <span>•</span>
                    <span>{resource.date}</span>
                    {resource.size && (
                      <>
                        <span>•</span>
                        <span>{resource.size}</span>
                      </>
                    )}
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
