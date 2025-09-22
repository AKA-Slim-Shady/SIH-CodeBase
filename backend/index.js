import express from 'express';
import dotenv from "dotenv"

// Import your database pool and table creation functions
import pool from './database.js';
import { createCommentsTable } from './Comments/comments.model.js';
import { createDepartmentsTable } from './Departments/departments.model.js';
import { createNotificationsTable } from './Notifications/notifications.model.js';
import { createStatusTable } from './Status/status.model.js';

// Import your router files
import commentsRouter from './Comments/comments.route.js';
import departmentsRouter from './Departments/departments.route.js';
import notificationsRouter from './Notifications/notifications.route.js';
import statusRouter from './Status/status.route.js';

dotenv.config()
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Main function to initialize the application
async function initializeApp() {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        console.log('✅ PostgreSQL database connected successfully.');

        // Create all necessary tables
        await createCommentsTable();
        await createDepartmentsTable();
        await createNotificationsTable();
        await createStatusTable();
        
        // This is where you would also create the 'users' and 'posts' tables
        // await createUsersTable();
        // await createPostsTable();

        // Register the routers with their base paths
        // The router paths are relative to the root URL (e.g., /api)
        app.use('/api', commentsRouter);
        app.use('/api', departmentsRouter);
        app.use('/api', notificationsRouter);
        app.use('/api', statusRouter);
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Failed to connect to the database or start server:', error);
    }
}

// Initialize the app
initializeApp();
