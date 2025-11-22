import jsPDF from 'jspdf';

export const generatePDF = (inputs, recommendation, t, additionalData) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(76, 175, 80); // Green color
  doc.text('Fertilizer Recommendation Report', 105, 20, { align: 'center' });
  
  // Line
  doc.setDrawColor(76, 175, 80);
  doc.line(20, 25, 190, 25);
  
  let yPos = 35;
  
  // Helper function to check if new page is needed
  const checkNewPage = (requiredSpace = 10) => {
    if (yPos > 280 - requiredSpace) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };
  
  const sanitizeText = (value) => {
    if (value === undefined || value === null) return '';
    let text = String(value);
    const replacements = {
      '→': '->',
      '°': ' deg ',
      '•': '-',
      '–': '-',
      '—': '-',
      '’': '\'',
      '‘': '\'',
      '“': '"',
      '”': '"',
      '₹': 'Rs.',
      '🌱': '',
      '🐛': '',
      '💧': '',
      '🍃': '',
      '🔄': '',
      '💡': '',
      '🌾': '',
      '🌧️': '',
      '🌦️': ''
    };
    Object.keys(replacements).forEach((char) => {
      text = text.split(char).join(replacements[char]);
    });
    return text.replace(/\s+/g, ' ').trim();
  };

  const addParagraph = (text, indent = 25, lineHeight = 6) => {
    const clean = sanitizeText(text);
    if (!clean) return;
    const width = Math.max(20, 190 - indent);
    const lines = doc.splitTextToSize(clean, width);
    const requiredSpace = lines.length * lineHeight + 2;
    checkNewPage(requiredSpace);
    doc.text(lines, indent, yPos);
    yPos += lines.length * lineHeight;
  };

  const addKeyValue = (label, value, indent = 25) => {
    addParagraph(`${label}: ${value}`, indent);
  };

  const addList = (items = [], indent = 30) => {
    items
      .map((item) => sanitizeText(item))
      .filter(Boolean)
      .forEach((item) => addParagraph(`- ${item}`, indent));
  };
  
  // Helper function to add section header (without emojis - they cause garbled text in PDF)
  const addSectionHeader = (title, icon = '', color = [0, 0, 0]) => {
    checkNewPage(15);
    doc.setFontSize(14);
    doc.setTextColor(color[0], color[1], color[2]);
    // Use plain text title without emojis
    doc.text(title, 20, yPos);
    yPos += 8;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(20, yPos - 2, 190, yPos - 2);
    yPos += 5;
    doc.setTextColor(0, 0, 0);
  };
  
  // Input Parameters Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Input Parameters', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  addKeyValue('Nitrogen (N)', inputs.N, 20);
  addKeyValue('Phosphorus (P)', inputs.P, 20);
  addKeyValue('Potassium (K)', inputs.K, 20);
  addKeyValue('Temperature', `${inputs.temperature} deg C`, 20);
  addKeyValue('Humidity', `${inputs.humidity}%`, 20);
  addKeyValue('pH Level', inputs.ph, 20);
  addKeyValue('Moisture', `${inputs.moisture}%`, 20);
  addKeyValue('Crop', inputs.crop, 20);
  if (inputs.soil_type) {
    addKeyValue('Soil Type', inputs.soil_type, 20);
  }
  if (inputs.hectare_area) {
    addKeyValue('Hectare Area', `${inputs.hectare_area} hectares`, 20);
  }
  yPos += 8;
  
  // Recommendation Section
  doc.setFontSize(16);
  doc.text('Recommendation', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(12);
  doc.setTextColor(76, 175, 80);
  doc.text(sanitizeText(`Fertilizer: ${recommendation.fertilizer}`), 20, yPos);
  yPos += 7;
  doc.setTextColor(0, 0, 0);
  doc.text(sanitizeText(`Dosage: ${recommendation.dosage}`), 20, yPos);
  yPos += 7;
  addParagraph(`Remarks: ${recommendation.remarks}`, 20);
  yPos += 8;
  
  // Alternative Recommendations
  if (recommendation.alternatives && recommendation.alternatives.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(255, 152, 0); // Orange
    doc.text('Alternative Options', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    recommendation.alternatives.forEach((alt, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.setTextColor(255, 152, 0);
      doc.text(sanitizeText(`Alternative ${index + 1}: ${alt.fertilizer}`), 20, yPos);
      yPos += 7;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(sanitizeText(`Dosage: ${alt.dosage}`), 25, yPos);
      yPos += 6;
      addParagraph(`Remarks: ${alt.remarks}`, 25);
      yPos += 6;
    });
    yPos += 5;
  }
  
  // Additional Suggestions
  if (recommendation.suggestions && recommendation.suggestions.length > 0) {
    checkNewPage(20);
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243); // Blue
    doc.text('Additional Suggestions', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    addList(recommendation.suggestions, 25);
    yPos += 10;
  }
  
  // Additional Features Section
  if (additionalData) {
    yPos += 5;
    
    // Soil Health Score
    if (additionalData.soilHealthScore !== undefined) {
      addSectionHeader('Soil Health Score', '', [76, 175, 80]);
      doc.setFontSize(12);
      addKeyValue('Score', `${additionalData.soilHealthScore}/100`, 25);
      addParagraph(`Status: ${additionalData.soilHealthMessage || 'Good'}`, 25);
      yPos += 5;
    }
    
    // Pest Risk Predictor
    if (additionalData.pestRisk) {
      addSectionHeader('Pest Risk Predictor', '', [255, 152, 0]);
      doc.setFontSize(12);
      addKeyValue('Risk Level', additionalData.pestRisk.risk, 25);
      doc.setFontSize(11);
      addParagraph(`Message: ${additionalData.pestRisk.message}`, 25);
      addParagraph(`Recommendation: ${additionalData.pestRisk.recommendation}`, 25);
      yPos += 3;
    }
    
    // Water Usage Alert
    if (additionalData.waterUsage && inputs.crop) {
      addSectionHeader('Water Usage Alert', '', [33, 150, 243]);
      doc.setFontSize(12);
      addKeyValue('Level', additionalData.waterUsage.level, 25);
      doc.setFontSize(11);
      addParagraph(additionalData.waterUsage.message, 25);
      yPos += 3;
    }
    
    // Compost Suggestion
    if (additionalData.compostSuggestion) {
      addSectionHeader('Compost Suggestion', '', [76, 175, 80]);
      doc.setFontSize(12);
      addKeyValue('Type', additionalData.compostSuggestion.type, 25);
      doc.setFontSize(11);
      addParagraph(additionalData.compostSuggestion.suggestion, 25);
      yPos += 3;
    }
    
    // Crop Rotation Advisor
    if (additionalData.cropRotation && inputs.crop) {
      addSectionHeader('Crop Rotation Advisor', '', [156, 39, 176]);
      doc.setFontSize(11);
      addParagraph(additionalData.cropRotation, 25);
      yPos += 3;
    }
    
    // Daily Farming Tip
    if (additionalData.dailyTip) {
      addSectionHeader('Daily Farming Tip', '', [255, 193, 7]);
      doc.setFontSize(11);
      addParagraph(additionalData.dailyTip, 25);
      yPos += 3;
    }
    
    // AI Irrigation Alert
    if (additionalData.weatherForecast) {
      addSectionHeader('AI Irrigation Alert', '', additionalData.weatherForecast.alert ? [244, 67, 54] : [76, 175, 80]);
      doc.setFontSize(11);
      addParagraph(additionalData.weatherForecast.message, 25);
      yPos += 3;
    }
    
    const detailSections = additionalData.detailSections || {};

    if (detailSections.soilHealth) {
      addSectionHeader('Soil Health Insights', '', [76, 175, 80]);
      doc.setFontSize(12);
      addKeyValue('Current Score', `${detailSections.soilHealth.currentScore}/100`, 25);
      addParagraph(`Status: ${detailSections.soilHealth.message}`, 25);
      doc.setFontSize(11);
      doc.text('Breakdown', 25, yPos);
      yPos += 6;
      Object.values(detailSections.soilHealth.breakdown || {}).forEach((metric) => {
        const optimalText = metric.optimal ? `, Optimal: ${metric.optimal}` : '';
        addParagraph(`${metric.status}: Score ${metric.score}/${metric.max} (Value: ${metric.value}${optimalText})`, 30);
      });
      doc.text('Recommendations', 25, yPos);
      yPos += 6;
      addList(detailSections.soilHealth.recommendations, 30);
      yPos += 4;
    }

    if (detailSections.pestRisk) {
      addSectionHeader('Pest Risk Deep Dive', '', [255, 152, 0]);
      doc.setFontSize(12);
      addKeyValue('Risk Level', detailSections.pestRisk.risk, 25);
      addParagraph(`Message: ${detailSections.pestRisk.message}`, 25);
      addParagraph(`Recommendation: ${detailSections.pestRisk.recommendation}`, 25);
      doc.setFontSize(11);
      doc.text('Risk Factors', 25, yPos);
      yPos += 6;
      (detailSections.pestRisk.factors || []).forEach((factor) => {
        addParagraph(`${factor.name} (${factor.impact}) - ${factor.value}. ${factor.description}`, 30);
      });
      doc.text('Prevention Tips', 25, yPos);
      yPos += 6;
      addList(detailSections.pestRisk.preventionTips, 30);
      yPos += 4;
    }

    if (detailSections.waterUsage) {
      addSectionHeader('Water Requirement Insights', '', [33, 150, 243]);
      doc.setFontSize(12);
      addKeyValue('Requirement Level', detailSections.waterUsage.level, 25);
      addParagraph(`Message: ${detailSections.waterUsage.message}`, 25);
      doc.setFontSize(11);
      doc.text('Water Requirements', 25, yPos);
      yPos += 6;
      Object.entries(detailSections.waterUsage.requirements || {}).forEach(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        addKeyValue(label, value, 30);
      });
      doc.text('Watering Tips', 25, yPos);
      yPos += 6;
      addList(detailSections.waterUsage.tips, 30);
      yPos += 4;
    }

    if (detailSections.compost) {
      addSectionHeader('Compost Strategy', '', [76, 175, 80]);
      doc.setFontSize(12);
      addKeyValue('Recommended Type', detailSections.compost.type, 25);
      addParagraph(detailSections.compost.suggestion, 25);
      doc.setFontSize(11);
      doc.text('Composition', 25, yPos);
      yPos += 6;
      Object.entries(detailSections.compost.composition || {}).forEach(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        addKeyValue(label, value, 30);
      });
      doc.text('Application Plan', 25, yPos);
      yPos += 6;
      addList(detailSections.compost.application, 30);
      doc.text('Benefits', 25, yPos);
      yPos += 6;
      addList(detailSections.compost.benefits, 30);
      yPos += 4;
    }

    if (detailSections.cropRotation) {
      addSectionHeader('Crop Rotation Plan', '', [156, 39, 176]);
      doc.setFontSize(12);
      addParagraph(detailSections.cropRotation.advice, 25);
      doc.setFontSize(11);
      doc.text('Rotation Cycle', 25, yPos);
      yPos += 6;
      const rotationPlan = detailSections.cropRotation.rotationPlan || {};
      Object.entries(rotationPlan).forEach(([year, cropValue]) => {
        const label = year.charAt(0).toUpperCase() + year.slice(1).replace(/[0-9]/g, (num) => ` ${num}`);
        addKeyValue(label, cropValue, 30);
      });
      doc.text('Benefits', 25, yPos);
      yPos += 6;
      addList(detailSections.cropRotation.benefits, 30);
      doc.text('Execution Tips', 25, yPos);
      yPos += 6;
      addList(detailSections.cropRotation.tips, 30);
      yPos += 4;
    }

    if (detailSections.dailyTip) {
      addSectionHeader('Daily Farming Guidance', '', [255, 193, 7]);
      doc.setFontSize(12);
      addParagraph(`Current Tip: ${detailSections.dailyTip.currentTip}`, 25);
      addParagraph(`Category: ${detailSections.dailyTip.category}`, 25);
      doc.setFontSize(11);
      doc.text('Top Tips', 25, yPos);
      yPos += 6;
      const tipList = (detailSections.dailyTip.allTips || []).slice(0, 6);
      addList(tipList, 30);
      Object.entries(detailSections.dailyTip.tipsByCategory || {}).forEach(([category, tips]) => {
        const categoryLabel = `${category.charAt(0).toUpperCase() + category.slice(1)} Tips`;
        doc.text(categoryLabel, 25, yPos);
        yPos += 6;
        addList(tips, 30);
      });
      yPos += 4;
    }

    if (detailSections.irrigation && detailSections.irrigation.forecast) {
      const irrigationColor = detailSections.irrigation.forecast.alert ? [244, 67, 54] : [76, 175, 80];
      addSectionHeader('AI Irrigation Insights', '', irrigationColor);
      doc.setFontSize(12);
      addParagraph(detailSections.irrigation.forecast.message, 25);
      doc.setFontSize(11);
      doc.text('Current Conditions', 25, yPos);
      yPos += 6;
      Object.entries(detailSections.irrigation.currentConditions || {}).forEach(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        addKeyValue(label, value, 30);
      });
      doc.text('Recommendations', 25, yPos);
      yPos += 6;
      addList(detailSections.irrigation.recommendations, 30);
      doc.text('Smart Irrigation Tips', 25, yPos);
      yPos += 6;
      addList(detailSections.irrigation.smartIrrigation, 30);
      yPos += 4;
    }

    // Plant Growth Stage Tips
    if (additionalData.growthStageTips && inputs.crop) {
      checkNewPage(30);
      addSectionHeader('Plant Growth Stage Tips', '', [76, 175, 80]);
      doc.setFontSize(11);
      
      Object.entries(additionalData.growthStageTips).forEach(([stage, tips]) => {
        checkNewPage(20);
        doc.setFontSize(12);
        doc.setTextColor(76, 175, 80);
        const stageName = stage.charAt(0).toUpperCase() + stage.slice(1) + ' Stage';
        doc.text(stageName, 25, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        if (Array.isArray(tips)) {
          addList(tips, 30);
        }
        yPos += 5;
      });
    }
  }
  
  // Footer
  checkNewPage(15);
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by Fertilizer Recommendation System', 105, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Date: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' });
  
  // Generate appropriate filename based on crop and date
  const cropName = inputs.crop ? inputs.crop.charAt(0).toUpperCase() + inputs.crop.slice(1) : 'Crop';
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `${cropName}_Fertilizer_Recommendation_${dateStr}.pdf`;
  
  // Save the PDF
  doc.save(filename);
};

