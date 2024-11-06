import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Game: React.FC = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageId, setImageId] = useState<number | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [celebrate, setCelebrate] = useState(false);
    const [timer, setTimer] = useState(25);
    const [gameOver, setGameOver] = useState(false);
    const [pastScores, setPastScores] = useState<{ score: number; date: string }[]>([]);

    const { width, height } = useWindowSize();
    const navigate = useNavigate();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
                'Authorization': `Bearer ${token}`,
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
                'Authorization': `Bearer ${token}`,
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
                'Authorization': `Bearer ${token}`,
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
                    setCelebrate(true);
                    setTimeout(() => setCelebrate(false), 5000);
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
                'Authorization': `Bearer ${token}`,
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

    const handlePlayAgain = () => {
        setScore(0);
        setGameOver(false);
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
        fetchRandomImage();
        fetchPastScores();
        startTimer(); // Start the timer when the game begins
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <div>
            <h2>Game</h2>
            {celebrate && <Confetti width={width} height={height} />}
            {gameOver ? (
                <div>
                    <h3>Game Over! Your final score: {score}</h3>
                    <button onClick={handlePlayAgain}>Play Again</button>
                    <button onClick={handleLogout}>Logout</button>
                    <h3>Past Scores:</h3>
                    <ul>
                        {pastScores.map((item, index) => (
                            <li key={index}>
                                {item.score} points on {new Date(item.date).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    {imageUrl && <img src={imageUrl} alt="Random" style={{ width: '300px', height: '300px' }} />}
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
                    <p>Your high score: {highScore}</p>
                    <p>Time left: {timer} seconds</p>
                </div>
            )}
            <button onClick={handleLogout} style={{ marginTop: '20px' }}>Logout</button> {/* Logout button always available */}
        </div>
    );
};

export default Game;
