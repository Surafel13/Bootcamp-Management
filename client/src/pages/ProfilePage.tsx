import { useSelector } from 'react-redux';
import { User, Mail, Shield, Building2, Calendar, CheckCircle } from 'lucide-react';
import { selectUser, selectActiveRole, selectActiveDivisionId } from '../features/auth/authSlice';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  division_admin: 'Division Admin',
  student: 'Student',
  instructor: 'Instructor',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-danger/10 text-danger',
  division_admin: 'bg-primary/10 text-primary',
  student: 'bg-success/10 text-success',
  instructor: 'bg-info/10 text-info',
};

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const activeRole = useSelector(selectActiveRole);
  const activeDivisionId = useSelector(selectActiveDivisionId);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-60 text-text-muted text-sm">
        Loading profile...
      </div>
    );
  }

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  // Find active division
  const activeMembership = user.memberships?.find(
    (m: any) => (m.division?._id ?? m.division) === activeDivisionId
  );

  const activeDivision = activeMembership?.division;
  const divisionName = typeof activeDivision === 'string' ? 'Unknown Division' : activeDivision?.name;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-[0_8px_24px_var(--primary-glow)]">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-text-primary mb-2">{user.name}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${ROLE_COLORS[activeRole] || 'bg-bg-hover text-text-secondary'}`}>
                {ROLE_LABELS[activeRole] || activeRole}
              </span>
              {user.status === 'active' && (
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-success/10 text-success flex items-center gap-1">
                  <CheckCircle size={12} />
                  Active
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-text-muted" />
                <span>{user.email}</span>
              </div>
              {divisionName && activeRole !== 'super_admin' && (
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-text-muted" />
                  <span>{divisionName}</span>
                </div>
              )}
              {user.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-text-muted" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="card">
        <h2 className="text-lg font-black text-text-primary mb-4 flex items-center gap-2">
          <Shield size={18} />
          Roles & Memberships
        </h2>
        <div className="flex flex-col gap-3">
          {user.roles?.includes('super_admin') && (
            <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                    <Shield size={16} className="text-danger" />
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">Super Admin</div>
                    <div className="text-xs text-text-muted">Global access to all divisions</div>
                  </div>
                </div>
                {activeRole === 'super_admin' && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Active
                  </span>
                )}
              </div>
            </div>
          )}

          {user.memberships?.map((membership: any, index: number) => {
            const division = membership.division;
            const divName = typeof division === 'string' ? 'Unknown' : division?.name;
            const isActive = (division?._id ?? division) === activeDivisionId && membership.role === activeRole;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isActive
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-bg-hover border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-primary/10' : 'bg-bg-card'
                    }`}>
                      <Building2 size={16} className={isActive ? 'text-primary' : 'text-text-muted'} />
                    </div>
                    <div>
                      <div className="font-bold text-text-primary">{ROLE_LABELS[membership.role] || membership.role}</div>
                      <div className="text-xs text-text-muted">{divName}</div>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Active
                    </span>
                  )}
                </div>
                {membership.permissions && membership.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {membership.permissions.map((perm: string, i: number) => (
                      <span
                        key={i}
                        className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-bg-card text-text-muted"
                      >
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Information */}
      <div className="card">
        <h2 className="text-lg font-black text-text-primary mb-4 flex items-center gap-2">
          <User size={18} />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-text-muted mb-1">Full Name</div>
            <div className="text-sm font-semibold text-text-primary">{user.name}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Email Address</div>
            <div className="text-sm font-semibold text-text-primary">{user.email}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Account Status</div>
            <div className="text-sm font-semibold capitalize text-text-primary">{user.status}</div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">User ID</div>
            <div className="text-sm font-mono text-text-secondary">{user._id}</div>
          </div>
          {user.createdAt && (
            <div>
              <div className="text-xs text-text-muted mb-1">Account Created</div>
              <div className="text-sm font-semibold text-text-primary">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          )}
          {user.lastLogin && (
            <div>
              <div className="text-xs text-text-muted mb-1">Last Login</div>
              <div className="text-sm font-semibold text-text-primary">
                {new Date(user.lastLogin).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Context */}
      {activeRole !== 'super_admin' && divisionName && (
        <div className="card bg-primary/5 border-primary/20">
          <h3 className="font-bold text-text-primary mb-2">Current Context</h3>
          <p className="text-sm text-text-secondary">
            You are currently viewing the system as <span className="font-bold text-primary">{ROLE_LABELS[activeRole]}</span>
            {' '}in the <span className="font-bold text-primary">{divisionName}</span> division.
            Use the role switcher in the top bar to change your active role or division.
          </p>
        </div>
      )}
    </div>
  );
}