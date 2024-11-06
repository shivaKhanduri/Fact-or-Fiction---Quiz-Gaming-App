import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported globally if not already

const Home: React.FC = () => {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="text-center">
        <h2 className="mb-4 text-primary">Welcome to ImageQuest</h2>
        <p className="mb-4 text-secondary">
          Try to guess the images correctly to score high!
        </p>
        <Link to="/game" className="btn btn-success btn-lg">
          Start Game
        </Link>
      </div>
    </div>
  );
};

export default Home;
