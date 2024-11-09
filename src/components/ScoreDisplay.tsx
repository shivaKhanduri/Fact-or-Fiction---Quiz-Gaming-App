import React from 'react';
import { Alert } from 'react-bootstrap';

interface ScoreDisplayProps {
    score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
    return (
        <Alert variant="primary" className="text-center">
            <h4>Current Score: {score}</h4>
        </Alert>
    );
};

export default ScoreDisplay;
