// src/pages/Game.tsx
import React, { useState, useEffect } from 'react';

const Game: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const fetchRandomImage = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/game/random-image', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setImageUrl(data.imageUrl);
      setCorrectAnswer(data.answer);
      setFeedback('');
    } else {
      console.error('Error fetching random image:', await response.text());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:4000/api/game/validate-answer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId: correctAnswer, userAnswer }), // Assuming correctAnswer is the imageId
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isCorrect) {
        setScore(score + 1);
        setFeedback('Correct!');
      } else {
        setFeedback('Incorrect! Try again.');
      }
    } else {
      console.error('Error validating answer:', await response.text());
    }

    setUserAnswer('');
  };

  useEffect(() => {
    fetchRandomImage();
  }, []);

  return (
    <div>
      <h2>Game</h2>
      {imageUrl && <img src={imageUrl} alt="Random" />}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          required
        />
        <button type="submit">Submit Answer</button>
      </form>
      <p>{feedback}</p>
      <p>Your score: {score}</p>
    </div>
  );
};

export default Game;
