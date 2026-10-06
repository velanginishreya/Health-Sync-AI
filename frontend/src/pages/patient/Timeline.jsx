import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, FileText, HeartPulse, Pill, Calendar, Activity, Stethoscope } from 'lucide-react';
import { PageHeader, StatusPill, EmptyState } from '../../components/ui';

const FILTERS = ['ALL', 'LAB_REPORT', 'VITAL', 'MEDICATION', 'APPOINTMENT', 'DIAGNOSIS'];

const EVENT_META = {
  LAB_REPORT: { Icon: FileText, tone: 'good' },
  VITAL: { Icon: HeartPulse, tone: 'critical' },
  MEDICATION: { Icon: Pill, tone: 'accent' },
  APPOINTMENT: { Icon: Calendar, tone: 'ink' },
  DOCTOR_NOTE: { Icon: Stethoscope, tone: 'watch' },
};
const DEFAULT_META = { Icon: Activity, tone: 'ink' };

const TONE_TILE_CLASSES = {
  ink: 'bg-ink-50 text-ink-600 border-line',
  accent: 'bg-accent-50 text-accent-600 border-accent-100',
  good: 'bg-status-good-50 text-status-good-600 border-status-good-100',
  watch: 'bg-status-watch-50 text-status-watch-600 border-status-watch-100',
  critical: 'bg-status-critical-50 text-status-critical-600 border-status-critical-100',
};

const TONE_PILL_VARIANT = {
  ink: 'neutral',
  accent: 'info',
  good: 'good',
  watch: 'watch',
  critical: 'critical',
};

const getEventMeta = (type) => EVENT_META[type] || DEFAULT_META;

export const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [filterType]);

  const fetchTimeline = async () => {
    try {
      const url = filterType === 'ALL' ? '/api/v1/patients/me/timeline' : `/api/v1/patients/me/timeline?event_type=${filterType}`;
      const res = await axios.get(url);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        label="Longitudinal record"
        title="Chronological Health Timeline"
        description="Unified historical record of health events and clinical interactions."
      />

      {/* Filter Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-2.5 rounded-control text-xs font-semibold transition ${
              filterType === type
                ? 'bg-ink-900 text-white shadow-panel'
                : 'bg-surface-raised text-ink-600 border border-line hover:bg-surface-sunken'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="space-y-6 max-w-3xl animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-ink-100 shrink-0" />
              <div className="panel h-20 flex-1" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No events recorded yet"
          description="Lab reports, vitals, medications, appointments, and clinical notes will appear here as they're added to your record."
        />
      ) : (
        <div className="relative pl-9 border-l border-line space-y-5 max-w-3xl">
          {events.map((e) => {
            const { Icon, tone } = getEventMeta(e.event_type);
            return (
              <div key={e.id} className="relative">
                {/* Timeline node */}
                <div className={`absolute -left-[38px] top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-panel bg-surface-raised ${TONE_TILE_CLASSES[tone]}`}>
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>

                <div className="panel p-4 space-y-1.5 hover:border-ink-300 transition">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-semibold text-sm text-ink-900">{e.title}</span>
                      <StatusPill variant={TONE_PILL_VARIANT[tone]}>{e.event_type.replace('_', ' ')}</StatusPill>
                    </div>
                    <span className="text-[11px] text-ink-400 readout shrink-0">{e.event_date}</span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">{e.description}</p>
                  <span className="instrument-label block pt-1">Source: {e.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
