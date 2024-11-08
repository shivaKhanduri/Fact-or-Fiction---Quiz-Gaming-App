import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home: React.FC = () => {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center p-4 shadow rounded bg-white">
        <h1 className="mb-3 text-primary">Welcome to ImageQuest</h1>
        <p className="lead text-secondary">
          ImageQuest is a fun and challenging game where you guess what's in the image as fast as you can. Compete against yourself to beat your high score and challenge your friends!
        </p>
        
        <h3 className="mt-4 text-success">How to Play:</h3>
        <ul className="list-group list-group-flush text-start mt-3 mb-4">
          <li className="list-group-item">
            <strong>1. Start the Game:</strong> Click "Start Game" to begin.
          </li>
          <li className="list-group-item">
            <strong>2. View an Image:</strong> A random image will appear.
          </li>
          <li className="list-group-item">
            <strong>3. Type Your Guess:</strong> Enter your answer in the input field below the image.
          </li>
          <li className="list-group-item">
            <strong>4. Submit:</strong> Submit your guess to check if it's correct.
          </li>
          <li className="list-group-item">
            <strong>5. Time Limit:</strong> You have 25 seconds in total to guess how many images you can.
          </li>
          <li className="list-group-item">
            <strong>6. Score & High Score:</strong> Your score will increase for each correct guess. Try to beat your high score!
          </li>
        </ul>

        <Link to="/game" className="btn btn-success btn-lg">
          Start Game
        </Link>
      </div>
    </div>
  );
};

export default Home;
