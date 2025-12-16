from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Autoriser toutes les origines

# Chemin vers le fichier JSON
JSON_FILE = "data.json"

def read_json_file():
    """Lit et retourne le contenu du fichier JSON."""
    with open(JSON_FILE, "r") as f:
        data = json.load(f)
    return data

@app.route("/")
def index():
    return "Bienvenue sur le serveur Flask pour la LED et le capteur de température Si7021!"

@app.route("/status", methods=["GET"])
def get_status():
    data = read_json_file()
    return jsonify({
        "temperature": data.get("temperature"),
        "humidity": data.get("humidity"),
        "lampStatus": data.get("lampStatus")
    })

@app.route("/led", methods=["GET"])
def get_led_status():
    data = read_json_file()
    return jsonify({"led": data.get("lampStatus")})

@app.route("/led/on", methods=["POST"])
def turn_led_on():
    data = read_json_file()
    data["lampStatus"] = "on"
    with open(JSON_FILE, "w") as f:
        json.dump(data, f)
    return jsonify({"led": data["lampStatus"]})

@app.route("/led/off", methods=["POST"])
def turn_led_off():
    data = read_json_file()
    data["lampStatus"] = "off"
    with open(JSON_FILE, "w") as f:
        json.dump(data, f)
    return jsonify({"led": data["lampStatus"]})

@app.route("/temperature", methods=["GET"])
def get_temperature():
    data = read_json_file()
    return jsonify({"temp": data.get("temperature")})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
