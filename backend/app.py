from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
from model import predict_fertilizer

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['fertilizer_db']
users_collection = db['users']
history_collection = db['history']

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Fertilizer Recommendation API is running',
        'status': 'OK',
        'endpoints': {
            'login': 'POST /login',
            'recommend': 'POST /recommend',
            'history': 'GET /history?user_email=...',
            'confusion_matrix': 'GET /static/confusion_matrix.png'
        }
    })

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json or {}
        email = data.get('email')
        password = data.get('password')
        
        # Always allow login with any email/password
        if not email:
            email = 'guest@example.com'
        if not password:
            password = 'password'
        
        # Check if user exists
        try:
            user = users_collection.find_one({'email': email})
            
            if user:
                # Update password if different, then login (no validation)
                try:
                    if user.get('password') != password:
                        users_collection.update_one(
                            {'email': email},
                            {'$set': {'password': password, 'updated_at': datetime.now()}}
                        )
                except:
                    pass  # Continue even if update fails
            else:
                # Auto-create user on first login
                try:
                    new_user = {
                        'email': email,
                        'password': password,
                        'created_at': datetime.now()
                    }
                    users_collection.insert_one(new_user)
                except:
                    pass  # Continue even if insert fails
            
            # Always return success
            return jsonify({
                'success': True,
                'email': email,
                'message': 'Login successful'
            })
        except:
            # Even if database fails, allow login
            return jsonify({
                'success': True,
                'email': email,
                'message': 'Login successful'
            })
    except Exception as e:
        # On any error, still allow login
        email = request.json.get('email', 'guest@example.com') if request.json else 'guest@example.com'
        return jsonify({
            'success': True,
            'email': email,
            'message': 'Login successful'
        })

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json or {}
        user_email = data.get('user_email', 'guest@example.com')
        
        # Validate and convert inputs with defaults
        try:
            n = float(data.get('N', 50))
            p = float(data.get('P', 30))
            k = float(data.get('K', 40))
            temperature = float(data.get('temperature', 28))
            humidity = float(data.get('humidity', 65))
            ph = float(data.get('ph', 6.5))
            moisture = float(data.get('moisture', 50))
        except (ValueError, TypeError) as e:
            return jsonify({'error': f'Invalid input values: {str(e)}'}), 400
        
        crop = data.get('crop', '')
        if not crop:
            return jsonify({'error': 'Crop type is required'}), 400
        
        soil_type = data.get('soil_type', '')
        hectare_area = data.get('hectare_area', '')
        
        # Get prediction from model
        try:
            result = predict_fertilizer(n, p, k, temperature, humidity, ph, moisture, crop)
            if not result:
                return jsonify({'error': 'Prediction returned empty result'}), 500
        except FileNotFoundError as e:
            return jsonify({'error': f'Model files not found. Please ensure model files (fertilizer_model.pkl, crop_encoder.pkl, target_encoder.pkl) exist in the backend directory. Error: {str(e)}'}), 500
        except Exception as e:
            return jsonify({'error': f'Prediction failed: {str(e)}'}), 500
        
        # Store in history (don't fail if this fails)
        try:
            history_entry = {
                'user_email': user_email,
                'timestamp': datetime.now(),
                'inputs': {
                    'N': n,
                    'P': p,
                    'K': k,
                    'temperature': temperature,
                    'humidity': humidity,
                    'ph': ph,
                    'moisture': moisture,
                    'crop': crop,
                    'soil_type': soil_type,
                    'hectare_area': hectare_area
                },
                'recommendation': result
            }
            history_collection.insert_one(history_entry)
        except Exception as e:
            # Log but don't fail the request
            print(f'Failed to save history: {str(e)}')
        
        return jsonify({
            'success': True,
            'recommendation': result
        })
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/history', methods=['GET'])
def history():
    try:
        user_email = request.args.get('user_email')
        if not user_email:
            return jsonify({'error': 'user_email required'}), 400
        
        # Get last 50 recommendations
        try:
            history_entries = list(history_collection.find(
                {'user_email': user_email}
            ).sort('timestamp', -1).limit(50))
            
            # Convert ObjectId to string for JSON serialization
            for entry in history_entries:
                entry['_id'] = str(entry['_id'])
                if 'timestamp' in entry:
                    entry['timestamp'] = entry['timestamp'].isoformat()
        except Exception as e:
            # If database query fails, return empty history
            print(f'Database query failed: {str(e)}')
            history_entries = []
        
        return jsonify({
            'success': True,
            'history': history_entries
        })
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/youtube-videos', methods=['GET'])
def get_youtube_videos():
    try:
        crop = request.args.get('crop', '').lower()
        
        # Crop-specific YouTube video recommendations
        video_recommendations = {
            'tomato': [
                {
                    'title': 'Complete Guide to Tomato Farming',
                    'description': 'Learn everything about growing tomatoes from seed to harvest',
                    'url': 'https://www.youtube.com/results?search_query=tomato+farming+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '15-20 min'
                },
                {
                    'title': 'Tomato Diseases and Solutions',
                    'description': 'Identify and treat common tomato diseases',
                    'url': 'https://www.youtube.com/results?search_query=tomato+diseases+treatment',
                    'category': 'Disease Management',
                    'duration': '10-15 min'
                },
                {
                    'title': 'Tomato Pruning Techniques',
                    'description': 'Master the art of pruning for better yields',
                    'url': 'https://www.youtube.com/results?search_query=tomato+pruning+techniques',
                    'category': 'Cultivation Technique',
                    'duration': '8-12 min'
                },
                {
                    'title': 'Organic Tomato Farming',
                    'description': 'Grow tomatoes using organic methods',
                    'url': 'https://www.youtube.com/results?search_query=organic+tomato+farming',
                    'category': 'Organic Farming',
                    'duration': '12-18 min'
                }
            ],
            'rice': [
                {
                    'title': 'Rice Farming Step by Step',
                    'description': 'Complete rice cultivation from preparation to harvest',
                    'url': 'https://www.youtube.com/results?search_query=rice+farming+step+by+step',
                    'category': 'Complete Guide',
                    'duration': '20-25 min'
                },
                {
                    'title': 'Rice Transplanting Methods',
                    'description': 'Learn proper transplanting techniques for rice',
                    'url': 'https://www.youtube.com/results?search_query=rice+transplanting+methods',
                    'category': 'Cultivation Technique',
                    'duration': '10-15 min'
                },
                {
                    'title': 'Rice Pest and Disease Management',
                    'description': 'Control common rice pests and diseases',
                    'url': 'https://www.youtube.com/results?search_query=rice+pest+disease+management',
                    'category': 'Pest Control',
                    'duration': '15-20 min'
                },
                {
                    'title': 'Modern Rice Farming Techniques',
                    'description': 'Latest technology and methods in rice cultivation',
                    'url': 'https://www.youtube.com/results?search_query=modern+rice+farming+techniques',
                    'category': 'Advanced Methods',
                    'duration': '12-18 min'
                }
            ],
            'wheat': [
                {
                    'title': 'Wheat Cultivation Complete Guide',
                    'description': 'From sowing to harvesting wheat',
                    'url': 'https://www.youtube.com/results?search_query=wheat+cultivation+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '18-22 min'
                },
                {
                    'title': 'Wheat Disease Management',
                    'description': 'Identify and control wheat diseases',
                    'url': 'https://www.youtube.com/results?search_query=wheat+disease+management',
                    'category': 'Disease Management',
                    'duration': '12-15 min'
                },
                {
                    'title': 'Wheat Irrigation Techniques',
                    'description': 'Proper irrigation for better wheat yield',
                    'url': 'https://www.youtube.com/results?search_query=wheat+irrigation+techniques',
                    'category': 'Irrigation',
                    'duration': '10-14 min'
                },
                {
                    'title': 'Wheat Harvesting Methods',
                    'description': 'Modern harvesting and storage techniques',
                    'url': 'https://www.youtube.com/results?search_query=wheat+harvesting+methods',
                    'category': 'Harvesting',
                    'duration': '8-12 min'
                }
            ],
            'maize': [
                {
                    'title': 'Maize Farming Complete Tutorial',
                    'description': 'Complete guide to growing corn/maize',
                    'url': 'https://www.youtube.com/results?search_query=maize+corn+farming+tutorial',
                    'category': 'Complete Guide',
                    'duration': '15-20 min'
                },
                {
                    'title': 'Maize Intercropping Methods',
                    'description': 'Intercropping techniques for better income',
                    'url': 'https://www.youtube.com/results?search_query=maize+intercropping+methods',
                    'category': 'Advanced Methods',
                    'duration': '10-15 min'
                },
                {
                    'title': 'Maize Pest Control',
                    'description': 'Control fall armyworm and other pests',
                    'url': 'https://www.youtube.com/results?search_query=maize+pest+control',
                    'category': 'Pest Control',
                    'duration': '12-16 min'
                },
                {
                    'title': 'Hybrid Maize Cultivation',
                    'description': 'Growing high-yield hybrid maize varieties',
                    'url': 'https://www.youtube.com/results?search_query=hybrid+maize+cultivation',
                    'category': 'Advanced Methods',
                    'duration': '14-18 min'
                }
            ],
            'sugarcane': [
                {
                    'title': 'Sugarcane Farming Complete Guide',
                    'description': 'Comprehensive sugarcane cultivation guide',
                    'url': 'https://www.youtube.com/results?search_query=sugarcane+farming+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '20-25 min'
                },
                {
                    'title': 'Sugarcane Planting Methods',
                    'description': 'Best practices for sugarcane planting',
                    'url': 'https://www.youtube.com/results?search_query=sugarcane+planting+methods',
                    'category': 'Cultivation Technique',
                    'duration': '12-16 min'
                },
                {
                    'title': 'Sugarcane Disease Management',
                    'description': 'Control red rot and other sugarcane diseases',
                    'url': 'https://www.youtube.com/results?search_query=sugarcane+disease+management',
                    'category': 'Disease Management',
                    'duration': '10-15 min'
                },
                {
                    'title': 'Sugarcane Harvesting Process',
                    'description': 'Modern harvesting techniques and timing',
                    'url': 'https://www.youtube.com/results?search_query=sugarcane+harvesting+process',
                    'category': 'Harvesting',
                    'duration': '8-12 min'
                }
            ],
            'cotton': [
                {
                    'title': 'Cotton Farming Complete Guide',
                    'description': 'Comprehensive cotton cultivation tutorial',
                    'url': 'https://www.youtube.com/results?search_query=cotton+farming+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '18-22 min'
                },
                {
                    'title': 'Cotton Pest Management',
                    'description': 'Control bollworm and whitefly effectively',
                    'url': 'https://www.youtube.com/results?search_query=cotton+pest+management+bollworm',
                    'category': 'Pest Control',
                    'duration': '15-20 min'
                },
                {
                    'title': 'Bt Cotton Cultivation',
                    'description': 'Growing Bt cotton for better yields',
                    'url': 'https://www.youtube.com/results?search_query=bt+cotton+cultivation',
                    'category': 'Advanced Methods',
                    'duration': '12-16 min'
                },
                {
                    'title': 'Organic Cotton Farming',
                    'description': 'Sustainable organic cotton cultivation',
                    'url': 'https://www.youtube.com/results?search_query=organic+cotton+farming',
                    'category': 'Organic Farming',
                    'duration': '14-18 min'
                }
            ],
            'brinjal': [
                {
                    'title': 'Brinjal/Eggplant Farming Guide',
                    'description': 'Complete guide to growing brinjal',
                    'url': 'https://www.youtube.com/results?search_query=brinjal+eggplant+farming+guide',
                    'category': 'Complete Guide',
                    'duration': '12-16 min'
                },
                {
                    'title': 'Brinjal Pest Control',
                    'description': 'Control fruit borer and other pests',
                    'url': 'https://www.youtube.com/results?search_query=brinjal+pest+control+fruit+borer',
                    'category': 'Pest Control',
                    'duration': '10-14 min'
                },
                {
                    'title': 'Brinjal Grafting Techniques',
                    'description': 'Grafting for disease resistance',
                    'url': 'https://www.youtube.com/results?search_query=brinjal+grafting+techniques',
                    'category': 'Advanced Methods',
                    'duration': '8-12 min'
                },
                {
                    'title': 'Organic Brinjal Cultivation',
                    'description': 'Grow brinjal organically',
                    'url': 'https://www.youtube.com/results?search_query=organic+brinjal+cultivation',
                    'category': 'Organic Farming',
                    'duration': '12-15 min'
                }
            ],
            'potato': [
                {
                    'title': 'Potato Farming Complete Guide',
                    'description': 'From planting to harvesting potatoes',
                    'url': 'https://www.youtube.com/results?search_query=potato+farming+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '15-20 min'
                },
                {
                    'title': 'Potato Disease Management',
                    'description': 'Control late blight and other diseases',
                    'url': 'https://www.youtube.com/results?search_query=potato+disease+management+late+blight',
                    'category': 'Disease Management',
                    'duration': '12-15 min'
                },
                {
                    'title': 'Potato Storage Methods',
                    'description': 'Proper storage techniques for potatoes',
                    'url': 'https://www.youtube.com/results?search_query=potato+storage+methods',
                    'category': 'Post-Harvest',
                    'duration': '8-12 min'
                },
                {
                    'title': 'High Yield Potato Farming',
                    'description': 'Techniques for maximum potato yield',
                    'url': 'https://www.youtube.com/results?search_query=high+yield+potato+farming',
                    'category': 'Advanced Methods',
                    'duration': '14-18 min'
                }
            ],
            'onion': [
                {
                    'title': 'Onion Farming Complete Guide',
                    'description': 'Comprehensive onion cultivation tutorial',
                    'url': 'https://www.youtube.com/results?search_query=onion+farming+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '15-18 min'
                },
                {
                    'title': 'Onion Transplanting Methods',
                    'description': 'Proper transplanting for better bulbs',
                    'url': 'https://www.youtube.com/results?search_query=onion+transplanting+methods',
                    'category': 'Cultivation Technique',
                    'duration': '10-12 min'
                },
                {
                    'title': 'Onion Storage Techniques',
                    'description': 'Store onions for long shelf life',
                    'url': 'https://www.youtube.com/results?search_query=onion+storage+techniques',
                    'category': 'Post-Harvest',
                    'duration': '8-10 min'
                },
                {
                    'title': 'Onion Disease Control',
                    'description': 'Prevent purple blotch and other diseases',
                    'url': 'https://www.youtube.com/results?search_query=onion+disease+control',
                    'category': 'Disease Management',
                    'duration': '12-15 min'
                }
            ],
            'chilli': [
                {
                    'title': 'Chilli Farming Complete Guide',
                    'description': 'Complete guide to growing chilli peppers',
                    'url': 'https://www.youtube.com/results?search_query=chilli+pepper+farming+complete+guide',
                    'category': 'Complete Guide',
                    'duration': '15-18 min'
                },
                {
                    'title': 'Chilli Pest Management',
                    'description': 'Control thrips, mites and aphids',
                    'url': 'https://www.youtube.com/results?search_query=chilli+pest+management',
                    'category': 'Pest Control',
                    'duration': '10-14 min'
                },
                {
                    'title': 'Chilli Drying Methods',
                    'description': 'Dry and store chillies properly',
                    'url': 'https://www.youtube.com/results?search_query=chilli+drying+methods',
                    'category': 'Post-Harvest',
                    'duration': '8-12 min'
                },
                {
                    'title': 'High Yield Chilli Cultivation',
                    'description': 'Techniques for maximum chilli production',
                    'url': 'https://www.youtube.com/results?search_query=high+yield+chilli+cultivation',
                    'category': 'Advanced Methods',
                    'duration': '12-16 min'
                }
            ]
        }
        
        # Default videos for crops not in the list
        default_videos = [
            {
                'title': f'{crop.capitalize()} Farming Complete Guide' if crop else 'General Farming Guide',
                'description': 'Learn complete farming techniques',
                'url': f'https://www.youtube.com/results?search_query={crop}+farming+complete+guide' if crop else 'https://www.youtube.com/results?search_query=farming+guide',
                'category': 'Complete Guide',
                'duration': '15-20 min'
            },
            {
                'title': f'{crop.capitalize()} Pest Control' if crop else 'Pest Control Methods',
                'description': 'Effective pest management techniques',
                'url': f'https://www.youtube.com/results?search_query={crop}+pest+control' if crop else 'https://www.youtube.com/results?search_query=pest+control+farming',
                'category': 'Pest Control',
                'duration': '10-15 min'
            },
            {
                'title': f'{crop.capitalize()} Disease Management' if crop else 'Disease Management',
                'description': 'Identify and treat common diseases',
                'url': f'https://www.youtube.com/results?search_query={crop}+disease+management' if crop else 'https://www.youtube.com/results?search_query=crop+disease+management',
                'category': 'Disease Management',
                'duration': '12-16 min'
            },
            {
                'title': f'Organic {crop.capitalize()} Farming' if crop else 'Organic Farming Methods',
                'description': 'Sustainable organic farming practices',
                'url': f'https://www.youtube.com/results?search_query=organic+{crop}+farming' if crop else 'https://www.youtube.com/results?search_query=organic+farming',
                'category': 'Organic Farming',
                'duration': '14-18 min'
            }
        ]
        
        videos = video_recommendations.get(crop, default_videos)
        
        return jsonify({
            'success': True,
            'crop': crop,
            'videos': videos
        })
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

