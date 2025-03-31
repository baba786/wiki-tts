from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This enables CORS for all routes

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "Minimal server is running"})

@app.route('/test-post', methods=['POST'])
def test_post():
    try:
        data = request.get_json()
        return jsonify({"received": data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting minimal server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
