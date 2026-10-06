import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, PanelTitle } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/Tag';
import { FilterChips } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Caps, Meta, Mono } from '../../components/ui/Text';
import { fmtDateTime, humanize } from '../../lib/format';
import { get, useLoad } from '../../lib/api';

const FILTERS = [
  { value: 'ALL', label: 'Everything', match: () => true },
  { value: 'LOGIN', label: 'Sign-ins', match: (action) => action.includes('LOGIN') || action.includes('LOGOUT') },
  { value: 'ACCESS', label: 'Record access', match: (action) => action.includes('ACCESS') || action.includes('VIEW') },
  { value: 'AI', label: 'AI requests', match: (action) => action.includes('AI') },
  { value: 'EXPORT', label: 'Exports', match: (action) => action.includes('EXPORT') },
];

const actionTone = (action) => {
  const key = String(action || '').toUpperCase();
  if (key.includes('ACCESS') || key.includes('DELETE')) return 'critical';
  if (key.includes('LOGIN') || key.includes('LOGOUT')) return 'info';
  if (key.includes('AI') || key.includes('EXPORT')) return 'watch';
  if (key.includes('UPLOAD') || key.includes('REGISTER')) return 'good';
  return 'neutral';
};

export const AdminAuditLogs = () => {
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const { data, loading } = useLoad(() => get('/api/v1/admin/audit-logs'), []);
  const logs = data || [];

  const activeFilter = FILTERS.find((item) => item.value === filter) || FILTERS[0];

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return logs.filter((log) => {
      const action = String(log.action || '').toUpperCase();
      const matchesFilter = activeFilter.match(action);
      const haystack = [log.action, log.resource_type, log.user_id, log.ip_address].join(' ').toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [logs, activeFilter, query]);

  return (
    <AppShell role="ADMIN">
      <Page>
        <PageHeader
          title="Audit log"
          description="Every sign-in, record access, AI request, and export, written once and never edited."
        />

        <div className="flex items-start gap-3.5 rounded-card3 border border-sand-200 bg-bone-sunken/70 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-white text-petrol-700">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.1} />
          </span>
          <p className="text-b3 leading-relaxed text-sand-700">
            <span className="font-semibold text-sand-950">Entries are append-only. </span>
            A doctor opening a patient who is not assigned to them is refused by the server and
            leaves a trail here. That is why this page matters more than any dashboard.
          </p>
        </div>

        {loading ? (
          <PageSkeleton figures={3} rows={6} />
        ) : (
          <>
            <div className="space-y-4">
              <FilterChips
                options={FILTERS.map((item) => ({
                  value: item.value,
                  label: item.label,
                  count: logs.filter((log) => item.match(String(log.action || '').toUpperCase())).length,
                }))}
                value={filter}
                onChange={setFilter}
                label="Filter the audit log"
              />
              <div className="max-w-sm">
                <label htmlFor="audit-search" className="sr-only">
                  Search the audit log
                </label>
                <Input
                  id="audit-search"
                  icon={Search}
                  placeholder="Search actions, users, IPs"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <Card pad="lg">
              <PanelTitle icon={ShieldCheck} count={`${visible.length} of ${logs.length} entries`}>
                Entries
              </PanelTitle>

              {visible.length === 0 ? (
                <EmptyState
                  bare
                  icon={ShieldCheck}
                  title="No entries match"
                  body="Clear the search or switch filters. New events are written as they happen."
                />
              ) : (
                <TableWrap>
                  <Table minWidth={800}>
                    <THead>
                      <TR>
                        <TH>Time</TH>
                        <TH>Action</TH>
                        <TH>Resource</TH>
                        <TH>User</TH>
                        <TH align="right">IP</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {visible.map((log) => (
                        <TR key={log.id}>
                          <TD>
                            <span className="font-mono3 text-m3 text-sand-800">{fmtDateTime(log.timestamp)}</span>
                          </TD>
                          <TD>
                            <StatusPill value={log.action} tone={actionTone(log.action)} label={humanize(log.action)} size="sm" />
                          </TD>
                          <TD>
                            <span className="text-b3 text-sand-700">{log.resource_type || 'System'}</span>
                            {log.resource_id && (
                              <span className="mt-0.5 block max-w-[220px] truncate font-mono3 text-m4 text-sand-500">
                                {log.resource_id}
                              </span>
                            )}
                          </TD>
                          <TD>
                            {log.user_id ? (
                              <span className="block max-w-[200px] truncate font-mono3 text-m4 text-sand-600">
                                {log.user_id}
                              </span>
                            ) : (
                              <Meta>system</Meta>
                            )}
                          </TD>
                          <TD align="right">
                            <Mono>{log.ip_address || 'not recorded'}</Mono>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </TableWrap>
              )}
            </Card>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Caps>Reading this page</Caps>
              <Meta>
                The newest 100 entries are shown. Nothing here can be edited or removed, by design.
              </Meta>
            </div>
          </>
        )}
      </Page>
    </AppShell>
  );
};

export default AdminAuditLogs;
