import { MessageSquare } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div>
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">
            <MessageSquare size={36} />
          </div>
          <h3>All Feedback</h3>
          <p>This section is coming soon. Feedback submitted by students will appear here for admin review.</p>
        </div>
      </div>
    </div>
  );
}
