import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ChevronDown, CheckCircle } from 'lucide-react';
import { selectUser, selectActiveRole, selectActiveDivisionId, switchRoleLocally } from '../../features/auth/authSlice';
import api from '../../lib/axios';
import { addToast } from '../../features/ui/uiSlice';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  division_admin: 'Division Admin',
  student: 'Student',
};

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: '/admin',
  division_admin: '/division-admin',
  student: '/student',
};

interface MembershipOption {
  role: string;
  divisionId: string | null;
  label: string;
  sub: string;
}

export default function MembershipSwitcher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const activeRole = useSelector(selectActiveRole);
  const activeDivisionId = useSelector(selectActiveDivisionId);

  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Build flat list of all role contexts this user can switch to
  const options: MembershipOption[] = [];

  if (user?.roles?.includes('super_admin')) {
    options.push({
      role: 'super_admin',
      divisionId: null,
      label: 'Super Admin',
      sub: 'Global access'
    });
  }

  user?.memberships?.forEach((m: any) => {
    options.push({
      role: m.role,
      divisionId: m.division?._id ?? m.division,
      label: ROLE_LABELS[m.role] ?? m.role,
      sub: m.division?.name ?? 'Division',
    });
  });

  // Only render if the user actually has more than one context
  if (options.length <= 1) return null;

  const isActive = (opt: MembershipOption) =>
    opt.role === activeRole &&
    (opt.divisionId?.toString() ?? null) === (activeDivisionId ?? null);

const handleSwitch = async (opt: MembershipOption) => {
  if (isActive(opt) || switching) return;
  setSwitching(true);
  try {
    const { data } = await api.post('/auth/switch-role', {  // POST not PATCH
      role:       opt.role,
      divisionId: opt.divisionId ?? undefined,
    });

    // FIX: backend wraps in data.data, not data directly
    const { activeRole, activeDivision } = data.data;

    dispatch(switchRoleLocally({
      activeRole,
      activeDivisionId: activeDivision ?? null,
      accessToken:      data.accessToken,
      refreshToken:     data.refreshToken,
    }));

    setOpen(false);

    // Navigate AFTER dispatch so Redux is updated before the route guard checks
    const dest = ROLE_DASHBOARD[activeRole] ?? '/';
    navigate(dest, { replace: true });

  } catch (err) {
    console.error('Role switch failed:', err);
    dispatch(addToast({ message: 'Role switch failed', type: 'error' }));
  } finally {
    setSwitching(false);
  }
};

  // Find current active option to display division name
  const activeOption = options.find(opt => isActive(opt));
  const displayLabel = activeOption?.role === 'super_admin'
    ? ROLE_LABELS[activeRole!]
    : `${ROLE_LABELS[activeRole!]} - ${activeOption?.sub ?? ''}`;

  return (
    <div className="relative">
      <button
        className="w-auto h-9.5 rounded-radius-sm border border-border bg-bg-input flex items-center gap-1.5 px-2.5 py-1.5 text-[0.78rem] font-bold cursor-pointer text-text-secondary hover:text-primary hover:border-primary transition-all duration-300"
        onClick={() => setOpen(v => !v)}
        title="Switch role"
      >
        <RefreshCw
          size={14}
          className={`shrink-0 ${switching ? 'animate-spin' : ''}`}
        />
        <span className="capitalize whitespace-nowrap">
          {displayLabel}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-49"
          />
          <div className="absolute top-full mt-2 right-0 min-w-50 bg-bg-card border border-border rounded-radius shadow-shadow-lg overflow-hidden z-50 animate-slide-up">
            <div className="px-3 py-2 pb-1.5 text-[0.7rem] font-bold text-text-muted uppercase tracking-wide">
              Switch Role
            </div>
            {options.map((opt, idx) => {
              const active = isActive(opt);
              return (
                <button
                  key={idx}
                  onClick={() => handleSwitch(opt)}
                  disabled={switching}
                  className={`
                    flex items-center justify-between w-full px-3 py-2.5 border-none text-left
                    ${idx > 0 ? 'border-t border-border' : ''}
                    ${active ? 'bg-primary-light/10 cursor-default' : 'cursor-pointer'}
                    ${switching && !active ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
                    hover:${!active ? 'bg-bg-hover' : ''}
                    transition-all duration-300
                  `}
                >
                  <div>
                    <div className={`text-sm font-bold ${active ? 'text-primary' : 'text-text-primary'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[0.72rem] text-text-muted mt-0.5">
                      {opt.sub}
                    </div>
                  </div>
                  {active && (
                    <CheckCircle size={14} className="text-primary shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}