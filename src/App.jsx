import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import FamilyVaults from './pages/family-vaults/FamilyVaults';
import ViewFamilyMember from './pages/family-vaults/ViewFamilyMember';

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/family/vaults" />} />
          <Route path="/family/vaults" element={<FamilyVaults />} />
          <Route path="/family/vaults/:vaultName/*" element={<ViewFamilyMember />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default App; 