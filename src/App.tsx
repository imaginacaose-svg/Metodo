import { HashRouter, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import ProposalPage from './pages/ProposalPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="/proposta" element={<ProposalPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
