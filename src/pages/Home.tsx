import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home: React.FC = () => {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <div className="text-center p-4 shadow rounded bg-white">
        <h1 className="mb-3 text-primary">FactQuest</h1>

        <h3 className="mt-4 text-primary">FactQuest - How to Play:</h3>
        <p className="text-muted"><em>Think you can separate fact from fiction? Let’s find out!</em></p>
        <ul className="list-group list-group-flush text-start mt-3 mb-4">
          <li className="list-group-item">
            <strong>1. Choose a Category:</strong> Pick a topic of your choice — from Space to History, we’ve got it all!
          </li>
          <li className="list-group-item">
            <strong>2. Fact or Fiction:</strong> Two statements enter the ring, but only one is true.
          </li>
          <li className="list-group-item">
            <strong>3. Make Your Guess:</strong> Can you spot the truth? Choose wisely!
          </li>
          <li className="list-group-item">
            <strong>4. Survival Mode:</strong> Get ready for some intense action — one wrong move, and it's game over!
          </li>
          <li className="list-group-item">
            <strong>5. Leaderboard:</strong> Think you’ve got what it takes to top the charts? Let’s see who the real fact master is!
          </li>
        </ul>

        <Link to="/factgame" className="btn btn-primary btn-lg">
          Start FactQuest
        </Link>

        <div className="mt-5">
          <h5 className="text-warning">
            "Only one way to find out if you’ve got what it takes... Start your quest now!"
          </h5>
        </div>
      </div>
    </div>
  );
};

export default Home;
