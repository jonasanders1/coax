# main.py
import warnings
warnings.filterwarnings("ignore", category=Warning, module="pydantic")

from flask import Flask
from flask_cors import CORS
from config.settings import settings
from api.routes import bp
from utils.logger import get_logger

logger = get_logger(__name__)

app = Flask(__name__)
app.register_blueprint(bp)

# CORS
if settings.is_development:
    CORS(
        app,
        resources={
            r"/*": {
                "origins": ["http://localhost:8080", "http://127.0.0.1:8080"],
                "methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type"],
                "supports_credentials": True,
            }
        },
    )
    logger.info("Running in development mode with Flask-CORS")
else:
    logger.info("Running in production mode (CORS via Nginx)")

if __name__ == "__main__":
    app.run(host=settings.HOST, port=settings.PORT, debug=settings.is_development)