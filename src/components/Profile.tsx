import React, { useEffect, useState } from 'react';

const Profile: React.FC = () => {
  const [highScore, setHighScore] = useState(0);
  const [pastScores, setPastScores] = useState<{ score: number; date: string }[]>([]);

  const API_URL = 'https://web-production-b41c.up.railway.app/api';

  const fetchHighScore = async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    try {
      const response = await fetch(`${API_URL}/game/high-score/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHighScore(data.highScore);
      } else {
        console.error('Error fetching high score:', await response.text());
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const fetchPastScores = async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    try {
      const response = await fetch(`${API_URL}/game/past-scores/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPastScores(data.pastScores);
      } else {
        console.error('Error fetching past scores:', await response.text());
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const getUserIdFromToken = (token: string | null) => {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  };

  useEffect(() => {
    fetchHighScore();
    fetchPastScores();
  }, []);

  return (
    <div className="container mt-5">
      <h2>My Profile</h2>
      <p>
        High Score: <strong>{highScore}</strong>
      </p>
      <h3 className="mt-4">Past Scores</h3>
      <ul className="list-group">
        {pastScores.map((item, index) => (
          <li className="list-group-item" key={index}>
            {item.score} points on {new Date(item.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
