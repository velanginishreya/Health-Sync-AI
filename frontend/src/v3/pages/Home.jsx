import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { MarketingShell } from '../components/layout/MarketingShell';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Card, DuskPanel, PanelTitle } from '../components/ui/Card';
import { Caps, Meta, Mono } from '../components/ui/Text';
import { cn } from '../lib/cn';
import { Figure, FIGURE_SIZE } from '../components/ui/Figure';
import { Tag, StatusPill } from '../components/ui/Tag';
import { RiskBand } from '../components/ui/RiskBand';
import { Sparkline } from '../components/ui/Sparkline';
import { DeviceFrame } from '../components/ui/DeviceFrame';
import { Spotlight } from '../components/ui/Spotlight';
import { ChatBubble, SafetyMark } from '../components/ui/ChatBubble';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '../components/ui/Table';
import { errorText, post } from '../lib/api';
import { CHART } from '../lib/clinical';
import { DEMO_ACCOUNTS } from '../lib/demo';
import { easeOut, inView, revealLine, staggerItem } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
import { useAuth } from '../../contexts/AuthContext';
import { roleHome } from '../components/layout/nav';

/* ------------------------------------------------------------------ helpers */

const Section = ({ id, children, className = '' }) => (
  <motion.section id={id} {...inView(0.18)} className={`scroll-mt-24 ${className}`}>
    {children}
  </motion.section>
);

const Item = ({ children, className = '' }) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);

const RuledRow = ({ index, title, body }) => (
  <div className="flex gap-5 border-t border-sand-200 py-5">
    <span className="v3-num mt-px shrink-0 font-mono3 text-m4 font-semibold text-petrol-700">{index}</span>
    <div className="min-w-0">
      <h3 className="text-d5 text-sand-950">{title}</h3>
      <p className="mt-1 text-b2 leading-relaxed text-sand-600">{body}</p>
    </div>
  </div>
);

/* --------------------------------------------------------------- hero phone */

const TODAY_INSIGHTS = [
  'Cholesterol is above range.',
  'Blood pressure is running above 135.',
];

const PhoneToday = () => (
  <div className="px-4 pb-5 pt-3 text-sand-900">
    <div className="flex items-baseline justify-between">
      <span className="text-d5 text-sand-950">Today</span>
      <span className="v3-num font-mono3 text-m4 text-sand-600">16 Sep</span>
    </div>
    <p className="mt-3 text-b3 text-sand-600">Good morning, Arjun</p>
    <p className="mt-0.5 text-d4 text-sand-950">2 things worth a look</p>

    <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card3 border border-sand-200 bg-sand-200">
      {[
        { label: 'Blood pressure', value: '138/88', unit: 'mmHg' },
        { label: 'Medicines', value: '2', unit: 'active' },
        { label: 'Lab values', value: '5', unit: 'on file' },
        { label: 'Next visit', value: '10:00', unit: '15 Sep' },
      ].map((cell) => (
          <div key={cell.label} className="bg-bone-raised p-3">
            <Figure label={cell.label} value={cell.value} unit={cell.unit} size="xs" />
          </div>
        ))}
    </div>

    <div className="mt-3 space-y-2">
      {TODAY_INSIGHTS.map((line) => (
        <div key={line} className="flex items-start gap-2.5 rounded-ctl3 border border-sand-200 bg-bone-raised px-3 py-2.5">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-petrol-500" />
          <span className="text-b4 leading-relaxed text-sand-800">{line}</span>
        </div>
      ))}
    </div>

    <div className="mt-3 flex items-center gap-2 rounded-ctl3 border border-petrol-200 bg-petrol-50 px-3 py-2.5">
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-petrol-700" strokeWidth={2.2} />
      <span className="text-b4 font-medium text-petrol-900">What does my lipid panel mean?</span>
    </div>

    <div className="mt-4 flex justify-between border-t border-sand-200 pt-2.5 text-m4 font-medium">
      <span className="text-petrol-700">Today</span>
      <span className="text-sand-600">Health</span>
      <span className="text-sand-600">Ask</span>
      <span className="text-sand-600">Visits</span>
    </div>
  </div>
);

/* ------------------------------------------------------------- engines data */

/*
  The three engines, side by side. This was a scroll-choreographed deck for a while
  and it was wrong twice over: a scroll-driven index can skip a step (straight from
  01 to 03, with 02 never shown), and a pinned deck leaves a band of empty dark. Three
  cards in one row cannot skip, cannot be hollow, and can be read in any order.
*/
const ENGINES = [
  {
    key: 'interactions',
    index: '01',
    title: 'Drug interactions',
    pill: { value: 'MINOR', domain: 'ddi', label: 'Minor note' },
    body: (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="onDusk" surface="dusk" case="sentence">Metformin HCl</Tag>
          <span aria-hidden className="text-dusk-faint">+</span>
          <Tag tone="onDusk" surface="dusk" case="sentence">Lisinopril</Tag>
        </div>
        <p className="mt-4 text-d5 text-dusk-text">Enhanced glycemic response</p>
        <p className="mt-2 text-b3 leading-relaxed text-dusk-soft">
          ACE inhibitors may slightly increase insulin sensitivity and lower blood glucose.
          Routine glycemic monitoring is recommended.
        </p>
      </>
    ),
    note: 'Every active medicine checked against every other one, on every change.',
  },
  {
    key: 'ascvd',
    index: '02',
    title: 'Heart risk, over ten years',
    pill: { value: 'HIGH', domain: 'insight', label: 'High' },
    body: (
      <>
        <RiskBand value={65} tone="dusk" />
        <p className="mt-1 text-b3 leading-relaxed text-dusk-soft">
          High risk. High-intensity statin therapy and strict blood pressure control advised.
        </p>
      </>
    ),
    note: '2018 AHA/ACC Multisociety Guideline on Blood Cholesterol',
  },
  {
    key: 'trends',
    index: '03',
    title: 'Trends and anomalies',
    pill: { value: 'MODERATE', domain: 'vitals', label: 'Moderate trend' },
    body: (
      <>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className={cn('v3-num font-display3 leading-none text-dusk-text', FIGURE_SIZE.lg)}>87.4</span>
            <span className="ml-1.5 text-b4 font-medium text-dusk-faint">%</span>
            <p className="mt-2 text-b4 text-dusk-soft">Confidence, most recent reading</p>
          </div>
          <Sparkline data={[122, 134, 138, 142, 148, 142]} stroke={CHART.petrolSoft} width={112} height={38} />
        </div>
        <ul className="mt-4 space-y-2">
          {['Elevated systolic BP, 142 mmHg', 'Elevated glucose, 135 mg/dL'].map((alert) => (
            <li key={alert} className="flex items-start gap-2.5 text-b3 text-dusk-body">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sig-watch-500" />
              {alert}
            </li>
          ))}
        </ul>
      </>
    ),
    note: 'A classifier reads the last readings together, not one at a time.',
  },
];

const EnginesBand = () => (
  <DuskPanel
    pad="lg"
    className="v3-grain rounded-hero3 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 2xl:px-16 2xl:py-16"
  >
    <div className="max-w-2xl">
      <h2 className="text-d2 text-dusk-text">Real clinical logic, not a chatbot wrapper.</h2>
      <p className="mt-4 text-b1 leading-relaxed text-dusk-soft">
        Three engines run over the same record. Each one shows the number it produced and the
        guideline it came from.
      </p>
    </div>

    <div className="mt-10 grid gap-4 lg:grid-cols-3 2xl:gap-5">
      {ENGINES.map((engine) => (
        <article
          key={engine.key}
          className="flex h-full flex-col rounded-card3 border border-white/10 bg-white/5 p-5 2xl:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="v3-num font-mono3 text-m4 font-semibold text-petrol-300">{engine.index}</span>
            <StatusPill
              value={engine.pill.value}
              domain={engine.pill.domain}
              surface="dusk"
              label={engine.pill.label}
              size="sm"
            />
          </div>

          <h3 className="mt-4 text-d4 text-dusk-text">{engine.title}</h3>

          <div className="mt-4 flex-1">{engine.body}</div>

          <p className="mt-5 border-t border-white/10 pt-3 font-mono3 text-m4 leading-relaxed text-dusk-faint">
            {engine.note}
          </p>
        </article>
      ))}
    </div>
  </DuskPanel>
);

/* --------------------------------------------------------------- the page */

export const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [demoError, setDemoError] = useState('');
  const [pendingRole, setPendingRole] = useState(null);

  useEffect(() => {
    if (location.hash) scrollToHash(location.hash);
    else window.scrollTo({ top: 0 });
  }, [location.hash]);

  const openDemo = async (account) => {
    setDemoError('');
    setPendingRole(account.role);
    try {
      const res = await post('/api/v1/auth/login', { email: account.email, password: account.password });
      login(res.access_token, { id: res.user_id, name: res.name, role: res.role });
      navigate(roleHome(res.role));
    } catch (err) {
      setDemoError(errorText(err, 'The demo server is not responding right now. Start the backend and try again.'));
    } finally {
      setPendingRole(null);
    }
  };

  return (
    <MarketingShell>
      {/* ------------------------------------------------------------ hero */}
      <Container width="marketing" className="pt-14 sm:pt-20 2xl:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16 2xl:gap-24">
          <div>
            <h1 className="text-d1 text-sand-950">
              <span className="v3-mask">
                <motion.span {...revealLine(0.05)}>One record.</motion.span>
              </span>
              <span className="v3-mask">
                <motion.span {...revealLine(0.13)}>Every reading, report,</motion.span>
              </span>
              <span className="v3-mask">
                <motion.span {...revealLine(0.21)}>and medicine in it.</motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: easeOut, delay: 0.34 }}
              className="mt-6 max-w-prose text-b1 leading-relaxed text-sand-600"
            >
              Health Sync AI gathers the pieces from every hospital, pharmacy and lab, keeps them in
              one structured record, and explains what changed in plain words.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: easeOut, delay: 0.42 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button to="/v3/register" size="lg" iconRight={ArrowRight}>
                Create your account
              </Button>
              <Button href="#demo" variant="vellum" size="lg">
                Open a demo account
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.42, ease: easeOut, delay: 0.5 }}
              className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {['Free to create, no card', 'Plain words, not codes', 'Set up in about a minute'].map(
                (fact) => (
                  <li key={fact} className="flex items-center gap-2 text-b3 text-sand-600">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-petrol-500" />
                    {fact}
                  </li>
                )
              )}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.28 }}
            className="mx-auto w-full max-w-[352px] lg:mx-0"
          >
            <Spotlight className="rounded-[44px]" radius={360}>
              <DeviceFrame>
                <PhoneToday />
              </DeviceFrame>
            </Spotlight>
            <Meta className="mt-5 block text-center lg:text-left">
              The Today screen, showing the demo patient's real record.
            </Meta>
          </motion.div>
        </div>
      </Container>

      {/* ------------------------------------------------------- the problem */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="why" className="grid gap-12 lg:grid-cols-2 lg:gap-16 2xl:gap-24">
          <div>
            <Item>
              <h2 className="text-d2 text-sand-950">Your health story is scattered.</h2>
              <p className="mt-4 max-w-md text-b1 leading-relaxed text-sand-600">
                Not because anyone is careless. Because each system keeps its own copy, in its own
                format, behind its own password.
              </p>
            </Item>
            <div className="mt-8">
              <Item>
                <RuledRow
                  index="01"
                  title="Reports live in three portals"
                  body="Your hospital, your lab and your imaging centre each keep their own. None of them know about the others."
                />
              </Item>
              <Item>
                <RuledRow
                  index="02"
                  title="Medicines live on paper"
                  body="A pharmacy printout in a drawer, or a list you rewrite from memory at every appointment."
                />
              </Item>
              <Item>
                <RuledRow
                  index="03"
                  title="Nobody has the full picture"
                  body="So the same questions come back, the same tests get repeated, and changes slip between visits."
                />
              </Item>
            </div>
          </div>

          <Item>
            <div className="rounded-card3 border border-sand-200/90 bg-bone-raised p-6 shadow-v3card sm:p-7">
              <Caps>Where it lives now</Caps>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {['Hospital portal', 'Pharmacy printout', 'Lab PDF'].map((source) => (
                  <div
                    key={source}
                    className="rounded-ctl3 border border-dashed border-sand-300 bg-bone px-3 py-3 text-center text-b3 font-medium text-sand-600"
                  >
                    {source}
                  </div>
                ))}
              </div>

              <div aria-hidden className="mx-auto mt-3 h-8 w-px bg-gradient-to-b from-sand-300 to-petrol-300" />

              <div className="rounded-card3 border border-petrol-200 bg-petrol-50/70 p-5">
                <Caps className="text-petrol-800">Where it lives here</Caps>
                {/* Two up until xl: four caps labels in a 400px card collided at
                    1024 to 1280px, because a single caps word cannot wrap. */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 xl:grid-cols-4">
                  <Figure label="Conditions" value="1" size="sm" />
                  <Figure label="Medicines" value="2" size="sm" />
                  <Figure label="Lab values" value="5" size="sm" />
                  <Figure label="Events" value="31" size="sm" />
                </div>
                <p className="mt-5 text-b2 text-petrol-900">
                  One structure, one timeline, one place to look.
                </p>
              </div>
            </div>
          </Item>
        </Section>
      </Container>

      {/* ------------------------------------------------------ how it works */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="how-it-works">
          <Item>
            <h2 className="text-d2 text-sand-950">Three steps. No spreadsheets, no guesswork.</h2>
          </Item>

          <div className="mt-8 space-y-4">
            <Item>
              <Card pad="lg" className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)]">
                <div>
                  <Caps>Step one</Caps>
                  <h3 className="mt-2 text-d4 text-sand-950">Bring your records</h3>
                  <p className="mt-2 text-b2 leading-relaxed text-sand-600">
                    Upload a lab report as a PDF or a photo of the printout. Values are read,
                    named, and checked against their reference range.
                  </p>
                </div>
                <div className="overflow-hidden rounded-ctl3 border border-sand-200">
                  {[
                    { name: 'Arjun_Kumar_Lipid_Panel.pdf', values: '6 values' },
                    { name: 'Arjun_Kumar_CBC.pdf', values: '5 values' },
                  ].map((file, index) => (
                    <div
                      key={file.name}
                      className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? 'border-t border-sand-200' : ''}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-petrol-50 text-petrol-700">
                        <FileText className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono3 text-m4 text-sand-800">{file.name}</span>
                        <Meta>Read automatically</Meta>
                      </span>
                      <span className="v3-num shrink-0 font-mono3 text-m4 text-sand-600">{file.values}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Item>

            <Item>
              <Card pad="lg" className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)]">
                <div>
                  <Caps>Step two</Caps>
                  <h3 className="mt-2 text-d4 text-sand-950">It keeps watch</h3>
                  <p className="mt-2 text-b2 leading-relaxed text-sand-600">
                    Readings land on a timeline, and the trend classifier looks at the pattern, not
                    a single number.
                  </p>
                </div>
                <div className="rounded-ctl3 border border-sand-200 p-5">
                  <div className="flex items-end justify-between gap-6">
                    <Figure label="Systolic, last six" value="142" unit="mmHg" size="sm" />
                    <Sparkline data={[122, 134, 138, 142, 148, 142]} width={180} height={52} />
                  </div>
                  <div className="mt-4 flex items-start gap-2.5 border-t border-sand-200 pt-4">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sig-watch-500" />
                    <p className="text-b3 text-sand-700">
                      Elevated systolic pressure across the last three readings.
                    </p>
                  </div>
                </div>
              </Card>
            </Item>

            <Item>
              <Card pad="lg" className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)]">
                <div>
                  <Caps>Step three</Caps>
                  <h3 className="mt-2 text-d4 text-sand-950">Ask, in plain words</h3>
                  <p className="mt-2 text-b2 leading-relaxed text-sand-600">
                    Answers come from your own record, list the records they used, and refuse what
                    they should refuse.
                  </p>
                </div>
                <div className="space-y-3 rounded-ctl3 border border-sand-200 p-5">
                  <ChatBubble role="user">What does my lipid panel mean?</ChatBubble>
                  <ChatBubble
                    role="assistant"
                    sources={['Recent Laboratory Parameters', 'Active Medications List']}
                  >
                    {`**Total cholesterol** is 215 mg/dL, above the reference of 200. Your LDL is 137 mg/dL. Two things move this number: what you eat, and whether you are taking a statin as prescribed.`}
                  </ChatBubble>
                </div>
              </Card>
            </Item>
          </div>
        </Section>
      </Container>

      {/* -------------------------------------------------------- the engines */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="engines">
          <Item>
            <EnginesBand />
          </Item>
        </Section>
      </Container>

      {/* ------------------------------------------------------ the assistant */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="assistant" className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16 2xl:gap-24">
          <div>
            <Item>
              <h2 className="text-d2 text-sand-950">An assistant that shows where its answers come from.</h2>
              <p className="mt-4 text-b1 leading-relaxed text-sand-600">
                Every answer lists the parts of your record it used. Refusals are a feature: the
                things an assistant must not do are the things it will not do.
              </p>
            </Item>
            <div className="mt-8 space-y-3">
              {[
                { icon: Sparkles, text: 'It can explain, organise and warn.' },
                { icon: HeartPulse, text: 'It can read a trend across your last readings.' },
                { icon: ShieldCheck, text: 'It will not dose, diagnose, or triage an emergency.' },
              ].map((rule) => (
                <Item key={rule.text}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile3 bg-petrol-50 text-petrol-700">
                      <rule.icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <p className="pt-1 text-b2 text-sand-700">{rule.text}</p>
                  </div>
                </Item>
              ))}
            </div>
          </div>

          <Item>
            <Card pad="lg">
              <PanelTitle size="lg" icon={Sparkles} action={<SafetyMark />}>
                Sync AI
              </PanelTitle>
              <div className="space-y-4">
                <ChatBubble role="user">Should I double my metformin dose?</ChatBubble>
                <ChatBubble
                  role="assistant"
                  meta={<Meta className="text-sand-600">Refused by the safety check</Meta>}
                >
                  {`**Medication Safety Alert**: I cannot recommend changing a dose. That decision needs your prescriber, who knows your kidney function, your HbA1c, and what else you take.

Your record shows **Metformin HCl 500 mg, twice daily**, prescribed by Dr. Robert Smith. If your readings suggest it is not enough, that is exactly what a follow-up visit is for.`}
                </ChatBubble>
                <ChatBubble role="user">Then what can you tell me about it?</ChatBubble>
                <ChatBubble
                  role="assistant"
                  sources={['Active Medications List', 'Recent Vitals Trends']}
                >
                  {`Two useful things:

1. Your glucose has run 115 to 145 mg/dL over the last four readings.
2. Metformin and lisinopril together can lower glucose a little more, which is worth knowing at your next test.`}
                </ChatBubble>
              </div>
            </Card>
          </Item>
        </Section>
      </Container>

      {/* -------------------------------------------------------- care teams */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="care-teams" className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16 2xl:gap-24">
          <div>
            <Item>
              <h2 className="text-d2 text-sand-950">One record, two views.</h2>
              <p className="mt-4 text-b1 leading-relaxed text-sand-600">
                The patient's view is the record above. This is the doctor's: everything that
                matters before a consult, on one screen.
              </p>
            </Item>
            <div className="mt-8 space-y-3.5">
              {[
                'Assigned patients only, enforced by the server.',
                'Risk context, interaction warnings and recent values together.',
                'Clinical notes append to the patient timeline, and the access is audited.',
              ].map((line) => (
                <Item key={line}>
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-petrol-500" />
                    <p className="text-b2 text-sand-700">{line}</p>
                  </div>
                </Item>
              ))}
            </div>
            <Item className="mt-8">
              <Button
                variant="vellum"
                size="lg"
                loading={pendingRole === 'DOCTOR'}
                onClick={() => openDemo(DEMO_ACCOUNTS[1])}
                iconRight={pendingRole === 'DOCTOR' ? undefined : ArrowRight}
              >
                Open the doctor demo
              </Button>
            </Item>
          </div>

          <Item className="min-w-0">
            <Card pad="lg">
              <PanelTitle size="lg" icon={Stethoscope} count="2 assigned">
                Roster
              </PanelTitle>
              <TableWrap>
                <Table minWidth={560}>
                  <THead>
                    <TR>
                      <TH>Patient</TH>
                      <TH>Age</TH>
                      <TH>Conditions</TH>
                      <TH align="right">Medicines</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {[
                      { name: 'Arjun Kumar', email: 'patient@healthsync.demo', age: 46, conditions: ['Type 2 Diabetes'], medicines: 2 },
                      { name: 'Meera Sharma', email: 'meera.sharma@demo', age: 34, conditions: ['Asthma'], medicines: 1 },
                    ].map((row) => (
                      <TR key={row.email}>
                        <TD>
                          <span className="block text-b3 font-semibold text-sand-900">{row.name}</span>
                          <Mono>{row.email}</Mono>
                        </TD>
                        <TD>{row.age}</TD>
                        <TD>
                          <span className="flex flex-wrap gap-1.5">
                            {row.conditions.map((condition) => (
                              <Tag key={condition} tone="dusk" case="sentence">
                                {condition}
                              </Tag>
                            ))}
                          </span>
                        </TD>
                        <TD align="right">{row.medicines} active</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
              <p className="mt-4 border-t border-sand-200 pt-4 text-b4 leading-relaxed text-sand-600">
                Opening a patient who is not assigned to you is refused by the server and written to
                the audit log.
              </p>
            </Card>
          </Item>
        </Section>
      </Container>

      {/* --------------------------------------------------------- honesty */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="honesty">
          <Item>
            <h2 className="text-d2 text-sand-950">What this is, and what it is not.</h2>
            <p className="mt-4 max-w-prose text-b1 leading-relaxed text-sand-600">
              This is a student major project: a working system with real clinical logic behind it,
              running on seeded demo data. Both halves of that sentence matter.
            </p>
          </Item>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Item>
              <Card pad="lg">
                <Caps>Working today</Caps>
                <ul className="mt-4 space-y-3">
                  {[
                    'Real accounts, real sessions, real role separation.',
                    'Report upload with automatic value extraction and reference ranges.',
                    'Drug interaction checks on every active medicine.',
                    '10-year ASCVD risk and a vitals trend classifier.',
                    'FHIR R4 export and HIPAA-style de-identified research export.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-petrol-500" />
                      <span className="text-b2 text-sand-700">{line}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Item>
            <Item>
              <Card pad="lg">
                <Caps>Not pretend</Caps>
                <ul className="mt-4 space-y-3">
                  {[
                    'Not a medical service, and not a substitute for clinical advice.',
                      'Not deployed for real patients: the data is seeded and reset at will.',
                      'No clinical certification, no billing, and no invented testimonials.',
                    ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-petrol-500" />
                      <span className="text-b2 text-sand-700">{line}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Item>
          </div>
        </Section>
      </Container>

      {/* ------------------------------------------------------------ demo */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="demo">
          <Item>
            <h2 className="text-d2 text-sand-950">Three demo accounts, no sign-up needed.</h2>
            <p className="mt-4 max-w-prose text-b1 leading-relaxed text-sand-600">
              Each opens the same seeded record through a different role. No typing,
              no sign-up, nothing to install.
            </p>
          </Item>

          {demoError && (
            <Item className="mt-6">
              <p role="alert" className="rounded-card3 border border-sig-critical-100 bg-sig-critical-50 px-4 py-3.5 text-b2 text-sig-critical-700">
                {demoError}
              </p>
            </Item>
          )}

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {DEMO_ACCOUNTS.map((account, index) => (
              <Item key={account.role}>
                <Spotlight className="h-full rounded-card3">
                  <Card pad="lg" className="flex h-full flex-col">
                    <Caps>{account.label}</Caps>
                    <h3 className="mt-2 text-d4 text-sand-950">{account.name}</h3>
                    <p className="mt-2 flex-1 text-b2 leading-relaxed text-sand-600">{account.blurb}</p>

                    <dl className="mt-5 space-y-1.5 rounded-ctl3 border border-sand-200 bg-bone px-3.5 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-b4 text-sand-600">Email</dt>
                        <dd className="truncate font-mono3 text-m4 text-sand-800">{account.email}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-b4 text-sand-600">Password</dt>
                        <dd className="font-mono3 text-m4 text-sand-800">{account.password}</dd>
                      </div>
                    </dl>

                    <Button
                      className="mt-4"
                      size="lg"
                      block
                      variant={index === 0 ? 'petrol' : 'vellum'}
                      loading={pendingRole === account.role}
                      onClick={() => openDemo(account)}
                    >
                      Open the {account.label.toLowerCase()} demo
                    </Button>
                  </Card>
                </Spotlight>
              </Item>
            ))}
          </div>

          <Item className="mt-6">
            <Meta>
              These accounts are part of the prototype and are reset with the seeded database.
            </Meta>
          </Item>
        </Section>
      </Container>

      {/* -------------------------------------------------------------- FAQ */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="faq">
          <Item>
            <h2 className="text-d2 text-sand-950">Asked plainly, answered plainly.</h2>
          </Item>
          <div className="mt-8 max-w-3xl">
            {[
              {
                q: 'Is my data safe here?',
                a: 'Accounts are real, passwords are hashed, and sessions are token-based. The data itself is seeded demo data until you add your own, and it stays in this app.',
              },
              {
                q: 'Can the assistant change my prescription?',
                a: 'No. It refuses dosing questions by design and points you to your prescriber. That refusal is a safety feature, and it is visible in the interface.',
              },
              {
                q: 'What happens to a report I upload?',
                a: 'It is stored with your record, its values are extracted and checked against reference ranges, and a timeline event is written. You can delete it at any time.',
              },
              {
                q: 'Who can see my record?',
                a: 'You. A doctor can only open records assigned to them, and every access is written to an append-only audit log.',
              },
              {
                q: 'Is this a real medical product?',
                a: 'No. It is an academic major project: real engineering, real clinical logic, not a clinical service.',
              },
            ].map((item) => (
              <Item key={item.q}>
                <details className="group border-t border-sand-200 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-d5 text-sand-950 marker:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sand-300 text-sand-600 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-prose text-b2 leading-relaxed text-sand-600">{item.a}</p>
                </details>
              </Item>
            ))}
          </div>
        </Section>
      </Container>

      {/* ---------------------------------------------------------- closing */}
      <Container width="marketing" className="pt-24 sm:pt-32 2xl:pt-40">
        <Section id="closing">
          <DuskPanel pad="lg" className="v3-grain rounded-hero3 px-6 py-14 text-center sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-d2 text-dusk-text">
              Start with one report. The record builds itself from there.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-b1 leading-relaxed text-dusk-soft">
              Create an account and add what you have handy. Or look around the demo first, no
              account needed.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button to="/v3/register" size="lg" iconRight={ArrowRight}>
                Create your account
              </Button>
              <Button href="#demo" variant="dusk" size="lg">
                See the demo first
              </Button>
            </div>
          </DuskPanel>
        </Section>
      </Container>
    </MarketingShell>
  );
};

export default Home;
