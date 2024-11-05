import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h2>Welcome to Word Spell Game</h2>
      <p>Try to guess the words correctly to score high!</p>
      <Link to="/game">Start Game</Link>
    </div>
  );
};

export default Home;
