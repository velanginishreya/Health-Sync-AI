import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Upload, AlertTriangle, Eye, Sparkles, Loader2 } from 'lucide-react';
import { Panel, StatusPill, Button, PageHeader, EmptyState } from '../../components/ui';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/v1/patients/me/reports');
      setReports(res.data);
      if (res.data.length > 0 && !selectedReport) {
        setSelectedReport(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds maximum size limit of 10MB');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/v1/patients/me/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchReports();
      setSelectedReport(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateDynamicReport = async (reportType) => {
    setGenerating(true);
    setError('');
    try {
      const res = await axios.post(`/api/v1/patients/me/reports/generate-dynamic?report_type=${encodeURIComponent(reportType)}`);
      fetchReports();
      setSelectedReport(res.data);
    } catch (err) {
      setError('Dynamic PDF generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const uploadInput = (
    <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUpload} className="hidden" />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        label="Document intelligence"
        title="Laboratory reports"
        description="Upload or dynamically generate PDF reports to extract structured parameters."
        actions={
          <>
            <Button
              as="button"
              variant="secondary"
              size="sm"
              icon={generating ? Loader2 : Sparkles}
              onClick={() => handleGenerateDynamicReport('Complete Blood Count (CBC)')}
              disabled={generating}
            >
              <span className={generating ? 'animate-pulse' : ''}>
                {generating ? 'Parsing PDF…' : 'Generate sample PDF'}
              </span>
            </Button>

            <Button as="label" variant="primary" size="sm" icon={Upload} className="cursor-pointer">
              {uploading ? 'Processing file…' : 'Upload PDF report'}
              {uploadInput}
            </Button>
          </>
        }
      />

      {error && (
        <div className="bg-status-critical-50 text-status-critical-700 text-xs p-3 rounded-control border border-status-critical-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {reports.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No lab reports yet"
          description="Upload a PDF or image of a lab report and Health Sync AI will automatically extract structured test parameters for you."
          action={
            <Button as="label" variant="primary" icon={Upload} className="cursor-pointer">
              Upload your first report
              {uploadInput}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Report List */}
          <Panel className="p-5 space-y-3">
            <h2 className="text-sm font-semibold text-ink-900">Uploaded lab reports <span className="readout text-ink-500">({reports.length})</span></h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-3.5 rounded-control border cursor-pointer transition flex items-center justify-between gap-2 ${
                    selectedReport?.id === r.id
                      ? 'bg-accent-50 border-accent-500 shadow-panel'
                      : 'bg-surface-sunken border-line hover:border-line-strong'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-semibold text-xs text-ink-900 block truncate">{r.report_type}</span>
                    <span className="text-[11px] text-ink-500 block truncate">{r.file_name}</span>
                    <span className="text-[10px] text-ink-400 readout">Extracted: {r.results?.length || 0} parameters</span>
                  </div>
                  <Eye className="w-4 h-4 text-ink-400 shrink-0" strokeWidth={2} />
                </div>
              ))}
            </div>
          </Panel>

          {/* Right: Extracted Structured Parameters */}
          <Panel className="lg:col-span-2 p-6 space-y-4">
            {selectedReport ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-ink-900">{selectedReport.report_type}</h2>
                    <span className="text-xs text-ink-500 readout">
                      {selectedReport.file_name} &middot; {selectedReport.report_date}
                    </span>
                  </div>
                  <StatusPill variant="info" className="shrink-0 self-start sm:self-auto">
                    Extracted via document AI pipeline
                  </StatusPill>
                </div>

                {/* Extracted Parameter Table */}
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                    <thead>
                      <tr className="bg-surface-sunken text-ink-600 font-semibold border-b border-line">
                        <th className="p-3">Test parameter</th>
                        <th className="p-3">Observed value</th>
                        <th className="p-3">Unit</th>
                        <th className="p-3">Reference range</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {selectedReport.results?.map((res) => (
                        <tr key={res.id} className="hover:bg-surface-sunken">
                          <td className="p-3 font-semibold text-ink-900">{res.test_name}</td>
                          <td className="p-3 font-semibold text-ink-800 readout">{res.value}</td>
                          <td className="p-3 text-ink-500 readout">{res.unit}</td>
                          <td className="p-3 text-ink-500 readout">{res.reference_range}</td>
                          <td className="p-3 text-center">
                            <StatusPill variant={res.status === 'HIGH' || res.status === 'LOW' ? 'watch' : 'good'} className="py-0.5 px-2">
                              {res.status}
                            </StatusPill>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-ink-400 text-xs font-medium">
                Select or upload a laboratory report to inspect extracted parameters.
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
};
