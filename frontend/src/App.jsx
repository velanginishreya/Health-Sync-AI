import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { PatientDashboard } from './pages/patient/PatientDashboard';
import { DigitalTwin } from './pages/patient/DigitalTwin';
import { MedicalHistory } from './pages/patient/MedicalHistory';
import { Medications } from './pages/patient/Medications';
import { Vitals } from './pages/patient/Vitals';
import { Reports } from './pages/patient/Reports';
import { Timeline } from './pages/patient/Timeline';
import { AIAssistant } from './pages/patient/AIAssistant';
import { Appointments } from './pages/patient/Appointments';

import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientDetail } from './pages/doctor/PatientDetail';

import { AdminDashboard } from './pages/admin/AdminDashboard';

// ---- v3 redesign â€” its own route tree under /v3; v1 is untouched ----
import { V3Root } from './v3/components/layout/V3Root';
import { Home as HomeV3 } from './v3/pages/Home';
import { Login as LoginV3 } from './v3/pages/Login';
import { Register as RegisterV3 } from './v3/pages/Register';
import { PatientDashboard as PatientDashboardV3 } from './v3/pages/patient/Dashboard';
import { Vitals as VitalsV3 } from './v3/pages/patient/Vitals';
import { Medications as MedicationsV3 } from './v3/pages/patient/Medications';
import { Reports as ReportsV3 } from './v3/pages/patient/Reports';
import { Timeline as TimelineV3 } from './v3/pages/patient/Timeline';
import { AIAssistant as AIAssistantV3 } from './v3/pages/patient/AIAssistant';
import { Appointments as AppointmentsV3 } from './v3/pages/patient/Appointments';
import { MedicalHistory as MedicalHistoryV3 } from './v3/pages/patient/MedicalHistory';
import { DigitalTwin as DigitalTwinV3 } from './v3/pages/patient/DigitalTwin';
import { DoctorDashboard as DoctorDashboardV3 } from './v3/pages/doctor/Dashboard';
import { DoctorPatients as DoctorPatientsV3 } from './v3/pages/doctor/Patients';
import { DoctorAppointments as DoctorAppointmentsV3 } from './v3/pages/doctor/Appointments';
import { DoctorPatientDetail as DoctorPatientDetailV3 } from './v3/pages/doctor/PatientDetail';
import { AdminOverview as AdminOverviewV3 } from './v3/pages/admin/Overview';
import { AdminUsers as AdminUsersV3 } from './v3/pages/admin/Users';
import { AdminAuditLogs as AdminAuditLogsV3 } from './v3/pages/admin/AuditLogs';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="p-16 text-center text-ink-400 text-sm font-medium">
        Authenticating session&hellip;
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Same as ProtectedRoute above, but for the /v3 tree â€” its own login/home, and its
// own v3-typography loading state, so a signed-out visitor never leaves /v3.
const ProtectedRouteV3 = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="p-16 text-center text-sand-600 text-b2 font-medium">
        Signing you in&hellip;
      </div>
    );
  }
  if (!user) return <Navigate to="/v3/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/v3" replace />;
  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // The /v3 redesign supplies its own chrome (MarketingShell/AppShell rendered
  // inside its own root) - it renders standalone here rather than inheriting the
  // v1 DemoBanner/Navbar/Sidebar.
  if (location.pathname.startsWith('/v3')) {
    return children;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <DemoBanner />
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      {user ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {children}
          </main>
        </div>
      ) : (
        // Public surfaces (home, login, register) go full-bleed â€” they compose their
        // own width-constrained sections rather than inheriting the dashboard shell.
        <main className="flex-1">{children}</main>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Workspace */}
            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/digital-twin" element={<ProtectedRoute allowedRoles={['PATIENT']}><DigitalTwin /></ProtectedRoute>} />
            <Route path="/patient/medical-history" element={<ProtectedRoute allowedRoles={['PATIENT']}><MedicalHistory /></ProtectedRoute>} />
            <Route path="/patient/medications" element={<ProtectedRoute allowedRoles={['PATIENT']}><Medications /></ProtectedRoute>} />
            <Route path="/patient/vitals" element={<ProtectedRoute allowedRoles={['PATIENT']}><Vitals /></ProtectedRoute>} />
            <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['PATIENT']}><Reports /></ProtectedRoute>} />
            <Route path="/patient/timeline" element={<ProtectedRoute allowedRoles={['PATIENT']}><Timeline /></ProtectedRoute>} />
            <Route path="/patient/ai-assistant" element={<ProtectedRoute allowedRoles={['PATIENT']}><AIAssistant /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['PATIENT']}><Appointments /></ProtectedRoute>} />

            {/* Doctor Workspace */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={['DOCTOR']}><PatientDetail /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />

            {/* Admin Workspace */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

            {/* ---- v3 redesign â€” separate route tree, own layout shells, same backend ---- */}
            <Route path="/v3" element={<V3Root><HomeV3 /></V3Root>} />
            <Route path="/v3/login" element={<V3Root><LoginV3 /></V3Root>} />
            <Route path="/v3/register" element={<V3Root><RegisterV3 /></V3Root>} />

            <Route path="/v3/patient/dashboard" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><PatientDashboardV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/digital-twin" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><DigitalTwinV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/medical-history" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><MedicalHistoryV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/medications" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><MedicationsV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/vitals" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><VitalsV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/reports" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><ReportsV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/timeline" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><TimelineV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/ai-assistant" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><AIAssistantV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/patient/appointments" element={<V3Root><ProtectedRouteV3 allowedRoles={['PATIENT']}><AppointmentsV3 /></ProtectedRouteV3></V3Root>} />

            <Route path="/v3/doctor/dashboard" element={<V3Root><ProtectedRouteV3 allowedRoles={['DOCTOR']}><DoctorDashboardV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/doctor/patients" element={<V3Root><ProtectedRouteV3 allowedRoles={['DOCTOR']}><DoctorPatientsV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/doctor/patients/:id" element={<V3Root><ProtectedRouteV3 allowedRoles={['DOCTOR']}><DoctorPatientDetailV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/doctor/appointments" element={<V3Root><ProtectedRouteV3 allowedRoles={['DOCTOR']}><DoctorAppointmentsV3 /></ProtectedRouteV3></V3Root>} />

            <Route path="/v3/admin/dashboard" element={<V3Root><ProtectedRouteV3 allowedRoles={['ADMIN']}><AdminOverviewV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/admin/users" element={<V3Root><ProtectedRouteV3 allowedRoles={['ADMIN']}><AdminUsersV3 /></ProtectedRouteV3></V3Root>} />
            <Route path="/v3/admin/audit-logs" element={<V3Root><ProtectedRouteV3 allowedRoles={['ADMIN']}><AdminAuditLogsV3 /></ProtectedRouteV3></V3Root>} />

            <Route path="/v3/*" element={<Navigate to="/v3" replace />} />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;