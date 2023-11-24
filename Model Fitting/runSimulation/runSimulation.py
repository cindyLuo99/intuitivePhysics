from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/upload-trail', methods=['POST'])
def upload_trail():
    data = request.json
    with open('trail_data.json', 'w') as file:
        json.dump(data, file)
    return jsonify({"message": "Data received and saved"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

