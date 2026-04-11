<<<<<<< HEAD
# FSDLProject
=======
# Hotel Khalsa Punjab - Booking System

A beautifully designed, full-stack web application offering a premium hotel and lawn booking experience for Hotel Khalsa Punjab. 

![Project Overview](https://img.shields.io/badge/Stack-React_|_Node.js_|_MongoDB-informational?style=flat&logo=react&logoColor=white&color=2bbc8a)

## ✨ Key Features
- **Secure User Authentication**: Complete login, registration, and session management using JWT.
- **Dynamic User Profiles**: View profile details and upload custom profile pictures (Base64 encoding).
- **Room & Event Booking**: An integrated booking platform allowing seamless reservations for hotel rooms and event lawns.
- **Aesthetic Gallery & Typography**: Beautiful glassmorphic UI displaying hotel amenities, utilizing tailored typography (Editorial New & Open Sans).
- **Fully Responsive**: Polished, mobile-responsive layout utilizing Tailwind CSS utility classes directly within an ethereal visual theme.

## 🛠 Tech Stack
- **Frontend**: React.js, Tailwind CSS, `lucide-react` for iconography.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose) and localized SQLite fallback logic.

## 🚀 Quick Start / Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and `npm` installed on your machine. Ensure you have MongoDB running locally on `mongodb://127.0.0.1:27017` or provide a valid connection string.

### 1. Backend Setup
Open your terminal and navigate to the `backend` directory:
```bash
# Move into the backend directory
cd backend

# Install all backend dependencies
npm install

# Start the Express server
node server.js
```
*The backend server will start running on `http://localhost:5000`.*

### 2. Frontend Setup
Open a **new** terminal window and navigate to the `frontend` directory:
```bash
# Move into the frontend directory
cd frontend

# Install all frontend dependencies
npm install

# Start the Vite/React development server
npm run dev
```
*Your terminal will output a local URL (usually `http://localhost:5173`). Click it to view the web application!*

## 💡 Important Notes for Git
If you accidentally ran `git add .` before creating a `.gitignore`, your `node_modules` might manually be tracked. You can remove them efficiently from git cache using the following command before pushing:
```bash
git rm -r --cached .
git add .
git commit -m "Update gitignore and untrack modules"
```

## Acknowledgments
Built with ❤️ for a modern architectural and seamless user experience.
>>>>>>> afc9cc3 (Code Updated)
