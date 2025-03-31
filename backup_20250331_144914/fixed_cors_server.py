from flask import Flask, request, jsonify, send_file, make_response
import os
import subprocess
import time
import hashlib
import sys

app = Flask(__name__)

AUDIO_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'audio_files')
os.makedirs(AUDIO_DIR, exist_ok=True)

# Simple decorator to add CORS headers to all responses
def add_cors_headers(response):
    """Add CORS headers to a response"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/', methods=['GET', 'OPTIONS'])
def home():
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    response = jsonify({"status": "Flask server is running"})
    return add_cors_headers(response)

@app.route('/test-post', methods=['POST', 'OPTIONS'])
def test_post():
    """Simple test endpoint that just returns the received data"""
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    try:
        data = request.get_json()
        if not data:
            response = jsonify({'error': 'No data provided', 'received': 'null'}), 400
            return add_cors_headers(response[0]), 400
        
        response = jsonify({
            'status': 'success', 
            'received': data,
            'note': 'This is a test endpoint that echoes back the data you sent'
        })
        return add_cors_headers(response)
    except Exception as e:
        response = jsonify({'error': str(e), 'traceback': str(e.__traceback__)}), 500
        return add_cors_headers(response[0]), 500

@app.route('/generate-audio', methods=['POST', 'OPTIONS'])
def generate_audio():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
    
    try:    
        # Try to get JSON data
        data = request.get_json()
        
        if not data or 'text' not in data:
            response = jsonify({'error': 'No text provided'}), 400
            return add_cors_headers(response[0]), 400
        
        text = data['text']
        
        # Create a filename based on the text hash
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        output_file = os.path.join(AUDIO_DIR, f"{text_hash}.wav")
        
        # Check if we've already generated this audio
        if not os.path.exists(output_file):
            # Choose your preferred TTS model
            model_name = "tts_models/en/ljspeech/glow-tts"  # Using the already downloaded model
            
            # Prepare the TTS command
            # The text needs to be properly quoted for the shell command
            escaped_text = text.replace('"', '\\"')
            
            tts_command = f'tts --text "{escaped_text}" --model_name "{model_name}" --out_path "{output_file}"'
            
            try:
                # Run the TTS command
                process = subprocess.Popen(tts_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                stdout, stderr = process.communicate()
                
                if process.returncode != 0:
                    response = jsonify({
                        'error': 'TTS command failed',
                        'details': stderr.decode('utf-8')
                    }), 500
                    return add_cors_headers(response[0]), 500
            except Exception as e:
                response = jsonify({'error': str(e)}), 500
                return add_cors_headers(response[0]), 500
        
        # Return a URL to access the audio file
        audio_url = f"/get-audio/{text_hash}.wav"
        response = jsonify({'audio_url': audio_url})
        return add_cors_headers(response)
        
    except Exception as e:
        response = jsonify({
            'error': str(e),
            'type': str(type(e)),
            'error_details': 'An error occurred while processing the request'
        }), 500
        return add_cors_headers(response[0]), 500

@app.route('/get-audio/<filename>', methods=['GET', 'OPTIONS'])
def get_audio(filename):
    if request.method == 'OPTIONS':
        response = make_response()
        return add_cors_headers(response)
        
    # Return the audio file
    file_path = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(file_path):
        response = jsonify({'error': 'Audio file not found'}), 404
        return add_cors_headers(response[0]), 404
        
    response = send_file(file_path)
    return add_cors_headers(response)

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
