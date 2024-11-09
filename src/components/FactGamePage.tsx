import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';

interface FactPair {
    fact: string;
    fiction: string;
    correctAnswer: 'Fact' | 'Fiction'; // Added correctAnswer field
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

    const fetchFactPair = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/factgame/start-fact-round`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data: FactPair = await response.json();

            if (!data.fact || !data.fiction || !data.correctAnswer) {
                throw new Error('Incomplete data from server.');
            }

            setFactPair(data);
        } catch (error) {
            console.error('Error fetching fact pair:', error);
            setMessage('Failed to fetch fact/fiction pair. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuess = (selected: 'Fact' | 'Fiction') => {
        if (!factPair) return;

        const isCorrect = selected === factPair.correctAnswer;
        setMessage(isCorrect ? 'Correct!' : 'Incorrect!');

        if (isCorrect) {
            setLocalScore((prev) => prev + 10);
            setScore((prevScore) => prevScore + 10);
        }
    };

    const resetGame = () => {
        setFactPair(null);
        setMessage('');
        setCategory('');
    };

    return (
        <Container className="mt-4">
            <h1 className="text-center">Fact Game</h1>
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
                            className="mt-2"
                            onClick={fetchFactPair}
                            disabled={isLoading || !category.trim()}
                        >
                            {isLoading ? <Spinner animation="border" size="sm" /> : 'Start Game'}
                        </Button>
                    </Form>
                </Col>
            </Row>

            {factPair && (
                <Row className="mt-4">
                    <Col>
                        <Alert variant="primary" className="text-center">
                            <strong>Fact:</strong> {factPair.fact}
                        </Alert>
                        <Alert variant="warning" className="text-center">
                            <strong>Fiction:</strong> {factPair.fiction}
                        </Alert>
                        <div className="d-flex justify-content-around">
                            <Button variant="success" onClick={() => handleGuess('Fact')}>
                                Select Fact
                            </Button>
                            <Button variant="danger" onClick={() => handleGuess('Fiction')}>
                                Select Fiction
                            </Button>
                        </div>
                    </Col>
                </Row>
            )}

            {message && (
                <Row className="mt-3">
                    <Col md={{ span: 6, offset: 3 }}>
                        <Alert variant={message === 'Correct!' ? 'success' : 'danger'}>{message}</Alert>
                        <h3>Score: {localScore}</h3>
                    </Col>
                </Row>
            )}

            <Row className="mt-3">
                <Col md={{ span: 6, offset: 3 }} className="text-center">
                    <Button variant="secondary" onClick={resetGame} className="mt-2">
                        Reset Game
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default FactGamePage;
