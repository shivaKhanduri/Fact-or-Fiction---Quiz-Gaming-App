import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Game from './pages/Game';
import FactGamePage from './components/FactGamePage'; // New Fact Game Page
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import Profile from './components/Profile'; 
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; 

const App: React.FC = () => {

  const [score, setScore] = useState<number>(0); // Score state to be shared
  console.log('Current score:', score);

  return (
    <Router>
      <Header />
      <Routes>
        {/* Public Routes */}
        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/game" element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/factgame" element={
          <ProtectedRoute>
            <FactGamePage setScore={setScore} /> {/* Pass setScore as a prop */}
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
