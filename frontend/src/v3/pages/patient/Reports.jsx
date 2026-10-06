import React, { useEffect, useMemo, useState } from 'react';
import { FileUp, FlaskConical, FileText } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, PanelTitle } from '../../components/ui/Card';
import { StatusPill, Tag } from '../../components/ui/Tag';
import { FileButton } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Toast, useToast } from '../../components/ui/Toast';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../../components/ui/Table';
import { Caps, Meta } from '../../components/ui/Text';
import { labStatusLabel } from '../../lib/clinical';
import { fmtDate, fmtNumber } from '../../lib/format';
import { errorText, get, post, useLoad } from '../../lib/api';

const MAX_BYTES = 10 * 1024 * 1024;

export const Reports = () => {
  const { toast, show, clear } = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const { data, loading, reload } = useLoad(() => get('/api/v1/patients/me/reports'), []);
  const reports = data || [];

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!reports.some((report) => report.id === selectedId)) {
      setSelectedId(reports[0].id);
    }
  }, [reports, selectedId]);

  const selected = useMemo(
    () => reports.find((report) => report.id === selectedId) || null,
    [reports, selectedId]
  );

  const upload = async (file) => {
    setError('');
    if (file.size > MAX_BYTES) {
      setError('That file is larger than 10 MB. Try a smaller scan or photo.');
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const created = await post('/api/v1/patients/me/reports/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await reload({ quiet: true });
      if (created?.id) setSelectedId(created.id);
      show('Report uploaded and read automatically.', 'good');
    } catch (err) {
      setError(errorText(err, 'That upload did not go through. Try again.'));
    } finally {
      setUploading(false);
    }
  };

  const generateSample = async () => {
    setError('');
    setGenerating(true);
    try {
      const created = await post('/api/v1/patients/me/reports/generate-dynamic?report_type=Complete%20Blood%20Count%20(CBC)');
      await reload({ quiet: true });
      if (created?.id) setSelectedId(created.id);
      show('Sample report added and read automatically.', 'good');
    } catch (err) {
      setError(errorText(err, 'Could not add a sample report.'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title="Lab reports"
          description="Upload a PDF or a photo of a printout. Values are read, named, and filed by date."
          actions={
            <>
              <Button variant="vellum" icon={FlaskConical} loading={generating} onClick={generateSample}>
                Try a sample report
              </Button>
              <FileButton
                accept=".pdf,.png,.jpg,.jpeg"
                onSelect={upload}
                icon={FileUp}
                loading={uploading}
                size="md"
              >
                Upload a report
              </FileButton>
            </>
          }
        />

        {error && (
          <p role="alert" className="rounded-card3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3.5 text-b2 text-sig-critical-700">
            {error}
          </p>
        )}

        {loading ? (
          <PageSkeleton figures={3} rows={5} />
        ) : reports.length === 0 ? (
          <EmptyState
            headingLevel="h2"
            icon={FileText}
            title="No lab reports yet"
            body="Upload your first report, or add a generated sample to see how values are read and ranged."
            action={
              <>
                <FileButton accept=".pdf,.png,.jpg,.jpeg" onSelect={upload} loading={uploading}>
                  Upload a report
                </FileButton>
                <Button variant="vellum" loading={generating} onClick={generateSample}>
                  Add a sample report
                </Button>
              </>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <Card pad="sm" className="lg:sticky lg:top-[calc(var(--v3-topbar-h)+24px)] lg:self-start">
              <div className="px-2 pb-2 pt-1">
                <Caps>Your reports ({reports.length})</Caps>
              </div>
              <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                {reports.map((report) => {
                  const active = report.id === selectedId;
                  return (
                    <li key={report.id} className="shrink-0 lg:shrink">
                      <button
                        type="button"
                        onClick={() => setSelectedId(report.id)}
                        aria-current={active ? 'true' : undefined}
                        className={`w-full min-h-touch rounded-ctl3 px-3 py-2.5 text-left transition-colors duration-150 ${
                          active ? 'bg-petrol-50 text-petrol-900' : 'text-sand-700 hover:bg-sand-100'
                        }`}
                      >
                        <span className={`block text-b3 font-semibold ${active ? 'text-petrol-900' : 'text-sand-900'}`}>
                          {report.report_type}
                        </span>
                        <span className="v3-num mt-0.5 block font-mono3 text-m4 text-sand-500">
                          {fmtDate(report.report_date || report.created_at)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 border-t border-sand-200 px-2 pt-3 text-b4 leading-relaxed text-sand-600">
                Every value is stored in your record and checked against its reference range.
              </p>
            </Card>

            {selected && (
              <Card pad="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-d3 text-sand-950">{selected.report_type}</h2>
                    <p className="mt-1.5 text-b3 text-sand-600">
                      <span className="font-mono3 text-m4">{selected.file_name}</span>
                      <span aria-hidden className="mx-2 text-sand-400">·</span>
                      {fmtDate(selected.report_date || selected.created_at)}
                    </p>
                  </div>
                  <Tag tone="petrol" case="sentence" icon={FlaskConical}>
                    Read automatically
                  </Tag>
                </div>

                <div className="mt-6">
                  <PanelTitle icon={FileText} count={`${selected.results?.length || 0} values`}>
                    Values in this report
                  </PanelTitle>
                  {selected.results?.length ? (
                    <TableWrap>
                      <Table minWidth={560}>
                        <THead>
                          <TR>
                            <TH>Test</TH>
                            <TH align="right">Value</TH>
                            <TH>Reference range</TH>
                            <TH align="right">Status</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {selected.results.map((result) => (
                            <TR key={result.id}>
                              <TD>
                                <span className="text-b3 font-medium text-sand-900">{result.test_name}</span>
                              </TD>
                              <TD align="right">
                                <span className="font-mono3 text-m3 text-sand-950">{fmtNumber(result.value)}</span>
                                <span className="ml-1 text-m4 text-sand-500">{result.unit}</span>
                              </TD>
                              <TD>
                                <span className="font-mono3 text-m4 text-sand-600">
                                  {result.reference_range || 'Not given'}
                                </span>
                              </TD>
                              <TD align="right">
                                <StatusPill value={result.status} domain="lab" label={labStatusLabel(result.status)} size="sm" />
                              </TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                    </TableWrap>
                  ) : (
                    <Meta>No values were extracted from this file.</Meta>
                  )}
                </div>

                <p className="mt-5 rounded-ctl3 border border-sand-200 bg-bone px-4 py-3 text-b3 leading-relaxed text-sand-700">
                  {selected.results?.length || 0} values were read from the file automatically. Always
                  compare them with the original report from your lab.
                </p>

                {selected.extracted_text && (
                  <details className="mt-4 border-t border-sand-200 pt-4">
                    <summary className="cursor-pointer list-none text-b3 font-medium text-sand-700 transition-colors hover:text-petrol-700">
                      Show the text read from the file
                    </summary>
                    <pre className="v3-num mt-3 max-h-72 overflow-auto rounded-ctl3 border border-sand-200 bg-bone p-4 font-mono3 text-m4 leading-relaxed text-sand-700">
                      {selected.extracted_text}
                    </pre>
                  </details>
                )}
              </Card>
            )}
          </div>
        )}
      </Page>

      <Toast toast={toast} onClose={clear} />
    </AppShell>
  );
};

export default Reports;
