import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Check, CheckCheck, X, Send, Users, BookOpen, UserPlus, AlertCircle, Calendar, MessageSquare } from 'lucide-react';
import { selectActiveRole, selectActiveDivisionId } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useBroadcastToDivision,
  useBroadcastToBootcamp,
  useBroadcastToGroup,
  useSendToUser
} from '../features/notifications/notificationsApi';
import { useBootcamps } from '../features/bootcamps/bootcampsApi';
import { useGroups } from '../features/bootcamps/bootcampsApi';

const NOTIFICATION_ICONS: Record<string, any> = {
  broadcast: Bell,
  announcement: AlertCircle,
  deadline: Calendar,
  meeting: Users,
  personal: MessageSquare,
  system: AlertCircle,
  default: Bell,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  broadcast: 'bg-primary/10 text-primary',
  announcement: 'bg-warning/10 text-warning',
  deadline: 'bg-danger/10 text-danger',
  meeting: 'bg-info/10 text-info',
  personal: 'bg-success/10 text-success',
  system: 'bg-text-muted/10 text-text-muted',
  default: 'bg-primary/10 text-primary',
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const activeRole = useSelector(selectActiveRole);
  const activeDivisionId = useSelector(selectActiveDivisionId);

  const { data: notificationsData, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showBroadcast, setShowBroadcast] = useState(false);

  const isAdmin = activeRole === 'division_admin' || activeRole === 'super_admin';

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n: any) => !n.read)
    : notifications;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to mark as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast('All notifications marked as read');
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to mark all as read', 'error');
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-text-muted text-sm">Loading notifications…</div>;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-text-primary mb-1">Notifications</h2>
            <p className="text-sm text-text-secondary">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                className="btn btn-secondary flex items-center gap-2"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck size={15} />
                Mark All Read
              </button>
            )}
            {isAdmin && (
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowBroadcast(true)}
              >
                <Send size={15} />
                Send Broadcast
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
          }`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-primary text-white'
              : 'bg-bg-hover text-text-secondary hover:bg-bg-card'
          }`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2">
        {filteredNotifications.length === 0 ? (
          <div className="card flex flex-col items-center py-16 text-text-muted gap-2">
            <Bell size={48} className="opacity-30" />
            <p className="text-sm">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification: any) => {
            const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
            const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;

            return (
              <div
                key={notification._id}
                className={`card hover:border-primary/40 transition-all ${
                  !notification.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <div className="font-bold text-text-primary mb-1">{notification.title}</div>
                    )}
                    <p className="text-sm text-text-secondary mb-2">{notification.message}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>{new Date(notification.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      <span className="capitalize">{notification.type}</span>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      className="action-btn bg-success/10 text-success hover:bg-success hover:text-white"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                      disabled={markAsRead.isPending}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && isAdmin && (
        <BroadcastModal
          onClose={() => setShowBroadcast(false)}
          activeDivisionId={activeDivisionId}
          activeRole={activeRole}
        />
      )}
    </div>
  );
}

// Broadcast Modal Component
function BroadcastModal({
  onClose,
  activeDivisionId,
  activeRole
}: {
  onClose: () => void;
  activeDivisionId: string | null;
  activeRole: string;
}) {
  const dispatch = useDispatch();
  const [broadcastType, setBroadcastType] = useState<'division' | 'bootcamp' | 'group' | 'user'>('division');
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    bootcampId: '',
    groupId: '',
    userId: '',
    role: '',
    status: '',
  });

  const { data: bootcamps = [] } = useBootcamps(activeDivisionId);
  const { data: groups = [] } = useGroups(form.bootcampId);

  const broadcastToDivision = useBroadcastToDivision();
  const broadcastToBootcamp = useBroadcastToBootcamp();
  const broadcastToGroup = useBroadcastToGroup();
  const sendToUser = useSendToUser();

  const toast = (message: string, type: 'success' | 'error' = 'success') =>
    dispatch(addToast({ message, type }));

  const handleSend = async () => {
    if (!form.message) {
      toast('Message is required', 'error');
      return;
    }

    try {
      const payload = {
        title: form.title || undefined,
        message: form.message,
        type: form.type,
      };

      let result;
      switch (broadcastType) {
        case 'division':
          if (!activeDivisionId) {
            toast('Division not found', 'error');
            return;
          }
          result = await broadcastToDivision.mutateAsync({
            ...payload,
            divisionId: activeDivisionId,
            role: form.role || undefined,
          });
          break;
        case 'bootcamp':
          if (!form.bootcampId) {
            toast('Please select a bootcamp', 'error');
            return;
          }
          result = await broadcastToBootcamp.mutateAsync({
            ...payload,
            bootcampId: form.bootcampId,
            status: form.status || undefined,
          });
          break;
        case 'group':
          if (!form.groupId) {
            toast('Please select a group', 'error');
            return;
          }
          result = await broadcastToGroup.mutateAsync({
            ...payload,
            groupId: form.groupId,
          });
          break;
        case 'user':
          if (!form.userId) {
            toast('Please enter user ID', 'error');
            return;
          }
          result = await sendToUser.mutateAsync({
            ...payload,
            userId: form.userId,
          });
          break;
      }

      toast(result.message || 'Broadcast sent successfully');
      onClose();
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Failed to send broadcast', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>Send Broadcast</h2>
          <button className="modal-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Broadcast Type */}
          <div className="form-group">
            <label>Broadcast To</label>
            <select
              className="form-input"
              value={broadcastType}
              onChange={e => setBroadcastType(e.target.value as any)}
            >
              <option value="division">Division</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="group">Group</option>
              <option value="user">Specific User</option>
            </select>
          </div>

          {/* Target Selection */}
          {broadcastType === 'bootcamp' && (
            <div className="form-group">
              <label>Select Bootcamp <span className="text-danger">*</span></label>
              <select
                className="form-input"
                value={form.bootcampId}
                onChange={e => setForm(f => ({ ...f, bootcampId: e.target.value, groupId: '' }))}
              >
                <option value="">Choose a bootcamp...</option>
                {bootcamps.map((bootcamp: any) => (
                  <option key={bootcamp._id} value={bootcamp._id}>
                    {bootcamp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {broadcastType === 'group' && (
            <>
              <div className="form-group">
                <label>Select Bootcamp First <span className="text-danger">*</span></label>
                <select
                  className="form-input"
                  value={form.bootcampId}
                  onChange={e => setForm(f => ({ ...f, bootcampId: e.target.value, groupId: '' }))}
                >
                  <option value="">Choose a bootcamp...</option>
                  {bootcamps.map((bootcamp: any) => (
                    <option key={bootcamp._id} value={bootcamp._id}>
                      {bootcamp.name}
                    </option>
                  ))}
                </select>
              </div>
              {form.bootcampId && (
                <div className="form-group">
                  <label>Select Group <span className="text-danger">*</span></label>
                  <select
                    className="form-input"
                    value={form.groupId}
                    onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((group: any) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {broadcastType === 'user' && (
            <div className="form-group">
              <label>User ID <span className="text-danger">*</span></label>
              <input
                className="form-input"
                placeholder="Enter user ID"
                value={form.userId}
                onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
              />
            </div>
          )}

          {/* Filters */}
          {broadcastType === 'division' && (
            <div className="form-group">
              <label>Filter by Role (Optional)</label>
              <select
                className="form-input"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="">All roles</option>
                <option value="student">Students only</option>
                <option value="instructor">Instructors only</option>
                <option value="division_admin">Division admins only</option>
              </select>
            </div>
          )}

          {broadcastType === 'bootcamp' && (
            <div className="form-group">
              <label>Filter by Status (Optional)</label>
              <select
                className="form-input"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">All statuses</option>
                <option value="active">Active only</option>
                <option value="dropped">Dropped only</option>
                <option value="completed">Completed only</option>
              </select>
            </div>
          )}

          {/* Notification Type */}
          <div className="form-group">
            <label>Type</label>
            <select
              className="form-input"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="announcement">Announcement</option>
              <option value="deadline">Deadline</option>
              <option value="meeting">Meeting</option>
              <option value="system">System</option>
              <option value="broadcast">General Broadcast</option>
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label>Title (Optional)</label>
            <input
              className="form-input"
              placeholder="e.g. Important Announcement"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Message */}
          <div className="form-group">
            <label>Message <span className="text-danger">*</span></label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Enter your message..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="modal-actions mt-5">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSend}
            disabled={
              broadcastToDivision.isPending ||
              broadcastToBootcamp.isPending ||
              broadcastToGroup.isPending ||
              sendToUser.isPending
            }
          >
            <Send size={14} />
            {broadcastToDivision.isPending || broadcastToBootcamp.isPending || broadcastToGroup.isPending || sendToUser.isPending
              ? 'Sending...'
              : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}