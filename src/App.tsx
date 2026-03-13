import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './Admin';
import { Layout } from './components/Layout';

// Pages
import Home from './pages/Home';
import Recruitment from './pages/Recruitment';
import Travel from './pages/Travel';
import Jobs from './pages/Jobs';
import About from './pages/About';
import Contact from './pages/Contact';
import LogoEnhancer from './pages/LogoEnhancer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/travel" element={<Travel />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/enhance-logo" element={<LogoEnhancer />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}
