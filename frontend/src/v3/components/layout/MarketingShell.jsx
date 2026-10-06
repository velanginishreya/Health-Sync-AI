import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Container } from './Container';
import { Button, IconButton } from '../ui/Button';
import { Drawer } from '../ui/Overlay';
import { Wordmark } from '../ui/LogoMark';
import { Caps, Meta } from '../ui/Text';
import { useAuth } from '../../../contexts/AuthContext';
import { roleHome } from './nav';

const LINKS = [
  { to: '/v3#how-it-works', label: 'How it works' },
  { to: '/v3#engines', label: 'The engines' },
  { to: '/v3#care-teams', label: 'For doctors' },
  { to: '/v3#honesty', label: 'Straight answers' },
];

const MARKETING_LINK =
  'rounded-ctl3 px-3 py-2 text-b3 font-medium text-sand-700 transition-colors duration-150 hover:bg-sand-200/60 hover:text-sand-950';

const FooterColumn = ({ title, children }) => (
  <div>
    <Caps>{title}</Caps>
    <ul className="mt-4 space-y-2">{children}</ul>
  </div>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="inline-flex min-h-8 items-center text-b3 text-sand-600 transition-colors hover:text-petrol-700"
    >
      {children}
    </Link>
  </li>
);

export const MarketingShell = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ctl3 focus:bg-sand-950 focus:px-4 focus:py-2.5 focus:text-b2 focus:font-semibold focus:text-bone"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-sand-200/80 bg-bone/90 backdrop-blur-md">
        <Container width="marketing" className="flex h-16 items-center gap-4">
          <Link to="/v3" aria-label="Health Sync AI home" className="flex min-h-touch items-center rounded-ctl3">
            <Wordmark />
          </Link>

          <nav aria-label="Site" className="ml-6 hidden items-center gap-0.5 lg:flex">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className={MARKETING_LINK}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <Button to={roleHome(user.role)} variant="vellum" size="sm">
                Open my workspace
              </Button>
            ) : (
              <>
                <NavLink to="/v3/login" className={`${MARKETING_LINK} hidden sm:inline-flex`}>
                  Sign in
                </NavLink>
                <Button to="/v3/register" size="sm" className="hidden sm:inline-flex">
                  Create your account
                </Button>
                <IconButton
                  label="Open menu"
                  icon={Menu}
                  variant="quiet"
                  onClick={() => setMenuOpen(true)}
                  className="lg:hidden"
                />
              </>
            )}
          </div>
        </Container>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <footer className="mt-20 border-t border-sand-200 bg-bone-sunken/60">
        <Container width="marketing" className="py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Wordmark />
              <p className="mt-3 max-w-xs text-b3 leading-relaxed text-sand-600">
                A personalized digital twin: one structured health record, with a safety-aware
                assistant that reasons over it.
              </p>
            </div>

            <FooterColumn title="Product">
              <FooterLink to="/v3#how-it-works">How it works</FooterLink>
              <FooterLink to="/v3#engines">The engines</FooterLink>
              <FooterLink to="/v3#care-teams">For doctors</FooterLink>
              <FooterLink to="/v3#demo">Demo accounts</FooterLink>
            </FooterColumn>

            <FooterColumn title="Your record">
              <FooterLink to="/v3/patient/digital-twin">Health profile</FooterLink>
              <FooterLink to="/v3/patient/vitals">Vitals</FooterLink>
              <FooterLink to="/v3/patient/medications">Medicines</FooterLink>
              <FooterLink to="/v3/patient/ai-assistant">Ask Sync AI</FooterLink>
            </FooterColumn>

            <FooterColumn title="Honesty">
              <FooterLink to="/v3#honesty">Straight answers</FooterLink>
              <FooterLink to="/v3/login">Sign in</FooterLink>
              <FooterLink to="/v3/register">Create an account</FooterLink>
            </FooterColumn>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Meta>
              Health Sync AI is an academic major project. Not a medical service, not a substitute
              for clinical advice.
            </Meta>
            <Meta className="shrink-0">Seeded demo data · Built with FastAPI and React</Meta>
          </div>
        </Container>
      </footer>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu">
        <div className="px-5 pb-2 pt-5">
          <Wordmark />
        </div>
        <nav aria-label="Site" className="flex flex-col gap-0.5 px-3 py-3">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex min-h-12 items-center rounded-ctl3 px-3 text-b1 font-medium text-sand-800 transition-colors hover:bg-sand-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-sand-200 p-4">
          <Button to="/v3/register" size="lg" block>
            Create your account
          </Button>
          <Button to="/v3/login" variant="vellum" size="lg">
            Sign in
          </Button>
          <Meta className="mt-1 text-center">
            Prototype. Seeded demo data, not real patients.
          </Meta>
        </div>
      </Drawer>
    </>
  );
};
