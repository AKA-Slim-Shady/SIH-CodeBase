import Status from '../models/complaintStatusModel.js';
import Post from '../models/postModel.js';
import Notification from '../models/notificationModel.js';
import { io } from '../server.js';

export const updateStatus = async (req, res) => {
    const { postid } = req.params;
    const { status } = req.body;
    try {
        const post = await Post.findByPk(postid);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (req.user && req.user.id === post.userId) {
            console.log(`[Notification] User ${req.user.id} is updating their own post. No notification will be sent.`);
        } else if (post.userId) {
            const shortDesc = post.desc.length > 25 ? post.desc.substring(0, 25) + '...' : post.desc;
            
            // --- 👇 UPGRADE: New notification message and link logic ---
            let message = `Status of your report "${shortDesc}" is now: ${status}.`;
            let link = '/user'; // The notification will always link to the user dashboard

            if (status === 'Issue resolved') {
                message = `Your report "${shortDesc}" has been resolved. Please go to your user dashboard to send feedback.`;
            }
            // --- 👆 END: New Logic ---

            const newNotification = await Notification.create({
                userId: post.userId,
                message: message,
                link: link, // Link is now always '/user'
                isRead: false,
            });

            console.log(`[Notification] Created for user ${post.userId}. Emitting 'new_notification' to room: ${post.userId.toString()}`);
            io.to(post.userId.toString()).emit('new_notification', newNotification);
        }

        const [statusRecord, created] = await Status.findOrCreate({
            where: { postId: parseInt(postid, 10) },
            defaults: { status: status },
        });

        if (!created) {
            await statusRecord.update({ status: status });
        }
        
        res.json(statusRecord);
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: err.message });
    }
};

// The getStatus function requires no changes
export const getStatus = async (req, res) => {
    const { postid } = req.params;
    try {
        const statusRecord = await Status.findOne({
            where: { postId: parseInt(postid, 10) }
        });

        if (!statusRecord) {
            return res.status(404).json({ message: 'Status not found for this post.' });
        }
        res.json(statusRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

