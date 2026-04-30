import { useState } from 'react';
import { MessageSquare, Star, TrendingUp, Users, Calendar } from 'lucide-react';
import { useFeedbackReport } from '../../features/reports/reportsApi';
import { useDivisions } from '../../features/divisions/divisionApi';
import { useBootcamps } from '../../features/bootcamps/bootcampsApi';

export default function FeedbackPage() {
  const [filters, setFilters] = useState({
    division: '',
    bootcamp: '',
    from: '',
    to: '',
  });
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const { data: divisions = [] } = useDivisions();
  const { data: bootcamps = [] } = useBootcamps(filters.division || null);
  const { data: feedbackData, isLoading } = useFeedbackReport({
    division: filters.division || undefined,
    bootcamp: filters.bootcamp || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const feedback = feedbackData?.feedback || [];
  const stats = feedbackData?.stats || {
    totalFeedback: 0,
    averageRating: 0,
    responseRate: 0,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-warning';
    return 'text-danger';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-warning fill-warning' : 'text-text-muted'}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="py-16 text-center text-text-muted text-sm">Loading feedback…</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="card bg-bg-secondary border-border">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-text-primary mb-1">All Feedback</h2>
            <p className="text-sm text-text-secondary">
              Student feedback and ratings across all divisions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare size={18} className="text-primary" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">{stats.totalFeedback}</div>
              <div className="text-xs text-text-muted">Total Feedback</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Star size={18} className="text-warning" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-xs text-text-muted">Average Rating</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-success" />
            </div>
            <div>
              <div className="text-2xl font-black text-text-primary">
                {stats.responseRate ? `${stats.responseRate}%` : '0%'}
              </div>
              <div className="text-xs text-text-muted">Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="font-bold text-text-primary mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Division</label>
            <select
              value={filters.division}
              onChange={(e) => setFilters({ ...filters, division: e.target.value, bootcamp: '' })}
              className="input"
            >
              <option value="">All Divisions</option>
              {divisions.map((div: any) => (
                <option key={div._id} value={div._id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Bootcamp</label>
            <select
              value={filters.bootcamp}
              onChange={(e) => setFilters({ ...filters, bootcamp: e.target.value })}
              className="input"
              disabled={!filters.division}
            >
              <option value="">All Bootcamps</option>
              {bootcamps.map((bootcamp: any) => (
                <option key={bootcamp._id} value={bootcamp._id}>
                  {bootcamp.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">From Date</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">To Date</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="card">
        {feedback.length === 0 ? (
          <div className="py-16 text-center text-text-muted text-sm">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            No feedback found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                    Session
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                    Bootcamp
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((item: any) => (
                  <tr key={item._id} className="border-b border-border hover:bg-bg-hover transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-text-muted" />
                        <span className="text-sm font-semibold text-text-primary">
                          {item.student?.name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary">
                        {item.session?.title || 'Unknown Session'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary">
                        {item.session?.bootcamp?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {renderStars(item.rating || 0)}
                        <span className={`text-sm font-bold ${getRatingColor(item.rating || 0)}`}>
                          {item.rating || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar size={14} className="text-text-muted" />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedFeedback(item)}
                        className="text-sm text-primary hover:text-primary/80 font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Feedback Details</h2>
              <button className="modal-close" onClick={() => setSelectedFeedback(null)}>×</button>
            </div>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-1">Student</div>
                  <div className="text-sm text-text-primary">
                    {selectedFeedback.student?.name || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-1">Session</div>
                  <div className="text-sm text-text-primary">
                    {selectedFeedback.session?.title || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-1">Bootcamp</div>
                  <div className="text-sm text-text-primary">
                    {selectedFeedback.session?.bootcamp?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-1">Date</div>
                  <div className="text-sm text-text-primary">
                    {formatDate(selectedFeedback.createdAt)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-text-muted mb-1">Rating</div>
                <div className="flex items-center gap-2">
                  {renderStars(selectedFeedback.rating || 0)}
                  <span className={`text-lg font-bold ${getRatingColor(selectedFeedback.rating || 0)}`}>
                    {selectedFeedback.rating || 0} / 5
                  </span>
                </div>
              </div>
              {selectedFeedback.comment && (
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-1">Comment</div>
                  <div className="text-sm text-text-secondary bg-bg-hover p-3 rounded-lg">
                    {selectedFeedback.comment}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions mt-5">
              <button className="btn-secondary" onClick={() => setSelectedFeedback(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}