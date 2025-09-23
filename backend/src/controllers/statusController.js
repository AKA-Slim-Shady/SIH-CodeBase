// backend/src/controllers/statusController.js

import Status from '../models/complaintStatusModel.js';

// Update status
export const updateStatus = async (req, res) => {
    const { postid } = req.params;
    const { status } = req.body;
    try {
        const [statusRecord, created] = await Status.findOrCreate({
            where: { postId: postid },
            defaults: { status: status },
        });

        if (!created) {
            await statusRecord.update({ status: status });
        }

        res.json(statusRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get status
export const getStatus = async (req, res) => {
    const { postid } = req.params;
    try {
        const statusRecord = await Status.findOne({
            where: { postId: postid }
        });

        if (!statusRecord) {
            return res.status(404).json({ message: 'Status not found for this post.' });
        }
        res.json(statusRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};