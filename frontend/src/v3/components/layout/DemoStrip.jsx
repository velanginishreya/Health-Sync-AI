import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { Meta } from '../ui/Text';

/*
  The honest disclosure, present on every screen, small, and never the visual
  centrepiece. Informational text plus a single quiet link home to the explanation:
  navigating the SPA must not leak a full page load, so it is a router Link.
*/
export const DemoStrip = ({ className = '' }) => (
  <div className={`border-b border-sand-200/80 bg-sand-100/70 ${className}`}>
    <Container width="wide" className="flex h-[var(--v3-strip-h)] items-center justify-between gap-4">
      <Meta className="min-w-0 truncate">
        <span className="font-semibold text-sand-700">Prototype.</span> Seeded demo data, not real patients.
      </Meta>
      <Link
        to="/v3#honesty"
        className="inline-flex min-h-8 shrink-0 items-center text-b4 font-medium text-sand-600 underline decoration-sand-300 underline-offset-2 transition-colors hover:text-petrol-700 hover:decoration-petrol-300"
      >
        What this is
      </Link>
    </Container>
  </div>
);
