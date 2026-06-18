import { Routes, Route, Navigate } from 'react-router-dom';
import Hub from './pages/Hub';
import StandJourney from './pages/stand/StandJourney';
import StandReportPage from './pages/stand/StandReportPage';
import StudioEntrepreneur from './pages/stand/StudioEntrepreneur';
import CapTourisme from './pages/stand/CapTourisme';
import AgritechSouss from './pages/stand/AgritechSouss';
import AtelierMarketing from './pages/stand/AtelierMarketing';
import VoixDuClient from './pages/stand/VoixDuClient';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/parcours" element={<StandJourney />} />
      <Route path="/studio" element={<StudioEntrepreneur />} />
      <Route path="/tourisme" element={<CapTourisme />} />
      <Route path="/agritech" element={<AgritechSouss />} />
      <Route path="/incubateur" element={<AtelierMarketing />} />
      <Route path="/hub-client" element={<VoixDuClient />} />
      <Route path="/rapport/:token" element={<StandReportPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
