'use client';

import { ROLE_PERMISSIONS, ALL_PERMISSIONS } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const BADGE_COLORS: Record<string, string> = {
  appointment:   'bg-blue-100 text-blue-700 border-blue-200',
  patient:       'bg-green-100 text-green-700 border-green-200',
  billing:       'bg-yellow-100 text-yellow-700 border-yellow-200',
  bill:          'bg-yellow-100 text-yellow-700 border-yellow-200',
  pharmacy:      'bg-purple-100 text-purple-700 border-purple-200',
  prescription:  'bg-teal-100 text-teal-700 border-teal-200',
  report:        'bg-sky-100 text-sky-700 border-sky-200',
  admin:         'bg-red-100 text-red-700 border-red-200',
  user:          'bg-orange-100 text-orange-700 border-orange-200',
  settings:      'bg-slate-100 text-slate-700 border-slate-200',
};

function getBadgeColor(key: string): string {
  const cat = key.split(':')[0];
  return BADGE_COLORS[cat] || 'bg-gray-100 text-gray-700 border-gray-200';
}

const ROLES = ['DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN', 'SUPERADMIN', 'PATIENT'];

export default function RbacPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        description="View what each role is allowed to do in the system"
      />

      <div className="grid gap-4">
        {ROLES.map(role => {
          const perms = ROLE_PERMISSIONS[role] || [];
          return (
            <Card key={role}>
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-primary" />
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {perms.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No permissions assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map(perm => (
                      <span
                        key={perm}
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getBadgeColor(perm)}`}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All permissions reference */}
      <Card>
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base">All Defined Permissions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ALL_PERMISSIONS.map(p => (
              <div key={p.key} className="flex items-start gap-2 text-sm">
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-mono font-medium shrink-0 ${getBadgeColor(p.key)}`}>
                  {p.key}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
