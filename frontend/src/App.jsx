import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomepageContainer from './pages/HomepageContainer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import HistoricalDashboard from './pages/HistoricalDashboard';
import ModelsSimulation from './pages/ModelsSimulation';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomepageContainer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/archive" element={<HistoricalDashboard />} />
        <Route path="/models" element={<ModelsSimulation />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
