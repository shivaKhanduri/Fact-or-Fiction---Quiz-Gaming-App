import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';

interface FactPair {
    fact: string;
    fiction: string;
    category: string;
}

interface FactGamePageProps {
    setScore: React.Dispatch<React.SetStateAction<number>>;
}

const FactGamePage: React.FC<FactGamePageProps> = ({ setScore }) => {
    const [category, setCategory] = useState<string>('');
    const [factPair, setFactPair] = useState<FactPair | null>(null);
    const [message, setMessage] = useState<string>('');
    const [localScore, setLocalScore] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const fetchFactPair = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/start-fact-round`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setFactPair(data);
            setSelectedAnswer(null);
        } catch (error) {
            console.error('Error fetching fact pair:', error);
            setMessage('Failed to fetch fact/fiction pair. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuess = async (guess: 'fact' | 'fiction') => {
        if (!factPair) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/validate-guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: '1', // Replace with actual user ID dynamically
                    guess,
                    correctAnswer: guess === 'fact' ? 'fact' : 'fiction',
                    score: 10,
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
            } else {
                setMessage('Incorrect! Try again.');
            }
        } catch (error) {
            console.error('Error validating guess:', error);
            setMessage('Failed to validate answer. Please try again.');
        }
    };

    const resetGame = () => {
        setFactPair(null);
        setMessage('');
        setCategory('');
        setLocalScore(0);
        setSelectedAnswer(null);
    };

    return (
        <Container className="mt-4">
            <h1 className="text-center">Fact or Fiction Game</h1>
            <Row className="mt-3">
                <Col md={{ span: 6, offset: 3 }}>
                    <Form>
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Enter a category (e.g., Space, History)"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            className="mt-2 w-100"
                            onClick={fetchFactPair}
                            disabled={isLoading || !category.trim()}
                        >
                            {isLoading ? <Spinner animation="border" size="sm" /> : 'Get New Fact/Fiction Pair'}
                        </Button>
                    </Form>
                </Col>
            </Row>

            {factPair && (
                <Row className="mt-4">
                    <Col>
                        <Alert
                            variant={
                                selectedAnswer === 'fact'
                                    ? message.includes('Correct') ? 'success' : 'danger'
                                    : 'info'
                            }
                            className="text-center"
                        >
                            <strong>Statement 1:</strong> {factPair.fact}
                        </Alert>
                        <Alert
                            variant={
                                selectedAnswer === 'fiction'
                                    ? message.includes('Correct') ? 'success' : 'danger'
                                    : 'warning'
                            }
                            className="text-center"
                        >
                            <strong>Statement 2:</strong> {factPair.fiction}
                        </Alert>
                        <div className="d-flex justify-content-around mt-3">
                            <Button
                                variant="success"
                                onClick={() => handleGuess('fact')}
                                disabled={!!selectedAnswer}
                            >
                                Statement 1 is Fact
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => handleGuess('fiction')}
                                disabled={!!selectedAnswer}
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

            <Row className="mt-3">
                <Col md={{ span: 6, offset: 3 }} className="text-center">
                    <Button variant="secondary" onClick={resetGame} className="w-100">
                        Start New Game
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default FactGamePage;
