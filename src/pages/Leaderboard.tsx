import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';

interface Player {
    username: string;
    high_score: number;
}

const Leaderboard: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/factgame/leaderboard`);
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                const data = await response.json();
                setPlayers(data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Could not load leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Leaderboard</h1>
            {loading && <Spinner animation="border" className="d-block mx-auto" />}
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            {!loading && !error && (
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>High Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{player.username}</td>
                                <td>{player.high_score}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Leaderboard;
