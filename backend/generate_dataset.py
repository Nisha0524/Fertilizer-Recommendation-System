import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Define crops and fertilizers
crops = [
    'tomato', 'rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'brinjal',
    'potato', 'onion', 'chilli', 'cabbage', 'cauliflower', 'carrot',
    'beans', 'peas', 'cucumber', 'pumpkin', 'watermelon', 'banana',
    'mango', 'coconut', 'groundnut', 'sunflower', 'soybean', 'mustard',
    'barley', 'oats', 'millet', 'sorghum', 'paddy', 'turmeric', 'ginger'
]
fertilizers = ['NPK 19:19:19', 'Urea', 'DAP', 'Potash', 'Compost', 'Organic Mix']

# Generate 400 rows of data to cover all crops
data = []

for i in range(400):
    # Generate realistic values
    n = round(np.random.uniform(0, 100), 2)
    p = round(np.random.uniform(0, 100), 2)
    k = round(np.random.uniform(0, 100), 2)
    temperature = round(np.random.uniform(20, 40), 2)
    humidity = round(np.random.uniform(30, 90), 2)
    ph = round(np.random.uniform(5.5, 7.5), 2)
    moisture = round(np.random.uniform(20, 80), 2)
    crop = np.random.choice(crops)
    
    # Assign fertilizer based on some logic (to make it more realistic)
    # Low N -> Urea, Low P -> DAP, Low K -> Potash, Balanced -> NPK, Organic preference -> Compost/Organic Mix
    if n < 30 and p < 30 and k < 30:
        fertilizer = np.random.choice(['NPK 19:19:19', 'Organic Mix'])
    elif n < 40:
        fertilizer = 'Urea'
    elif p < 30:
        fertilizer = 'DAP'
    elif k < 30:
        fertilizer = 'Potash'
    elif crop in ['tomato', 'brinjal', 'potato', 'onion', 'chilli', 'cabbage', 'cauliflower', 'carrot', 'beans', 'peas', 'cucumber', 'pumpkin']:
        fertilizer = np.random.choice(['NPK 19:19:19', 'Compost', 'Organic Mix'])
    elif crop in ['rice', 'wheat', 'barley', 'oats', 'millet', 'sorghum', 'paddy']:
        fertilizer = np.random.choice(['Urea', 'DAP', 'NPK 19:19:19'])
    elif crop in ['watermelon', 'banana', 'mango', 'coconut']:
        fertilizer = np.random.choice(['NPK 19:19:19', 'Potash', 'Organic Mix'])
    elif crop in ['groundnut', 'sunflower', 'soybean', 'mustard', 'cotton']:
        fertilizer = np.random.choice(['DAP', 'NPK 19:19:19', 'Urea'])
    elif crop in ['turmeric', 'ginger']:
        fertilizer = np.random.choice(['Compost', 'Organic Mix', 'NPK 19:19:19'])
    else:
        fertilizer = np.random.choice(fertilizers)
    
    data.append({
        'N': n,
        'P': p,
        'K': k,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'moisture': moisture,
        'crop': crop,
        'fertilizer': fertilizer
    })

# Create DataFrame
df = pd.DataFrame(data)

# Save to CSV
df.to_csv('fertilizer_dataset.csv', index=False)
print(f'Dataset created with {len(df)} rows')
print(f'Crops: {df["crop"].unique()}')
print(f'Fertilizers: {df["fertilizer"].unique()}')

