from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Endpoint to serve crime data
@app.route('/crime-data', methods=['GET'])
def get_crime_data():
    # Logic to fetch crime data from a database, CSV file, or any other data source
    crime_data = [
        {"latitude": 37.7749, "longitude": -122.4194, "count": 5},
        {"latitude": 37.7749, "longitude": -122.4184, "count": 3},
        # Add more crime data as needed
    ]
    return jsonify(crime_data)

# Other endpoints for additional functionalities as needed

if __name__ == '__main__':
    app.run(debug=True)
