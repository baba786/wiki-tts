from flask import Flask, request, jsonify, make_response

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    response = jsonify({"status": "Server is running"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/test-post', methods=['POST', 'OPTIONS'])
def test_post():
    # Handle OPTIONS requests (preflight)
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    # Handle POST requests
    try:
        data = request.get_json()
        response = jsonify({"received": data})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

@app.after_request
def add_cors_headers(response):
    """Add CORS headers to all responses"""
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
