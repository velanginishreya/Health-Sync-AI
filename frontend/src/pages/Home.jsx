import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, FileText, Bot, ShieldCheck, ArrowRight, Activity, Pill, ScanLine } from 'lucide-react';

const FEATURES = [
  {
    Icon: Cpu,
    title: 'Dynamic Digital Twin',
    desc: 'Aggregates conditions, medications, vitals, allergies, family history, and lab parameters into one structured context graph.',
  },
  {
    Icon: FileText,
    title: 'Document intelligence',
    desc: 'Extracts structured parameters from PDF lab reports (CBC, lipid, metabolic, thyroid) automatically on upload.',
  },
  {
    Icon: Bot,
    title: 'Explainable RAG assistant',
    desc: 'Retrieves the minimum necessary context and shows the exact data sources behind every answer it gives.',
  },
  {
    Icon: Pill,
    title: 'Drug interaction safety',
    desc: 'Every prescription is checked against active medications for dangerous interactions before it’s added.',
  },
  {
    Icon: Activity,
    title: 'Clinical risk scoring',
    desc: 'Live deep-learning risk classification alongside the ACC/AHA 10-year ASCVD cardiovascular risk engine.',
  },
  {
    Icon: ShieldCheck,
    title: 'HIPAA-aware & FHIR R4',
    desc: 'Anonymized exports for research use, and standards-based interoperability via FHIR R4 bundles.',
  },
];

export const Home = () => {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="bg-ink-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-ink-300 text-xs font-semibold mb-6">
            <ScanLine className="w-3.5 h-3.5 text-accent-400" strokeWidth={2} />
            Academic major project prototype
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            AI-powered personalized <span className="text-accent-400">Digital Twin</span> for patient health management
          </h1>
          <p className="text-base sm:text-lg text-ink-300 max-w-2xl mx-auto mt-6 leading-relaxed">
            Health Sync AI integrates medical history, lab reports, prescriptions, vitals, and allergies into one structured record, with a safety-aware AI assistant that reasons over your authorized context.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              to="/login"
              className="px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-control transition flex items-center gap-2 text-sm"
            >
              Enter Health Sync portal <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-control border border-white/15 transition text-sm"
            >
              Explore architecture
            </a>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="max-w-6xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900">Key differentiators</h2>
          <p className="text-ink-500 mt-2 max-w-xl mx-auto">Moving beyond generic AI chatbots to structured, safety-checked patient digital twins.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="panel p-6 space-y-3">
              <div className="w-10 h-10 rounded-control bg-ink-50 text-ink-700 flex items-center justify-center">
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold text-ink-900">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
