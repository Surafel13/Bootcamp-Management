import { Star, MessageSquare, User } from 'lucide-react';
import { useFeedback } from '../../../../features/bootcamps/bootcampsApi';

interface Props {
  sessionId: string;
}

export default function FeedbackSubTab({ sessionId }: Props) {
  const { data: feedbacks = [], isLoading } = useFeedback(sessionId);

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  if (isLoading) return <div className="py-12 text-center text-text-muted text-sm">Loading feedback…</div>;

  return (
    <div className="flex flex-col gap-4">
      {feedbacks.length > 0 && (
        <div className="card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-black text-primary">{averageRating}</div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={14}
                    className={parseFloat(averageRating) >= i ? 'fill-primary text-primary' : 'text-text-muted'}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">Average Rating</p>
              <p className="text-xs text-text-muted">{feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} received</p>
            </div>
          </div>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
          <MessageSquare size={36} className="opacity-30" />
          <p className="text-sm">No feedback yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedbacks.map(feedback => (
            <div key={feedback._id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-text-primary">
                      {feedback.isAnonymous ? 'Anonymous' : feedback.student.name}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          size={12}
                          className={feedback.rating >= i ? 'fill-warning text-warning' : 'text-text-muted'}
                        />
                      ))}
                    </div>
                  </div>
                  {!feedback.isAnonymous && (
                    <p className="text-xs text-text-muted mb-2">{feedback.student.email}</p>
                  )}
                  <p className="text-sm text-text-secondary">{feedback.comment}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(feedback.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}