# Horizon Travel

This repository contains the codebase for the **Horizon Travel** application, which consists of a Flask backend and a Next.js frontend.

---

## Project Structure

```text
horizon-travels/
├── backend/           # Flask backend code
├── frontend/          # Next.js frontend app
├── node_modules/      # Node.js dependencies (auto-generated)
├── venv/              # Python virtual environment (optional, user-created)
├── package.json       # Node.js root package file
├── package-lock.json  # Node.js lock file
├── start-flask.bat    # Windows batch script to start Flask backend
├── user-zone.mp3      # Media file (example)
├── .gitignore         # Git ignore file
```

---

## Setup Instructions

### 1. Backend Setup (Flask)

1. Create and activate a Python virtual environment:

- **Windows:**

```powershell
python -m venv venv
.\venv\Scripts\activate
```

- **macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install Python dependencies:

```bash
pip install -r backend/requirements.txt
```

---

### 2. Frontend Setup (Next.js)

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js packages:

```bash
npm install
```

---

### 3. Running the Application

- **Start Flask backend:**

From the project root directory, activate your Python environment (if not already activated) and run:

```bash
python backend/app.py
```

Or on Windows, you can use the batch script:

```powershell
.\start-flask.bat
```

- **Start Next.js frontend:**

From the `frontend` directory:

```bash
npm run dev
```

---

### 4. Convenience Script (Optional)
Default (ROOT FOLDER):
```bash
    npm run dev # Development mode
```

```bash
    npm run prod # Production mode (frontend)
```

You can create a script to automate environment setup and installs:
- Create a script (e.g., `setup.sh` or `setup.bat`) that:

  - Creates and activates Python virtual environment
  - Installs Python requirements
  - Runs `npm install` in `frontend`

---

## Notes

- Make sure you have **Python 3.8+** and **Node.js 16+** installed on your machine.
- The database file (`*.db`) is allowed and tracked in the backend.
- The `.gitignore` is configured to ignore common build and dependency directories.

---

Feel free to reach out if you need any help setting up the project!
