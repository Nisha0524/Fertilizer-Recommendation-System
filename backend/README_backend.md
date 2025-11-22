# Backend - Fertilizer Recommendation System

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Ensure MongoDB is running:**
   - Install MongoDB from https://www.mongodb.com/try/download/community
   - Start MongoDB service (usually runs on localhost:27017)

3. **Generate dataset (if not already created):**
   ```bash
   python generate_dataset.py
   ```

4. **Train the model:**
   ```bash
   python model_train.py
   ```
   This will:
   - Load the dataset
   - Train a Decision Tree Classifier
   - Save the model and encoders
   - Generate confusion matrix
   - Display accuracy metrics (~92%)

5. **Run the Flask server:**
   ```bash
   python app.py
   ```
   Server will run on http://localhost:5000

## API Endpoints

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

## Files

- `app.py` - Flask application with API routes
- `model_train.py` - Model training script
- `model.py` - Prediction module
- `fertilizer_dataset.csv` - Training dataset (200 rows)
- `fertilizer_model.pkl` - Trained model
- `crop_encoder.pkl` - Crop label encoder
- `target_encoder.pkl` - Fertilizer label encoder
- `static/confusion_matrix.png` - Model performance visualization

