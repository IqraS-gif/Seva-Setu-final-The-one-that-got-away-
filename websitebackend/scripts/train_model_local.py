import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier

def train_dummy_model():
    """
    Trains a synthetic model for immediate UI testing.
    Features: month (1-12), GoldsteinScale (-10 to +10), AvgTone (-100 to +100)
    Label: NGO Activity Probability (0 or 1)
    """
    print("🚀 Training local synthetic Gradient Boosting Model for UI testing...")
    
    # Generate synthetic training data
    n_samples = 1000
    
    # Random months
    months = np.random.randint(1, 13, n_samples)
    
    # Goldstein scale is usually around -10 to 10. Let's make extreme negative = higher NGO chance.
    goldstein = np.random.uniform(-10, 10, n_samples)
    
    # AvgTone is usually -100 to 100
    avg_tone = np.random.uniform(-10, 10, n_samples)
    
    # Synthetic labels: High likelihood of NGO if Goldstein is < -3 and Tone is < -2
    labels = ((goldstein < -3) & (avg_tone < -2)).astype(int)
    
    # Create DataFrame to match feature names
    df = pd.DataFrame({
        'month': months,
        'GoldsteinScale': goldstein,
        'AvgTone': avg_tone
    })
    
    # Train
    model = GradientBoostingClassifier(n_estimators=50, random_state=42)
    model.fit(df, labels)
    
    # Save
    os.makedirs(os.path.join(os.path.dirname(__file__), '../models'), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), '../models', 'ngo_risk_model.joblib')
    joblib.dump(model, model_path)
    
    print(f"✅ Model saved successfully at: {model_path}")
    print("You can now test the local Risk Dashboard API immediately.")

if __name__ == "__main__":
    train_dummy_model()
