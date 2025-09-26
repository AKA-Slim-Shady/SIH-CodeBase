import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FeedbackForm() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ postId, rating, comment });
        alert('Thank you for your feedback!');
        navigate('/');
    };

    return (
        <div className="form-card">
            <h2>Feedback for Issue #{postId}</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', textAlign: 'center' }}>Rating:</label>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{ cursor: 'pointer', color: star <= rating ? '#FFD700' : '#ccc', fontSize: '2.5rem', margin: '0 5px' }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="comment" style={{ display: 'block', marginBottom: '8px' }}>Comments:</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        style={{ minHeight: 100 }}
                    />
                </div>
                <button type="submit" disabled={rating === 0}>
                    Submit Feedback
                </button>
            </form>
        </div>
    );
}