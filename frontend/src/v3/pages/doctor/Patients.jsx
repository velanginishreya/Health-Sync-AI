import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Users } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, PanelTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Field';
import { Tag } from '../../components/ui/Tag';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Meta, Mono } from '../../components/ui/Text';
import { get, useLoad } from '../../lib/api';

export const DoctorPatients = () => {
  const [query, setQuery] = useState('');
  const { data, loading } = useLoad(() => get('/api/v1/doctor/patients'), []);
  const patients = data || [];

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((patient) =>
      [patient.name, patient.blood_group, ...(patient.active_conditions || []).map((condition) => condition.condition)]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [patients, query]);

  return (
    <AppShell role="DOCTOR">
      <Page>
        <PageHeader
          title="Patients"
          description="Everyone assigned to your care, with the conditions and medicines that matter before a consult."
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-full max-w-sm">
            <label htmlFor="patient-search" className="sr-only">
              Search the roster
            </label>
            <Input
              id="patient-search"
              icon={Search}
              placeholder="Search by name, condition, or blood group"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Meta>
            Showing {filtered.length} of {patients.length}
          </Meta>
        </div>

        {loading ? (
          <PageSkeleton figures={3} rows={5} />
        ) : (
          <Card pad="lg">
            <PanelTitle icon={Users} count={`${patients.length} assigned`}>
              Roster
            </PanelTitle>

            {filtered.length === 0 ? (
              <EmptyState
                bare
                icon={Users}
                title={query ? 'No patients match that search' : 'No patients assigned yet'}
                body={
                  query
                    ? 'Try a shorter search, or clear it to see the full roster.'
                    : 'An administrator assigns patients to you. Once assigned, their record appears here.'
                }
              />
            ) : (
              <TableWrap>
                <Table minWidth={780}>
                  <THead>
                    <TR>
                      <TH>Patient</TH>
                      <TH>Age</TH>
                      <TH>Blood group</TH>
                      <TH>Active conditions</TH>
                      <TH align="right">Medicines</TH>
                      <TH align="right">Record</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {filtered.map((patient) => (
                      <TR key={patient.id}>
                        <TD>
                          <span className="block text-b3 font-semibold text-sand-900">{patient.name}</span>
                          <Mono>{patient.email}</Mono>
                        </TD>
                        <TD>{patient.age ?? 'Not given'}</TD>
                        <TD>{patient.blood_group || 'Not given'}</TD>
                        <TD>
                          <span className="flex flex-wrap gap-1.5">
                            {(patient.active_conditions || []).map((condition) => (
                              <Tag key={condition.condition} tone="dusk" case="sentence">
                                {condition.condition}
                              </Tag>
                            ))}
                            {(patient.active_conditions?.length || 0) === 0 && <Meta>None recorded</Meta>}
                          </span>
                        </TD>
                        <TD align="right">{patient.active_medications_count ?? 0} active</TD>
                        <TD align="right">
                          <Link
                            to={`/v3/doctor/patients/${patient.id}`}
                            className="inline-flex min-h-8 items-center gap-1.5 text-b3 font-semibold text-petrol-700 transition-colors hover:text-petrol-800"
                          >
                            Open record
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </Link>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            )}
          </Card>
        )}
      </Page>
    </AppShell>
  );
};

export default DoctorPatients;
