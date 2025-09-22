// backend/src/controllers/webhookController.js

import { Webhook } from 'svix';
import User from '../models/userModel.js';

export const clerkWebhookHandler = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    // Get the headers from the request
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ 'error': 'Error occurred -- no svix headers' });
    }

    // Get the body
    const payload = req.body;
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let event;

    // Verify the payload with the headers
    try {
        event = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ 'error': err.message });
    }

    // Get the event type
    const eventType = event.type;

    // Handle the webhook event
    try {
        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = event.data;
            await User.create({
                clerkId: id,
                email: email_addresses[0].email_address,
                name: `${first_name || ''} ${last_name || ''}`.trim(),
                userpic: image_url,
            });
            console.log(`User ${id} was created in the database.`);
        }

        if (eventType === 'user.deleted') {
            const { id } = event.data;
            await User.destroy({ where: { clerkId: id } });
            console.log(`User ${id} was deleted from the database.`);
        }
        
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error handling webhook event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};