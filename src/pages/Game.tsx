import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import 'bootstrap/dist/css/bootstrap.min.css';

const Game: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [celebrate, setCelebrate] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false); // New state for single confetti trigger
  const [timer, setTimer] = useState(25);
  const [gameOver, setGameOver] = useState(false);
  const [pastScores, setPastScores] = useState<{ score: number; date: string }[]>([]);
  const [gameStarted, setGameStarted] = useState(false); // New state to track if the game is started

  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRandomImage = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:4000/api/game/random-image', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      setImageUrl(data.imageUrl);
      setImageId(data.imageId);
      setFeedback('');
    } else {
      console.error('Error fetching random image:', await response.text());
    }
  };

  const fetchHighScore = async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    const response = await fetch(`http://localhost:4000/api/game/high-score/${userId}`, {
      method: 'GET',
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
  };

  const fetchPastScores = async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    const response = await fetch(`http://localhost:4000/api/game/past-scores/${userId}`, {
      method: 'GET',
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (imageId === null) {
      console.error('No image ID available.');
      return;
    }

    const response = await fetch('http://localhost:4000/api/game/validate-answer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId, userAnswer }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isCorrect) {
        const newScore = score + 1;
        setScore(newScore);
        setFeedback('Correct!');
        fetchRandomImage();

        if (newScore > highScore) {
          setHighScore(newScore);

          if (!hasCelebrated) {
            setCelebrate(true);
            setHasCelebrated(true); // Ensure confetti only triggers once per game
            setTimeout(() => setCelebrate(false), 5000);
          }
        }
      } else {
        setFeedback('Incorrect! Try again.');
      }
    } else {
      console.error('Error validating answer:', await response.text());
    }

    setUserAnswer('');
  };

  const saveScore = async () => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    const response = await fetch('http://localhost:4000/api/game/save-score', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, score }),
    });

    if (response.ok) {
      console.log('Score saved successfully.');
    } else {
      console.error('Error saving score:', await response.text());
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
    fetchRandomImage();
    startTimer();
  };

  const handlePlayAgain = () => {
    setScore(0);
    setGameOver(false);
    setHasCelebrated(false); // Reset for next game
    fetchRandomImage();
    startTimer(); // Restart the timer
  };

  const handleLogout = async () => {
    await saveScore(); // Save the score on logout
    localStorage.removeItem('token');
    navigate('/login');
  };

  const startTimer = () => {
    setTimer(25);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          saveScore(); // Save the score when the game ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    <div className="container text-center mt-5">
      <h2 className="mb-4">ImageQuest</h2>
      {celebrate && <Confetti width={width} height={height} />}
      {!gameStarted ? (
        <>
          <div>
            <p>Your high score: <strong>{highScore}</strong></p>
            <h3 className="mt-4">Past Scores:</h3>
            <ul className="list-group mb-4">
              {pastScores.map((item, index) => (
                <li className="list-group-item" key={index}>
                  {item.score} points on {new Date(item.date).toLocaleString()}
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={handleStartGame}>
              Play ImageQuest
            </button>
          </div>
        </>
      ) : gameOver ? (
        <div>
          <h3 className="text-danger">Game Over! Your final score: {score}</h3>
          <button className="btn btn-success me-2" onClick={handlePlayAgain}>
            Play Again
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Random"
              className="img-thumbnail mb-3"
              style={{ width: '300px', height: '300px' }}
            />
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer"
                required
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Answer
            </button>
          </form>
          <p className="mt-3">{feedback}</p>
          <p>
            Your score: <strong>{score}</strong>
          </p>
          <p>
            High score: <strong>{highScore}</strong> {/* High Score displayed here */}
          </p>
          <p>
            Time left: <strong>{timer}</strong> seconds
          </p>
        </div>
      )}
    </div>
  );
};

export default Game;
