import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';

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
            setStatements(data.statements); // Set the shuffled statements
            setSelectedAnswer(null);
        } catch (error) {
            console.error('Error fetching fact pair:', error);
            setMessage('Failed to fetch fact/fiction pair. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuess = async (guess: string) => {
        if (!statements.length) return;

        try {
            const correctAnswer = statements.find((s) => s.type === 'fact')?.text;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/validate-guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: '1', // Replace this with actual user ID
                    guess,
                    correctAnswer,
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
        setStatements([]);
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

            {statements.length > 0 && (
                <Row className="mt-4">
                    <Col>
                        <Alert 
                            variant={selectedAnswer === statements[0].text ? (message.includes('Correct') ? 'success' : 'danger') : 'info'} 
                            className="text-center"
                        >
                            <strong>Statement 1:</strong> {statements[0].text}
                        </Alert>
                        <Alert 
                            variant={selectedAnswer === statements[1].text ? (message.includes('Correct') ? 'success' : 'danger') : 'warning'} 
                            className="text-center"
                        >
                            <strong>Statement 2:</strong> {statements[1].text}
                        </Alert>
                        <div className="d-flex justify-content-around mt-3">
                            <Button 
                                variant="success" 
                                onClick={() => handleGuess(statements[0].text)}
                                disabled={!!selectedAnswer}
                            >
                                Statement 1 is Fact
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={() => handleGuess(statements[1].text)}
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
