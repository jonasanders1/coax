# main.py
import os
from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from api.routes import bp

# Import CORS safely
try:
    from flask_cors import CORS
except ImportError:
    CORS = None

app = Flask(__name__)

# Trust proxy headers (even in dev)
app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1, x_prefix=1
)

app.register_blueprint(bp)

# === CORS: Only in development ===
if os.getenv("ENVIRONMENT", "").lower() == "development":
    if CORS:
        print("Local dev mode: Enabling Flask-CORS")
        CORS(
            app,
            resources={r"/chat": {
                "origins": [
                    "http://localhost:5173",
                    "http://localhost:8080",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:8080"
                ],
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type", "X-API-Key", "Accept"],
                "supports_credentials": True
            }}
        )
    else:
        print("flask-cors not installed")
else:
    print("Production mode: CORS handled by Nginx")

# === Direct run for local dev ===
if __name__ == "__main__":
    print(f"Running on http://0.0.0.0:8000")
    app.run(host="0.0.0.0", port=8000, debug=False)