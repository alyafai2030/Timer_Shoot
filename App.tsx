import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ScoreEntry from './components/ScoreEntry';
import Results from './components/Results';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        <Header />
        <main className="container mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<ScoreEntry />} />
            <Route path="/results" element={<Results />} />
            <Route path="/edit/:scoreId" element={<ScoreEntry />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;