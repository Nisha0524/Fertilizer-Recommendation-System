import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../i18n';
import { getRecommendation, getYouTubeVideos } from '../api/api';
import { generatePDF } from '../utils/pdfGenerator';
import { translateRecommendation } from '../utils/translateRecommendation';
import { tamilNaduDistricts, tamilNaduDistrictsTamil } from '../data/tamilNaduDistricts';
import './PlannerPage.css';

const PlannerPage = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const [rawRecommendation, setRawRecommendation] = useState(null);
  const [inputs, setInputs] = useState({
    N: '50',
    P: '30',
    K: '40',
    temperature: '28',
    humidity: '65',
    ph: '6.5',
    moisture: '50',
    crop: '',
    soil_type: '',
    hectare_area: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [dailyTip, setDailyTip] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const crops = [
    'tomato', 'rice', 'wheat', 'maize', 'sugarcane', 'cotton', 'brinjal',
    'potato', 'onion', 'chilli', 'cabbage', 'cauliflower', 'carrot',
    'beans', 'peas', 'cucumber', 'pumpkin', 'watermelon', 'banana',
    'mango', 'coconut', 'groundnut', 'sunflower', 'soybean', 'mustard',
    'barley', 'oats', 'millet', 'sorghum', 'paddy', 'turmeric', 'ginger'
  ];

  const soilTypes = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky', 'Sandy Loam', 'Clay Loam'];

  const suggestions = {
    N: { low: '15', medium: '45', high: '75', default: '50', range: '0-100' },
    P: { low: '10', medium: '30', high: '60', default: '30', range: '0-100' },
    K: { low: '12', medium: '35', high: '70', default: '40', range: '0-100' },
    temperature: { low: '20', medium: '28', high: '38', default: '28', range: '15-45°C' },
    humidity: { low: '40', medium: '60', high: '80', default: '65', range: '30-90%' },
    ph: { low: '6.0', medium: '6.5', high: '7.5', default: '6.5', range: '5.5-8.5' },
    moisture: { low: '30', medium: '50', high: '70', default: '50', range: '20-80%' }
  };

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    });
  };

  const setSuggestion = (field, level) => {
    const suggestion = suggestions[field];
    if (suggestion && suggestion[level]) {
      setInputs({
        ...inputs,
        [field]: suggestion[level]
      });
    }
  };

  // Translate recommendation based on current language
  const recommendation = useMemo(() => {
    if (!rawRecommendation) return null;
    return translateRecommendation(rawRecommendation, language);
  }, [rawRecommendation, language]);

  // Fetch YouTube videos for crop
  const fetchYouTubeVideos = async (crop) => {
    if (!crop) return;
    
    setLoadingVideos(true);
    try {
      const response = await getYouTubeVideos(crop);
      if (response && response.success && response.videos) {
        setYoutubeVideos(response.videos);
      }
    } catch (err) {
      console.error('Failed to fetch YouTube videos:', err);
      setYoutubeVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRawRecommendation(null);

    try {
      const userEmail = localStorage.getItem('user') || 'guest@example.com';
      const data = {
        ...inputs,
        user_email: userEmail
      };
      
      // Validate inputs before sending
      if (!data.crop) {
        setError('Please select a crop type');
        setLoading(false);
        return;
      }
      
      const response = await getRecommendation(data);
      
      if (response && response.success && response.recommendation) {
        setRawRecommendation(response.recommendation);
        setError(''); // Clear any previous errors
        
        // Fetch YouTube videos for the crop
        if (data.crop) {
          fetchYouTubeVideos(data.crop);
        }
      } else if (response && response.error) {
        setError(response.error);
      } else {
        setError('Failed to get recommendation. Please try again.');
      }
    } catch (err) {
      console.error('Recommendation error:', err);
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend server is running on http://localhost:5000');
      } else if (err.response) {
        setError(err.response.data?.error || err.response.data?.message || 'Server error occurred');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate Soil Health Score (1-100)
  const calculateSoilHealthScore = useMemo(() => {
    const n = parseFloat(inputs.N) || 0;
    const p = parseFloat(inputs.P) || 0;
    const k = parseFloat(inputs.K) || 0;
    const ph = parseFloat(inputs.ph) || 0;
    const moisture = parseFloat(inputs.moisture) || 0;
    const temp = parseFloat(inputs.temperature) || 0;

    // NPK Balance Score (0-30 points)
    const npkAvg = (n + p + k) / 3;
    const npkScore = Math.min(30, (npkAvg / 50) * 30);

    // pH Score (0-25 points) - optimal range 6.0-7.5
    let phScore = 0;
    if (ph >= 6.0 && ph <= 7.5) {
      phScore = 25;
    } else if (ph >= 5.5 && ph < 6.0) {
      phScore = 20;
    } else if (ph > 7.5 && ph <= 8.0) {
      phScore = 20;
    } else {
      phScore = 10;
    }

    // Moisture Score (0-25 points) - optimal 40-70%
    let moistureScore = 0;
    if (moisture >= 40 && moisture <= 70) {
      moistureScore = 25;
    } else if (moisture >= 30 && moisture < 40) {
      moistureScore = 20;
    } else if (moisture > 70 && moisture <= 80) {
      moistureScore = 20;
    } else {
      moistureScore = 10;
    }

    // Temperature Score (0-20 points) - optimal 20-35°C
    let tempScore = 0;
    if (temp >= 20 && temp <= 35) {
      tempScore = 20;
    } else if (temp >= 15 && temp < 20) {
      tempScore = 15;
    } else if (temp > 35 && temp <= 40) {
      tempScore = 15;
    } else {
      tempScore = 10;
    }

    const totalScore = Math.round(npkScore + phScore + moistureScore + tempScore);
    return Math.min(100, Math.max(0, totalScore));
  }, [inputs.N, inputs.P, inputs.K, inputs.ph, inputs.moisture, inputs.temperature]);

  // Get Soil Health Message - with Tamil
  const getSoilHealthMessage = (score) => {
    if (score >= 80) return t('soilHealthExcellent') || 'Excellent soil health!';
    if (score >= 60) return t('soilHealthGood') || 'Good but needs more organic matter.';
    if (score >= 40) return t('soilHealthFair') || 'Fair - requires soil improvement.';
    return t('soilHealthPoor') || 'Poor - immediate soil treatment needed.';
  };

  // Pest Risk Predictor - Crop Specific with Tamil
  const getPestRisk = useMemo(() => {
    const humidity = parseFloat(inputs.humidity) || 0;
    const temp = parseFloat(inputs.temperature) || 0;
    const crop = inputs.crop?.toLowerCase() || '';

    let risk = t('pestRiskLow') || 'Low';
    let message = t('pestRiskLowMessage') || 'Low pest risk. Regular monitoring recommended.';
    let recommendation = t('pestRiskLowRec') || 'Continue normal pest management practices.';

    // Crop-specific pest risks
    if (crop === 'rice') {
      if (humidity > 75 && temp > 25 && temp < 35) {
        risk = t('pestRiskHigh') || 'High';
        message = t('pestRiskRiceHigh') || 'High chance of blast disease and stem borer';
        recommendation = t('pestRiskRiceRec') || 'Apply neem oil and fungicides. Monitor for stem borer. Ensure proper water management.';
      } else if (humidity > 70) {
        risk = t('pestRiskMedium') || 'Medium';
        message = t('pestRiskRiceMedium') || 'Moderate risk of rice diseases';
        recommendation = t('pestRiskRiceRecMedium') || 'Monitor for leaf folder and diseases. Apply preventive measures.';
      }
    } else if (crop === 'tomato' || crop === 'brinjal' || crop === 'chilli') {
      if (humidity > 75 && temp > 25 && temp < 35) {
        risk = t('pestRiskHigh') || 'High';
        message = t('pestRiskVegetableHigh') || 'High chance of fungal infections and fruit borer';
        recommendation = t('pestRiskVegetableRec') || 'Apply neem oil once a week. Ensure proper ventilation. Monitor for fruit borer.';
      } else if (humidity > 70 && temp > 30) {
        risk = t('pestRiskMediumHigh') || 'Medium-High';
        message = t('pestRiskVegetableMediumHigh') || 'Moderate to high risk of pest attacks';
        recommendation = t('pestRiskVegetableRecMedium') || 'Apply preventive organic pesticides. Monitor daily for aphids and whitefly.';
      }
    } else if (crop === 'cotton') {
      if (humidity > 70 && temp > 30) {
        risk = t('pestRiskHigh') || 'High';
        message = t('pestRiskCottonHigh') || 'High risk of bollworm and whitefly';
        recommendation = t('pestRiskCottonRec') || 'Monitor for bollworm regularly. Apply Bt cotton or organic pesticides.';
      } else if (humidity > 65) {
        risk = t('pestRiskMedium') || 'Medium';
        message = t('pestRiskCottonMedium') || 'Moderate pest risk in cotton';
        recommendation = t('pestRiskCottonRecMedium') || 'Increase monitoring frequency. Use organic pest control.';
      }
    } else {
      // General pest risk
      if (humidity > 75 && temp > 25 && temp < 35) {
        risk = t('pestRiskHigh') || 'High';
        message = t('pestRiskHighMessage') || 'High chance of fungal infections';
        recommendation = t('pestRiskHighRec') || 'Apply neem oil once a week. Ensure proper ventilation.';
      } else if (humidity > 70 && temp > 30) {
        risk = t('pestRiskMediumHigh') || 'Medium-High';
        message = t('pestRiskMediumHighMessage') || 'Moderate to high risk of pest attacks';
        recommendation = t('pestRiskMediumHighRec') || 'Apply preventive organic pesticides. Monitor daily.';
      } else if (humidity > 65 || temp > 35) {
        risk = t('pestRiskMedium') || 'Medium';
        message = t('pestRiskMediumMessage') || 'Moderate pest risk detected';
        recommendation = t('pestRiskMediumRec') || 'Increase monitoring frequency. Use organic pest control.';
      }
    }

    return { risk, message, recommendation };
  }, [inputs.humidity, inputs.temperature, inputs.crop, t]);

  // Fertilizer Cost Estimator (INR)
  const getFertilizerCost = (fertilizerName) => {
    const costMap = {
      'NPK 19:19:19': 350,
      'Urea': 280,
      'DAP': 320,
      'Potash': 400,
      'Compost': 150,
      'Organic Mix': 200
    };
    return costMap[fertilizerName] || 300;
  };

  // Plant Growth Stage Tips - Crop Specific
  const getGrowthStageTips = (crop) => {
    const cropLower = crop?.toLowerCase() || '';
    
    // Crop-specific tips
    const cropSpecificTips = {
      rice: {
        seedling: [
          t('riceSeedling1') || 'Maintain 2-3cm water level in nursery',
          t('riceSeedling2') || 'Keep temperature 25-30°C for germination',
          t('riceSeedling3') || 'Apply light nitrogen after 10 days',
          t('riceSeedling4') || 'Protect from birds and pests'
        ],
        vegetative: [
          t('riceVegetative1') || 'Maintain 5-7cm water depth in field',
          t('riceVegetative2') || 'Apply nitrogen in split doses (50% at planting, 25% at tillering)',
          t('riceVegetative3') || 'Control weeds regularly',
          t('riceVegetative4') || 'Monitor for stem borer and leaf folder'
        ],
        flowering: [
          t('riceFlowering1') || 'Critical water stage - maintain 5-10cm water',
          t('riceFlowering2') || 'Apply remaining 25% nitrogen at panicle initiation',
          t('riceFlowering3') || 'Avoid water stress during flowering',
          t('riceFlowering4') || 'Monitor for blast disease'
        ],
        harvest: [
          t('riceHarvest1') || 'Drain water 10-15 days before harvest',
          t('riceHarvest2') || 'Harvest when 80% grains turn golden yellow',
          t('riceHarvest3') || 'Harvest in morning when moisture is 20-22%',
          t('riceHarvest4') || 'Dry properly to 14% moisture for storage'
        ]
      },
      tomato: {
        seedling: [
          t('tomatoSeedling1') || 'Start seeds in nursery trays with well-drained soil',
          t('tomatoSeedling2') || 'Maintain 20-25°C temperature',
          t('tomatoSeedling3') || 'Transplant after 25-30 days when 4-5 leaves appear',
          t('tomatoSeedling4') || 'Harden seedlings before transplanting'
        ],
        vegetative: [
          t('tomatoVegetative1') || 'Stake plants for support',
          t('tomatoVegetative2') || 'Apply nitrogen-rich fertilizer for leaf growth',
          t('tomatoVegetative3') || 'Prune side shoots (suckers) regularly',
          t('tomatoVegetative4') || 'Water at base, avoid wetting leaves'
        ],
        flowering: [
          t('tomatoFlowering1') || 'Apply phosphorus for flower and fruit set',
          t('tomatoFlowering2') || 'Maintain consistent moisture - avoid stress',
          t('tomatoFlowering3') || 'Hand pollination may help in low humidity',
          t('tomatoFlowering4') || 'Monitor for blossom end rot'
        ],
        harvest: [
          t('tomatoHarvest1') || 'Harvest when fruits are firm and fully colored',
          t('tomatoHarvest2') || 'Harvest in early morning',
          t('tomatoHarvest3') || 'Pick regularly to encourage more fruiting',
          t('tomatoHarvest4') || 'Handle gently to avoid bruising'
        ]
      },
      wheat: {
        seedling: [
          t('wheatSeedling1') || 'Sow at proper depth (5-6cm)',
          t('wheatSeedling2') || 'Maintain soil moisture for germination',
          t('wheatSeedling3') || 'Apply phosphorus at sowing',
          t('wheatSeedling4') || 'Protect from birds'
        ],
        vegetative: [
          t('wheatVegetative1') || 'Apply first dose of nitrogen at tillering stage',
          t('wheatVegetative2') || 'Control weeds with herbicides',
          t('wheatVegetative3') || 'Ensure adequate spacing (20-25cm rows)',
          t('wheatVegetative4') || 'Monitor for rust and powdery mildew'
        ],
        flowering: [
          t('wheatFlowering1') || 'Apply second nitrogen dose at boot stage',
          t('wheatFlowering2') || 'Avoid water stress during flowering',
          t('wheatFlowering3') || 'Monitor for aphids and diseases',
          t('wheatFlowering4') || 'Support with potash for grain filling'
        ],
        harvest: [
          t('wheatHarvest1') || 'Harvest when grains are hard and moisture is 20-25%',
          t('wheatHarvest2') || 'Harvest in early morning',
          t('wheatHarvest3') || 'Thresh immediately after harvest',
          t('wheatHarvest4') || 'Dry to 12% moisture for storage'
        ]
      },
      sugarcane: {
        seedling: [
          t('sugarcaneSeedling1') || 'Plant setts with 2-3 buds',
          t('sugarcaneSeedling2') || 'Maintain soil moisture for sprouting',
          t('sugarcaneSeedling3') || 'Apply basal dose of NPK',
          t('sugarcaneSeedling4') || 'Control weeds early'
        ],
        vegetative: [
          t('sugarcaneVegetative1') || 'Apply nitrogen in 3-4 split doses',
          t('sugarcaneVegetative2') || 'Earthing up at 45 and 90 days',
          t('sugarcaneVegetative3') || 'Maintain adequate irrigation',
          t('sugarcaneVegetative4') || 'Monitor for top borer and red rot'
        ],
        flowering: [
          t('sugarcaneFlowering1') || 'Reduce nitrogen, increase potash',
          t('sugarcaneFlowering2') || 'Maintain soil moisture',
          t('sugarcaneFlowering3') || 'Remove flower stalks if not needed',
          t('sugarcaneFlowering4') || 'Monitor for pests and diseases'
        ],
        harvest: [
          t('sugarcaneHarvest1') || 'Harvest at 10-12 months when Brix is 18-20%',
          t('sugarcaneHarvest2') || 'Cut close to ground level',
          t('sugarcaneHarvest3') || 'Harvest in early morning',
          t('sugarcaneHarvest4') || 'Crush within 24-48 hours for best quality'
        ]
      },
      cotton: {
        seedling: [
          t('cottonSeedling1') || 'Sow at proper depth (2-3cm)',
          t('cottonSeedling2') || 'Maintain soil temperature 20-25°C',
          t('cottonSeedling3') || 'Thin to proper spacing after emergence',
          t('cottonSeedling4') || 'Control early season pests'
        ],
        vegetative: [
          t('cottonVegetative1') || 'Apply nitrogen for vegetative growth',
          t('cottonVegetative2') || 'Prune lower branches and leaves',
          t('cottonVegetative3') || 'Monitor for bollworm and whitefly',
          t('cottonVegetative4') || 'Maintain proper plant spacing'
        ],
        flowering: [
          t('cottonFlowering1') || 'Apply phosphorus and potash for boll development',
          t('cottonFlowering2') || 'Critical stage - avoid water stress',
          t('cottonFlowering3') || 'Monitor for pink bollworm',
          t('cottonFlowering4') || 'Support with micronutrients (zinc, boron)'
        ],
        harvest: [
          t('cottonHarvest1') || 'Harvest when bolls open and lint is fluffy',
          t('cottonHarvest2') || 'Pick in dry weather conditions',
          t('cottonHarvest3') || 'Harvest in multiple pickings',
          t('cottonHarvest4') || 'Store in dry, clean place'
        ]
      }
    };

    // Default tips if crop not found
    const defaultTips = {
      seedling: [
        t('defaultSeedling1') || 'Maintain consistent moisture - not too wet, not too dry',
        t('defaultSeedling2') || 'Provide gentle light - avoid direct harsh sunlight',
        t('defaultSeedling3') || 'Keep temperature stable between 20-25°C',
        t('defaultSeedling4') || 'Use diluted fertilizer if needed'
      ],
      vegetative: [
        t('defaultVegetative1') || 'Increase nitrogen for leaf growth',
        t('defaultVegetative2') || 'Ensure adequate spacing for air circulation',
        t('defaultVegetative3') || 'Water deeply but less frequently',
        t('defaultVegetative4') || 'Monitor for early signs of pests'
      ],
      flowering: [
        t('defaultFlowering1') || 'Increase phosphorus for flower development',
        t('defaultFlowering2') || 'Maintain consistent watering schedule',
        t('defaultFlowering3') || 'Avoid overhead watering to prevent flower damage',
        t('defaultFlowering4') || 'Support plants if needed (staking)'
      ],
      harvest: [
        t('defaultHarvest1') || 'Reduce watering before harvest',
        t('defaultHarvest2') || 'Harvest in early morning for best quality',
        t('defaultHarvest3') || 'Check for maturity indicators specific to crop',
        t('defaultHarvest4') || 'Handle produce gently to avoid bruising'
      ]
    };

    return cropSpecificTips[cropLower] || defaultTips;
  };

  // Water Usage Alert - Crop Specific with Tamil
  const getWaterUsage = (crop) => {
    const cropLower = crop?.toLowerCase() || '';
    const waterMap = {
      'rice': { 
        level: t('waterVeryHigh') || 'Very High', 
        message: t('waterRice') || 'Rice requires 1000-2000mm water. Ensure adequate irrigation.' 
      },
      'sugarcane': { 
        level: t('waterVeryHigh') || 'Very High', 
        message: t('waterSugarcane') || 'Sugarcane needs 1200-2000mm water. Regular irrigation essential.' 
      },
      'cotton': { 
        level: t('waterHigh') || 'High', 
        message: t('waterCotton') || 'Cotton requires 500-800mm water. Monitor soil moisture regularly.' 
      },
      'maize': { 
        level: t('waterMedium') || 'Medium', 
        message: t('waterMaize') || 'Maize needs 500-800mm water. Moderate irrigation sufficient.' 
      },
      'wheat': { 
        level: t('waterMedium') || 'Medium', 
        message: t('waterWheat') || 'Wheat requires 400-600mm water. Timely irrigation important.' 
      },
      'tomato': { 
        level: t('waterMediumHigh') || 'Medium-High', 
        message: t('waterTomato') || 'Tomato needs 600-1000mm water. Consistent watering crucial.' 
      },
      'potato': { 
        level: t('waterMedium') || 'Medium', 
        message: t('waterPotato') || 'Potato requires 500-700mm water. Avoid waterlogging.' 
      },
      'onion': { 
        level: t('waterLowMedium') || 'Low-Medium', 
        message: t('waterOnion') || 'Onion needs 600-800mm water. Moderate irrigation.' 
      },
      'carrot': { 
        level: t('waterLowMedium') || 'Low-Medium', 
        message: t('waterCarrot') || 'Carrot requires 500-700mm water. Regular light watering.' 
      },
      'cucumber': { 
        level: t('waterHigh') || 'High', 
        message: t('waterCucumber') || 'Cucumber needs 600-1000mm water. High water requirement.' 
      },
      'watermelon': { 
        level: t('waterHigh') || 'High', 
        message: t('waterWatermelon') || 'Watermelon requires 500-800mm water. Consistent moisture needed.' 
      },
      'brinjal': {
        level: t('waterMediumHigh') || 'Medium-High',
        message: t('waterBrinjal') || 'Brinjal needs 600-1000mm water. Regular irrigation needed.'
      },
      'chilli': {
        level: t('waterMedium') || 'Medium',
        message: t('waterChilli') || 'Chilli requires 500-800mm water. Moderate irrigation sufficient.'
      },
      'cabbage': {
        level: t('waterMedium') || 'Medium',
        message: t('waterCabbage') || 'Cabbage needs 600-800mm water. Consistent moisture important.'
      },
      'cauliflower': {
        level: t('waterMedium') || 'Medium',
        message: t('waterCauliflower') || 'Cauliflower requires 600-800mm water. Regular watering needed.'
      }
    };
    return waterMap[cropLower] || { 
      level: t('waterMedium') || 'Medium', 
      message: t('waterDefault') || 'Moderate water requirement. Monitor soil moisture.' 
    };
  };

  // Compost Suggestion - Crop Specific with Tamil
  const getCompostSuggestion = useMemo(() => {
    const ph = parseFloat(inputs.ph) || 0;
    const moisture = parseFloat(inputs.moisture) || 0;
    const crop = inputs.crop?.toLowerCase() || '';

    let suggestion = '';
    let type = '';

    // Crop-specific compost suggestions
    if (crop === 'rice' || crop === 'sugarcane') {
      if (ph < 6.0) {
        type = t('compostAlkaline') || 'Alkaline Compost';
        suggestion = t('compostRiceAcidic') || 'For rice/sugarcane: Add lime-rich compost or wood ash to raise pH. Use decomposed organic matter with calcium.';
      } else {
        type = t('compostBalanced') || 'Balanced Compost';
        suggestion = t('compostRice') || 'For rice/sugarcane: Use well-decomposed farmyard manure and green manure crops for better yield.';
      }
    } else if (crop === 'tomato' || crop === 'brinjal' || crop === 'chilli') {
      if (ph > 7.5) {
        type = t('compostAcidic') || 'Acidic Compost';
        suggestion = t('compostTomatoAlkaline') || 'For vegetables: Add acidic compost like pine needles, coffee grounds to lower pH.';
      } else if (moisture < 40) {
        type = t('compostMoistureRetaining') || 'Moisture-Retaining Compost';
        suggestion = t('compostTomatoMoisture') || 'For vegetables: Add compost rich in organic matter (coconut coir, leaf mold) to improve water retention.';
      } else {
        type = t('compostBalanced') || 'Balanced Compost';
        suggestion = t('compostTomato') || 'For vegetables: Use well-balanced compost (kitchen scraps, garden waste) to maintain soil health.';
      }
    } else if (crop === 'wheat' || crop === 'barley') {
      type = t('compostBalanced') || 'Balanced Compost';
      suggestion = t('compostWheat') || 'For cereals: Use farmyard manure and compost to improve soil structure and nutrient availability.';
    } else {
      // General compost suggestions
      if (ph < 6.0) {
        type = t('compostAlkaline') || 'Alkaline Compost';
        suggestion = t('compostAlkalineSuggestion') || 'Add lime-rich compost or wood ash to raise pH. Use decomposed organic matter with calcium.';
      } else if (ph > 7.5) {
        type = t('compostAcidic') || 'Acidic Compost';
        suggestion = t('compostAcidicSuggestion') || 'Add acidic compost like pine needles, coffee grounds, or peat moss to lower pH.';
      } else if (moisture < 40) {
        type = t('compostMoistureRetaining') || 'Moisture-Retaining Compost';
        suggestion = t('compostMoistureSuggestion') || 'Add compost rich in organic matter (coconut coir, leaf mold) to improve water retention.';
      } else if (moisture > 70) {
        type = t('compostDrainage') || 'Drainage-Improving Compost';
        suggestion = t('compostDrainageSuggestion') || 'Add compost with coarse materials (straw, wood chips) to improve drainage.';
      } else {
        type = t('compostBalanced') || 'Balanced Compost';
        suggestion = t('compostBalancedSuggestion') || 'Use well-balanced compost (kitchen scraps, garden waste) to maintain soil health.';
      }
    }

    return { type, suggestion };
  }, [inputs.ph, inputs.moisture, inputs.crop, t]);

  // Crop Rotation Advisor - Crop Specific with Tamil
  const getCropRotation = (crop) => {
    const cropLower = crop?.toLowerCase() || '';
    const rotationMap = {
      'rice': t('rotationRice') || 'After Rice → Good rotation crops: Pulses (Moong, Urad), Legumes, Mustard',
      'wheat': t('rotationWheat') || 'After Wheat → Good rotation crops: Pulses, Oilseeds, Vegetables',
      'tomato': t('rotationTomato') || 'After Tomato → Good rotation crops: Legumes, Corn, Leafy greens',
      'potato': t('rotationPotato') || 'After Potato → Good rotation crops: Legumes, Cereals, Mustard',
      'cotton': t('rotationCotton') || 'After Cotton → Good rotation crops: Pulses, Cereals, Oilseeds',
      'maize': t('rotationMaize') || 'After Maize → Good rotation crops: Legumes, Wheat, Vegetables',
      'sugarcane': t('rotationSugarcane') || 'After Sugarcane → Good rotation crops: Pulses, Legumes, Green manure crops',
      'brinjal': t('rotationBrinjal') || 'After Brinjal → Good rotation crops: Legumes, Leafy vegetables, Root crops',
      'chilli': t('rotationChilli') || 'After Chilli → Good rotation crops: Legumes, Onion, Garlic',
      'cabbage': t('rotationCabbage') || 'After Cabbage → Good rotation crops: Legumes, Root vegetables, Corn',
      'cauliflower': t('rotationCauliflower') || 'After Cauliflower → Good rotation crops: Legumes, Leafy greens, Beans',
      'carrot': t('rotationCarrot') || 'After Carrot → Good rotation crops: Legumes, Leafy vegetables, Onion',
      'onion': t('rotationOnion') || 'After Onion → Good rotation crops: Legumes, Leafy vegetables, Root crops',
      'cucumber': t('rotationCucumber') || 'After Cucumber → Good rotation crops: Legumes, Corn, Leafy greens',
      'watermelon': t('rotationWatermelon') || 'After Watermelon → Good rotation crops: Legumes, Leafy vegetables, Root crops'
    };
    return rotationMap[cropLower] || t('rotationDefault') || 'Rotate with legumes or different crop families to maintain soil health.';
  };

  // Daily Farming Tips - Crop Specific with Tamil
  const getDailyFarmingTips = () => {
    const crop = inputs.crop?.toLowerCase() || '';
    const cropTips = {
      'rice': [
        t('tipRice1') || 'Maintain proper water level in rice fields (5-7cm)',
        t('tipRice2') || 'Apply nitrogen in split doses for better efficiency',
        t('tipRice3') || 'Control weeds regularly to prevent competition',
        t('tipRice4') || 'Monitor for stem borer and leaf folder pests'
      ],
      'tomato': [
        t('tipTomato1') || 'Stake tomato plants for better support and air circulation',
        t('tipTomato2') || 'Water at base, avoid wetting leaves to prevent diseases',
        t('tipTomato3') || 'Prune side shoots (suckers) regularly',
        t('tipTomato4') || 'Harvest regularly to encourage more fruiting'
      ],
      'wheat': [
        t('tipWheat1') || 'Apply phosphorus at sowing for root development',
        t('tipWheat2') || 'Control weeds early with herbicides',
        t('tipWheat3') || 'Monitor for rust and powdery mildew diseases',
        t('tipWheat4') || 'Harvest when grains are hard and moisture is 20-25%'
      ],
      'sugarcane': [
        t('tipSugarcane1') || 'Apply nitrogen in 3-4 split doses',
        t('tipSugarcane2') || 'Earthing up at 45 and 90 days after planting',
        t('tipSugarcane3') || 'Maintain adequate irrigation throughout growth',
        t('tipSugarcane4') || 'Harvest at 10-12 months when Brix is 18-20%'
      ],
      'cotton': [
        t('tipCotton1') || 'Monitor for bollworm and whitefly regularly',
        t('tipCotton2') || 'Apply micronutrients (zinc, boron) for better yield',
        t('tipCotton3') || 'Prune lower branches for better air circulation',
        t('tipCotton4') || 'Harvest when bolls open and lint is fluffy'
      ]
    };

    const defaultTips = [
      t('tipDefault1') || 'Water plants early morning or evening to reduce evaporation',
      t('tipDefault2') || 'Mulch around plants to retain moisture and suppress weeds',
      t('tipDefault3') || 'Test soil pH regularly for optimal nutrient availability',
      t('tipDefault4') || 'Use organic compost to improve soil structure',
      t('tipDefault5') || 'Rotate crops annually to prevent pest buildup',
      t('tipDefault6') || 'Monitor plants daily for early pest detection',
      t('tipDefault7') || 'Prune regularly to promote healthy growth',
      t('tipDefault8') || 'Use companion planting to naturally deter pests',
      t('tipDefault9') || 'Maintain proper spacing for air circulation',
      t('tipDefault10') || 'Harvest at peak maturity for best quality'
    ];

    return cropTips[crop] || defaultTips;
  };

  const farmingTips = getDailyFarmingTips();

  // Get random daily tip
  useEffect(() => {
    const randomTip = farmingTips[Math.floor(Math.random() * farmingTips.length)];
    setDailyTip(randomTip);
  }, []);

  // AI-based Irrigation Alert (mock weather integration)
  useEffect(() => {
    if (inputs.location) {
      // Simulate weather forecast check
      const checkWeather = () => {
        // Mock: 30% chance of rain in next 2 hours
        const willRain = Math.random() < 0.3;
        if (willRain) {
          setWeatherForecast({
            alert: true,
            message: t('irrigationAlertRain') || 'Rain expected in 2 hours — Avoid watering now.',
            time: t('in2Hours') || '2 hours'
          });
        } else {
          setWeatherForecast({
            alert: false,
            message: t('irrigationAlertSafe') || 'No rain expected. Safe to irrigate.',
            time: t('next24Hours') || 'next 24 hours'
          });
        }
      };
      checkWeather();
      const interval = setInterval(checkWeather, 300000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [inputs.location]);

  // Get crop-specific details for each card type
  const getCropSpecificDetails = (cardType) => {
    const crop = inputs.crop?.toLowerCase() || '';
    const cropName = inputs.crop ? inputs.crop.charAt(0).toUpperCase() + inputs.crop.slice(1) : 'Selected Crop';
    
    const details = {
      soilHealth: {
        title: 'Soil Health Score Details',
        cropName,
        currentScore: calculateSoilHealthScore,
        message: getSoilHealthMessage(calculateSoilHealthScore),
        breakdown: {
          npk: {
            value: Math.round(((parseFloat(inputs.N) || 0) + (parseFloat(inputs.P) || 0) + (parseFloat(inputs.K) || 0)) / 3),
            score: Math.round(Math.min(30, (((parseFloat(inputs.N) || 0) + (parseFloat(inputs.P) || 0) + (parseFloat(inputs.K) || 0)) / 3 / 50) * 30)),
            max: 30,
            status: 'NPK Balance'
          },
          ph: {
            value: parseFloat(inputs.ph) || 0,
            score: (() => {
              const ph = parseFloat(inputs.ph) || 0;
              if (ph >= 6.0 && ph <= 7.5) return 25;
              if (ph >= 5.5 && ph < 6.0) return 20;
              if (ph > 7.5 && ph <= 8.0) return 20;
              return 10;
            })(),
            max: 25,
            status: 'pH Level',
            optimal: '6.0-7.5'
          },
          moisture: {
            value: parseFloat(inputs.moisture) || 0,
            score: (() => {
              const m = parseFloat(inputs.moisture) || 0;
              if (m >= 40 && m <= 70) return 25;
              if (m >= 30 && m < 40) return 20;
              if (m > 70 && m <= 80) return 20;
              return 10;
            })(),
            max: 25,
            status: 'Moisture',
            optimal: '40-70%'
          },
          temperature: {
            value: parseFloat(inputs.temperature) || 0,
            score: (() => {
              const t = parseFloat(inputs.temperature) || 0;
              if (t >= 20 && t <= 35) return 20;
              if (t >= 15 && t < 20) return 15;
              if (t > 35 && t <= 40) return 15;
              return 10;
            })(),
            max: 20,
            status: 'Temperature',
            optimal: '20-35°C'
          }
        },
        recommendations: crop ? [
          `For ${cropName}: Maintain optimal NPK levels based on growth stage`,
          `Monitor pH regularly - ${cropName} prefers pH between 6.0-7.5`,
          `Keep soil moisture between 40-70% for ${cropName}`,
          `Temperature should be maintained between 20-35°C for ${cropName}`
        ] : [
          'Maintain balanced NPK levels',
          'Keep pH between 6.0-7.5',
          'Monitor soil moisture regularly',
          'Maintain optimal temperature'
        ]
      },
      pestRisk: {
        title: 'Pest Risk Predictor Details',
        cropName,
        risk: getPestRisk.risk,
        message: getPestRisk.message,
        recommendation: getPestRisk.recommendation,
        factors: [
          {
            name: 'Humidity',
            value: `${inputs.humidity}%`,
            impact: parseFloat(inputs.humidity) > 75 ? 'High Risk' : parseFloat(inputs.humidity) > 70 ? 'Medium Risk' : 'Low Risk',
            description: 'High humidity increases fungal disease risk'
          },
          {
            name: 'Temperature',
            value: `${inputs.temperature}°C`,
            impact: parseFloat(inputs.temperature) > 30 && parseFloat(inputs.temperature) < 35 ? 'High Risk' : 'Moderate Risk',
            description: 'Optimal temperature range reduces pest activity'
          },
          {
            name: 'Crop Type',
            value: cropName,
            impact: crop ? 'Crop-specific risks apply' : 'General risks',
            description: crop ? `Common pests for ${cropName} include specific threats` : 'General pest monitoring recommended'
          }
        ],
        preventionTips: crop ? [
          `For ${cropName}: Apply preventive measures based on growth stage`,
          'Use organic pesticides like neem oil weekly',
          'Ensure proper spacing for air circulation',
          'Remove affected plant parts immediately',
          'Monitor daily during high-risk periods'
        ] : [
          'Apply preventive organic pesticides',
          'Ensure proper ventilation',
          'Monitor plants daily',
          'Remove affected parts immediately'
        ]
      },
      waterUsage: {
        title: 'Water Usage Details',
        cropName,
        level: inputs.crop ? getWaterUsage(inputs.crop).level : 'Medium',
        message: inputs.crop ? getWaterUsage(inputs.crop).message : 'Moderate water requirement',
        requirements: crop ? {
          daily: crop === 'rice' || crop === 'sugarcane' ? 'High (5-10mm/day)' : crop === 'cotton' ? 'Medium-High (4-6mm/day)' : 'Medium (3-5mm/day)',
          weekly: crop === 'rice' || crop === 'sugarcane' ? '35-70mm/week' : crop === 'cotton' ? '28-42mm/week' : '21-35mm/week',
          seasonal: crop === 'rice' ? '1000-2000mm' : crop === 'sugarcane' ? '1200-2000mm' : crop === 'cotton' ? '500-800mm' : '400-800mm',
          irrigation: crop === 'rice' ? 'Continuous flooding' : crop === 'sugarcane' ? 'Regular irrigation' : 'Moderate irrigation'
        } : {
          daily: 'Medium (3-5mm/day)',
          weekly: '21-35mm/week',
          seasonal: '400-800mm',
          irrigation: 'Moderate irrigation'
        },
        tips: [
          'Water early morning or evening to reduce evaporation',
          'Use drip irrigation for efficient water use',
          'Monitor soil moisture regularly',
          'Adjust watering based on weather conditions',
          crop ? `For ${cropName}: Follow crop-specific watering schedule` : 'Follow general watering guidelines'
        ]
      },
      compost: {
        title: 'Compost Suggestion Details',
        cropName,
        type: getCompostSuggestion.type,
        suggestion: getCompostSuggestion.suggestion,
        composition: {
          organic: 'Kitchen scraps, garden waste, leaves',
          nitrogen: 'Green materials (grass clippings, vegetable scraps)',
          carbon: 'Brown materials (dry leaves, straw, paper)',
          ratio: '3:1 (carbon to nitrogen)'
        },
        application: crop ? [
          `For ${cropName}: Apply ${getCompostSuggestion.type.toLowerCase()} compost`,
          'Mix 2-3 inches into topsoil before planting',
          'Side-dress during growing season',
          'Maintain 3-4 inch layer as mulch'
        ] : [
          'Apply balanced compost',
          'Mix into topsoil before planting',
          'Side-dress during growing season',
          'Maintain mulch layer'
        ],
        benefits: [
          'Improves soil structure and drainage',
          'Increases nutrient availability',
          'Enhances water retention',
          'Promotes beneficial microorganisms',
          'Reduces need for chemical fertilizers'
        ]
      },
      cropRotation: {
        title: 'Crop Rotation Advisor Details',
        cropName,
        advice: inputs.crop ? getCropRotation(inputs.crop) : 'Rotate with legumes or different crop families',
        benefits: [
          'Prevents soil nutrient depletion',
          'Reduces pest and disease buildup',
          'Improves soil structure',
          'Increases crop yield',
          'Reduces need for pesticides'
        ],
        rotationPlan: crop ? {
          year1: cropName,
          year2: crop === 'rice' || crop === 'wheat' ? 'Legumes (Moong, Urad)' : crop === 'tomato' || crop === 'brinjal' ? 'Legumes or Corn' : 'Legumes or Cereals',
          year3: crop === 'rice' || crop === 'wheat' ? 'Oilseeds (Mustard)' : 'Leafy vegetables',
          year4: 'Return to original crop or similar family'
        } : {
          year1: 'Current Crop',
          year2: 'Legumes',
          year3: 'Oilseeds or Vegetables',
          year4: 'Return to original crop'
        },
        tips: [
          'Plan 3-4 year rotation cycle',
          'Avoid planting same family consecutively',
          'Include nitrogen-fixing crops (legumes)',
          'Consider cover crops for soil improvement',
          crop ? `For ${cropName}: Follow specific rotation recommendations` : 'Follow general rotation guidelines'
        ]
      },
      dailyTip: {
        title: 'Daily Farming Tips',
        cropName,
        currentTip: dailyTip,
        allTips: farmingTips,
        category: crop ? `${cropName} Specific Tips` : 'General Farming Tips',
        tipsByCategory: {
          watering: [
            'Water early morning or evening',
            'Use drip irrigation for efficiency',
            'Monitor soil moisture regularly'
          ],
          pestControl: [
            'Inspect plants daily for pests',
            'Use organic pesticides',
            'Remove affected parts immediately'
          ],
          soilManagement: [
            'Test soil pH regularly',
            'Add organic compost',
            'Maintain proper drainage'
          ],
          harvesting: [
            'Harvest at peak maturity',
            'Handle produce gently',
            'Store properly after harvest'
          ]
        }
      },
      irrigation: {
        title: 'AI Irrigation Alert Details',
        cropName,
        forecast: weatherForecast,
        currentConditions: {
          location: inputs.location || 'Not specified',
          temperature: `${inputs.temperature}°C`,
          humidity: `${inputs.humidity}%`,
          moisture: `${inputs.moisture}%`
        },
        recommendations: weatherForecast?.alert ? [
          'Avoid watering now - rain expected',
          'Check weather forecast before irrigation',
          'Adjust irrigation schedule accordingly',
          'Protect plants from excessive rain if needed'
        ] : [
          'Safe to irrigate',
          'Monitor weather conditions',
          'Water early morning for best results',
          'Adjust based on soil moisture levels'
        ],
        smartIrrigation: [
          'Use soil moisture sensors',
          'Implement automated irrigation systems',
          'Monitor weather forecasts regularly',
          'Adjust watering based on crop stage',
          crop ? `For ${cropName}: Follow crop-specific irrigation needs` : 'Follow general irrigation guidelines'
        ]
      }
    };

    return details[cardType] || null;
  };

  const handleDownloadPDF = () => {
    if (!recommendation) {
      return;
    }

    const detailSections = {
      soilHealth: getCropSpecificDetails('soilHealth'),
      pestRisk: getCropSpecificDetails('pestRisk'),
      compost: getCropSpecificDetails('compost')
    };

    if (inputs.crop) {
      detailSections.waterUsage = getCropSpecificDetails('waterUsage');
      detailSections.cropRotation = getCropSpecificDetails('cropRotation');
      detailSections.growthStages = getGrowthStageTips(inputs.crop);
    }

    if (dailyTip) {
      detailSections.dailyTip = getCropSpecificDetails('dailyTip');
    }

    if (inputs.location && weatherForecast) {
      detailSections.irrigation = getCropSpecificDetails('irrigation');
    }

    const additionalData = {
      soilHealthScore: calculateSoilHealthScore,
      soilHealthMessage: getSoilHealthMessage(calculateSoilHealthScore),
      pestRisk: getPestRisk,
      waterUsage: inputs.crop ? getWaterUsage(inputs.crop) : null,
      compostSuggestion: getCompostSuggestion,
      cropRotation: inputs.crop ? getCropRotation(inputs.crop) : null,
      dailyTip,
      weatherForecast,
      growthStageTips: inputs.crop ? getGrowthStageTips(inputs.crop) : null,
      detailSections
    };

    generatePDF(inputs, recommendation, t, additionalData);
  };

  const handleViewDetails = (cardType) => {
    setSelectedCardType(cardType);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedCardType(null);
  };

  return (
    <div>
      <div className="language-toggle">
        <button onClick={toggleLanguage}>
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>
      <div className="container">
        <div className="card">
          <h1>{t('fertilizerPlanner')}</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label>{t('n')} <span className="suggestion-range">({suggestions.N.range})</span></label>
                <input
                  type="number"
                  name="N"
                  value={inputs.N}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={suggestions.N.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('N', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('N', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('N', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('p')} <span className="suggestion-range">({suggestions.P.range})</span></label>
                <input
                  type="number"
                  name="P"
                  value={inputs.P}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={suggestions.P.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('P', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('P', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('P', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('k')} <span className="suggestion-range">({suggestions.K.range})</span></label>
                <input
                  type="number"
                  name="K"
                  value={inputs.K}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={suggestions.K.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('K', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('K', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('K', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('temperature')} <span className="suggestion-range">({suggestions.temperature.range})</span></label>
                <input
                  type="number"
                  name="temperature"
                  value={inputs.temperature}
                  onChange={handleChange}
                  required
                  min="0"
                  max="50"
                  step="0.1"
                  placeholder={suggestions.temperature.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('temperature', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('temperature', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('temperature', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('humidity')} <span className="suggestion-range">({suggestions.humidity.range})</span></label>
                <input
                  type="number"
                  name="humidity"
                  value={inputs.humidity}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={suggestions.humidity.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('humidity', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('humidity', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('humidity', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('ph')} <span className="suggestion-range">({suggestions.ph.range})</span></label>
                <input
                  type="number"
                  name="ph"
                  value={inputs.ph}
                  onChange={handleChange}
                  required
                  min="0"
                  max="14"
                  step="0.1"
                  placeholder={suggestions.ph.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('ph', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('ph', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('ph', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('moisture')} <span className="suggestion-range">({suggestions.moisture.range})</span></label>
                <input
                  type="number"
                  name="moisture"
                  value={inputs.moisture}
                  onChange={handleChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder={suggestions.moisture.default}
                />
                <div className="suggestion-buttons">
                  <button type="button" onClick={() => setSuggestion('moisture', 'low')} className="suggestion-btn low">Low</button>
                  <button type="button" onClick={() => setSuggestion('moisture', 'medium')} className="suggestion-btn medium">Medium</button>
                  <button type="button" onClick={() => setSuggestion('moisture', 'high')} className="suggestion-btn high">High</button>
                </div>
              </div>
              <div className="input-group">
                <label>{t('crop')}</label>
                <select
                  name="crop"
                  value={inputs.crop}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('selectCrop')}</option>
                  {crops.map(crop => (
                    <option key={crop} value={crop}>{crop.charAt(0).toUpperCase() + crop.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>{t('soilType')}</label>
                <select
                  name="soil_type"
                  value={inputs.soil_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('selectSoilType')}</option>
                  {soilTypes.map(soil => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>{t('hectareArea')}</label>
                <input
                  type="number"
                  name="hectare_area"
                  value={inputs.hectare_area}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="Enter area in hectares"
                />
              </div>
              <div className="input-group">
                <label>{t('location') || '📍 Location'} ({t('selectDistrict') || 'Select District'})</label>
                <select
                  name="location"
                  value={inputs.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('selectDistrict') || 'Select District'}</option>
                  {tamilNaduDistricts.map(district => (
                    <option key={district} value={district}>
                      {language === 'ta' && tamilNaduDistrictsTamil[district] 
                        ? `${district} (${tamilNaduDistrictsTamil[district]})`
                        : district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Processing...' : t('getRecommendation')}
            </button>
          </form>

          {/* Soil Health Score & Additional Features */}
          <div className="features-grid">
            {/* Soil Health Score */}
            <div className="feature-card soil-health-card">
              <div className="feature-header">
                <span className="feature-icon">🌱</span>
                <h3>{t('soilHealthScore') || 'Soil Health Score'}</h3>
              </div>
              <div className="soil-score-display">
                <div className="score-circle">
                  <span className="score-value">{calculateSoilHealthScore}</span>
                  <span className="score-label">/100</span>
                </div>
                <p className="score-message">{getSoilHealthMessage(calculateSoilHealthScore)}</p>
              </div>
              <button className="view-details-btn" onClick={() => handleViewDetails('soilHealth')}>
                {t('viewDetails') || 'View Details'}
              </button>
            </div>

            {/* Pest Risk Predictor */}
            <div className="feature-card pest-risk-card">
              <div className="feature-header">
                <span className="feature-icon">🐛</span>
                <h3>{t('pestRiskPredictor') || 'Pest Risk Predictor'}</h3>
              </div>
              <div className={`risk-indicator risk-${getPestRisk.risk.toLowerCase().replace('-', '').replace(' ', '')}`}>
                <span className="risk-level">{getPestRisk.risk} {t('risk') || 'Risk'}</span>
              </div>
              <p className="risk-message">{getPestRisk.message}</p>
              <p className="risk-recommendation">💡 {getPestRisk.recommendation}</p>
              <button className="view-details-btn" onClick={() => handleViewDetails('pestRisk')}>
                {t('viewDetails') || 'View Details'}
              </button>
            </div>

            {/* Water Usage Alert */}
            {inputs.crop && (
              <div className="feature-card water-usage-card">
                <div className="feature-header">
                  <span className="feature-icon">💧</span>
                  <h3>{t('waterUsageAlert') || 'Water Usage Alert'}</h3>
                </div>
                <div className={`water-level water-${getWaterUsage(inputs.crop).level.toLowerCase().replace('-', '').replace(' ', '')}`}>
                  <span>{getWaterUsage(inputs.crop).level} {t('waterRequirement') || 'Water Requirement'}</span>
                </div>
                <p>{getWaterUsage(inputs.crop).message}</p>
                <button className="view-details-btn" onClick={() => handleViewDetails('waterUsage')}>
                  {t('viewDetails') || 'View Details'}
                </button>
              </div>
            )}

            {/* Compost Suggestion */}
            <div className="feature-card compost-card">
              <div className="feature-header">
                <span className="feature-icon">🍃</span>
                <h3>{t('compostSuggestion') || 'Compost Suggestion'}</h3>
              </div>
              <div className="compost-type">{getCompostSuggestion.type}</div>
              <p>{getCompostSuggestion.suggestion}</p>
              <button className="view-details-btn" onClick={() => handleViewDetails('compost')}>
                {t('viewDetails') || 'View Details'}
              </button>
            </div>

            {/* Crop Rotation Advisor */}
            {inputs.crop && (
              <div className="feature-card rotation-card">
                <div className="feature-header">
                  <span className="feature-icon">🔄</span>
                  <h3>{t('cropRotationAdvisor') || 'Crop Rotation Advisor'}</h3>
                </div>
                <p className="rotation-advice">{getCropRotation(inputs.crop)}</p>
                <button className="view-details-btn" onClick={() => handleViewDetails('cropRotation')}>
                  {t('viewDetails') || 'View Details'}
                </button>
              </div>
            )}

            {/* Daily Farming Tip */}
            {dailyTip && (
              <div className="feature-card tip-card">
                <div className="feature-header">
                  <span className="feature-icon">💡</span>
                  <h3>{t('dailyFarmingTip') || 'Daily Farming Tip'}</h3>
                </div>
                <p className="daily-tip">{dailyTip}</p>
                <button className="view-details-btn" onClick={() => handleViewDetails('dailyTip')}>
                  {t('viewDetails') || 'View Details'}
                </button>
              </div>
            )}

            {/* AI Irrigation Alert */}
            {inputs.location && weatherForecast && (
              <div className={`feature-card irrigation-card ${weatherForecast.alert ? 'alert-active' : ''}`}>
                <div className="feature-header">
                  <span className="feature-icon">🌧️</span>
                  <h3>{t('aiIrrigationAlert') || 'AI Irrigation Alert'}</h3>
                </div>
                <p className={`irrigation-message ${weatherForecast.alert ? 'alert' : 'safe'}`}>
                  {weatherForecast.alert 
                    ? (t('irrigationAlertRain') || weatherForecast.message)
                    : (t('irrigationAlertSafe') || weatherForecast.message)
                  }
                </p>
                <button className="view-details-btn" onClick={() => handleViewDetails('irrigation')}>
                  {t('viewDetails') || 'View Details'}
                </button>
              </div>
            )}
          </div>

          {/* Plant Growth Stage Tips */}
          {inputs.crop && (
            <div className="growth-stages-section">
              <h2 className="section-title">🌾 {t('plantGrowthStageTips') || 'Plant Growth Stage Tips'}</h2>
              <div className="stages-grid">
                {Object.entries(getGrowthStageTips(inputs.crop)).map(([stage, tips]) => (
                  <div key={stage} className="stage-card">
                    <h4 className="stage-name">
                      {stage === 'seedling' && (t('seedlingStage') || 'Seedling Stage')}
                      {stage === 'vegetative' && (t('vegetativeStage') || 'Vegetative Stage')}
                      {stage === 'flowering' && (t('floweringStage') || 'Flowering Stage')}
                      {stage === 'harvest' && (t('harvestStage') || 'Harvest Stage')}
                      {!['seedling', 'vegetative', 'flowering', 'harvest'].includes(stage) && 
                        (stage.charAt(0).toUpperCase() + stage.slice(1) + ' ' + (t('stage') || 'Stage'))}
                    </h4>
                    <ul className="stage-tips">
                      {tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendation && (
            <>
              <div className="recommendation-card primary">
                <div className="recommendation-badge">{t('primaryRecommendation')}</div>
                <h2>{t('recommendation')}</h2>
                <div className="recommendation-details">
                  <div className="recommendation-item">
                    <strong>{t('fertilizer')}:</strong>
                    <span className="fertilizer-name">{recommendation.fertilizer}</span>
                  </div>
                  <div className="recommendation-item">
                    <strong>{t('dosage')}:</strong>
                    <span>{recommendation.dosage}</span>
                  </div>
                  <div className="recommendation-item">
                    <strong>{t('remarks')}:</strong>
                    <span>{recommendation.remarks}</span>
                  </div>
                  {/* Fertilizer Cost Estimator */}
                  <div className="recommendation-item cost-item">
                    <strong>{t('estimatedCost') || '💰 Estimated Cost'}:</strong>
                    <span className="cost-value">₹{getFertilizerCost(recommendation.fertilizer)} {t('perKg') || 'per kg'}</span>
                    {inputs.hectare_area && (
                      <span className="cost-note">
                        ({t('approx') || 'Approx'} ₹{Math.round(getFertilizerCost(recommendation.fertilizer) * parseFloat(inputs.hectare_area) * 50)} {t('for') || 'for'} {inputs.hectare_area} {t('hectares') || 'hectares'})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                <div className="alternatives-section">
                  <h3 className="alternatives-title">
                    <span className="alternatives-icon">💡</span>
                    {t('alternativeOptions')}
                  </h3>
                  <p className="alternatives-subtitle">{t('alternativeSubtitle')}</p>
                  <div className="alternatives-grid">
                    {recommendation.alternatives.map((alt, index) => (
                      <div key={index} className="alternative-card">
                        <div className="alternative-badge">{t('alternative')} {index + 1}</div>
                        <div className="alternative-item">
                          <strong>{t('fertilizer')}:</strong>
                          <span className="alternative-fertilizer">{alt.fertilizer}</span>
                        </div>
                        <div className="alternative-item">
                          <strong>{t('dosage')}:</strong>
                          <span>{alt.dosage}</span>
                        </div>
                        <div className="alternative-item">
                          <strong>{t('remarks')}:</strong>
                          <span>{alt.remarks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recommendation.suggestions && recommendation.suggestions.length > 0 && (
                <div className="suggestions-section">
                  <h3 className="suggestions-title">
                    <span className="suggestions-icon">🌱</span>
                    {t('additionalSuggestions')}
                  </h3>
                  <ul className="suggestions-list">
                    {recommendation.suggestions.map((suggestion, index) => (
                      <li key={index} className="suggestion-item">
                        <span className="suggestion-bullet">✓</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="recommendation-actions">
                <button onClick={handleDownloadPDF} className="btn btn-secondary">
                  {t('downloadPDF')}
                </button>
              </div>
            </>
          )}
          
          {/* YouTube Videos Section */}
          {inputs.crop && youtubeVideos.length > 0 && (
            <div className="youtube-videos-section">
              <h2 className="section-title">
                <span>📺</span> {t('learningVideos')}
              </h2>
              <p className="section-subtitle">{t('learnHowToFarm')} {inputs.crop.charAt(0).toUpperCase() + inputs.crop.slice(1)}</p>
              <div className="videos-grid">
                {youtubeVideos.map((video, index) => (
                  <div key={index} className="video-card">
                    <div className="video-category-badge">{t(video.category.toLowerCase().replace(/[^a-z]/g, '')) || video.category}</div>
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-description">{video.description}</p>
                    <div className="video-meta">
                      <span className="video-duration">⏱️ {video.duration}</span>
                    </div>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-youtube"
                    >
                      {t('watchOnYouTube')} ▶️
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {loadingVideos && (
            <div className="loading-videos">
              <p>{t('loadingVideos')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCardType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getCropSpecificDetails(selectedCardType)?.title || 'Details'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedCardType === 'soilHealth' && (() => {
                const details = getCropSpecificDetails('soilHealth');
                return (
                  <div>
                    <div className="detail-section">
                      <h3>Crop: {details.cropName}</h3>
                      <div className="score-breakdown">
                        <div className="score-item">
                          <div className="score-header">
                            <span>{details.breakdown.npk.status}</span>
                            <span className="score-value">{details.breakdown.npk.score}/{details.breakdown.npk.max}</span>
                          </div>
                          <div className="score-bar">
                            <div className="score-fill" style={{width: `${(details.breakdown.npk.score/details.breakdown.npk.max)*100}%`}}></div>
                          </div>
                          <p className="score-info">Average NPK: {details.breakdown.npk.value}</p>
                        </div>
                        <div className="score-item">
                          <div className="score-header">
                            <span>{details.breakdown.ph.status}</span>
                            <span className="score-value">{details.breakdown.ph.score}/{details.breakdown.ph.max}</span>
                          </div>
                          <div className="score-bar">
                            <div className="score-fill" style={{width: `${(details.breakdown.ph.score/details.breakdown.ph.max)*100}%`}}></div>
                          </div>
                          <p className="score-info">pH: {details.breakdown.ph.value} (Optimal: {details.breakdown.ph.optimal})</p>
                        </div>
                        <div className="score-item">
                          <div className="score-header">
                            <span>{details.breakdown.moisture.status}</span>
                            <span className="score-value">{details.breakdown.moisture.score}/{details.breakdown.moisture.max}</span>
                          </div>
                          <div className="score-bar">
                            <div className="score-fill" style={{width: `${(details.breakdown.moisture.score/details.breakdown.moisture.max)*100}%`}}></div>
                          </div>
                          <p className="score-info">Moisture: {details.breakdown.moisture.value}% (Optimal: {details.breakdown.moisture.optimal})</p>
                        </div>
                        <div className="score-item">
                          <div className="score-header">
                            <span>{details.breakdown.temperature.status}</span>
                            <span className="score-value">{details.breakdown.temperature.score}/{details.breakdown.temperature.max}</span>
                          </div>
                          <div className="score-bar">
                            <div className="score-fill" style={{width: `${(details.breakdown.temperature.score/details.breakdown.temperature.max)*100}%`}}></div>
                          </div>
                          <p className="score-info">Temperature: {details.breakdown.temperature.value}°C (Optimal: {details.breakdown.temperature.optimal})</p>
                        </div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Recommendations</h4>
                      <ul className="detail-list">
                        {details.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              {selectedCardType === 'pestRisk' && (() => {
                const details = getCropSpecificDetails('pestRisk');
                return (
                  <div>
                    <div className="detail-section">
                      <div className="risk-badge-large">
                        <span className="risk-level-large">{details.risk} Risk</span>
                        <p>{details.message}</p>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Risk Factors</h4>
                      <div className="factors-grid">
                        {details.factors.map((factor, idx) => (
                          <div key={idx} className="factor-card">
                            <h5>{factor.name}</h5>
                            <p className="factor-value">{factor.value}</p>
                            <p className="factor-impact">{factor.impact}</p>
                            <p className="factor-desc">{factor.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Recommendation</h4>
                      <p className="recommendation-text">{details.recommendation}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Prevention Tips</h4>
                      <ul className="detail-list">
                        {details.preventionTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              {selectedCardType === 'waterUsage' && (() => {
                const details = getCropSpecificDetails('waterUsage');
                return (
                  <div>
                    <div className="detail-section">
                      <h3>Crop: {details.cropName}</h3>
                      <div className="water-level-large">
                        <span>{details.level} Water Requirement</span>
                      </div>
                      <p>{details.message}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Water Requirements</h4>
                      <div className="requirements-grid">
                        <div className="requirement-item">
                          <strong>Daily:</strong> {details.requirements.daily}
                        </div>
                        <div className="requirement-item">
                          <strong>Weekly:</strong> {details.requirements.weekly}
                        </div>
                        <div className="requirement-item">
                          <strong>Seasonal:</strong> {details.requirements.seasonal}
                        </div>
                        <div className="requirement-item">
                          <strong>Irrigation:</strong> {details.requirements.irrigation}
                        </div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Watering Tips</h4>
                      <ul className="detail-list">
                        {details.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              {selectedCardType === 'compost' && (() => {
                const details = getCropSpecificDetails('compost');
                return (
                  <div>
                    <div className="detail-section">
                      <h3>Crop: {details.cropName}</h3>
                      <div className="compost-type-large">{details.type}</div>
                      <p>{details.suggestion}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Compost Composition</h4>
                      <div className="composition-grid">
                        <div className="composition-item">
                          <strong>Organic Materials:</strong> {details.composition.organic}
                        </div>
                        <div className="composition-item">
                          <strong>Nitrogen Sources:</strong> {details.composition.nitrogen}
                        </div>
                        <div className="composition-item">
                          <strong>Carbon Sources:</strong> {details.composition.carbon}
                        </div>
                        <div className="composition-item">
                          <strong>Ideal Ratio:</strong> {details.composition.ratio}
                        </div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Application Method</h4>
                      <ul className="detail-list">
                        {details.application.map((app, idx) => (
                          <li key={idx}>{app}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Benefits</h4>
                      <ul className="detail-list">
                        {details.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              {selectedCardType === 'cropRotation' && (() => {
                const details = getCropSpecificDetails('cropRotation');
                return (
                  <div>
                    <div className="detail-section">
                      <h3>Crop: {details.cropName}</h3>
                      <p className="rotation-advice-large">{details.advice}</p>
                    </div>
                    <div className="detail-section">
                      <h4>Rotation Plan (4-Year Cycle)</h4>
                      <div className="rotation-plan">
                        <div className="rotation-year">
                          <strong>Year 1:</strong> {details.rotationPlan.year1}
                        </div>
                        <div className="rotation-year">
                          <strong>Year 2:</strong> {details.rotationPlan.year2}
                        </div>
                        <div className="rotation-year">
                          <strong>Year 3:</strong> {details.rotationPlan.year3}
                        </div>
                        <div className="rotation-year">
                          <strong>Year 4:</strong> {details.rotationPlan.year4}
                        </div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Benefits of Crop Rotation</h4>
                      <ul className="detail-list">
                        {details.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Tips</h4>
                      <ul className="detail-list">
                        {details.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              {selectedCardType === 'dailyTip' && (() => {
                const details = getCropSpecificDetails('dailyTip');
                return (
                  <div>
                    <div className="detail-section">
                      <h3>{details.category}</h3>
                      <p className="current-tip">{details.currentTip}</p>
                    </div>
                    <div className="detail-section">
                      <h4>All Tips for {details.cropName}</h4>
                      <ul className="detail-list tips-list">
                        {details.allTips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Tips by Category</h4>
                      <div className="tips-categories">
                        <div className="tip-category">
                          <h5>Watering</h5>
                          <ul>
                            {details.tipsByCategory.watering.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="tip-category">
                          <h5>Pest Control</h5>
                          <ul>
                            {details.tipsByCategory.pestControl.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="tip-category">
                          <h5>Soil Management</h5>
                          <ul>
                            {details.tipsByCategory.soilManagement.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="tip-category">
                          <h5>Harvesting</h5>
                          <ul>
                            {details.tipsByCategory.harvesting.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {selectedCardType === 'irrigation' && (() => {
                const details = getCropSpecificDetails('irrigation');
                return (
                  <div>
                    <div className="detail-section">
                      <h3>Crop: {details.cropName}</h3>
                      <div className={`irrigation-status ${details.forecast?.alert ? 'alert' : 'safe'}`}>
                        <p>{details.forecast?.message}</p>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Current Conditions</h4>
                      <div className="conditions-grid">
                        <div className="condition-item">
                          <strong>Location:</strong> {details.currentConditions.location}
                        </div>
                        <div className="condition-item">
                          <strong>Temperature:</strong> {details.currentConditions.temperature}
                        </div>
                        <div className="condition-item">
                          <strong>Humidity:</strong> {details.currentConditions.humidity}
                        </div>
                        <div className="condition-item">
                          <strong>Soil Moisture:</strong> {details.currentConditions.moisture}
                        </div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4>Recommendations</h4>
                      <ul className="detail-list">
                        {details.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="detail-section">
                      <h4>Smart Irrigation Tips</h4>
                      <ul className="detail-list">
                        {details.smartIrrigation.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;

