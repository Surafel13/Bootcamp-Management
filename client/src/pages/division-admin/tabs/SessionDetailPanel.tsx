import { useState } from 'react';
import { ArrowLeft, ClipboardList, BookOpen, Users2, MessageSquare, MapPin, Monitor } from 'lucide-react';
import TaskSubTab from './session/TaskSubTab';
import ResourcesSubTab from './session/ResourcesSubTab';
import AttendanceSubTab from './session/AttendanceSubTab';
import FeedbackSubTab from './session/FeedbackSubTab';
import type { Bootcamp, Session } from '../../../features/bootcamps/types';

const SUB_TABS = [
  { key: 'tasks', label: 'Tasks', icon: ClipboardList },
  { key: 'resources', label: 'Resources', icon: BookOpen },
  { key: 'attendance', label: 'Attendance', icon: Users2 },
  { key: 'feedback', label: 'Feedback', icon: MessageSquare },
] as const;

type SubTabKey = typeof SUB_TABS[number]['key'];

interface Props {
  session: Session;
  bootcamp: Bootcamp;
  onBack: () => void;
}

export default function SessionDetailPanel({ session, bootcamp, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<SubTabKey>('tasks');

  return (
    <div className="flex flex-col gap-4">
      {/* Session header */}
      <div className="card">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-3">
          <ArrowLeft size={15} /> Back to sessions
        </button>
        <h3 className="text-base font-black text-text-primary mb-1">{session.title}</h3>
        <div className="flex gap-5 text-xs text-text-muted">
          <span>🗓 {new Date(session.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
          {session.location && <span><MapPin size={11} className="inline"/> {session.location}</span>}
          {session.onlineLink && <span><Monitor size={11} className="inline"/> {session.onlineLink}</span>}
          {session.instructor && <span><Users2 size={11} className="inline"/> {session.instructor.name}</span>}
          <span className="capitalize font-semibold text-primary">{session.status}</span>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 border-b border-border">
        {SUB_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px
              ${activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {activeTab === 'tasks' && <TaskSubTab sessionId={session._id} bootcampId={bootcamp._id!} divisionId={typeof bootcamp.division === 'string' ? bootcamp.division : bootcamp.division._id} />}
      {activeTab === 'resources' && <ResourcesSubTab sessionId={session._id} bootcampId={bootcamp._id!} />}
      {activeTab === 'attendance' && <AttendanceSubTab sessionId={session._id} />}
      {activeTab === 'feedback' && <FeedbackSubTab sessionId={session._id} />}
    </div>
  );
}