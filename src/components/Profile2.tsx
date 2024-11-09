import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';

interface PastScore {
    score: number;
    date: string;
}

const Profile2: React.FC = () => {
    const [pastScores, setPastScores] = useState<PastScore[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPastScores = async () => {
            try {
                const userId = '1'; // Replace with dynamic user ID
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/fact-past-scores/${userId}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                setPastScores(data.pastScores);
            } catch (error: any) {
                console.error('Error fetching past scores:', error);
                setError('Failed to fetch past scores. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPastScores();
    }, []);

    return (
        <Container className="mt-4">
            <h1 className="text-center">Your Past Scores</h1>

            {isLoading ? (
                <div className="text-center mt-4">
                    <Spinner animation="border" />
                </div>
            ) : error ? (
                <Alert variant="danger" className="mt-4">
                    {error}
                </Alert>
            ) : (
                <Row className="mt-4">
                    <Col md={{ span: 8, offset: 2 }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Score</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastScores.map((score, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{score.score}</td>
                                        <td>{score.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Profile2;
