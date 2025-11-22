# Tamil Nadu Districts Dataset

## Location
The Tamil Nadu districts dataset is located at:
**`frontend/src/data/tamilNaduDistricts.js`**

## Current Dataset
The file contains all 38 districts of Tamil Nadu with:
- English district names
- Tamil translations for each district

## How to Add More Data

### To Add More Districts (if new districts are created):
1. Open `frontend/src/data/tamilNaduDistricts.js`
2. Add the district name to the `tamilNaduDistricts` array
3. Add the Tamil translation to the `tamilNaduDistrictsTamil` object

Example:
```javascript
export const tamilNaduDistricts = [
  // ... existing districts
  'NewDistrict'  // Add new district here
];

export const tamilNaduDistrictsTamil = {
  // ... existing translations
  'NewDistrict': 'புதிய மாவட்டம்'  // Add Tamil translation here
};
```

### To Add District-Specific Data (Optional):
You can extend the dataset to include:
- District-specific crop recommendations
- District-specific soil types
- District-specific weather patterns
- District-specific fertilizer preferences

To do this, create a new object in the same file:

```javascript
export const districtCropData = {
  'Coimbatore': {
    recommendedCrops: ['cotton', 'sugarcane', 'rice'],
    soilType: 'Black Soil',
    avgRainfall: '700-900mm'
  },
  'Madurai': {
    recommendedCrops: ['rice', 'cotton', 'chilli'],
    soilType: 'Red Soil',
    avgRainfall: '600-800mm'
  }
  // Add more districts as needed
};
```

## Usage
The dataset is imported and used in:
- `frontend/src/pages/PlannerPage.jsx` - For location dropdown

## Notes
- The dataset is currently static (hardcoded)
- For dynamic data, consider creating a backend API endpoint
- The Tamil translations are used when the language is set to Tamil

