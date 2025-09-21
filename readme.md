
-----

# 🚀 SIH Civic Issue Reporter: Setup Guide

This project is built as a **Monorepo** containing a React Native mobile application and a Node.js/Express API connected to a PostgreSQL database (hosted on Neon).

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Mobile Frontend** | **React Native (via Expo)** | Citizen app for reporting issues (iOS/Android). |
| **Backend API** | **Node.js + Express** | Handles all business logic, routing, and real-time updates. |
| **Database** | **PostgreSQL (Neon)** | Scalable database with the **PostGIS** extension for geospatial queries. |
| **Real-time** | **Socket.IO** | Enables instant status updates and new report notifications. |

-----

## 📂 Project Structure

The repository is structured with a clear separation of concerns between client and server.

```
SIH-CODEBASE/
├── .gitignore          # Ignores all node_modules, .env, and build artifacts
|
├── backend/            # NODE.JS API SERVER
│   ├── node_modules/   # (Dependencies installed via 'npm install')
│   ├── .env            # REQUIRED: Database URL and server port
│   ├── index.js        # Main Express server and API routes
│   └── database.js     # PostgreSQL (Neon) connection client and pool manager
|
└── frontend/           # REACT NATIVE MOBILE APP
    └── SIH-APP/        # (The Expo project root)
        ├── node_modules/
        ├── package.json
        ├── App.js        # Main file, imports ReportForm
        └── src/
            └── components/
                └── ReportForm.js # Component for capturing GPS and submitting report
```

-----

## ⚙️ Local Setup Instructions

Follow these steps precisely to get the entire stack running on your local machine.

### Step 1: Clone and Install Dependencies

1.  **Clone the repository:**

    ```bash
    git clone [YOUR REPO URL]
    cd civic-reporting-sih
    ```

2.  **Install Backend Dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**

    ```bash
    cd ../frontend/SIH-APP
    npm install
    ```

### Step 2: Database and Configuration

1.  **Configure Neon Database URL:**

      * Create a file named **`.env`** inside the `backend/` directory.
      * Paste your Neon connection string. **Ensure the password is URL-encoded if it contains special characters.**

    <!-- end list -->

    ```env
    # backend/.env
    DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&..."
    PORT=3000
    ```

2.  **Run Initial Database Setup (PostGIS):**

      * Connect to your Neon database (via the web console or psql).
      * Execute the following SQL commands **once**:

    <!-- end list -->

    ```sql
    CREATE EXTENSION postgis;

    CREATE TABLE reports (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'New',
        location GEOMETRY(Point, 4326)
    );

    CREATE INDEX reports_gix ON reports USING GIST (location);
    ```

### Step 3: Configure Frontend Network

The mobile app must know your computer's IP address to connect.

1.  **Find Your Local IP:** (e.g., `192.168.x.x` or `10.0.2.2` for Android Emulator).

2.  **Update the Base URL:** Edit the file **`frontend/SIH-APP/src/components/ReportForm.js`** and change the `BASE_URL` constant.

    ```javascript
    // In ReportForm.js
    const BASE_URL = 'http://[YOUR_LOCAL_IP_ADDRESS]:3000'; 
    ```

### Step 4: Run the Application

You must start the backend server and the frontend client simultaneously.

1.  **Start the Backend API:**

      * In your first terminal window:

    <!-- end list -->

    ```bash
    cd backend
    npm start  # Runs index.js via nodemon
    ```

    *(You should see "Backend API running on http://localhost:3000")*

2.  **Start the Frontend Client:**

      * In your second terminal window:

    <!-- end list -->

    ```bash
    cd frontend/SIH-APP
    npm start  # Starts the Expo Metro Bundler
    ```

    *(This will display a **QR code** in the terminal or browser.)*

3.  **Launch the App:**

      * **Mobile:** Open the **Expo Go** app on your phone and **scan the QR code**.
      * **Web (Quick Test):** Press **`w`** in the terminal window running the Expo Bundler.
