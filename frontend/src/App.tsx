import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import PatientLayout from './components/PatientLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Health from './pages/Health';
import Monitoring from './pages/Monitoring';
import Prescriptions from './pages/Prescriptions';
import Doctor from './pages/Doctor';
import Assistant from './pages/Assistant';
import Emergency from './pages/Emergency';
import Reports from './pages/Reports';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';

// Doctor imports
import DoctorLayout from './components/doctor/DoctorLayout';
import DoctorLogin from './pages/doctor/DoctorLogin';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetail from './pages/doctor/PatientDetail';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorNotes from './pages/doctor/DoctorNotes';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorReports from './pages/doctor/DoctorReports';
import ClinicalAIWidget from './pages/doctor/ClinicalAIWidget';
import DoctorPrivacy from './pages/doctor/DoctorPrivacy';
import DoctorSettings from './pages/doctor/DoctorSettings';
import DoctorEmergencies from './pages/doctor/DoctorEmergencies';

// Guardian imports
import GuardianLayout from './components/guardian/GuardianLayout';
import GuardianLogin from './pages/guardian/GuardianLogin';
import GuardianDashboard from './pages/guardian/GuardianDashboard';
import FamilyList from './pages/guardian/FamilyList';
import PatientDetailGuardian from './pages/guardian/PatientDetail';
import DoctorUpdatesGuardian from './pages/guardian/DoctorUpdates';
import MedicationsGuardian from './pages/guardian/Medications';
import LocationGuardian from './pages/guardian/Location';
import RiskGuardian from './pages/guardian/Risk';
import HistoryGuardian from './pages/guardian/History';
import CareTeamGuardian from './pages/guardian/CareTeam';
import AssistantGuardian from './pages/guardian/Assistant';
import PrivacyGuardian from './pages/guardian/Privacy';
import NotificationsGuardian from './pages/guardian/Notifications';
import SettingsGuardian from './pages/guardian/Settings';
import EmergenciesGuardian from './pages/guardian/Emergencies';

// Volunteer imports
import VolunteerLayout from './components/volunteer/VolunteerLayout';
import VolunteerLogin from './pages/volunteer/VolunteerLogin';
import VolunteerRegister from './pages/volunteer/VolunteerRegister';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerEmergencies from './pages/volunteer/VolunteerEmergencies';
import VolunteerEmergencyDetail from './pages/volunteer/VolunteerEmergencyDetail';
import VolunteerResourcePage from './pages/volunteer/VolunteerResourcePage';
import VolunteerAssistant from './pages/volunteer/VolunteerAssistant';

// College administration imports
import CollegeLayout from './components/college/CollegeLayout';
import CollegeLogin from './pages/college/CollegeLogin';
import CollegeDashboard from './pages/college/CollegeDashboard';
import CollegeResourcePage from './pages/college/CollegeResourcePage';
import CollegeAssistant from './pages/college/CollegeAssistant';
import StudentDetail from './pages/college/StudentDetail';
import Landing from './pages/Landing';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Patient Authentication paths */}
          <Route path="/patient/login" element={<Login />} />
          <Route path="/patient/register" element={<Register />} />
          
          {/* Patient Console paths (Protected) */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="health" element={<Health />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="doctor" element={<Doctor />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="reports" element={<Reports />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Doctor Authentication paths */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          
          {/* Doctor Console paths (Protected) */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorDashboard />} />
            <Route path="patients/:patientId" element={<PatientDetail />} />
            <Route path="emergencies" element={<DoctorEmergencies />} />
            <Route path="assistant" element={<ClinicalAIWidget />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="notes" element={<DoctorNotes />} />
            <Route path="reports" element={<DoctorReports />} />
            <Route path="privacy" element={<DoctorPrivacy />} />
            <Route path="settings" element={<DoctorSettings />} />
          </Route>

          {/* Guardian Authentication paths */}
          <Route path="/guardian/login" element={<GuardianLogin />} />

          {/* Guardian Console paths (Protected) */}
          <Route
            path="/guardian"
            element={
              <ProtectedRoute allowedRoles={['guardian']}>
                <GuardianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/guardian/dashboard" replace />} />
            <Route path="dashboard" element={<GuardianDashboard />} />
            <Route path="family" element={<FamilyList />} />
            <Route path="patient/:patientId" element={<PatientDetailGuardian />} />
            <Route path="health" element={<PatientDetailGuardian />} />
            <Route path="risk" element={<RiskGuardian />} />
            <Route path="emergencies" element={<EmergenciesGuardian />} />
            <Route path="location" element={<LocationGuardian />} />
            <Route path="care-team" element={<CareTeamGuardian />} />
            <Route path="doctor-updates" element={<DoctorUpdatesGuardian />} />
            <Route path="medications" element={<MedicationsGuardian />} />
            <Route path="history" element={<HistoryGuardian />} />
            <Route path="assistant" element={<AssistantGuardian />} />
            <Route path="privacy" element={<PrivacyGuardian />} />
            <Route path="notifications" element={<NotificationsGuardian />} />
            <Route path="settings" element={<SettingsGuardian />} />
          </Route>

          {/* Volunteer Community Response Console (Protected) */}
          <Route path="/volunteer/login" element={<VolunteerLogin />} />
          <Route path="/volunteer/register" element={<VolunteerRegister />} />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/volunteer/dashboard" replace />} />
            <Route path="dashboard" element={<VolunteerDashboard />} />
            <Route path="emergencies" element={<VolunteerEmergencies />} />
            <Route path="emergencies/:id" element={<VolunteerEmergencyDetail />} />
            <Route path="assistant" element={<VolunteerAssistant />} />
            <Route path="profile" element={<VolunteerResourcePage page="profile" />} />
            <Route path="verification" element={<VolunteerResourcePage page="verification" />} />
            <Route path="map" element={<VolunteerResourcePage page="map" />} />
            <Route path="assignments" element={<VolunteerResourcePage page="assignments" />} />
            <Route path="training" element={<VolunteerResourcePage page="training" />} />
            <Route path="care-credits" element={<VolunteerResourcePage page="care-credits" />} />
            <Route path="certificates" element={<VolunteerResourcePage page="certificates" />} />
            <Route path="impact" element={<VolunteerResourcePage page="impact" />} />
            <Route path="history" element={<VolunteerResourcePage page="history" />} />
            <Route path="notifications" element={<VolunteerResourcePage page="notifications" />} />
            <Route path="privacy" element={<VolunteerResourcePage page="privacy" />} />
            <Route path="settings" element={<VolunteerResourcePage page="settings" />} />
          </Route>

          {/* College / institution administration (Protected) */}
          <Route path="/college/login" element={<CollegeLogin />} />
          <Route
            path="/college"
            element={
              <ProtectedRoute allowedRoles={['college']}>
                <CollegeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/college/dashboard" replace />} />
            <Route path="dashboard" element={<CollegeDashboard />} />
            <Route path="assistant" element={<CollegeAssistant />} />
            <Route path="students" element={<CollegeResourcePage page="students" />} />
            <Route path="students/:id" element={<StudentDetail />} />
            {['verification','volunteers','training','missions','care-credits','certificates','programs','impact','reports','notifications','audit','privacy','profile','settings'].map(page => (
              <Route key={page} path={page} element={<CollegeResourcePage page={page} />} />
            ))}
          </Route>

          {/* Default fallback redirects */}
          <Route path="*" element={<Navigate to="/patient/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
