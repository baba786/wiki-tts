from flask import Flask, request, jsonify, send_file, make_response
import os
import subprocess
import time
import hashlib
import urllib.parse
import sys
from flask_cors import CORS

app = Flask(__name__)
# Configure CORS - only use ONE method for CORS
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio_files')
os.makedirs(AUDIO_DIR, exist_ok=True)

# Removing the after_request handler to avoid duplicate CORS headers

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Flask server is running"}), 200

@app.route('/test-post', methods=['POST', 'OPTIONS'])
def test_post():
    """Simple test endpoint that just returns the received data"""
    if request.method == 'OPTIONS':
        return make_response()  # CORS is handled by Flask-CORS
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided', 'received': 'null'}), 400
        
        return jsonify({
            'status': 'success', 
            'received': data,
            'note': 'This is a test endpoint that echoes back the data you sent'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'traceback': str(e.__traceback__)}), 500

@app.route('/generate-audio', methods=['POST', 'OPTIONS'])
def generate_audio():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return make_response()  # CORS is handled by Flask-CORS
    
    try:    
        # Try to get JSON data
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        
        # Create a filename based on the text hash
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        output_file = os.path.join(AUDIO_DIR, f"{text_hash}.wav")
        
        # Check if we've already generated this audio
        if not os.path.exists(output_file):
            # Choose your preferred TTS model
            model_name = "tts_models/en/ljspeech/glow-tts"  # Using the already downloaded model
            # model_name = "tts_models/en/ljspeech/vits"      # Higher quality but needs downloading
            
            # Prepare the TTS command
            # The text needs to be properly quoted for the shell command
            escaped_text = text.replace('"', '\\"')
            
            tts_command = f'tts --text "{escaped_text}" --model_name "{model_name}" --out_path "{output_file}"'
            
            try:
                # Run the TTS command
                process = subprocess.Popen(tts_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                stdout, stderr = process.communicate()
                
                if process.returncode != 0:
                    return jsonify({
                        'error': 'TTS command failed',
                        'details': stderr.decode('utf-8')
                    }), 500
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        # Return a URL to access the audio file
        audio_url = f"/get-audio/{text_hash}.wav"
        return jsonify({'audio_url': audio_url})
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': str(type(e)),
            'error_details': 'An error occurred while processing the request'
        }), 500

@app.route('/get-audio/<filename>', methods=['GET'])
def get_audio(filename):
    # Return the audio file
    file_path = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'Audio file not found'}), 404
        
    return send_file(file_path)

if __name__ == '__main__':
    print(f"Starting Flask server on 0.0.0.0:5000")
    
    # Test that TTS is installed and properly configured
    try:
        test_command = "tts --version"
        process = subprocess.Popen(test_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        if process.returncode == 0:
            print(f"TTS is installed: {stdout.decode('utf-8').strip()}")
            print("Using TTS model: tts_models/en/ljspeech/glow-tts")
        else:
            print("WARNING: TTS command-line tool may not be installed correctly.")
            print(f"Error: {stderr.decode('utf-8')}")
            print("Please install Coqui TTS: pip install TTS==0.14.0")
    except Exception as e:
        print(f"Error checking TTS installation: {str(e)}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
