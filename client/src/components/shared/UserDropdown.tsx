import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Settings, LogOut } from 'lucide-react';
import { clearCredentials, selectUser, selectActiveRole, selectActiveDivisionId } from '../../features/auth/authSlice';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  division_admin: 'Division Admin',
  student: 'Student',
};

export default function UserDropdown() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const activeRole = useSelector(selectActiveRole);
  const activeDivisionId = useSelector(selectActiveDivisionId);
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  // Find active division name
  const activeDivision = user?.memberships?.find(
    (m: any) => (m.division?._id ?? m.division) === activeDivisionId
  )?.division;

  const divisionName = typeof activeDivision === 'string' ? null : activeDivision?.name;

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="text-right">
          <h4 className="text-sm font-semibold text-text-primary">{user?.name ?? 'User'}</h4>
          <p className="flex items-center gap-1 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
            {ROLE_LABELS[activeRole] ?? activeRole ?? 'Member'}
            {divisionName && <span className="text-text-muted">• {divisionName}</span>}
          </p>
        </div>
        <div className="w-9.5 h-9.5 rounded-xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-[0_4px_12px_var(--primary-glow)]">
          {initials}
        </div>
      </div>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-49"
          />
          <div className="absolute top-full mt-2.5 right-0 w-50 bg-bg-card border border-border rounded-radius shadow-shadow-lg py-2 z-50 animate-slide-up">
            <Link
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-300 no-underline"
              to="/profile"
              onClick={() => setOpen(false)}
            >
              <User size={16} />
              <span>My Profile</span>
            </Link>
            <Link
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-all duration-300 no-underline"
              to="/settings"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} />
              <span>Account Settings</span>
            </Link>
            <div className="h-px bg-border my-1.5" />
            <button
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-danger bg-transparent border-none hover:bg-danger-light/10 transition-all duration-300 cursor-pointer text-left"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}