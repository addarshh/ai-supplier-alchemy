# AI Supplier Analysis Backend

This Flask API provides the backend functionality for the AI Supplier Analysis tool, integrating with AWS Bedrock for AI insights generation.

## Setup Instructions

### 1. Set up Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
python3 -m pip install -r requirements.txt
```

### 2. AWS Configuration
Ensure your AWS credentials are configured for Bedrock access:
```bash
aws configure
```

Or set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Run the Server
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Start the Flask server
python3 app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

- `POST /api/analyze` - Upload and analyze Excel files
- `GET /api/download/<filename>` - Download generated reports
- `GET /api/health` - Health check endpoint

## File Structure
- `uploads/` - Directory for uploaded files and generated reports
- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies 