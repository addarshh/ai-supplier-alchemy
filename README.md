# AI Supplier Analysis Tool

A comprehensive full-stack application that analyzes supplier spend data using AI-powered insights and generates detailed Excel reports.

## Features

- **File Upload**: Upload Excel files (.xlsx, .xls, .xlsb) containing transaction data
- **AI-Powered Analysis**: Uses AWS Bedrock (Claude 3.5 Sonnet) to generate executive insights
- **Statistical Analysis**: Comprehensive pivot table analysis across multiple spend categories
- **Excel Report Generation**: Multi-sheet Excel reports with AI insights and statistical summaries
- **Modern UI**: Beautiful, responsive interface built with React, TypeScript, and Tailwind CSS

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn/ui
- **Backend**: Flask + Python + Pandas + AWS Bedrock
- **File Processing**: Excel file handling with openpyxl and pyxlsb
- **AI Integration**: AWS Bedrock for generative AI insights

## Prerequisites

- Python 3.8+
- Node.js 16+
- AWS Account with Bedrock access
- AWS credentials configured

## Quick Start

### Option 1: Automated Startup (Recommended)

```bash
# Make the startup script executable
chmod +x start.sh

# Run the application
./start.sh
```

This will:
1. Install backend dependencies
2. Start the Flask backend server on port 5000
3. Start the React frontend on port 5173
4. Open both servers in your browser

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Set up virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt

# Configure AWS credentials (if not already done)
aws configure

# Start the Flask server
source venv/bin/activate
python3 app.py
```

#### Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

## AWS Configuration

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

## Usage

1. **Upload File**: Upload your transaction data Excel file
2. **Analysis**: The system will process your data and generate insights
3. **Review Results**: View metrics, AI insights, and recommendations
4. **Download Report**: Download the comprehensive Excel report

## API Endpoints

- `POST /api/analyze` - Upload and analyze Excel files
- `GET /api/download/<filename>` - Download generated reports
- `GET /api/health` - Health check endpoint

## File Structure

```
ai-supplier-alchemy/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── README.md          # Backend documentation
│   └── uploads/           # Generated reports (created automatically)
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   └── ...
├── start.sh              # Automated startup script
└── README.md            # This file
```

## Development

### Backend Development

The Flask backend handles:
- File upload and validation
- Excel data processing with pandas
- Statistical analysis and pivot tables
- AWS Bedrock integration for AI insights
- Excel report generation

### Frontend Development

The React frontend provides:
- Modern, responsive UI
- File upload interface
- Real-time processing status
- Results visualization
- Report download functionality

## Troubleshooting

### Common Issues

1. **AWS Bedrock Access**: Ensure your AWS account has access to Bedrock and the Claude model
2. **Port Conflicts**: If ports 5000 or 5173 are in use, modify the startup scripts
3. **File Permissions**: Ensure the `uploads` directory is writable
4. **Python Dependencies**: If you encounter import errors, reinstall requirements

### Logs

- Backend logs are displayed in the terminal where you started the Flask server
- Frontend logs are available in the browser's developer console

## License

This project is proprietary and confidential.

## Support

For technical support or questions, please contact the development team.
