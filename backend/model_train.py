import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib.pyplot as plt
import pickle
import os

def train_model():
    # Load dataset
    df = pd.read_csv('fertilizer_dataset.csv')
    
    print("Dataset shape:", df.shape)
    print("\nFirst few rows:")
    print(df.head())
    print("\nDataset info:")
    print(df.info())
    
    # Encode categorical variables
    crop_encoder = LabelEncoder()
    target_encoder = LabelEncoder()
    
    df['crop_encoded'] = crop_encoder.fit_transform(df['crop'])
    df['fertilizer_encoded'] = target_encoder.fit_transform(df['fertilizer'])
    
    # Prepare features and target
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'moisture', 'crop_encoded']
    X = df[features]
    y = df['fertilizer_encoded']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Decision Tree Classifier
    model = DecisionTreeClassifier(random_state=42, max_depth=15, min_samples_split=5)
    model.fit(X_train, y_train)
    
    # Predictions
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    print("\n" + "="*50)
    print("MODEL PERFORMANCE METRICS")
    print("="*50)
    print(f"Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1-Score: {f1:.4f}")
    print("="*50)
    
    # Generate confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix - Fertilizer Recommendation Model')
    plt.colorbar()
    
    # Get class labels
    classes = target_encoder.classes_
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45, ha='right')
    plt.yticks(tick_marks, classes)
    
    # Add text annotations
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], 'd'),
                    horizontalalignment="center",
                    color="white" if cm[i, j] > thresh else "black")
    
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    
    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)
    
    # Save confusion matrix
    plt.savefig('static/confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("\nConfusion matrix saved to static/confusion_matrix.png")
    
    # Save model and encoders
    with open('fertilizer_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    with open('crop_encoder.pkl', 'wb') as f:
        pickle.dump(crop_encoder, f)
    
    with open('target_encoder.pkl', 'wb') as f:
        pickle.dump(target_encoder, f)
    
    print("\nModel and encoders saved successfully!")
    print("- fertilizer_model.pkl")
    print("- crop_encoder.pkl")
    print("- target_encoder.pkl")
    
    return accuracy, precision, recall, f1

if __name__ == '__main__':
    train_model()

