import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomepageContainer from './pages/HomepageContainer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import HistoricalDashboard from './pages/HistoricalDashboard';
import ModelsSimulation from './pages/ModelsSimulation';
import AboutManifesto from './pages/AboutManifesto';
import Web3UserApp from './pages/Web3UserApp';
import UserDashboard from './pages/UserDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomepageContainer />} />
        <Route path="/node" element={<Web3UserApp />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/archive" element={<HistoricalDashboard />} />
        <Route path="/models" element={<ModelsSimulation />} />
        <Route path="/about" element={<AboutManifesto />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
