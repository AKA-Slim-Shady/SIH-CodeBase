
-----

# 🚀 SIH Civic Issue Reporter: Quickstart Guide

This guide ensures you can install dependencies, configure your network, and successfully launch the frontend client and backend API on your local machine.

## 1\. Project Structure

Your codebase consists of two main, independent folders within your root project directory (`civic-reporting-sih/`):

```
civic-reporting-sih/
├── backend/            # Node.js/Express API
└── frontend/SIH-APP/   # React Native Mobile App (The UI)
```

-----

## 2\. Dependencies and Configuration

### A. Environment Setup

1.  **Create `.env`:** In the **`backend/`** folder, create a file named **`.env`** and paste the shared Neon database connection string (provided by the team lead).

    ```env
    # backend/.env (Crucial for database connection)
    DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&..."
    PORT=3000
    ```

2.  **Install Dependencies:** Run `npm install` in both project roots:

    ```bash
    # Install backend packages
    cd backend
    npm install

    # Install frontend packages
    cd ../frontend/SIH-APP
    npm install
    ```

### B. Network Configuration (Crucial for Mobile)

The mobile app must use your computer's IP to find the server.

1.  **Find your Local IP:** Determine your computer's local network IP address (e.g., `192.168.x.x`).

2.  **Update the URL:** Find the file where the base URL is defined in your frontend code (likely in a file like `App.js` or a central API client file) and replace the placeholder:

    ```javascript
    // Example: Locate the API URL definition in your frontend code
    const BASE_URL = 'http://[YOUR_LOCAL_IP_ADDRESS]:3000'; 
    ```

-----

## 3\. Launching the Application

You must start the backend server before starting the frontend bundler.

### Step 1: Start the Backend API

1.  **Navigate:**
    ```bash
    cd backend
    ```
2.  **Launch:**
    ```bash
    npm start
    ```
    *The console should confirm the API is running on port 3000.*

### Step 2: Start the Frontend Client

1.  **Navigate:**

    ```bash
    cd ../frontend/SIH-APP
    ```

2.  **Launch:**

    ```bash
    npm start
    ```

    *(This starts the Expo Metro Bundler and displays a **QR code**.)*

3.  **Launch the App:**

      * **Mobile:** Open the **Expo Go** app on your phone and **scan the QR code**.
      * **Web (Testing):** Press the **`w` key** in the terminal running the Expo Bundler to open the app in your browser.
