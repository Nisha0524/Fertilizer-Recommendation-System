import { strings } from './strings';

export const translateRecommendation = (recommendation, language) => {
  if (!recommendation) return recommendation;
  
  const t = (key) => strings[language]?.[key] || strings['en'][key] || key;
  
  // Translate fertilizer names
  const fertilizerMap = {
    'NPK 19:19:19': t('fertilizerNPK'),
    'Urea': t('fertilizerUrea'),
    'DAP': t('fertilizerDAP'),
    'Potash': t('fertilizerPotash'),
    'Compost': t('fertilizerCompost'),
    'Organic Mix': t('fertilizerOrganicMix')
  };
  
  // Translate remarks
  const remarkMap = {
    'NPK 19:19:19': t('remarkNPK'),
    'Urea': t('remarkUrea'),
    'DAP': t('remarkDAP'),
    'Potash': t('remarkPotash'),
    'Compost': t('remarkCompost'),
    'Organic Mix': t('remarkOrganicMix')
  };
  
  // Translate alternative remarks
  const altRemarkMap = {
    'NPK 19:19:19': t('altRemarkNPK'),
    'Urea': t('altRemarkUrea'),
    'DAP': t('altRemarkDAP'),
    'Potash': t('altRemarkPotash'),
    'Compost': t('altRemarkCompost'),
    'Organic Mix': t('altRemarkOrganicMix')
  };
  
  // Translate dosage units
  const translateDosage = (dosage) => {
    if (!dosage) return dosage;
    if (language === 'ta') {
      let translated = dosage
        .replace(/kg per acre/gi, t('kgPerAcre'))
        .replace(/tons per acre/gi, t('tonsPerAcre'))
        .replace(/kg\/acre/gi, t('kgPerAcre'))
        .replace(/ton\/acre/gi, t('tonsPerAcre'))
        .replace(/per acre/gi, 'எகர்');
      return translated;
    }
    return dosage;
  };
  
  // Translate suggestions
  const suggestionMap = {
    'Consider adding nitrogen-rich organic matter like farmyard manure or green manure crops.': t('suggestionLowN'),
    'Phosphorus levels are low. Consider bone meal or rock phosphate as organic alternatives.': t('suggestionLowP'),
    'Potassium deficiency detected. Wood ash or banana peels can be used as organic potassium sources.': t('suggestionLowK'),
    'Soil is acidic. Consider adding lime to raise pH level gradually.': t('suggestionAcidic'),
    'Soil is alkaline. Consider adding sulfur or organic matter to lower pH.': t('suggestionAlkaline'),
    'Low soil moisture. Ensure adequate irrigation before fertilizer application.': t('suggestionLowMoisture'),
    'High temperature conditions. Apply fertilizers early morning or evening to avoid evaporation loss.': t('suggestionHighTemp'),
    'For tomatoes, consider side-dressing with compost during flowering stage.': t('suggestionTomato'),
    'For rice, split application of nitrogen is recommended - 50% at planting, 25% at tillering, 25% at panicle initiation.': t('suggestionRice'),
    'For wheat, apply phosphorus at sowing and nitrogen in split doses during growth stages.': t('suggestionWheat'),
    'For cabbage, ensure adequate nitrogen for leaf development. Consider foliar feeding.': t('suggestionCabbage'),
    'For potatoes, high potassium requirement. Apply potash at tuber formation stage.': t('suggestionPotato'),
    'For cotton, balanced NPK with micronutrients. Consider zinc and boron supplements.': t('suggestionCotton'),
    'Follow crop-specific nutrient management practices.': t('suggestionDefault'),
    'Consult agricultural expert': t('consultExpert')
  };
  
  // Get original fertilizer name for mapping
  const originalFertilizer = recommendation.fertilizer;
  
  const translated = {
    ...recommendation,
    fertilizer: fertilizerMap[originalFertilizer] || originalFertilizer,
    dosage: translateDosage(recommendation.dosage),
    remarks: remarkMap[originalFertilizer] || recommendation.remarks
  };
  
  // Translate alternatives
  if (recommendation.alternatives && recommendation.alternatives.length > 0) {
    translated.alternatives = recommendation.alternatives.map(alt => {
      const originalAltFert = alt.fertilizer;
      return {
        ...alt,
        fertilizer: fertilizerMap[originalAltFert] || originalAltFert,
        dosage: translateDosage(alt.dosage),
        remarks: altRemarkMap[originalAltFert] || alt.remarks
      };
    });
  }
  
  // Translate suggestions
  if (recommendation.suggestions && recommendation.suggestions.length > 0) {
    translated.suggestions = recommendation.suggestions.map(suggestion => {
      // Try exact match first
      if (suggestionMap[suggestion]) {
        return suggestionMap[suggestion];
      }
      // Try keyword matching
      const suggestionLower = suggestion.toLowerCase();
      if (suggestionLower.includes('nitrogen') && suggestionLower.includes('organic')) {
        return t('suggestionLowN');
      }
      if (suggestionLower.includes('phosphorus') && suggestionLower.includes('low')) {
        return t('suggestionLowP');
      }
      if (suggestionLower.includes('potassium') && suggestionLower.includes('deficiency')) {
        return t('suggestionLowK');
      }
      if (suggestionLower.includes('acidic') || suggestionLower.includes('ph') && suggestionLower.includes('6.0')) {
        return t('suggestionAcidic');
      }
      if (suggestionLower.includes('alkaline') || suggestionLower.includes('ph') && suggestionLower.includes('7.5')) {
        return t('suggestionAlkaline');
      }
      if (suggestionLower.includes('moisture') && suggestionLower.includes('low')) {
        return t('suggestionLowMoisture');
      }
      if (suggestionLower.includes('temperature') && suggestionLower.includes('high')) {
        return t('suggestionHighTemp');
      }
      if (suggestionLower.includes('tomato')) {
        return t('suggestionTomato');
      }
      if (suggestionLower.includes('rice')) {
        return t('suggestionRice');
      }
      if (suggestionLower.includes('wheat')) {
        return t('suggestionWheat');
      }
      if (suggestionLower.includes('cabbage')) {
        return t('suggestionCabbage');
      }
      if (suggestionLower.includes('potato')) {
        return t('suggestionPotato');
      }
      if (suggestionLower.includes('cotton')) {
        return t('suggestionCotton');
      }
      if (suggestionLower.includes('crop-specific') || suggestionLower.includes('nutrient management')) {
        return t('suggestionDefault');
      }
      return suggestion;
    });
  }
  
  return translated;
};

