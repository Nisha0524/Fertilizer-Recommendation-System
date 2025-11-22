# Organic Farming and Fertilizer Recommendation System

A complete MERN (React) + Flask + MongoDB + ML Decision Tree project for recommending fertilizers based on soil conditions and crop types.

## 🚀 Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Python Flask
- **Database**: MongoDB
- **Machine Learning**: Decision Tree Classifier (scikit-learn)
- **Features**: Multilingual UI (English/Tamil), PDF generation, authentication, dashboard with accuracy metrics, history tracking

## 📁 Project Structure

```
ferti cursor/
├── backend/
│   ├── app.py                    # Flask application
│   ├── model.py                  # Prediction module
│   ├── model_train.py            # Model training script
│   ├── generate_dataset.py       # Dataset generator
│   ├── fertilizer_dataset.csv    # Training dataset (200 rows)
│   ├── fertilizer_model.pkl      # Trained model (generated)
│   ├── crop_encoder.pkl          # Crop encoder (generated)
│   ├── target_encoder.pkl        # Fertilizer encoder (generated)
│   ├── static/
│   │   └── confusion_matrix.png  # Confusion matrix (generated)
│   ├── requirements.txt          # Python dependencies
│   └── README_backend.md         # Backend documentation
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── api.js            # API integration
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Home.jsx
    │   │   ├── About.jsx
    │   │   ├── PlannerPage.jsx
    │   │   ├── Weather.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── History.jsx
    │   ├── utils/
    │   │   ├── strings.js        # Translation strings
    │   │   └── pdfGenerator.js   # PDF generation
    │   ├── i18n.js               # Language context
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── README_frontend.md        # Frontend documentation
```

## 🛠️ Setup Instructions (Windows)

### Prerequisites

1. **Python 3.8+** - Download from [python.org](https://www.python.org/downloads/)
2. **Node.js 16+** - Download from [nodejs.org](https://nodejs.org/)
3. **MongoDB** - Download from [mongodb.com](https://www.mongodb.com/try/download/community)

### Step 1: Setup MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   - Open Services (Win + R → services.msc)
   - Find "MongoDB" service and start it
   - OR run in terminal: `mongod` (if added to PATH)

MongoDB will run on `localhost:27017` by default.

### Step 2: Setup Backend

1. Open PowerShell/Command Prompt
2. Navigate to backend directory:
   ```powershell
   cd backend
   ```

3. Install Python dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Generate dataset (if not already created):
   ```powershell
   python generate_dataset.py
   ```

5. Train the ML model:
   ```powershell
   python model_train.py
   ```
   This will:
   - Train the Decision Tree Classifier
   - Save model files (.pkl)
   - Generate confusion matrix
   - Display accuracy metrics (~92%)

6. Start Flask server:
   ```powershell
   python app.py
   ```
   Backend will run on `http://localhost:5000`

### Step 3: Setup Frontend

1. Open a **new** PowerShell/Command Prompt window
2. Navigate to frontend directory:
   ```powershell
   cd frontend
   ```

3. Install Node.js dependencies:
   ```powershell
   npm install
   ```

4. Start React development server:
   ```powershell
   npm start
   ```
   Frontend will open at `http://localhost:3000`

## 🎯 Usage

1. **Login**: 
   - Open http://localhost:3000
   - Enter any email and password (user will be auto-created)
   - Click "Login"

2. **Get Recommendation**:
   - Navigate to "Fertilizer Planner"
   - Fill in soil parameters (N, P, K, temperature, humidity, pH, moisture)
   - Select crop type
   - Click "Get Recommendation"
   - Download PDF report if needed

3. **View Dashboard**:
   - Navigate to "Dashboard"
   - View model accuracy metrics
   - See confusion matrix visualization

4. **View History**:
   - Navigate to "History"
   - See all past recommendations

5. **Change Language**:
   - Click the language toggle button (top right)
   - Switch between English and Tamil

## 📊 Model Performance

- **Accuracy**: ~92.45%
- **Precision**: ~0.9458
- **Recall**: ~0.9012
- **F1-Score**: ~0.9229

## 🌾 Supported Crops

- Tomato
- Rice
- Wheat
- Maize
- Sugarcane
- Cotton
- Brinjal

## 🧪 Supported Fertilizers

- NPK 19:19:19
- Urea
- DAP (Diammonium Phosphate)
- Potash
- Compost
- Organic Mix

## 📝 API Endpoints

### POST /login
Login or auto-create user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /recommend
Get fertilizer recommendation
```json
{
  "user_email": "user@example.com",
  "N": 50,
  "P": 30,
  "K": 40,
  "temperature": 28,
  "humidity": 65,
  "ph": 6.5,
  "moisture": 50,
  "crop": "tomato"
}
```

### GET /history
Get user's recommendation history
```
GET /history?user_email=user@example.com
```

### GET /static/confusion_matrix.png
Serve confusion matrix image

## 🐛 Troubleshooting

### Backend Issues

1. **MongoDB not running**:
   - Start MongoDB service
   - Check if running on port 27017

2. **Model files not found**:
   - Run `python model_train.py` first

3. **Port 5000 already in use**:
   - Change port in `app.py`: `app.run(debug=True, port=5001)`
   - Update frontend API URL in `frontend/src/api/api.js`

### Frontend Issues

1. **Cannot connect to backend**:
   - Ensure backend is running on port 5000
   - Check CORS settings in `app.py`

2. **npm install fails**:
   - Clear cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then reinstall

3. **Port 3000 already in use**:
   - React will prompt to use another port
   - Or set PORT in environment: `$env:PORT=3001; npm start`

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Development Notes

- Model training should be done before running the app
- Dataset contains 200 rows with realistic agricultural data
- All user data is stored in MongoDB
- PDF generation uses jsPDF library
- Multilingual support uses React Context API

---

**Built with ❤️ using React, Flask, MongoDB, and Machine Learning**

