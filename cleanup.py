#!/usr/bin/env python3
import os
import shutil
import datetime

def create_backup_folder():
    """Create a backup folder with timestamp"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(current_dir, f"backup_{timestamp}")
    
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"Created backup directory: {backup_dir}")
    
    return backup_dir

def backup_files(files_to_backup, backup_dir):
    """Backup specified files to backup directory"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename in files_to_backup:
        src_path = os.path.join(current_dir, filename)
        if os.path.exists(src_path):
            dest_path = os.path.join(backup_dir, filename)
            shutil.copy2(src_path, dest_path)
            print(f"Backed up: {filename}")

def remove_files(files_to_remove):
    """Remove specified files"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for filename in files_to_remove:
        file_path = os.path.join(current_dir, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Removed: {filename}")

def rename_files(rename_pairs):
    """Rename files according to the provided pairs"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    for old_name, new_name in rename_pairs:
        old_path = os.path.join(current_dir, old_name)
        new_path = os.path.join(current_dir, new_name)
        
        if os.path.exists(old_path):
            shutil.move(old_path, new_path)
            print(f"Renamed: {old_name} → {new_name}")

def update_readme():
    """Update README.md with new instructions"""
    readme_content = """# Wikipedia Text-to-Speech App

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
"""
    
    with open("README.md", "w") as f:
        f.write(readme_content)
    
    print("Updated README.md")

if __name__ == "__main__":
    # Files to remove
    files_to_remove = [
        "server.py",
        "simple_server.py",
        "minimal_server.py",
        "no_cors_server.py",
        "minimal_test.html",
        "test.html",
        "test_cors.html",
        "test_server.py",
        "server_html.py",
        "run_app.py",
        "run_simple.py"
    ]
    
    # Files to rename
    rename_pairs = [
        ("fixed_cors_server.py", "server.py"),
        ("run_fixed_cors.py", "run.py")
    ]
    
    # Create backup
    backup_dir = create_backup_folder()
    
    # Backup all files before removing/renaming
    all_files = files_to_remove + [pair[0] for pair in rename_pairs]
    backup_files(all_files, backup_dir)
    
    # Remove unnecessary files
    remove_files(files_to_remove)
    
    # Rename files to simpler names
    rename_files(rename_pairs)
    
    # Update README
    update_readme()
    
    print("\nCleanup complete!")
    print(f"Files backed up to: {backup_dir}")
    print("\nThe application can now be run with: python run.py")
