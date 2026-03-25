import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PatientNavbar from './components/navbar/PatientNavbar';
import DoctorNavbar from './components/navbar/DoctorNavbar';
import AdminNavbar from './components/navbar/AdminNavbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PatientNotes from './pages/patient/PatientNotes';
import PatientHome from './pages/patient/home/PatientHome';
import PatientDashboard from './components/dashboard/PatientDashboard';
import PatientProfile from './pages/patient/profile/PatientProfile';
import PatientSettings from './pages/patient/settings/PatientSettings';
import PatientAppointments from './pages/patient/appointments/PatientAppointments';
import BookAppointment from './pages/patient/appointments/BookAppointment';
import PatientDoctors from './pages/patient/doctors/PatientDoctors';
import PatientHealthRecords from './pages/patient/health-records/PatientHealthRecords';
import PatientMedications from './pages/patient/medications/PatientMedications';
import PatientReviews from './pages/patient/reviews/PatientReviews';
import DoctorHome from './pages/doctor/home/DoctorHome';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import DoctorPatients from './pages/doctor/patients/DoctorPatients';
import PatientDetail from './pages/doctor/patients/PatientDetail';
import DoctorAppointments from './pages/doctor/appointments/DoctorAppointments';
import DoctorProfile from './pages/doctor/profile/DoctorProfile';
import DoctorProfileCompletion from './pages/doctor/DoctorProfileCompletion';
import DoctorSettings from './pages/doctor/settings/DoctorSettings';
import DoctorMedications from './pages/doctor/medications/DoctorMedications';
import AllMedications from './pages/doctor/medications/AllMedications';
import DoctorReviews from './pages/doctor/reviews/DoctorReviews';
import DoctorHealthRecords from './pages/doctor/health-records/DoctorHealthRecords';
import DoctorHealthScores from './pages/doctor/health-scores/DoctorHealthScores';
import AllAppointments from './pages/doctor/appointments/AllAppointments';
import AdminHome from './pages/admin/home/AdminHome';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import AdminDoctors from './pages/admin/doctors/AdminDoctors';
import AdminPatients from './pages/admin/patients/AdminPatients';
import AdminAppointments from './pages/admin/appointments/AdminAppointments';
import AdminHealthRecords from './pages/admin/health-records/AdminHealthRecords';
import AdminReports from './pages/admin/reports/AdminReports';
import AdminSettings from './pages/admin/settings/AdminSettings';
import VideoConsultation from './pages/consultation/VideoConsultation';
import PendingApprovalPage from './pages/PendingApprovalPage';
import Loading from './components/loading/Loading';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';
import './styles/doctor-theme.css';
import './styles/doctor-profile-completion.css';
import './styles/admin-theme.css';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('App.jsx - Token:', token ? 'Present' : 'Not found');
    console.log('App.jsx - UserData:', userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('App.jsx - Parsed User:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <Loading />;

  const isAuthenticated = !!user;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isPatientRoute = location.pathname.startsWith('/patient');
  const isDoctorRoute = location.pathname.startsWith('/doctor');
  const isAdminRoute = location.pathname.startsWith('/admin');

  console.log('App.jsx - Current pathname:', location.pathname);

  return (
    <div>
      {isAuthenticated && isPatientRoute && <PatientNavbar />}
      {isAuthenticated && isDoctorRoute && <DoctorNavbar />}
      {isAuthenticated && isAdminRoute && <AdminNavbar />}
      
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? (
            (() => {
              console.log('Login redirect - User role:', user.role);
              if (user.role === 'admin') {
                console.log('Redirecting to /admin/home');
                return <Navigate to="/admin/home" replace />;
              } else if (user.role === 'doctor') {
                console.log('Redirecting to /doctor/home');
                return <Navigate to="/doctor/home" replace />;
              } else {
                console.log('Redirecting to /patient/home');
                return <Navigate to="/patient/home" replace />;
              }
            })()
          ) : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? (
            user.role === 'admin' ? <Navigate to="/admin/home" replace /> :
            user.role === 'doctor' ? <Navigate to="/doctor/home" replace /> : <Navigate to="/patient/home" replace />
          ) : <Register />
        } />
        
        {/* Pending Approval Route */}
        <Route path="/pending-approval" element={
          (() => {
            console.log('Pending approval route - User:', user);
            // If user is actually approved but still shows pending, redirect to appropriate home
            if (isAuthenticated && user?.isApproved === true) {
              console.log('User is approved, redirecting to home');
              if (user.role === 'doctor') {
                return <Navigate to="/doctor/home" replace />;
              } else if (user.role === 'patient') {
                return <Navigate to="/patient/home" replace />;
              }
            }
            return <PendingApprovalPage />;
          })()
        } />
        
        {/* Patient Routes */}
        <Route path="/patient/home" element={
          isAuthenticated && user?.role === 'patient' ? <PatientHome /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/dashboard" element={
          isAuthenticated && user?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/profile" element={
          isAuthenticated && user?.role === 'patient' ? <PatientProfile /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/settings" element={
          isAuthenticated && user?.role === 'patient' ? <PatientSettings /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/appointments" element={
          isAuthenticated && user?.role === 'patient' ? <PatientAppointments /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/book-appointment" element={
          isAuthenticated && user?.role === 'patient' ? <BookAppointment /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/book-appointment/:doctorId" element={
          isAuthenticated && user?.role === 'patient' ? <BookAppointment /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/doctors" element={
          isAuthenticated && user?.role === 'patient' ? <PatientDoctors /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/health-records" element={
          isAuthenticated && user?.role === 'patient' ? <PatientHealthRecords /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/medications" element={
          isAuthenticated && user?.role === 'patient' ? <PatientMedications /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/reviews" element={
          isAuthenticated && user?.role === 'patient' ? <PatientReviews /> : <Navigate to="/login" replace />
        } />
        <Route path="/patient/notes" element={
          isAuthenticated && user?.role === 'patient' ? <PatientNotes /> : <Navigate to="/login" replace />
        } />
        
        {/* Video Consultation Route */}
        <Route path="/appointments/:appointmentId/consultation" element={
          isAuthenticated ? <VideoConsultation /> : <Navigate to="/login" replace />
        } />
        
        {/* Doctor Routes */}
        <Route path="/doctor/complete-profile" element={
          (() => {
            console.log('Profile completion route accessed');
            
            if (isAuthenticated && user?.role === 'doctor') {
              console.log('Showing profile completion form');
              return <DoctorProfileCompletion />;
            } else {
              console.log('Not authenticated, redirecting to login');
              return <Navigate to="/login" replace />;
            }
          })()
        } />
        <Route path="/doctor/home" element={
          (() => {
            console.log('Doctor home route - Authenticated:', isAuthenticated);
            console.log('Doctor home route - User role:', user?.role);
            if (isAuthenticated && user?.role === 'doctor') {
              console.log('Loading DoctorHome component');
              return <DoctorHome />;
            } else {
              console.log('Redirecting to /login from doctor home');
              return <Navigate to="/login" replace />;
            }
          })()
        } />
        <Route path="/doctor/dashboard" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/patients" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorPatients /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/patients/:id" element={
          isAuthenticated && user?.role === 'doctor' ? <PatientDetail /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/health-records" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorHealthRecords /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/appointments" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorAppointments /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/medications" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorMedications /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/medications/all" element={
          isAuthenticated && user?.role === 'doctor' ? <AllMedications /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/appointments/all" element={
          isAuthenticated && user?.role === 'doctor' ? <AllAppointments /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/reviews" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorReviews /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/health-scores" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorHealthScores /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/profile" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorProfile /> : <Navigate to="/login" replace />
        } />
        <Route path="/doctor/settings" element={
          isAuthenticated && user?.role === 'doctor' ? <DoctorSettings /> : <Navigate to="/login" replace />
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/home" element={
          isAuthenticated && user?.role === 'admin' ? <AdminHome /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/dashboard" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/doctors" element={
          isAuthenticated && user?.role === 'admin' ? <AdminDoctors /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/patients" element={
          isAuthenticated && user?.role === 'admin' ? <AdminPatients /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/appointments" element={
          isAuthenticated && user?.role === 'admin' ? <AdminAppointments /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/health-records" element={
          isAuthenticated && user?.role === 'admin' ? <AdminHealthRecords /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/reports" element={
          isAuthenticated && user?.role === 'admin' ? <AdminReports /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/settings" element={
          isAuthenticated && user?.role === 'admin' ? <AdminSettings /> : <Navigate to="/login" replace />
        } />
        
        <Route path="/" element={
          <Navigate to={isAuthenticated ? (
            user?.role === 'admin' ? '/admin/home' :
            user?.role === 'doctor' ? '/doctor/home' : '/patient/home'
          ) : '/login'} replace />
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;