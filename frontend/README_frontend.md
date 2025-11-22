# Frontend - Fertilizer Recommendation System

## Setup Instructions

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at http://localhost:3000

## Features

- **Login Page**: Simple email/password authentication
- **Home Page**: Welcome page with feature overview
- **About Page**: Information about the system
- **Fertilizer Planner**: Input form to get fertilizer recommendations
- **Dashboard**: Display model accuracy metrics and confusion matrix
- **History**: View past recommendations
- **Weather**: Placeholder for weather information
- **Multilingual Support**: Toggle between English and Tamil
- **PDF Generation**: Download recommendation reports as PDF

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── api.js          # API calls to backend
│   ├── components/
│   │   ├── Navbar.jsx      # Navigation bar
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── PlannerPage.jsx
│   │   ├── Weather.jsx
│   │   ├── Dashboard.jsx
│   │   └── History.jsx
│   ├── utils/
│   │   ├── strings.js      # Translation strings
│   │   └── pdfGenerator.js # PDF generation
│   ├── i18n.js             # Language context
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
└── package.json
```

## API Configuration

The frontend connects to the backend API at `http://localhost:5000`. Make sure the backend server is running before using the frontend.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

## Dependencies

- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.2
- jsPDF 2.5.1

