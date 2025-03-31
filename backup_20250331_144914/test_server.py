import http.server
import socketserver
import os
import sys

# Print Python version for debugging
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

# Set the port
PORT = 8000

# Create the handler
Handler = http.server.SimpleHTTPRequestHandler

# Set up the server with explicit binding to all interfaces
print(f"Starting server on 0.0.0.0:{PORT}")
try:
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
except OSError as e:
    print(f"Error: {e}")
    print("Try killing any process using this port with: lsof -ti:8000 | xargs kill -9")
except KeyboardInterrupt:
    print("\nServer stopped by user")
