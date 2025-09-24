import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { colors, spacing, typography } from '../theme/theme'; // Assuming you have a theme file

export default function FeedbackForm() {
    const { postId } = useParams(); // Get the post ID from the URL
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would send this data to your backend.
        console.log({
            postId: postId,
            rating: rating,
            comment: comment,
        });

        alert('Thank you for your feedback!');
        navigate('/'); // Redirect to the home page after submission
    };

    return (
        <div style={{ maxWidth: 500, margin: 'auto', padding: spacing.l, background: colors.cardBg, borderRadius: 12, marginTop: spacing.l }}>
            <h2 style={{ fontSize: typography.title, color: colors.primary, marginBottom: spacing.m, textAlign: 'center' }}>
                Feedback for Issue #{postId}
            </h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: spacing.m }}>
                    <label style={{ display: 'block', marginBottom: spacing.s }}>Rating:</label>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{
                                    cursor: 'pointer',
                                    color: star <= rating ? '#FFD700' : '#ccc',
                                    fontSize: '2rem',
                                    margin: '0 5px',
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div style={{ marginBottom: spacing.m }}>
                    <label htmlFor="comment" style={{ display: 'block', marginBottom: spacing.s }}>Comments:</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        style={{
                            width: '100%',
                            minHeight: 100,
                            padding: spacing.m,
                            borderRadius: 8,
                            border: `1px solid ${colors.border}`,
                            fontFamily: typography.font,
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={rating === 0}
                    style={{
                        width: '100%',
                        padding: spacing.m,
                        background: rating === 0 ? '#ccc' : colors.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: rating === 0 ? 'not-allowed' : 'pointer',
                    }}
                >
                    Submit Feedback
                </button>
            </form>
        </div>
    );
}

