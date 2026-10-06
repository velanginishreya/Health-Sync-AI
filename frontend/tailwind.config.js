/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // v1 "Clinical Control Room"
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // v3 "Vital Clay": Spectral carries the display voice and the first-class
        // figures (light weights at scale), Schibsted Grotesk runs the interface,
        // DM Mono marks measured values. Used only under /v3.
        display3: ['"Spectral"', 'Georgia', 'ui-serif', 'serif'],
        body3: ['"Schibsted Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono3: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // ---- v3 "Vital Clay" palette (the /v3 surface) ----
        // Bone canvas, sand type, one deep-petrol accent, dusk instrument surfaces,
        // three labeled clinical states (sig). No purple anywhere in the system.
        bone: {
          DEFAULT: '#F4F1E9',
          raised: '#FFFDF8',
          sunken: '#EBE7DC',
          deep: '#E2DCCC',
        },
        sand: {
          950: '#141210',
          900: '#23201A',
          800: '#3A362E',
          700: '#544E43',
          600: '#6E6759',
          500: '#8E8674',
          400: '#B5AC99',
          300: '#D8D1C1',
          200: '#E9E4D8',
          100: '#F4F1E9',
          50: '#FAF8F3',
        },
        petrol: {
          950: '#04191C',
          900: '#072E33',
          800: '#093C42',
          700: '#0B4C53',
          600: '#0E5F66',
          500: '#17767C',
          400: '#3F9498',
          300: '#77B8BB',
          200: '#ABD5D6',
          100: '#D5EAEA',
          50: '#EEF6F6',
        },
        dusk: {
          950: '#06120E',
          900: '#0A1A15',
          800: '#102420',
          700: '#17302A',
          600: '#204038',
          // Text roles on the dusk material, named so no surface hard-codes a hex.
          // Tuned green-warm so they sit inside the ink rather than on top of it.
          text: '#F2EFE5',
          body: '#CBD9D8',
          soft: '#A6BFB4',
          faint: '#87A297',
          dim: '#7A948C',
        },
        sig: {
          // 300 is the on-dusk text step: the same clinical meaning, readable on the
          // dark green ink without a light pill shouting across it.
          good: { 50: '#E8F5EE', 100: '#CDEBDB', 300: '#9FE0BE', 500: '#1E7A4D', 600: '#17643E', 700: '#0F4C2E' },
          watch: { 50: '#FBF2DF', 100: '#F2E0B4', 300: '#F0CE8A', 500: '#A8701A', 600: '#8A5A12', 700: '#6D460C' },
          critical: { 50: '#FBEBE9', 100: '#F3D2CE', 300: '#F5B3A8', 500: '#B3261E', 600: '#93211A', 700: '#731812' },
        },
        // ---- v1 "Clinical Control Room" palette (the root routes) ----
        // Graphite ink: primary text & dark control-room surfaces
        ink: {
          950: '#0A0E13',
          900: '#10161D',
          800: '#1A222B',
          700: '#2A343F',
          600: '#414D5A',
          500: '#5B6875',
          400: '#7C8996',
          300: '#A3AEB8',
          200: '#C7CFD6',
          100: '#E4E8EB',
          50: '#F3F5F6',
        },
        // Warm paper surfaces: the app ground
        surface: {
          DEFAULT: '#F6F7F5',
          raised: '#FFFFFF',
          sunken: '#EEF0ED',
        },
        // Hairline structural lines
        line: {
          DEFAULT: '#E1E4E1',
          strong: '#C9CDC9',
        },
        // Instrument blue: the single interactive/brand accent
        accent: {
          950: '#061B33',
          900: '#0B2A4D',
          800: '#123B68',
          700: '#1A4E88',
          600: '#2563A8',
          500: '#3878C2',
          400: '#6098D6',
          300: '#93BAE5',
          200: '#C3D8F0',
          100: '#E1EDF8',
          50: '#F1F6FC',
        },
        // Semantic clinical status: reserved strictly for real state, never decoration
        status: {
          good: { 50: '#EAF6EF', 100: '#D2EEDE', 500: '#1F8354', 600: '#16794F', 700: '#0F5E3D' },
          watch: { 50: '#FBF1E1', 100: '#F5E1BE', 500: '#B5780F', 600: '#9C670C', 700: '#7A5109' },
          critical: { 50: '#FBEAE9', 100: '#F5D1CE', 500: '#C23B32', 600: '#B3261E', 700: '#8E1D17' },
        },
      },
      fontSize: {
        // v3 type scale: every step named, nothing arbitrary. Display steps are
        // Spectral (light at scale; display never goes bold); body/UI steps are
        // Schibsted Grotesk; m* steps are DM Mono readouts.
        d1: ['clamp(2.6rem, 1.6rem + 3.6vw, 5.25rem)', { lineHeight: '1.04', letterSpacing: '-0.024em', fontWeight: '300' }],
        d2: ['clamp(1.95rem, 1.4rem + 2vw, 3.4rem)', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '300' }],
        d3: ['1.875rem', { lineHeight: '1.16', letterSpacing: '-0.014em', fontWeight: '400' }],
        d4: ['1.3125rem', { lineHeight: '1.24', letterSpacing: '-0.014em', fontWeight: '560' }],
        d5: ['1.0625rem', { lineHeight: '1.34', letterSpacing: '-0.008em', fontWeight: '600' }],
        b1: ['1rem', { lineHeight: '1.62' }],
        b2: ['0.9375rem', { lineHeight: '1.55' }],
        b3: ['0.8125rem', { lineHeight: '1.5' }],
        b4: ['0.75rem', { lineHeight: '1.45' }],
        lbl: ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        mic: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.09em', fontWeight: '600' }],
        m1: ['1.25rem', { lineHeight: '1.15' }],
        m2: ['0.9375rem', { lineHeight: '1.4' }],
        m3: ['0.8125rem', { lineHeight: '1.4' }],
        m4: ['0.6875rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        // v1
        control: '0.5rem',
        card: '0.875rem',
        // v3: clay controls sit at 12px, surfaces go up to 20px, icon tiles take
        // 10px. Nothing else exists: radius drift is how a system decays.
        tile3: '0.625rem',
        ctl3: '0.75rem',
        card3: '1rem',
        panel3: '1.25rem',
        hero3: '1.75rem',
      },
      minHeight: {
        // One touch-target token: 44px, per WCAG 2.5.5 and Apple HIG.
        touch: '44px',
      },
      boxShadow: {
        // v1
        panel: '0 1px 2px rgba(10,14,19,0.05), 0 1px 1px rgba(10,14,19,0.03)',
        overlay: '0 12px 32px rgba(10,14,19,0.18), 0 2px 8px rgba(10,14,19,0.08)',
        // v3: layered soft depth. Two layers by default, three for true overlays.
        v3card: '0 1px 2px rgba(20,18,16,0.04), 0 10px 26px -16px rgba(20,18,16,0.12)',
        v3lift: '0 2px 4px rgba(20,18,16,0.05), 0 22px 44px -22px rgba(20,18,16,0.20)',
        v3menu: '0 2px 6px rgba(20,18,16,0.06), 0 18px 40px -18px rgba(20,18,16,0.24)',
        v3sheet: '0 40px 80px -28px rgba(20,18,16,0.40), 0 6px 20px -8px rgba(20,18,16,0.14)',
        v3toast: '0 4px 10px -2px rgba(6,20,22,0.30), 0 24px 48px -16px rgba(6,20,22,0.44)',
      },
      letterSpacing: {
        // v1
        label: '0.07em',
        // v3: caps labels on sand and dusk both use one tracking value
        caps: '0.09em',
      },
    },
  },
  plugins: [],
}
