import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import Confetti from 'react-confetti'; // Import Confetti
import useWindowSize from 'react-use/lib/useWindowSize'; // Responsive confetti

interface Statement {
    text: string;
    type: string; // "fact" or "fiction"
}

interface FactGamePageProps {
    setScore: React.Dispatch<React.SetStateAction<number>>;
}

const FactGamePage: React.FC<FactGamePageProps> = ({ setScore }) => {
    const [category, setCategory] = useState<string>('');
    const [statements, setStatements] = useState<Statement[]>([]);
    const [message, setMessage] = useState<string>('');
    const [localScore, setLocalScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timer, setTimer] = useState<number>(12); // 12-second timer
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [timerActive, setTimerActive] = useState<boolean>(false); 
    const [showConfetti, setShowConfetti] = useState<boolean>(false); // Confetti state
    const { width, height } = useWindowSize(); // Get screen size for confetti

    useEffect(() => {
        // Fetch high score from localStorage or backend
        const fetchHighScore = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/fact-high-score/1`);
                if (response.ok) {
                    const data = await response.json();
                    setHighScore(data.highScore || 0);
                }
            } catch (error) {
                console.error("Error fetching high score:", error);
            }
        };
        fetchHighScore();
    }, []);

    useEffect(() => {
        if (timer > 0 && timerActive && !gameOver) {
            const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(countdown);
        } else if (timer === 0) {
            handleGameOver(); // End game if timer reaches 0
        }
    }, [timer, timerActive, gameOver]);

    const fetchFactPair = async () => {
        if (!category.trim()) {
            setMessage('Please provide a valid category.');
            return;
        }
    
        const userId = localStorage.getItem('userId'); // Assuming a stored user session
        if (!userId) {
            setMessage('User not logged in.');
            return;
        }
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/start-fact-round`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, userId }),
            });
    
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
    
            const data = await response.json();
            setStatements(data.statements); // This sets the shuffled fact and fiction statements
        } catch (error) {
            console.error(error);
            setMessage('Failed to fetch fact pair.');
        }
    };

    const handleGuess = async (guess: string) => {
        if (!statements.length) return;

        try {
            const correctAnswer = statements.find((s) => s.type === 'fact')?.text;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/validate-fact-guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: '1', 
                    guess,
                    correctAnswer,
                    score: localScore,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setSelectedAnswer(guess);

            if (data.isCorrect) {
                setMessage('Correct!');
                setLocalScore((prev) => prev + 10);
                setScore((prevScore) => prevScore + 10);

                if (localScore + 10 > highScore) {
                    setHighScore(localScore + 10);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
                }

                fetchFactPair(); 
            } else {
                handleGameOver(); 
            }
        } catch (error) {
            console.error('Error validating guess:', error);
            setMessage('Failed to validate answer. Please try again.');
        }
    };

    const handleGameOver = async () => {
        setGameOver(true);
        setTimerActive(false);
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/save-final-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: '1', 
                    finalScore: localScore,
                }),
            });
            setMessage(`Game Over! Final Score: ${localScore}`);
        } catch (error) {
            console.error('Error saving final score:', error);
        }
    };

    const resetGame = () => {
        setStatements([]);
        setMessage('');
        setCategory('');
        setLocalScore(0);
        setSelectedAnswer(null);
        setGameOver(false);
        setTimer(12);
        setTimerActive(false);
    };

    return (
        <Container className="mt-4">
            {showConfetti && <Confetti width={width} height={height} />} 
            <h1 className="text-center">Fact or Fiction Game - Survival Mode</h1>
            {gameOver && <h3 className="text-danger text-center">Game Over!</h3>}
            <Row className="mt-3">
                <Col md={{ span: 6, offset: 3 }}>
                    <Form>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Enter a category (e.g., Space, History)"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={gameOver}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            className="mt-2 w-100"
                            onClick={fetchFactPair}
                            disabled={isLoading || !category.trim() || gameOver}
                        >
                            {isLoading ? <Spinner animation="border" size="sm" /> : 'Get New Fact/Fiction Pair'}
                        </Button>
                    </Form>
                </Col>
            </Row>

            {statements.length > 0 && !gameOver && (
                <Row className="mt-4">
                    <Col>
                        <Alert variant="info" className="text-center">
                            <strong>Time Left: {timer} seconds</strong>
                        </Alert>
                        <Alert className="text-center">
                            <strong>Statement 1:</strong> {statements[0].text}
                        </Alert>
                        <Alert className="text-center">
                            <strong>Statement 2:</strong> {statements[1].text}
                        </Alert>
                        <div className="d-flex justify-content-around mt-3">
                            <Button
                                variant="success"
                                onClick={() => handleGuess(statements[0].text)}
                                disabled={!!selectedAnswer || gameOver}
                            >
                                Statement 1 is Fact
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleGuess(statements[1].text)}
                                disabled={!!selectedAnswer || gameOver}
                            >
                                Statement 2 is Fact
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}

            {message && (
                <Row className="mt-3">
                    <Col md={{ span: 6, offset: 3 }}>
                        <Alert variant={message.includes('Correct') ? 'success' : 'danger'}>{message}</Alert>
                        <h3 className="text-center">Score: {localScore}</h3>
                    </Col>
                </Row>
            )}

            {gameOver && (
                <Row className="mt-3">
                    <Col md={{ span: 6, offset: 3 }} className="text-center">
                        <Button variant="secondary" onClick={resetGame} className="w-100">
                            Start New Game
                        </Button>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default FactGamePage;
