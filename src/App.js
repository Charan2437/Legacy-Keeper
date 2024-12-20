import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Auth Context and Protected Route
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Layout and Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Nominees from './pages/nominees/Nominees';
import Trustees from './pages/trustees/Trustees';
import Transactions from './pages/transactions/Transactions';
import DebtsLoans from './pages/debts-and-loans/DebtsAndLoans';
// import DepositsInvestments from './pages/deposits-and-investments/DepositsAndInvestments';
import Insurance from './pages/insurance/Insurance';
import BusinessPlans from './pages/business-plans/BusinessPlans';
import HealthRecords from './pages/health-records/HealthRecords';
import ViewHealthRecord from './pages/health-records/ViewHealthRecord';
import FamilyVaults from './pages/family-vaults/FamilyVaults';
import ViewFamilyMember from './pages/family-vaults/ViewFamilyMember';
import Reminders from './pages/reminders/Reminders';
import Documents from './pages/documents/DocumentsStore';

// Auth Pages
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import OTPVerification from './pages/auth/OTPVerification';
import ConfirmationSuccess from './pages/auth/ConfirmationSuccess';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Protected routes wrapper
const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          
          {/* Nominees & Trustees */}
          <Route path="/nominees" element={<ProtectedLayout><Nominees /></ProtectedLayout>} />
          <Route path="/trustees" element={<ProtectedLayout><Trustees /></ProtectedLayout>} />
          
          {/* Finance routes */}
          <Route path="/finance">
            <Route path="transactions" element={<ProtectedLayout><Transactions /></ProtectedLayout>} />
            <Route path="debts-loans" element={<ProtectedLayout><DebtsLoans /></ProtectedLayout>} />
            {/* <Route path="deposits" element={<ProtectedLayout><DepositsInvestments /></ProtectedLayout>} /> */}
            <Route path="documents" element={<ProtectedLayout><Documents /></ProtectedLayout>} />
          </Route>

          {/* Family routes */}
          <Route path="/family">
            <Route path="insurance" element={<ProtectedLayout><Insurance /></ProtectedLayout>} />
            <Route path="health-records" element={<ProtectedLayout><HealthRecords /></ProtectedLayout>} />
            <Route 
              path="health-records/:memberName" 
              element={<ProtectedLayout><ViewHealthRecord /></ProtectedLayout>} 
            />
            <Route path="vaults" element={<ProtectedLayout><FamilyVaults /></ProtectedLayout>} />
            <Route 
              path="vaults/:memberName" 
              element={<ProtectedLayout><ViewFamilyMember /></ProtectedLayout>} 
            />
            <Route path="digital-accounts" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          </Route>

          {/* Planning routes */}
          <Route path="/planning">
            <Route path="will" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="business" element={<ProtectedLayout><BusinessPlans /></ProtectedLayout>} />
            <Route path="legal" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          </Route>

          {/* Reminders */}
          <Route path="/reminders" element={<ProtectedLayout><Reminders /></ProtectedLayout>} />

          {/* Auth callback */}
          <Route path="/auth/callback" element={<ConfirmationSuccess />} />

          {/* Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;