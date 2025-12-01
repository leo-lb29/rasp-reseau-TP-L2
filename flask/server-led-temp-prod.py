from flask import Flask, jsonify
from flask_cors import CORS
import pigpio
import RPi.GPIO as GPIO
import time
from Si7021 import sensor as Si7021Sensor

# --- Flask ---
app = Flask(__name__)
CORS(app)

# --- LED GPIO ---
LED_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)
GPIO.output(LED_PIN, GPIO.LOW)  # LED éteinte au démarrage

# --- pigpio pour Si7021 ---
pi = pigpio.pi()
if not pi.connected:
    raise RuntimeError("Impossible de se connecter à pigpio daemon")

si7021 = Si7021Sensor(pi)
si7021.set_resolution(0)  # résolution max

def read_temperature_humidity():
    """Retourne température et humidité du Si7021."""
    temp = si7021.temperature()
    hum = si7021.humidity()
    return round(temp, 2), round(hum, 2)

def get_led_status():
    return "on" if GPIO.input(LED_PIN) else "off"

# --- Routes Flask ---
@app.route("/")
def index():
    return "Serveur Flask avec LED et capteur Si7021!"

@app.route("/status", methods=["GET"])
def status():
    temperature, humidity = read_temperature_humidity()
    return jsonify({
        "temperature": temperature,
        "humidity": humidity,
        "lampStatus": get_led_status()
    })

@app.route("/led", methods=["GET"])
def led_status():
    return jsonify({"led": get_led_status()})

@app.route("/led/on", methods=["POST"])
def led_on():
    GPIO.output(LED_PIN, GPIO.HIGH)
    return jsonify({"led": get_led_status()})

@app.route("/led/off", methods=["POST"])
def led_off():
    GPIO.output(LED_PIN, GPIO.LOW)
    return jsonify({"led": get_led_status()})

@app.route("/temperature", methods=["GET"])
def temperature():
    temperature, _ = read_temperature_humidity()
    return jsonify({"temp": temperature})

# --- Nettoyage ---
import atexit
atexit.register(lambda: [si7021.cancel(), pi.stop(), GPIO.cleanup()])

# --- Lancement ---
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0")
