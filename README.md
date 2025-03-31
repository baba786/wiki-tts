# Wikipedia Text-to-Speech App

A web application that fetches Wikipedia article summaries and converts them to speech using Coqui TTS.

## Setup

1. Make sure you have Python 3 installed
2. Install the required Python packages:

```bash
pip install flask flask-cors coqui-tts
```

## Running the Application

```bash
python run.py
```

This will:
- Start the Flask backend server on port 5000
- Start a web server for the frontend on port 8000
- Open your browser automatically to http://localhost:8000

## How to Use

1. Enter a topic in the search box and press "Search"
2. The Wikipedia summary will be displayed
3. Click "Generate Audio" to convert the summary to speech
4. The audio will automatically play when ready

## Features

- Fetches Wikipedia article summaries
- Converts text to natural-sounding speech using Coqui TTS
- Caches audio files to avoid regenerating the same content
- Fallback to browser's speech synthesis if the backend fails

## Customization

You can modify the TTS model used in `server.py` by changing the `model_name` variable:
```python
model_name = "tts_models/en/ljspeech/glow-tts"  # Fast but lower quality
# model_name = "tts_models/en/ljspeech/vits"    # Higher quality but slower
```

## Project Structure

- `index.html` - Main web interface
- `script.js` - Frontend JavaScript
- `styles.css` - Styling
- `server.py` - Flask backend with TTS
- `run.py` - Script to run both servers
- `audio_files/` - Directory for cached audio files
