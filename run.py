import subprocess
import sys
import os
import time
import webbrowser

def run_command(command, cwd=None):
    """Run a command in a new process."""
    return subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=cwd
    )

if __name__ == "__main__":
    # Get the directory of this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if not current_dir:
        current_dir = os.getcwd()
    
    print("Starting Wikipedia TTS Application...")
    
    # Kill any existing processes on these ports
    print("Checking for existing processes on ports 5000 and 8000...")
    os.system("lsof -ti:5000 | xargs kill -9 2>/dev/null || true")
    os.system("lsof -ti:8000 | xargs kill -9 2>/dev/null || true")
    
    # Start the Flask backend server
    print("Starting Flask backend server...")
    flask_process = run_command(
        "python3 server.py",
        cwd=current_dir
    )
    
    # Give the Flask server time to start
    time.sleep(2)
    
    # Start the HTTP server for the frontend
    print("Starting HTTP server for frontend...")
    http_process = run_command(
        "python3 -m http.server 8000",
        cwd=current_dir
    )
    
    # Give the HTTP server time to start
    time.sleep(2)
    
    # Open the browser
    print("Opening browser...")
    webbrowser.open('http://localhost:8000')
    
    try:
        print("\nServers are running!")
        print("Flask backend with TTS: http://localhost:5000")
        print("Frontend: http://localhost:8000")
        print("\nNOTE: The first TTS generation may take longer as the model loads.")
        print("Audio will be generated using the Coqui TTS engine with the 'tts_models/en/ljspeech/glow-tts' model.")
        print("\nPress Ctrl+C to stop the servers...")
        
        # Keep the script running and monitor output
        while True:
            # Check Flask process
            flask_out = flask_process.stdout.readline()
            if flask_out:
                print(f"Flask: {flask_out.strip()}")
                
            flask_err = flask_process.stderr.readline()
            if flask_err:
                print(f"Flask Error: {flask_err.strip()}")
                
            # Check HTTP process
            http_out = http_process.stdout.readline()
            if http_out:
                print(f"HTTP: {http_out.strip()}")
                
            http_err = http_process.stderr.readline()
            if http_err:
                print(f"HTTP Error: {http_err.strip()}")
                
            # Check if either process has terminated
            if flask_process.poll() is not None:
                print("Flask server terminated unexpectedly!")
                flask_err = flask_process.stderr.read()
                if flask_err:
                    print(f"Flask error: {flask_err}")
                break
                
            if http_process.poll() is None:
                print("HTTP server terminated unexpectedly!")
                http_err = http_process.stderr.read()
                if http_err:
                    print(f"HTTP error: {http_err}")
                break
                
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        flask_process.terminate()
        http_process.terminate()
        print("Servers stopped.")
    finally:
        # Make sure to clean up
        if flask_process.poll() is None:
            flask_process.terminate()
        if http_process.poll() is None:
            http_process.terminate()
