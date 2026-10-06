import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Calendar,
  Clock,
  FileText,
  HeartPulse,
  Pill,
  Stethoscope,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Page } from '../../components/layout/Container';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterChips } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Tag } from '../../components/ui/Tag';
import { Meta, Mono } from '../../components/ui/Text';
import { categoryTone } from '../../lib/clinical';
import { fmtDate, humanize } from '../../lib/format';
import { get, useLoad } from '../../lib/api';
import { staggerItem } from '../../lib/motion';

/*
  The timeline is the record's spine: everything that ever happened, newest first.
  Filtering is a client-side view of one fetch, so switching filters never costs a
  request and never reflows the page height.
*/
const EVENT_ICON = {
  DIAGNOSIS: Stethoscope,
  LAB_REPORT: FileText,
  MEDICATION: Pill,
  VITAL: HeartPulse,
  APPOINTMENT: Calendar,
  PRESCRIPTION: Pill,
  AI_INSIGHT: Bot,
  DOCTOR_NOTE: Stethoscope,
};

const TONE_CLASS = {
  petrol: 'bg-petrol-50 text-petrol-700',
  dusk: 'bg-sand-200/80 text-sand-700',
  sand: 'bg-sand-100 text-sand-600',
};

const FILTERS = [
  { value: 'ALL', label: 'Everything' },
  { value: 'LAB_REPORT', label: 'Lab reports' },
  { value: 'VITAL', label: 'Vitals' },
  { value: 'MEDICATION', label: 'Medicines' },
  { value: 'APPOINTMENT', label: 'Visits' },
  { value: 'DOCTOR_NOTE', label: 'Doctor notes' },
  { value: 'DIAGNOSIS', label: 'Diagnoses' },
];

export const Timeline = () => {
  const [filter, setFilter] = useState('ALL');
  const { data, loading } = useLoad(() => get('/api/v1/patients/me/timeline'), []);
  const events = data || [];

  const filtered = useMemo(
    () => (filter === 'ALL' ? events : events.filter((event) => event.event_type === filter)),
    [events, filter]
  );

  const counts = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      map[event.event_type] = (map[event.event_type] || 0) + 1;
    });
    return map;
  }, [events]);

  const options = FILTERS.map((option) => ({
    ...option,
    count: option.value === 'ALL' ? events.length : counts[option.value] || 0,
  }));

  return (
    <AppShell role="PATIENT">
      <Page>
        <PageHeader
          title="Timeline"
          description="Every report, reading, medicine, and visit in one story you can scroll through."
        />

        <FilterChips options={options} value={filter} onChange={setFilter} label="Filter the timeline" />

        {loading ? (
          <div className="space-y-3" role="status" aria-busy="true">
            <span className="sr-only">Loading your timeline</span>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-[74px] w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            headingLevel="h2"
            icon={Clock}
            title={filter === 'ALL' ? 'Nothing here yet' : 'Nothing in this category yet'}
            body={
              filter === 'ALL'
                ? 'Reports, readings, medicines, visits and notes appear here the moment they are added.'
                : 'Try another filter, or clear it to see the whole record.'
            }
          />
        ) : (
          <motion.ol
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
            className="relative space-y-3"
          >
            {filtered.map((event) => {
              const Icon = EVENT_ICON[event.event_type] || Clock;
              const tone = categoryTone(event.event_type);
              return (
                <motion.li key={event.id} variants={staggerItem}>
                  <Card pad="md" className="flex gap-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ctl3 ${TONE_CLASS[tone]}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3 className="text-d5 text-sand-950">{event.title}</h3>
                        <Tag tone={tone === 'petrol' ? 'petrol' : 'neutral'} case="sentence">
                          {humanize(event.event_type)}
                        </Tag>
                      </div>
                      {event.description && (
                        <p className="mt-1.5 text-b2 leading-relaxed text-sand-600">{event.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Mono>{fmtDate(event.event_date) === 'Not recorded' ? event.event_date : fmtDate(event.event_date)}</Mono>
                        <span aria-hidden className="text-sand-400">·</span>
                        <Meta>
                          {event.source === 'system' || event.source === 'sync_ai'
                            ? 'Recorded by Sync AI'
                            : humanize(event.source)}
                        </Meta>
                      </div>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </motion.ol>
        )}
      </Page>
    </AppShell>
  );
};

export default Timeline;
