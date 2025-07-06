from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import shutil
import pandas as pd
import json
import boto3
from datetime import datetime
import sys
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'xlsb'}
BEDROCK_MODEL_ID = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
AWS_REGION = "us-east-1"

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Pivot Table Structure Definition
PIVOT_STRUCTURE_CONFIG = {
    'index': ['Merchant Name'],
    'values': ['Transaction Amount', 'Transaction Date'],
    'aggfunc': {'Transaction Amount': 'sum', 'Transaction Date': 'count'}
}

# Analysis Modules Configuration
analysis_modules = [
    {'name': 'Relevant Spend', 'filter_column_name': 'Relevant Merchant?', 'filter_value': 'y', 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'Amazon + Prime Spend', 'filter_column_name': 'Amazon', 'filter_value': True, 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'Trips To Stores', 'filter_column_name': 'Trips', 'filter_value': True, 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'E-Commerce', 'filter_column_name': 'Ecom', 'filter_value': True, 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'Office', 'filter_column_name': 'Office', 'filter_value': True, 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'IT Peripherals', 'filter_column_name': 'ITHelper', 'filter_value': 1, 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'MRO', 'filter_column_name': 'MROHelper', 'filter_value': 1, 'pivot_config': PIVOT_STRUCTURE_CONFIG},
    {'name': 'DeDuped Users List', 'filter_column_name': 'User List', 'filter_value': True, 'pivot_config': PIVOT_STRUCTURE_CONFIG}
]

all_spend_config = {'name': 'All Spend', 'pivot_config': PIVOT_STRUCTURE_CONFIG}

def generate_stats_based_insights(master_df, processed_data):
    """Generate statistical insights from the processed data"""
    insights = {}
    def format_currency(amount): 
        return f"${amount:,.2f}"
    
    # Insight 1: Total Relevant Spend
    relevant_spend_pivot = processed_data['Relevant Spend']['pivot_table']
    insights['1. Total Addressable Opportunity'] = f"Total relevant spend is {format_currency(relevant_spend_pivot['Transaction Amount'].sum())} across {len(relevant_spend_pivot)} vendors."
    
    # Insight 2: Amazon Spend
    amazon_data = processed_data['Amazon + Prime Spend']
    insights['2. Amazon Spend Consolidation'] = f"Identified {format_currency(amazon_data['pivot_table']['Transaction Amount'].sum())} of spend from {amazon_data['filtered_data']['Purchaser ID'].nunique()} users on Amazon.com."
    
    # Insight 3: Prime Charges
    prime_charges_df = amazon_data['filtered_data'][amazon_data['filtered_data']['Merchant Name'].str.contains('PRIME', case=False, na=False)]
    if not prime_charges_df.empty:
        insights['3. Eliminate Redundant Prime Fees'] = f"{len(prime_charges_df)} separate Prime charges totaling {format_currency(prime_charges_df['Transaction Amount'].sum())} can be eliminated."
    
    # Insight 4: Top Vendors
    top_5_vendors = relevant_spend_pivot.head(5)
    vendor_list = [f"{idx} ({format_currency(row['Transaction Amount'])})" for idx, row in top_5_vendors.iterrows()]
    insights['4. Top Vendors to Consolidate'] = f"Top 5 non-Amazon vendors: {'; '.join(vendor_list)}."
    
    # Insight 5: Top Spenders
    relevant_users = processed_data['Relevant Spend']['filtered_data'].groupby('Purchaser Name')['Transaction Amount'].sum().nlargest(5)
    user_list = [f"{idx} ({format_currency(val)})" for idx, val in relevant_users.items()]
    insights['5. High-Value Users to Onboard'] = f"Top 5 users to onboard: {'; '.join(user_list)}."
    
    # Insight 6: Trips to Stores
    trips_data = processed_data['Trips To Stores']
    insights['6. Reduce Soft Costs from Store Trips'] = f"{int(trips_data['pivot_table']['Transaction Count'].sum())} trips to stores by {trips_data['filtered_data']['Purchaser ID'].nunique()} employees, totaling {format_currency(trips_data['pivot_table']['Transaction Amount'].sum())}."
    
    # Insight 7: E-commerce
    ecom_data = processed_data['E-Commerce']
    insights['7. Consolidate E-Commerce Spend'] = f"{format_currency(ecom_data['pivot_table']['Transaction Amount'].sum())} in e-commerce spend. Top vendors: {', '.join(ecom_data['pivot_table'].head(3).index.tolist())}."
    
    # Insight 8: Recommendation
    insights['8. Recommendation'] = "Recommend a follow-up Product Basket Analysis to find item-level savings."
    
    return insights

def generate_llm_insights_with_bedrock(stats_summary):
    """Generate AI insights using AWS Bedrock"""
    try:
        # Format the statistical insights into a string for the prompt context
        context_str = "\n".join(f"- {key}: {value}" for key, value in stats_summary.items())
        
        prompt = f"""Human: You are an expert business analyst specializing in procurement and supplier consolidation for Amazon Business. Your task is to synthesize the following statistical data points into a concise, actionable executive summary for an Account Executive (AE) to present to their customer.

Here is the statistical data summary:
<data>
{context_str}
</data>

Please create a compelling narrative from this data. The summary should be super detailed and structured into bullet points, more insights the better, highlighting the biggest opportunities (e.g., spend consolidation, cost savings) and ending with a clear, strategic recommendation for the next step. Do not simply repeat the numbers; interpret them and explain their business impact. Frame the output as if you are advising the Account Executive.

Assistant:"""

        # Initialize the Bedrock client
        bedrock_runtime = boto3.client(service_name='bedrock-runtime', region_name=AWS_REGION)

        # Body of the request, specific to Claude models
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "top_p": 0.9,
        })
        
        response = bedrock_runtime.invoke_model(body=body, modelId=BEDROCK_MODEL_ID)
        
        # Parse the response
        response_body = json.loads(response.get('body').read())
        llm_output = response_body.get('content')[0].get('text')
        
        return llm_output

    except Exception as e:
        return f"Bedrock call failed: {str(e)}. Please ensure your AWS credentials are configured correctly and you have access to the specified model in the selected region."

def process_analysis(file_path):
    """Process the uploaded file and generate analysis"""
    try:
        # Load the master data
        master_df = pd.read_excel(file_path, sheet_name="Customer Data Template", engine='pyxlsb')
        
        # Process analysis modules
        processed_data = {}
        for module in analysis_modules:
            module_name = module['name']
            col_to_filter = module['filter_column_name']
            filter_val = module['filter_value']
            filtered_df = master_df[master_df[col_to_filter] == filter_val].copy()
            if filtered_df.empty:
                processed_data[module_name] = {'filtered_data': pd.DataFrame(), 'pivot_table': pd.DataFrame()}
                continue
            pivot_conf = module['pivot_config']
            pivot_table_df = pd.pivot_table(filtered_df, index=pivot_conf['index'], values=pivot_conf['values'], aggfunc=pivot_conf['aggfunc'])
            pivot_table_df = pivot_table_df.rename(columns={'Transaction Date': 'Transaction Count'}).sort_values(by='Transaction Amount', ascending=False)
            processed_data[module_name] = {'filtered_data': filtered_df, 'pivot_table': pivot_table_df}
        
        # Process all spend
        all_spend_pivot_df = pd.pivot_table(master_df, index=all_spend_config['pivot_config']['index'], values=all_spend_config['pivot_config']['values'], aggfunc=all_spend_config['pivot_config']['aggfunc'])
        all_spend_pivot_df = all_spend_pivot_df.rename(columns={'Transaction Date': 'Transaction Count'}).sort_values(by='Transaction Amount', ascending=False)
        processed_data['All Spend'] = {'filtered_data': None, 'pivot_table': all_spend_pivot_df}
        
        # Generate stats-based insights
        stats_insights = generate_stats_based_insights(master_df, processed_data)
        
        # Generate AI insights
        ai_insights = generate_llm_insights_with_bedrock(stats_insights)
        
        # Generate Excel report
        output_file_path = os.path.join(UPLOAD_FOLDER, f"Supplier_Analysis_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx")
        
        with pd.ExcelWriter(output_file_path, engine='openpyxl') as writer:
            # Write AI Insights sheet
            llm_insight_df = pd.DataFrame([{'AI-Generated Executive Summary': ai_insights}])
            llm_insight_df.to_excel(writer, sheet_name='AI Insights', index=False)
            
            # Write Stats-Based Insights sheet
            stats_df = pd.DataFrame(stats_insights.items(), columns=['Discussion Point', 'Key Finding'])
            stats_df.to_excel(writer, sheet_name='Stats-Based Insights', index=False)
            
            # Write All Spend Report
            processed_data['All Spend']['pivot_table'].to_excel(writer, sheet_name='All Spend Report')
            
            # Write other module reports
            for module_name, data_dict in processed_data.items():
                if module_name == 'All Spend': 
                    continue
                if not data_dict['pivot_table'].empty:
                    data_dict['pivot_table'].to_excel(writer, sheet_name=f"{module_name} Report")
                    data_dict['filtered_data'].to_excel(writer, sheet_name=f"{module_name} Data", index=False)
        
        # Extract key metrics for frontend
        relevant_spend_pivot = processed_data['Relevant Spend']['pivot_table']
        amazon_data = processed_data['Amazon + Prime Spend']
        trips_data = processed_data['Trips To Stores']
        
        # Get top vendors and spenders
        top_5_vendors = relevant_spend_pivot.head(5)
        vendor_list = [f"{idx} (${row['Transaction Amount']:,.2f})" for idx, row in top_5_vendors.iterrows()]
        top_vendors_str = '; '.join(vendor_list)
        
        relevant_users = processed_data['Relevant Spend']['filtered_data'].groupby('Purchaser Name')['Transaction Amount'].sum().nlargest(5)
        user_list = [f"{idx} (${val:,.2f})" for idx, val in relevant_users.items()]
        top_spenders_str = '; '.join(user_list)
        
        # Prime charges
        prime_charges_df = amazon_data['filtered_data'][amazon_data['filtered_data']['Merchant Name'].str.contains('PRIME', case=False, na=False)]
        prime_fees = prime_charges_df['Transaction Amount'].sum() if not prime_charges_df.empty else 0
        
        return {
            'success': True,
            'metrics': {
                'totalOpportunity': f"${relevant_spend_pivot['Transaction Amount'].sum():,.2f}",
                'amazonSpend': f"${amazon_data['pivot_table']['Transaction Amount'].sum():,.2f}",
                'redundantPrimeFees': f"${prime_fees:,.2f}",
                'vendorCount': str(len(relevant_spend_pivot)),
                'userCount': str(amazon_data['filtered_data']['Purchaser ID'].nunique()),
                'storeTrips': f"{int(trips_data['pivot_table']['Transaction Count'].sum()):,}",
                'storeTripsCost': f"${trips_data['pivot_table']['Transaction Amount'].sum():,.2f}"
            },
            'aiInsights': ai_insights,
            'topVendors': top_vendors_str,
            'topSpenders': top_spenders_str,
            'reportPath': output_file_path
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Handle file upload and analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload an Excel file (.xlsx, .xls, .xlsb)'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        # Process the analysis
        result = process_analysis(file_path)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_report(filename):
    """Download the generated Excel report"""
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'AI Supplier Analysis API is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 