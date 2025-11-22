import pickle
import os

def predict_fertilizer(N, P, K, temperature, humidity, ph, moisture, crop):
    """
    Predict fertilizer recommendation based on input parameters
    """
    try:
        # Load model and encoders
        model_path = 'fertilizer_model.pkl'
        crop_encoder_path = 'crop_encoder.pkl'
        target_encoder_path = 'target_encoder.pkl'
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("Model file not found. Please run model_train.py first.")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        with open(crop_encoder_path, 'rb') as f:
            crop_encoder = pickle.load(f)
        
        with open(target_encoder_path, 'rb') as f:
            target_encoder = pickle.load(f)
        
        # Encode crop - handle unknown crops gracefully
        try:
            crop_encoded = crop_encoder.transform([crop])[0]
        except ValueError:
            # If crop is not in training data, use a default similar crop
            known_crops = crop_encoder.classes_
            # Map unknown crops to similar known crops
            # First, find a safe default crop that definitely exists
            safe_defaults = ['tomato', 'rice', 'wheat', 'cotton', 'maize']
            default_crop = None
            for safe_crop in safe_defaults:
                if safe_crop in known_crops:
                    default_crop = safe_crop
                    break
            if not default_crop:
                default_crop = known_crops[0]  # Use first known crop as last resort
            
            crop_mapping = {
                'peas': 'tomato' if 'tomato' in known_crops else default_crop,
                'beans': 'tomato' if 'tomato' in known_crops else default_crop,  # Map beans to tomato (similar vegetable)
                'potato': 'potato' if 'potato' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'onion': 'onion' if 'onion' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'chilli': 'chilli' if 'chilli' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'cabbage': 'cabbage' if 'cabbage' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'cauliflower': 'cauliflower' if 'cauliflower' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'carrot': 'carrot' if 'carrot' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'cucumber': 'cucumber' if 'cucumber' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'pumpkin': 'pumpkin' if 'pumpkin' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'watermelon': 'watermelon' if 'watermelon' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'banana': 'banana' if 'banana' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'mango': 'mango' if 'mango' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'coconut': 'coconut' if 'coconut' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'groundnut': 'groundnut' if 'groundnut' in known_crops else ('cotton' if 'cotton' in known_crops else default_crop),
                'sunflower': 'sunflower' if 'sunflower' in known_crops else ('cotton' if 'cotton' in known_crops else default_crop),
                'soybean': 'soybean' if 'soybean' in known_crops else ('cotton' if 'cotton' in known_crops else default_crop),
                'mustard': 'mustard' if 'mustard' in known_crops else ('cotton' if 'cotton' in known_crops else default_crop),
                'barley': 'barley' if 'barley' in known_crops else ('wheat' if 'wheat' in known_crops else default_crop),
                'oats': 'oats' if 'oats' in known_crops else ('wheat' if 'wheat' in known_crops else default_crop),
                'millet': 'millet' if 'millet' in known_crops else ('wheat' if 'wheat' in known_crops else default_crop),
                'sorghum': 'sorghum' if 'sorghum' in known_crops else ('wheat' if 'wheat' in known_crops else default_crop),
                'paddy': 'paddy' if 'paddy' in known_crops else ('rice' if 'rice' in known_crops else default_crop),
                'turmeric': 'turmeric' if 'turmeric' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'ginger': 'ginger' if 'ginger' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop),
                'brinjal': 'brinjal' if 'brinjal' in known_crops else ('tomato' if 'tomato' in known_crops else default_crop)
            }
            # Use mapped crop or default to a safe crop
            mapped_crop = crop_mapping.get(crop.lower(), default_crop)
            
            # Double check the mapped crop exists before encoding
            if mapped_crop not in known_crops:
                mapped_crop = default_crop
            
            crop_encoded = crop_encoder.transform([mapped_crop])[0]
        
        # Prepare input features
        features = [[N, P, K, temperature, humidity, ph, moisture, crop_encoded]]
        
        # Predict
        prediction_encoded = model.predict(features)[0]
        
        # Handle case where prediction index might be out of range
        try:
            fertilizer = target_encoder.inverse_transform([prediction_encoded])[0]
        except (ValueError, IndexError) as e:
            # If prediction fails, use the most common fertilizer or first available
            fertilizer_classes = target_encoder.classes_
            if len(fertilizer_classes) > 0:
                fertilizer = fertilizer_classes[0]  # Use first fertilizer as fallback
            else:
                fertilizer = 'NPK 19:19:19'  # Ultimate fallback
        
        # Get prediction probabilities for alternative recommendations
        try:
            probabilities = model.predict_proba(features)[0]
            fertilizer_classes = target_encoder.classes_
            # Get top 3 recommendations
            top_indices = probabilities.argsort()[-3:][::-1]
            alternatives = []
            for idx in top_indices[1:]:  # Skip the first one (primary recommendation)
                alt_fertilizer = fertilizer_classes[idx]
                if alt_fertilizer != fertilizer:
                    alternatives.append(alt_fertilizer)
        except:
            alternatives = []
        
        # Crop-specific fertilizer recommendations with adjusted dosages
        crop_fertilizer_map = {
            'rice': {
                'NPK 19:19:19': {'dosage': '60-80 kg per acre', 'priority': 1},
                'Urea': {'dosage': '120-180 kg per acre', 'priority': 2},
                'DAP': {'dosage': '40-60 kg per acre', 'priority': 3},
                'Potash': {'dosage': '40-60 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'wheat': {
                'DAP': {'dosage': '60-80 kg per acre', 'priority': 1},
                'Urea': {'dosage': '100-140 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '50-70 kg per acre', 'priority': 3},
                'Potash': {'dosage': '30-50 kg per acre', 'priority': 4},
                'Compost': {'dosage': '2-3 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '1-2 tons per acre', 'priority': 6}
            },
            'tomato': {
                'DAP': {'dosage': '50-80 kg per acre', 'priority': 1},
                'Potash': {'dosage': '50-70 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '60-90 kg per acre', 'priority': 3},
                'Urea': {'dosage': '80-120 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'cotton': {
                'NPK 19:19:19': {'dosage': '70-100 kg per acre', 'priority': 1},
                'Urea': {'dosage': '100-150 kg per acre', 'priority': 2},
                'DAP': {'dosage': '50-80 kg per acre', 'priority': 3},
                'Potash': {'dosage': '40-60 kg per acre', 'priority': 4},
                'Compost': {'dosage': '2-3 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '1.5-2.5 tons per acre', 'priority': 6}
            },
            'sugarcane': {
                'Urea': {'dosage': '150-200 kg per acre', 'priority': 1},
                'NPK 19:19:19': {'dosage': '80-120 kg per acre', 'priority': 2},
                'Potash': {'dosage': '60-80 kg per acre', 'priority': 3},
                'DAP': {'dosage': '60-90 kg per acre', 'priority': 4},
                'Compost': {'dosage': '4-5 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'potato': {
                'Potash': {'dosage': '60-90 kg per acre', 'priority': 1},
                'DAP': {'dosage': '50-80 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '60-85 kg per acre', 'priority': 3},
                'Urea': {'dosage': '80-120 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'maize': {
                'NPK 19:19:19': {'dosage': '60-85 kg per acre', 'priority': 1},
                'Urea': {'dosage': '100-150 kg per acre', 'priority': 2},
                'DAP': {'dosage': '50-75 kg per acre', 'priority': 3},
                'Potash': {'dosage': '35-55 kg per acre', 'priority': 4},
                'Compost': {'dosage': '2-3 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '1.5-2.5 tons per acre', 'priority': 6}
            },
            'brinjal': {
                'DAP': {'dosage': '50-75 kg per acre', 'priority': 1},
                'Potash': {'dosage': '45-65 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '55-80 kg per acre', 'priority': 3},
                'Urea': {'dosage': '70-110 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'chilli': {
                'Potash': {'dosage': '50-70 kg per acre', 'priority': 1},
                'DAP': {'dosage': '45-70 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '55-80 kg per acre', 'priority': 3},
                'Urea': {'dosage': '75-115 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'cabbage': {
                'Urea': {'dosage': '120-170 kg per acre', 'priority': 1},
                'NPK 19:19:19': {'dosage': '60-85 kg per acre', 'priority': 2},
                'DAP': {'dosage': '45-70 kg per acre', 'priority': 3},
                'Potash': {'dosage': '30-50 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'cauliflower': {
                'Urea': {'dosage': '110-160 kg per acre', 'priority': 1},
                'NPK 19:19:19': {'dosage': '55-80 kg per acre', 'priority': 2},
                'DAP': {'dosage': '40-65 kg per acre', 'priority': 3},
                'Potash': {'dosage': '30-50 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            },
            'carrot': {
                'Potash': {'dosage': '40-60 kg per acre', 'priority': 1},
                'DAP': {'dosage': '40-65 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '50-75 kg per acre', 'priority': 3},
                'Urea': {'dosage': '60-100 kg per acre', 'priority': 4},
                'Compost': {'dosage': '2-3 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '1.5-2.5 tons per acre', 'priority': 6}
            },
            'onion': {
                'Potash': {'dosage': '50-70 kg per acre', 'priority': 1},
                'DAP': {'dosage': '45-70 kg per acre', 'priority': 2},
                'NPK 19:19:19': {'dosage': '55-80 kg per acre', 'priority': 3},
                'Urea': {'dosage': '70-110 kg per acre', 'priority': 4},
                'Compost': {'dosage': '3-4 tons per acre', 'priority': 5},
                'Organic Mix': {'dosage': '2-3 tons per acre', 'priority': 6}
            }
        }
        
        # Get crop-specific fertilizer preferences for dosage adjustment only
        # DO NOT override the model's prediction - trust the ML model
        crop_lower = crop.lower()
        crop_fertilizers = crop_fertilizer_map.get(crop_lower, {
            'NPK 19:19:19': {'dosage': '50-75 kg per acre', 'priority': 1},
            'Urea': {'dosage': '100-150 kg per acre', 'priority': 2},
            'DAP': {'dosage': '50-100 kg per acre', 'priority': 3},
            'Potash': {'dosage': '30-50 kg per acre', 'priority': 4},
            'Compost': {'dosage': '2-3 tons per acre', 'priority': 5},
            'Organic Mix': {'dosage': '1-2 tons per acre', 'priority': 6}
        })
        
        # IMPORTANT: Keep the model's prediction - don't override it
        # Only adjust dosages based on crop type if available, otherwise use default
        if fertilizer in crop_fertilizers:
            # Use crop-specific dosage for this fertilizer
            dosage_map = crop_fertilizers[fertilizer]
            dosage = dosage_map['dosage'] if isinstance(dosage_map, dict) else dosage_map
        else:
            # Use default dosage for fertilizers not in crop-specific map
            # This handles any fertilizers from the dataset that aren't in our crop map
            default_dosages = {
                'NPK 19:19:19': '50-75 kg per acre',
                'Urea': '100-150 kg per acre',
                'DAP': '50-100 kg per acre',
                'Potash': '30-50 kg per acre',
                'Compost': '2-3 tons per acre',
                'Organic Mix': '1-2 tons per acre'
            }
            dosage = default_dosages.get(fertilizer, 'Consult agricultural expert')
        
        # Crop-specific remarks
        remarks_map = {
            'rice': {
                'NPK 19:19:19': 'Balanced fertilizer for rice. Apply 50% at planting, 25% at tillering, 25% at panicle initiation.',
                'Urea': 'High nitrogen for rice. Split application: 50% at planting, 25% at tillering, 25% at panicle initiation.',
                'DAP': 'Phosphorus for root development in rice. Apply at planting.',
                'Potash': 'Potassium for grain filling in rice. Apply at panicle initiation.',
                'Compost': 'Organic option for rice. Apply well-decomposed farmyard manure.',
                'Organic Mix': 'Complete organic solution for rice. Enhances soil health.'
            },
            'wheat': {
                'DAP': 'Phosphorus essential for wheat root development. Apply at sowing.',
                'Urea': 'Nitrogen for wheat growth. Apply in split doses: 50% at sowing, 50% at tillering.',
                'NPK 19:19:19': 'Balanced fertilizer for wheat. Apply at sowing.',
                'Potash': 'Potassium for grain quality in wheat. Apply at boot stage.',
                'Compost': 'Organic option for wheat. Apply well-decomposed compost.',
                'Organic Mix': 'Complete organic solution for wheat.'
            },
            'tomato': {
                'DAP': 'Phosphorus for tomato root and flower development. Apply at planting and flowering.',
                'Potash': 'Potassium essential for tomato fruit quality and disease resistance. Apply during fruiting.',
                'NPK 19:19:19': 'Balanced fertilizer for tomatoes. Apply during planting and flowering stages.',
                'Urea': 'Nitrogen for tomato vegetative growth. Apply during early growth stage.',
                'Compost': 'Organic option for tomatoes. Side-dress during flowering stage.',
                'Organic Mix': 'Complete organic solution for tomatoes.'
            },
            'cotton': {
                'NPK 19:19:19': 'Balanced NPK for cotton. Apply in split doses throughout growth.',
                'Urea': 'Nitrogen for cotton vegetative growth. Apply in 3-4 split doses.',
                'DAP': 'Phosphorus for cotton root development. Apply at planting.',
                'Potash': 'Potassium for cotton boll development. Apply during flowering.',
                'Compost': 'Organic option for cotton. Apply well-decomposed compost.',
                'Organic Mix': 'Complete organic solution for cotton with micronutrients.'
            },
            'sugarcane': {
                'Urea': 'High nitrogen requirement for sugarcane. Apply in 3-4 split doses.',
                'NPK 19:19:19': 'Balanced fertilizer for sugarcane. Apply in split doses.',
                'Potash': 'Potassium for sugarcane quality. Apply during growth stages.',
                'DAP': 'Phosphorus for sugarcane root development. Apply at planting.',
                'Compost': 'Organic option for sugarcane. Apply well-decomposed farmyard manure.',
                'Organic Mix': 'Complete organic solution for sugarcane.'
            },
            'potato': {
                'Potash': 'High potassium requirement for potato tuber development. Apply at tuber formation.',
                'DAP': 'Phosphorus for potato root and tuber development. Apply at planting.',
                'NPK 19:19:19': 'Balanced fertilizer for potatoes. Apply at planting.',
                'Urea': 'Nitrogen for potato vegetative growth. Apply during early growth.',
                'Compost': 'Organic option for potatoes. Apply well-decomposed compost.',
                'Organic Mix': 'Complete organic solution for potatoes.'
            },
            'brinjal': {
                'Urea': 'Nitrogen for brinjal vegetative growth and fruit development. Apply in split doses.',
                'DAP': 'Phosphorus for brinjal root and flower development. Apply at planting and flowering.',
                'Potash': 'Potassium for brinjal fruit quality. Apply during fruiting stage.',
                'NPK 19:19:19': 'Balanced fertilizer for brinjal. Apply during planting and flowering.',
                'Compost': 'Organic option for brinjal. Side-dress during flowering stage.',
                'Organic Mix': 'Complete organic solution for brinjal with pest management benefits.'
            },
            'chilli': {
                'Potash': 'Potassium essential for chilli fruit quality and pungency. Apply during fruiting.',
                'DAP': 'Phosphorus for chilli root and flower development. Apply at planting.',
                'NPK 19:19:19': 'Balanced fertilizer for chilli. Apply during planting and flowering.',
                'Urea': 'Nitrogen for chilli vegetative growth. Apply during early growth stage.',
                'Compost': 'Organic option for chilli. Improves fruit quality.',
                'Organic Mix': 'Complete organic solution for chilli with natural pest resistance.'
            },
            'cabbage': {
                'Urea': 'High nitrogen requirement for cabbage leaf development. Apply in split doses.',
                'NPK 19:19:19': 'Balanced fertilizer for cabbage. Apply during planting.',
                'DAP': 'Phosphorus for cabbage root development. Apply at planting.',
                'Potash': 'Potassium for cabbage head formation. Apply during head development.',
                'Compost': 'Organic option for cabbage. Apply well-decomposed compost.',
                'Organic Mix': 'Complete organic solution for cabbage.'
            },
            'cauliflower': {
                'Urea': 'High nitrogen requirement for cauliflower curd development. Apply in split doses.',
                'NPK 19:19:19': 'Balanced fertilizer for cauliflower. Apply during planting.',
                'DAP': 'Phosphorus for cauliflower root development. Apply at planting.',
                'Potash': 'Potassium for cauliflower curd quality. Apply during curd formation.',
                'Compost': 'Organic option for cauliflower. Apply well-decomposed compost.',
                'Organic Mix': 'Complete organic solution for cauliflower.'
            },
            'carrot': {
                'Potash': 'Potassium essential for carrot root development and quality. Apply during root formation.',
                'DAP': 'Phosphorus for carrot root development. Apply at planting.',
                'NPK 19:19:19': 'Balanced fertilizer for carrot. Apply during planting.',
                'Urea': 'Nitrogen for carrot vegetative growth. Apply during early growth.',
                'Compost': 'Organic option for carrot. Improves root quality.',
                'Organic Mix': 'Complete organic solution for carrot.'
            },
            'onion': {
                'Potash': 'Potassium essential for onion bulb development. Apply during bulb formation.',
                'DAP': 'Phosphorus for onion root development. Apply at planting.',
                'NPK 19:19:19': 'Balanced fertilizer for onion. Apply during planting.',
                'Urea': 'Nitrogen for onion vegetative growth. Apply during early growth.',
                'Compost': 'Organic option for onion. Improves bulb quality.',
                'Organic Mix': 'Complete organic solution for onion.'
            },
            'maize': {
                'NPK 19:19:19': 'Balanced fertilizer for maize. Apply during planting.',
                'Urea': 'Nitrogen for maize growth. Apply in split doses: 50% at planting, 50% at tasseling.',
                'DAP': 'Phosphorus for maize root development. Apply at planting.',
                'Potash': 'Potassium for maize grain filling. Apply at tasseling stage.',
                'Compost': 'Organic option for maize. Apply well-decomposed compost.',
                'Organic Mix': 'Complete organic solution for maize.'
            }
        }
        
        # Get crop-specific remark or default
        crop_remarks = remarks_map.get(crop_lower, {
            'NPK 19:19:19': 'Balanced fertilizer suitable for most crops. Apply during planting.',
            'Urea': 'High nitrogen content. Best applied during vegetative growth stage.',
            'DAP': 'Rich in phosphorus. Ideal for root development and flowering.',
            'Potash': 'Essential for fruit quality and disease resistance. Apply during fruiting.',
            'Compost': 'Organic option. Improves soil structure and nutrient retention.',
            'Organic Mix': 'Complete organic solution. Enhances soil health and crop quality.'
        })
        
        remarks = crop_remarks.get(fertilizer, 'Follow recommended agricultural practices for this crop.')
        
        # Generate alternative recommendations with crop-specific dosages
        alternative_recommendations = []
        default_dosages = {
            'NPK 19:19:19': '50-75 kg per acre',
            'Urea': '100-150 kg per acre',
            'DAP': '50-100 kg per acre',
            'Potash': '30-50 kg per acre',
            'Compost': '2-3 tons per acre',
            'Organic Mix': '1-2 tons per acre'
        }
        
        for alt_fert in alternatives[:2]:  # Limit to 2 alternatives
            # Get crop-specific dosage if available, otherwise use default
            if alt_fert in crop_fertilizers:
                alt_dosage_info = crop_fertilizers[alt_fert]
                alt_dosage = alt_dosage_info['dosage'] if isinstance(alt_dosage_info, dict) else alt_dosage_info
            else:
                alt_dosage = default_dosages.get(alt_fert, 'Consult agricultural expert')
            
            alt_remark = crop_remarks.get(alt_fert, 'Alternative option based on soil conditions and crop requirements.')
            alternative_recommendations.append({
                'fertilizer': alt_fert,
                'dosage': alt_dosage,
                'remarks': alt_remark
            })
        
        # Generate additional suggestions based on soil conditions
        additional_suggestions = []
        
        if N < 30:
            additional_suggestions.append('Consider adding nitrogen-rich organic matter like farmyard manure or green manure crops.')
        if P < 25:
            additional_suggestions.append('Phosphorus levels are low. Consider bone meal or rock phosphate as organic alternatives.')
        if K < 30:
            additional_suggestions.append('Potassium deficiency detected. Wood ash or banana peels can be used as organic potassium sources.')
        if ph < 6.0:
            additional_suggestions.append('Soil is acidic. Consider adding lime to raise pH level gradually.')
        if ph > 7.5:
            additional_suggestions.append('Soil is alkaline. Consider adding sulfur or organic matter to lower pH.')
        if moisture < 40:
            additional_suggestions.append('Low soil moisture. Ensure adequate irrigation before fertilizer application.')
        if temperature > 35:
            additional_suggestions.append('High temperature conditions. Apply fertilizers early morning or evening to avoid evaporation loss.')
        
        # Crop-specific suggestions
        crop_suggestions = {
            'tomato': 'For tomatoes, consider side-dressing with compost during flowering stage.',
            'rice': 'For rice, split application of nitrogen is recommended - 50% at planting, 25% at tillering, 25% at panicle initiation.',
            'wheat': 'For wheat, apply phosphorus at sowing and nitrogen in split doses during growth stages.',
            'cabbage': 'For cabbage, ensure adequate nitrogen for leaf development. Consider foliar feeding.',
            'potato': 'For potatoes, high potassium requirement. Apply potash at tuber formation stage.',
            'cotton': 'For cotton, balanced NPK with micronutrients. Consider zinc and boron supplements.'
        }
        
        crop_suggestion = crop_suggestions.get(crop.lower(), 'Follow crop-specific nutrient management practices.')
        if crop_suggestion:
            additional_suggestions.append(crop_suggestion)
        
        return {
            'fertilizer': fertilizer,
            'dosage': dosage,
            'remarks': remarks,
            'alternatives': alternative_recommendations,
            'suggestions': additional_suggestions
        }
    except Exception as e:
        raise Exception(f"Prediction error: {str(e)}")

