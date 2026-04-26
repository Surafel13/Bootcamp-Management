import { useState } from 'react';
import { ArrowLeft, BookOpen, Users, ClipboardList, UserCog, Calendar, User, Clock } from 'lucide-react';
import SessionsTab from './tabs/SessionsTab';
import GroupsTab from './tabs/GroupsTab';
import InstructorsTab from './tabs/InstructorsTab';
import { useBootcamp } from '../../features/bootcamps/bootcampsApi';

const TABS = [
  { key: 'sessions', label: 'Sessions', icon: BookOpen },
  { key: 'groups', label: 'Groups', icon: Users },
  { key: 'instructors', label: 'Instructors', icon: UserCog },
] as const;

type TabKey = typeof TABS[number]['key'];

interface Props {
  bootcampId: string;
  onBack: () => void;
}

export default function BootcampDetailPage({ bootcampId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('sessions');
  const { data: bootcamp, isLoading } = useBootcamp(bootcampId);

  if (isLoading) return (
    <div className="flex items-center justify-center h-60 text-text-muted text-sm">Loading…</div>
  );

  if (!bootcamp) return (
    <div className="flex items-center justify-center h-60 text-danger text-sm">Bootcamp not found.</div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Back + bootcamp summary */}
      <div className="card">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mt-0.5 shrink-0"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-black text-text-primary">{bootcamp.name}</h2>
              <span className={`text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full capitalize
                ${bootcamp.status === 'ongoing' ? 'bg-success/10 text-success' :
                  bootcamp.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                    'bg-text-muted/10 text-text-muted'}`}>
                {bootcamp.status}
              </span>
            </div>
            <p className="text-sm text-text-secondary">{bootcamp.description}</p>
            <div className="flex items-center gap-6 mt-2 text-xs text-text-muted">
              <span><Calendar size={15} className='inline'/> {new Date(bootcamp.startDate).toLocaleDateString()} → {new Date(bootcamp.endDate).toLocaleDateString()}</span>
              <span><Clock size={15} className="inline"/> {bootcamp.duration}</span>
              {bootcamp.instructor && <span><User size={12} className="inline"/> Lead: {bootcamp.instructor.name}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200 -mb-px
              ${activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'sessions' && <SessionsTab bootcampId={bootcampId} bootcamp={bootcamp} />}
        {activeTab === 'groups' && <GroupsTab bootcampId={bootcampId} bootcamp={bootcamp} />}
        {activeTab === 'instructors' && <InstructorsTab bootcampId={bootcampId} />}
      </div>
    </div>
  );
}