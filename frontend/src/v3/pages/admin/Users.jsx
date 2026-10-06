import React, { useMemo, useState } from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/Tag';
import { FilterChips } from '../../components/ui/Tabs';
import { Input, Label, Select } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Toast, useToast } from '../../components/ui/Toast';
import { Meta, Mono } from '../../components/ui/Text';
import { fmtDate, humanize, initials } from '../../lib/format';
import { errorText, get, post, useLoad } from '../../lib/api';
import { ROLE_LABEL } from '../../components/layout/nav';

const ROLE_TONE = { PATIENT: 'good', DOCTOR: 'petrol', ADMIN: 'neutral' };

const FILTERS = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'PATIENT', label: 'Patients' },
  { value: 'DOCTOR', label: 'Doctors' },
  { value: 'ADMIN', label: 'Admins' },
];

export const AdminUsers = () => {
  const { toast, show, clear } = useToast();
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [assign, setAssign] = useState({ doctor_id: '', patient_id: '' });
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

  const { data, loading, reload } = useLoad(() => get('/api/v1/admin/users'), []);
  const users = data || [];

  const doctors = useMemo(() => users.filter((user) => user.role === 'DOCTOR'), [users]);
  const patients = useMemo(() => users.filter((user) => user.role === 'PATIENT'), [users]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const haystack = [user.first_name, user.last_name, user.email, user.role].join(' ').toLowerCase();
      return matchesRole && (!term || haystack.includes(term));
    });
  }, [users, roleFilter, query]);

  const submitAssign = async (event) => {
    event.preventDefault();
    setAssignError('');
    if (!assign.doctor_id || !assign.patient_id) {
      setAssignError('Pick both a doctor and a patient.');
      return;
    }
    setAssigning(true);
    try {
      const patient = patients.find((item) => item.id === assign.patient_id);
      await post(
        `/api/v1/admin/assign-patient?doctor_id=${assign.doctor_id}&patient_id=${assign.patient_id}`
      );
      setAssign({ doctor_id: '', patient_id: '' });
      await reload({ quiet: true });
      show(`${patient ? `${patient.first_name} ${patient.last_name}` : 'Patient'} assigned to the doctor.`, 'good');
    } catch (err) {
      setAssignError(errorText(err, 'That assignment did not go through. Try again.'));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AppShell role="ADMIN">
      <Page>
        <PageHeader
          title="Users"
          description="Every account in the system, its role, and the care-team assignments that scope what doctors can see."
        />

        <Card pad="lg">
          <PanelTitle icon={UserPlus}>Assign a patient to a doctor</PanelTitle>
          <form onSubmit={submitAssign} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end" noValidate>
            <div>
              <Label htmlFor="assign-doctor" required>
                Doctor
              </Label>
              <Select
                id="assign-doctor"
                value={assign.doctor_id}
                onChange={(event) => setAssign((prev) => ({ ...prev, doctor_id: event.target.value }))}
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="assign-patient" required>
                Patient
              </Label>
              <Select
                id="assign-patient"
                value={assign.patient_id}
                onChange={(event) => setAssign((prev) => ({ ...prev, patient_id: event.target.value }))}
              >
                <option value="">Choose a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.email})
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" loading={assigning} className="lg:mb-0">
              Assign
            </Button>
          </form>

          {assignError && (
            <p role="alert" className="mt-4 rounded-ctl3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3 text-b3 text-sig-critical-700">
              {assignError}
            </p>
          )}

          <p className="mt-4 border-t border-sand-200 pt-4 text-b3 leading-relaxed text-sand-600">
            Assignment is what grants a doctor access. Without it, opening the record is refused by
            the server and written to the audit log.
          </p>
        </Card>

        {loading ? (
          <PageSkeleton figures={4} rows={6} />
        ) : (
          <>
            <div className="space-y-4">
              <FilterChips
                options={FILTERS.map((filter) => ({
                  ...filter,
                  count:
                    filter.value === 'ALL'
                      ? users.length
                      : users.filter((user) => user.role === filter.value).length,
                }))}
                value={roleFilter}
                onChange={setRoleFilter}
                label="Filter by role"
              />
              <div className="max-w-sm">
                <label htmlFor="user-search" className="sr-only">
                  Search users
                </label>
                <Input
                  id="user-search"
                  icon={Search}
                  placeholder="Search users"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <Card pad="lg">
              <PanelTitle icon={Users} count={`${visible.length} shown`}>Directory</PanelTitle>

              {visible.length === 0 ? (
                <EmptyState
                  bare
                  icon={Users}
                  title="No users match"
                  body="Clear the search or switch the role filter to see more accounts."
                />
              ) : (
                <TableWrap>
                  <Table minWidth={780}>
                    <THead>
                      <TR>
                        <TH>Name</TH>
                        <TH>Email</TH>
                        <TH>Role</TH>
                        <TH>Phone</TH>
                        <TH>Born</TH>
                        <TH align="right">Joined</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {visible.map((user) => (
                        <TR key={user.id}>
                          <TD>
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-tile3 bg-sand-200 font-body3 text-m4 font-semibold text-sand-800">
                                {initials(`${user.first_name} ${user.last_name}`)}
                              </span>
                              <span className="text-b3 font-semibold text-sand-900">
                                {user.first_name} {user.last_name}
                              </span>
                            </span>
                          </TD>
                          <TD>
                            <Mono>{user.email}</Mono>
                          </TD>
                          <TD>
                            <StatusPill
                              value={user.role}
                              tone={ROLE_TONE[user.role] || 'neutral'}
                              label={ROLE_LABEL[user.role] || humanize(user.role)}
                              size="sm"
                            />
                          </TD>
                          <TD>{user.phone || 'Not given'}</TD>
                          <TD>{user.date_of_birth ? fmtDate(user.date_of_birth) : 'Not given'}</TD>
                          <TD align="right">{fmtDate(user.created_at)}</TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </TableWrap>
              )}
            </Card>

            <Meta>
              Accounts are created by their owners through the public registration page. Roles shown
              here are what the server enforces on every request.
            </Meta>
          </>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default AdminUsers;
