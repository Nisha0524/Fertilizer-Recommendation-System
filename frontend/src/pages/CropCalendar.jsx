import React, { useState } from 'react';
import { useLanguage } from '../i18n';
import './CropCalendar.css';

const CropCalendar = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [rainfallInput, setRainfallInput] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedSeasonalAdvice, setSelectedSeasonalAdvice] = useState('');

  const seasons = [
    { value: 'kharif', label: t('kharif'), months: t('kharifMonths') },
    { value: 'rabi', label: t('rabi'), months: t('rabiMonths') },
    { value: 'zaid', label: t('zaid'), months: t('zaidMonths') }
  ];

  const cropCalendar = {
    kharif: [
      { crop: 'rice', planting: t('juneJuly'), harvest: t('octNov'), duration: '120-150 days' },
      { crop: 'maize', planting: t('juneJuly'), harvest: t('sepOct'), duration: '80-100 days' },
      { crop: 'cotton', planting: t('mayJune'), harvest: t('octDec'), duration: '150-180 days' },
      { crop: 'sugarcane', planting: t('febMar'), harvest: t('decJan'), duration: '10-12 months' },
      { crop: 'groundnut', planting: t('juneJuly'), harvest: t('octNov'), duration: '90-120 days' },
      { crop: 'soybean', planting: t('juneJuly'), harvest: t('sepOct'), duration: '90-110 days' },
      { crop: 'turmeric', planting: t('mayJune'), harvest: t('janFeb'), duration: '7-9 months' },
      { crop: 'ginger', planting: t('mayJune'), harvest: t('janFeb'), duration: '8-10 months' }
    ],
    rabi: [
      { crop: 'wheat', planting: t('novDec'), harvest: t('marApr'), duration: '120-150 days' },
      { crop: 'barley', planting: t('novDec'), harvest: t('marApr'), duration: '100-120 days' },
      { crop: 'mustard', planting: t('octNov'), harvest: t('febMar'), duration: '90-120 days' },
      { crop: 'potato', planting: t('octNov'), harvest: t('febMar'), duration: '90-120 days' },
      { crop: 'onion', planting: t('novDec'), harvest: t('aprMay'), duration: '120-150 days' },
      { crop: 'carrot', planting: t('octNov'), harvest: t('febMar'), duration: '70-90 days' },
      { crop: 'cabbage', planting: t('octNov'), harvest: t('febMar'), duration: '80-100 days' },
      { crop: 'cauliflower', planting: t('sepOct'), harvest: t('janFeb'), duration: '90-120 days' }
    ],
    zaid: [
      { crop: 'cucumber', planting: t('marApr'), harvest: t('mayJun'), duration: '50-70 days' },
      { crop: 'watermelon', planting: t('marApr'), harvest: t('mayJun'), duration: '70-90 days' },
      { crop: 'pumpkin', planting: t('marApr'), harvest: t('mayJun'), duration: '90-120 days' },
      { crop: 'tomato', planting: t('marApr'), harvest: t('mayJul'), duration: '90-120 days' },
      { crop: 'brinjal', planting: t('marApr'), harvest: t('mayJul'), duration: '100-120 days' },
      { crop: 'chilli', planting: t('marApr'), harvest: t('mayJul'), duration: '90-120 days' }
    ]
  };

  // Seasonal eating advice - when to eat what crops
  const seasonalEatingAdvice = {
    winter: {
      recommended: ['carrot', 'beetroot', 'radish', 'turnip', 'sweet potato', 'potato', 'onion', 'garlic', 'ginger', 'turmeric'],
      avoid: ['cucumber', 'watermelon', 'cabbage', 'cauliflower', 'greens'],
      tips: [
        'Avoid cold foods like cucumber and watermelon in winter',
        'Eat root vegetables like carrot, beetroot for warmth',
        'Include ginger and turmeric for immunity',
        'Avoid leafy greens as they can cause cold',
        'Prefer cooked vegetables over raw salads'
      ]
    },
    summer: {
      recommended: ['cucumber', 'watermelon', 'tomato', 'onion', 'carrot', 'pumpkin', 'bottle gourd', 'ridge gourd'],
      avoid: ['potato', 'sweet potato', 'heavy vegetables'],
      tips: [
        'Eat cooling foods like cucumber and watermelon',
        'Carrots are excellent in summer for hydration',
        'Include tomatoes for vitamin C',
        'Avoid heavy, starchy vegetables',
        'Prefer light, water-rich vegetables'
      ]
    },
    monsoon: {
      recommended: ['ginger', 'turmeric', 'garlic', 'onion', 'pepper', 'bitter gourd', 'drumstick'],
      avoid: ['leafy greens', 'raw vegetables', 'cut fruits'],
      tips: [
        'Avoid leafy greens during monsoon (high contamination risk)',
        'Eat immunity-boosting foods like ginger, turmeric',
        'Prefer cooked vegetables over raw',
        'Include bitter gourd for digestive health',
        'Avoid street food and cut fruits'
      ]
    },
    spring: {
      recommended: ['carrot', 'radish', 'cabbage', 'cauliflower', 'peas', 'beans', 'onion'],
      avoid: ['heavy vegetables'],
      tips: [
        'Fresh vegetables are best in spring',
        'Include seasonal greens and root vegetables',
        'Moderate consumption of all vegetables',
        'Enjoy fresh peas and beans'
      ]
    }
  };

  // Recipe details for interactive cooking suggestions
  const recipeDetails = {
    'Carrot Halwa': {
      ingredients: ['Carrots (500g)', 'Milk (500ml)', 'Sugar (200g)', 'Ghee (50g)', 'Cardamom', 'Nuts'],
      steps: ['Grate carrots', 'Cook in milk until soft', 'Add sugar and ghee', 'Garnish with nuts'],
      time: '45 minutes',
      difficulty: 'Easy'
    },
    'Carrot Sambar': {
      ingredients: ['Carrots', 'Toor dal', 'Tamarind', 'Sambar powder', 'Onion', 'Tomato'],
      steps: ['Cook dal', 'Add vegetables', 'Add sambar powder', 'Season with tamarind'],
      time: '30 minutes',
      difficulty: 'Medium'
    },
    'Carrot Fried Rice': {
      ingredients: ['Rice', 'Carrots', 'Onion', 'Garlic', 'Soy sauce', 'Pepper'],
      steps: ['Cook rice', 'Stir fry vegetables', 'Mix with rice', 'Season'],
      time: '25 minutes',
      difficulty: 'Easy'
    }
  };

  // Crop suggestions data - cooking recipes, skincare, and medicinal benefits
  const cropSuggestions = {
    // Kharif crops
    rice: {
      type: 'cooking',
      cooking: ['Biryani', 'Pulao', 'Fried Rice', 'Rice Pudding (Payasam)', 'Idli', 'Dosa', 'Pongal', 'Lemon Rice'],
      healthBenefits: ['Rich in carbohydrates for energy', 'Good source of B vitamins', 'Helps in digestion', 'Gluten-free option'],
      medicinal: ['Helps control blood pressure', 'Provides essential amino acids', 'Supports heart health']
    },
    maize: {
      type: 'cooking',
      cooking: ['Corn on the Cob', 'Corn Soup', 'Corn Fritters (Bhajji)', 'Corn Salad', 'Corn Chaat', 'Makki ki Roti', 'Corn Pulao'],
      healthBenefits: ['High in fiber', 'Rich in antioxidants', 'Good for eye health', 'Supports digestion'],
      medicinal: ['Helps prevent constipation', 'Rich in lutein for eye health', 'May reduce risk of heart disease']
    },
    cotton: {
      type: 'skincare',
      skincare: ['Cotton seed oil for moisturizing', 'Cotton fabric for sensitive skin', 'Natural cotton pads for skincare', 'Cotton-based face masks'],
      healthBenefits: ['Hypoallergenic fabric', 'Breathable material', 'Natural and organic'],
      medicinal: ['Cotton seed oil has anti-inflammatory properties', 'Used in traditional medicine for skin conditions', 'Natural wound dressing material']
    },
    sugarcane: {
      type: 'cooking',
      cooking: ['Sugarcane Juice', 'Jaggery (Gur)', 'Sugarcane Candy', 'Sugarcane Syrup', 'Traditional sweets'],
      healthBenefits: ['Quick energy source', 'Natural sweetener', 'Rich in minerals'],
      medicinal: ['Helps in hydration', 'Provides instant energy', 'Traditional remedy for jaundice']
    },
    groundnut: {
      type: 'cooking',
      cooking: ['Peanut Chutney', 'Peanut Curry', 'Peanut Butter', 'Peanut Ladoo', 'Peanut Sundal', 'Peanut Brittle'],
      healthBenefits: ['High in protein', 'Rich in healthy fats', 'Good source of vitamins'],
      medicinal: ['May reduce heart disease risk', 'Supports brain health', 'Helps in weight management']
    },
    soybean: {
      type: 'cooking',
      cooking: ['Soybean Curry', 'Soybean Salad', 'Tofu dishes', 'Soy Milk', 'Soybean Stir Fry', 'Soybean Soup'],
      healthBenefits: ['Complete protein source', 'Rich in isoflavones', 'Good for bone health'],
      medicinal: ['May reduce cholesterol', 'Supports menopausal health', 'May reduce cancer risk']
    },
    turmeric: {
      type: 'cooking',
      cooking: ['Turmeric Milk (Golden Milk)', 'Turmeric Rice', 'Curry dishes', 'Turmeric Tea', 'Pickles'],
      healthBenefits: ['Powerful anti-inflammatory', 'Rich in curcumin', 'Boosts immunity'],
      medicinal: ['Helps with arthritis pain', 'May improve brain function', 'Good for skin health', 'Traditional wound healer']
    },
    ginger: {
      type: 'cooking',
      cooking: ['Ginger Tea', 'Ginger Chutney', 'Ginger Pickle', 'Ginger Curry', 'Ginger Cookies', 'Ginger Lemonade'],
      healthBenefits: ['Aids digestion', 'Reduces nausea', 'Anti-inflammatory properties'],
      medicinal: ['Helps with cold and flu', 'Reduces muscle pain', 'May lower blood sugar', 'Good for heart health']
    },
    // Rabi crops
    wheat: {
      type: 'cooking',
      cooking: ['Roti/Chapati', 'Bread', 'Wheat Upma', 'Wheat Dosa', 'Wheat Halwa', 'Wheat Pulao', 'Paratha'],
      healthBenefits: ['High in fiber', 'Rich in B vitamins', 'Good source of protein'],
      medicinal: ['Helps in weight management', 'Supports digestive health', 'May reduce diabetes risk']
    },
    barley: {
      type: 'cooking',
      cooking: ['Barley Soup', 'Barley Salad', 'Barley Porridge', 'Barley Water', 'Barley Roti'],
      healthBenefits: ['High in fiber', 'Rich in minerals', 'Low glycemic index'],
      medicinal: ['Helps lower cholesterol', 'Supports digestive health', 'May reduce heart disease risk']
    },
    mustard: {
      type: 'cooking',
      cooking: ['Mustard Curry', 'Mustard Pickle', 'Mustard Greens (Sarson ka Saag)', 'Mustard Oil dishes', 'Mustard Chutney'],
      healthBenefits: ['Rich in omega-3', 'High in antioxidants', 'Good source of vitamins'],
      medicinal: ['May reduce inflammation', 'Supports heart health', 'Traditional remedy for cold']
    },
    potato: {
      type: 'cooking',
      cooking: ['Aloo Curry', 'Potato Fry', 'Potato Biryani', 'Samosa', 'Aloo Paratha', 'Potato Chips', 'Mashed Potatoes'],
      healthBenefits: ['Good source of potassium', 'Rich in vitamin C', 'Provides energy'],
      medicinal: ['Helps maintain blood pressure', 'Supports muscle function', 'Good for skin health']
    },
    onion: {
      type: 'cooking',
      cooking: ['Onion Curry', 'Onion Pakora', 'Onion Salad', 'Onion Raita', 'Onion Rings', 'Caramelized Onions'],
      healthBenefits: ['Rich in antioxidants', 'Anti-inflammatory', 'Good for heart health'],
      medicinal: ['May reduce cancer risk', 'Helps control blood sugar', 'Supports bone health', 'Traditional remedy for cold']
    },
    carrot: {
      type: 'cooking',
      cooking: ['Carrot Halwa', 'Carrot Sambar', 'Carrot Fried Rice', 'Carrot Salad', 'Carrot Juice', 'Carrot Curry', 'Carrot Pickle'],
      healthBenefits: ['Excellent for eye health', 'Rich in beta-carotene', 'High in fiber'],
      medicinal: ['Improves vision', 'Boosts immunity', 'Good for skin', 'May reduce cancer risk', 'Supports heart health']
    },
    cabbage: {
      type: 'cooking',
      cooking: ['Cabbage Curry', 'Cabbage Stir Fry', 'Cabbage Salad', 'Cabbage Soup', 'Cabbage Paratha', 'Cabbage Kofta'],
      healthBenefits: ['Low in calories', 'High in vitamin K', 'Rich in antioxidants'],
      medicinal: ['Supports bone health', 'May reduce inflammation', 'Good for digestion']
    },
    cauliflower: {
      type: 'cooking',
      cooking: ['Cauliflower Curry', 'Gobi Manchurian', 'Cauliflower Rice', 'Cauliflower Soup', 'Cauliflower Paratha', 'Aloo Gobi'],
      healthBenefits: ['Low in calories', 'High in fiber', 'Rich in vitamins'],
      medicinal: ['May reduce cancer risk', 'Supports brain health', 'Good for digestion']
    },
    // Zaid crops
    cucumber: {
      type: 'cooking',
      cooking: ['Cucumber Salad', 'Cucumber Raita', 'Cucumber Juice', 'Cucumber Sandwich', 'Cucumber Soup', 'Cucumber Pickle'],
      healthBenefits: ['High water content', 'Low in calories', 'Rich in vitamins'],
      medicinal: ['Helps with hydration', 'Good for skin', 'May reduce blood sugar', 'Supports weight loss']
    },
    watermelon: {
      type: 'cooking',
      cooking: ['Watermelon Juice', 'Watermelon Salad', 'Watermelon Smoothie', 'Watermelon Sorbet', 'Watermelon Raita'],
      healthBenefits: ['High water content', 'Rich in lycopene', 'Low in calories'],
      medicinal: ['Helps with hydration', 'May reduce inflammation', 'Good for heart health', 'Supports skin health']
    },
    pumpkin: {
      type: 'cooking',
      cooking: ['Pumpkin Curry', 'Pumpkin Halwa', 'Pumpkin Soup', 'Pumpkin Pie', 'Pumpkin Seeds Snack', 'Pumpkin Paratha'],
      healthBenefits: ['Rich in beta-carotene', 'High in fiber', 'Good source of vitamins'],
      medicinal: ['Supports eye health', 'May boost immunity', 'Good for heart health', 'Helps with weight management']
    },
    tomato: {
      type: 'cooking',
      cooking: ['Tomato Curry', 'Tomato Soup', 'Tomato Salad', 'Tomato Chutney', 'Tomato Rice', 'Tomato Pickle', 'Brinjal Tomato Curry'],
      healthBenefits: ['Rich in lycopene', 'High in vitamin C', 'Good source of antioxidants'],
      medicinal: ['May reduce cancer risk', 'Supports heart health', 'Good for skin', 'Helps with eye health']
    },
    brinjal: {
      type: 'cooking',
      cooking: ['Brinjal Curry', 'Brinjal Fry', 'Baingan Bharta', 'Brinjal Pickle', 'Brinjal Chutney', 'Brinjal Biryani'],
      healthBenefits: ['Low in calories', 'High in fiber', 'Rich in antioxidants'],
      medicinal: ['May reduce cholesterol', 'Supports heart health', 'Good for digestion', 'May help with weight loss']
    },
    chilli: {
      type: 'cooking',
      cooking: ['Chilli Pickle', 'Chilli Chutney', 'Chilli Curry', 'Stuffed Chillies', 'Chilli Powder', 'Chilli Sauce'],
      healthBenefits: ['Rich in vitamin C', 'Contains capsaicin', 'Boosts metabolism'],
      medicinal: ['May reduce pain', 'Supports weight loss', 'May improve heart health', 'Traditional remedy for cold']
    }
  };

  const cropDetails = {
    // Kharif crops
    rice: {
      idealRainfall: '1000-2000 mm',
      harmfulRainfall: t('riceHarmfulRain'),
      protection: t('riceProtection'),
      tips: [t('riceTip1'), t('riceTip2'), t('riceTip3')]
    },
    maize: {
      idealRainfall: '500-800 mm',
      harmfulRainfall: t('maizeHarmfulRain'),
      protection: t('maizeProtection'),
      tips: [t('maizeTip1'), t('maizeTip2'), t('maizeTip3')]
    },
    cotton: {
      idealRainfall: '500-800 mm',
      harmfulRainfall: t('cottonHarmfulRain'),
      protection: t('cottonProtection'),
      tips: [t('cottonTip1'), t('cottonTip2'), t('cottonTip3')]
    },
    sugarcane: {
      idealRainfall: '1200-2000 mm',
      harmfulRainfall: t('sugarcaneHarmfulRain'),
      protection: t('sugarcaneProtection'),
      tips: [t('sugarcaneTip1'), t('sugarcaneTip2'), t('sugarcaneTip3')]
    },
    groundnut: {
      idealRainfall: '500-700 mm',
      harmfulRainfall: t('groundnutHarmfulRain'),
      protection: t('groundnutProtection'),
      tips: [t('groundnutTip1'), t('groundnutTip2'), t('groundnutTip3')]
    },
    soybean: {
      idealRainfall: '600-1000 mm',
      harmfulRainfall: t('soybeanHarmfulRain'),
      protection: t('soybeanProtection'),
      tips: [t('soybeanTip1'), t('soybeanTip2'), t('soybeanTip3')]
    },
    turmeric: {
      idealRainfall: '1000-2000 mm',
      harmfulRainfall: t('turmericHarmfulRain'),
      protection: t('turmericProtection'),
      tips: [t('turmericTip1'), t('turmericTip2'), t('turmericTip3')]
    },
    ginger: {
      idealRainfall: '1500-2500 mm',
      harmfulRainfall: t('gingerHarmfulRain'),
      protection: t('gingerProtection'),
      tips: [t('gingerTip1'), t('gingerTip2'), t('gingerTip3')]
    },
    // Rabi crops
    wheat: {
      idealRainfall: '400-600 mm',
      harmfulRainfall: t('wheatHarmfulRain'),
      protection: t('wheatProtection'),
      tips: [t('wheatTip1'), t('wheatTip2'), t('wheatTip3')]
    },
    barley: {
      idealRainfall: '300-500 mm',
      harmfulRainfall: t('barleyHarmfulRain'),
      protection: t('barleyProtection'),
      tips: [t('barleyTip1'), t('barleyTip2'), t('barleyTip3')]
    },
    mustard: {
      idealRainfall: '400-600 mm',
      harmfulRainfall: t('mustardHarmfulRain'),
      protection: t('mustardProtection'),
      tips: [t('mustardTip1'), t('mustardTip2'), t('mustardTip3')]
    },
    potato: {
      idealRainfall: '500-700 mm',
      harmfulRainfall: t('potatoHarmfulRain'),
      protection: t('potatoProtection'),
      tips: [t('potatoTip1'), t('potatoTip2'), t('potatoTip3')]
    },
    onion: {
      idealRainfall: '600-800 mm',
      harmfulRainfall: t('onionHarmfulRain'),
      protection: t('onionProtection'),
      tips: [t('onionTip1'), t('onionTip2'), t('onionTip3')]
    },
    carrot: {
      idealRainfall: '500-700 mm',
      harmfulRainfall: t('carrotHarmfulRain'),
      protection: t('carrotProtection'),
      tips: [t('carrotTip1'), t('carrotTip2'), t('carrotTip3')]
    },
    cabbage: {
      idealRainfall: '600-800 mm',
      harmfulRainfall: t('cabbageHarmfulRain'),
      protection: t('cabbageProtection'),
      tips: [t('cabbageTip1'), t('cabbageTip2'), t('cabbageTip3')]
    },
    cauliflower: {
      idealRainfall: '600-800 mm',
      harmfulRainfall: t('cauliflowerHarmfulRain'),
      protection: t('cauliflowerProtection'),
      tips: [t('cauliflowerTip1'), t('cauliflowerTip2'), t('cauliflowerTip3')]
    },
    // Zaid crops
    cucumber: {
      idealRainfall: '600-1000 mm',
      harmfulRainfall: t('cucumberHarmfulRain'),
      protection: t('cucumberProtection'),
      tips: [t('cucumberTip1'), t('cucumberTip2'), t('cucumberTip3')]
    },
    watermelon: {
      idealRainfall: '500-800 mm',
      harmfulRainfall: t('watermelonHarmfulRain'),
      protection: t('watermelonProtection'),
      tips: [t('watermelonTip1'), t('watermelonTip2'), t('watermelonTip3')]
    },
    pumpkin: {
      idealRainfall: '600-1000 mm',
      harmfulRainfall: t('pumpkinHarmfulRain'),
      protection: t('pumpkinProtection'),
      tips: [t('pumpkinTip1'), t('pumpkinTip2'), t('pumpkinTip3')]
    },
    tomato: {
      idealRainfall: '600-1000 mm',
      harmfulRainfall: t('tomatoHarmfulRain'),
      protection: t('tomatoProtection'),
      tips: [t('tomatoTip1'), t('tomatoTip2'), t('tomatoTip3')]
    },
    brinjal: {
      idealRainfall: '600-1000 mm',
      harmfulRainfall: t('brinjalHarmfulRain'),
      protection: t('brinjalProtection'),
      tips: [t('brinjalTip1'), t('brinjalTip2'), t('brinjalTip3')]
    },
    chilli: {
      idealRainfall: '600-1000 mm',
      harmfulRainfall: t('chilliHarmfulRain'),
      protection: t('chilliProtection'),
      tips: [t('chilliTip1'), t('chilliTip2'), t('chilliTip3')]
    }
  };

  const checkWeatherAlert = (crop, rainfall) => {
    if (!crop || !rainfall) return null;
    
    const details = cropDetails[crop.toLowerCase()];
    if (!details) return null;

    const rainfallNum = parseFloat(rainfall);
    const idealRange = details.idealRainfall.split('-');
    const minIdeal = parseFloat(idealRange[0]);
    const maxIdeal = parseFloat(idealRange[1]);

    if (rainfallNum > maxIdeal * 1.5) {
      return {
        type: 'danger',
        message: t('excessiveRainfall'),
        crop: crop,
        details: details.harmfulRainfall,
        protection: details.protection
      };
    } else if (rainfallNum < minIdeal * 0.5) {
      return {
        type: 'warning',
        message: t('insufficientRainfall'),
        crop: crop,
        details: t('needIrrigation')
      };
    }
    return null;
  };

  const selectedCrops = selectedSeason ? cropCalendar[selectedSeason] : [];
  const cropDetail = selectedCrop ? cropDetails[selectedCrop.toLowerCase()] : null;

  return (
    <div>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="container">
        <div className="card">
          <h1>{t('cropCalendar')}</h1>
          <p className="calendar-subtitle">{t('calendarSubtitle')}</p>

          {/* Season Selection */}
          <div className="season-selector">
            <h2>{t('selectSeason')}</h2>
            <div className="season-grid">
              {seasons.map(season => (
                <button
                  key={season.value}
                  className={`season-card ${selectedSeason === season.value ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSeason(season.value);
                    setSelectedCrop('');
                  }}
                >
                  <div className="season-name">{season.label}</div>
                  <div className="season-months">{season.months}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Crop List for Selected Season */}
          {selectedSeason && (
            <div className="crops-section">
              <h2>{t('cropsForSeason')}: {seasons.find(s => s.value === selectedSeason)?.label}</h2>
              <div className="crops-grid">
                {selectedCrops.map((item, index) => (
                  <div key={index} className="crop-card">
                    <div className="crop-name">{item.crop.charAt(0).toUpperCase() + item.crop.slice(1)}</div>
                    <div className="crop-info">
                      <div className="info-item">
                        <span className="info-label">{t('plantingTime')}:</span>
                        <span className="info-value">{item.planting}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('harvestTime')}:</span>
                        <span className="info-value">{item.harvest}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{t('duration')}:</span>
                        <span className="info-value">{item.duration}</span>
                      </div>
                    </div>
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedCrop(item.crop)}
                    >
                      {t('viewDetails')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crop Details Modal */}
          {selectedCrop && (
            <div 
              className="crop-details-modal"
              onClick={(e) => {
                if (e.target.className === 'crop-details-modal') {
                  setSelectedCrop('');
                  setRainfallInput('');
                  setWeatherAlert(null);
                }
              }}
            >
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => {
                  setSelectedCrop('');
                  setRainfallInput('');
                  setWeatherAlert(null);
                  setSelectedRecipe(null);
                  setSelectedSeasonalAdvice('');
                }}>×</button>
                <h2>{selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} {t('details')}</h2>
                
                {cropDetail ? (
                  <>
                    <div className="detail-section">
                      <h3>{t('rainfallRequirements')}</h3>
                      <p><strong>{t('idealRainfall')}:</strong> {cropDetail.idealRainfall}</p>
                      <div className="alert-box warning">
                        <strong>{t('harmfulRainfall')}:</strong> {cropDetail.harmfulRainfall}
                      </div>
                      <div className="alert-box info">
                        <strong>{t('protectionMeasures')}:</strong> {cropDetail.protection}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>{t('cultivationTips')}</h3>
                      <ul className="tips-list">
                        {cropDetail.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weather Alert Checker */}
                    <div className="weather-checker">
                      <h3>{t('checkRainfallImpact')}</h3>
                      <div className="checker-inputs">
                        <input
                          type="number"
                          placeholder={t('enterRainfall')}
                          className="rainfall-input"
                          value={rainfallInput}
                          onChange={(e) => {
                            setRainfallInput(e.target.value);
                            const alert = checkWeatherAlert(selectedCrop, e.target.value);
                            setWeatherAlert(alert);
                          }}
                        />
                        <span className="unit">mm</span>
                      </div>
                      {weatherAlert && (
                        <div className={`alert-box ${weatherAlert.type}`}>
                          <strong>{weatherAlert.message}</strong>
                          <p>{weatherAlert.details}</p>
                          {weatherAlert.protection && <p><strong>{t('protection')}:</strong> {weatherAlert.protection}</p>}
                        </div>
                      )}
                    </div>

                    {/* Crop Suggestions Section */}
                    {cropSuggestions[selectedCrop.toLowerCase()] && (
                      <div className="crop-suggestions-section">
                        <h3 className="suggestions-title">🍽️ Cooking & Usage Suggestions</h3>
                        
                        {cropSuggestions[selectedCrop.toLowerCase()].type === 'cooking' && cropSuggestions[selectedCrop.toLowerCase()].cooking && (
                          <div className="suggestion-category">
                            <h4 className="category-title">👨‍🍳 Cooking Recipes (Click for details)</h4>
                            <div className="suggestions-grid">
                              {cropSuggestions[selectedCrop.toLowerCase()].cooking.map((recipe, index) => (
                                <div 
                                  key={index} 
                                  className="suggestion-item cooking-item clickable-recipe"
                                  onClick={() => setSelectedRecipe(recipe)}
                                >
                                  <span className="suggestion-icon">🍳</span>
                                  <span>{recipe}</span>
                                  <span className="click-hint">Click for recipe →</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {cropSuggestions[selectedCrop.toLowerCase()].type === 'skincare' && cropSuggestions[selectedCrop.toLowerCase()].skincare && (
                          <div className="suggestion-category">
                            <h4 className="category-title">✨ Skincare Uses</h4>
                            <div className="suggestions-grid">
                              {cropSuggestions[selectedCrop.toLowerCase()].skincare.map((use, index) => (
                                <div key={index} className="suggestion-item skincare-item">
                                  <span className="suggestion-icon">💆</span>
                                  <span>{use}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {cropSuggestions[selectedCrop.toLowerCase()].healthBenefits && (
                          <div className="suggestion-category">
                            <h4 className="category-title">💚 Health Benefits</h4>
                            <ul className="health-benefits-list">
                              {cropSuggestions[selectedCrop.toLowerCase()].healthBenefits.map((benefit, index) => (
                                <li key={index}>
                                  <span className="benefit-icon">✓</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {cropSuggestions[selectedCrop.toLowerCase()].medicinal && (
                          <div className="suggestion-category">
                            <h4 className="category-title">🌿 Medicinal & Herbal Values</h4>
                            <ul className="medicinal-list">
                              {cropSuggestions[selectedCrop.toLowerCase()].medicinal.map((value, index) => (
                                <li key={index}>
                                  <span className="medicinal-icon">🌱</span>
                                  {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Seasonal Eating Advice */}
                        <div className="suggestion-category seasonal-advice">
                          <h4 className="category-title">🍽️ Seasonal Eating Advice</h4>
                          <div className="seasonal-selector">
                            <button 
                              className={`season-btn ${selectedSeasonalAdvice === 'winter' ? 'active' : ''}`}
                              onClick={() => setSelectedSeasonalAdvice(selectedSeasonalAdvice === 'winter' ? '' : 'winter')}
                            >
                              ❄️ Winter
                            </button>
                            <button 
                              className={`season-btn ${selectedSeasonalAdvice === 'summer' ? 'active' : ''}`}
                              onClick={() => setSelectedSeasonalAdvice(selectedSeasonalAdvice === 'summer' ? '' : 'summer')}
                            >
                              ☀️ Summer
                            </button>
                            <button 
                              className={`season-btn ${selectedSeasonalAdvice === 'monsoon' ? 'active' : ''}`}
                              onClick={() => setSelectedSeasonalAdvice(selectedSeasonalAdvice === 'monsoon' ? '' : 'monsoon')}
                            >
                              🌧️ Monsoon
                            </button>
                            <button 
                              className={`season-btn ${selectedSeasonalAdvice === 'spring' ? 'active' : ''}`}
                              onClick={() => setSelectedSeasonalAdvice(selectedSeasonalAdvice === 'spring' ? '' : 'spring')}
                            >
                              🌸 Spring
                            </button>
                          </div>
                          
                          {selectedSeasonalAdvice && seasonalEatingAdvice[selectedSeasonalAdvice] && (
                            <div className="seasonal-details">
                              <div className="seasonal-recommended">
                                <h5>✅ Recommended:</h5>
                                <div className="crop-tags">
                                  {seasonalEatingAdvice[selectedSeasonalAdvice].recommended.map((crop, idx) => (
                                    <span key={idx} className="crop-tag recommended">{crop}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="seasonal-avoid">
                                <h5>❌ Avoid:</h5>
                                <div className="crop-tags">
                                  {seasonalEatingAdvice[selectedSeasonalAdvice].avoid.map((crop, idx) => (
                                    <span key={idx} className="crop-tag avoid">{crop}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="seasonal-tips">
                                <h5>💡 Tips:</h5>
                                <ul>
                                  {seasonalEatingAdvice[selectedSeasonalAdvice].tips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="detail-section">
                    <p>{t('cropDetailsNotAvailable')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipe Details Modal */}
          {selectedRecipe && (
            <div 
              className="recipe-modal"
              onClick={(e) => {
                if (e.target.className === 'recipe-modal') {
                  setSelectedRecipe(null);
                }
              }}
            >
              <div className="recipe-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedRecipe(null)}>×</button>
                <h2>🍳 {selectedRecipe}</h2>
                {recipeDetails[selectedRecipe] ? (
                  <div className="recipe-details">
                    <div className="recipe-meta">
                      <span className="recipe-time">⏱️ {recipeDetails[selectedRecipe].time}</span>
                      <span className="recipe-difficulty">📊 {recipeDetails[selectedRecipe].difficulty}</span>
                    </div>
                    <div className="recipe-section">
                      <h3>📋 Ingredients:</h3>
                      <ul className="ingredients-list">
                        {recipeDetails[selectedRecipe].ingredients.map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="recipe-section">
                      <h3>👨‍🍳 Steps:</h3>
                      <ol className="steps-list">
                        {recipeDetails[selectedRecipe].steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="recipe-placeholder">
                    <p>Recipe details coming soon! This is a popular {selectedCrop} recipe.</p>
                    <p className="recipe-note">💡 Tip: Search online for "{selectedRecipe}" recipe for detailed instructions.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* General Agricultural Tips */}
          <div className="general-tips">
            <h2>{t('generalTips')}</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">🌧️</div>
                <h3>{t('rainfallManagement')}</h3>
                <p>{t('rainfallTip')}</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🌡️</div>
                <h3>{t('temperatureControl')}</h3>
                <p>{t('temperatureTip')}</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🔄</div>
                <h3>{t('cropRotation')}</h3>
                <p>{t('rotationTip')}</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">💧</div>
                <h3>{t('irrigationTiming')}</h3>
                <p>{t('irrigationTip')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;

