
from flask import Flask, request, jsonify
import requests
import json
import uuid
import pymysql

app = Flask(__name__)

API_KEY = ''
API_KEY_2 = ''
API_URL = ''

# 数据库连接配置
DB_CONFIG = {
    'host': '',
    'port': ,
    'user': '',
    'password': '',  # 请替换为实际的数据库密码
    'database': '',  # 请替换为实际的数据库名
    'charset': 'utf8mb4'
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

def verify_user_and_get_info(user_id, password):
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            # 验证用户密码
            cursor.execute("SELECT password, profile, performance FROM user WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()

            if result is None:
                return None, "User not found"

            db_password, profile, performance = result

            if db_password != password:
                return None, "Invalid password"
            
            return {"profile": profile, "performance": performance}, None

def run_workflow(user_id, question, profile, performance):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'inputs': {
            'question': question,
            'profile': profile,
            'performance': performance,
            'type': "3"
        },
        'response_mode': 'blocking',
        'user': user_id
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {'error': f'API request failed: {str(e)}'}

def run_workflow_2(user_id, question, profile, performance):
    headers = {
        'Authorization': f'Bearer {API_KEY_2}',
        'Content-Type': 'application/json'
    }
    payload = {
        'inputs': {
            'question': question,
            'type': "5"
        },
        'response_mode': 'blocking',
        'user': user_id
    }
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {'error': f'API request failed: {str(e)}'}

# 请求Agent增强Prompt
@app.route('/process', methods=['POST'])
def process_input():
    data = request.json
    user_id = '1001'
    password = ''
    question = data.get('text', '')

    if not user_id or not password:
        return jsonify({'error': 'User ID and password are required'}), 400

    user_info, error = verify_user_and_get_info(user_id, password)
    if error:
        return jsonify({'error': error}), 401

    result = run_workflow(user_id, question, user_info['profile'], user_info['performance'])

    if 'error' in result:
        return jsonify({'error': result['error']}), 500

    return jsonify({'text': result.get('data', {}).get('outputs', {}).get('text', 'No text output')})

#请求Agent记忆最新问题
@app.route('/memory', methods=['POST'])
def memory_write():
    print('Memory write')
    data = request.json
    user_id = '1001'
    password = '778899'
    question = data.get('text', '')

    if not user_id or not password:
        return jsonify({'error': 'User ID and password are required'}), 400

    user_info, error = verify_user_and_get_info(user_id, password)
    if error:
        return jsonify({'error': error}), 401

    result = run_workflow_2(user_id, question, user_info['profile'], user_info['performance'])

    if 'error' in result:
        return jsonify({'error': result['error']}), 500

    return jsonify({'text': result.get('data', {}).get('outputs', {}).get('text', 'No text output')})

if __name__ == '__main__':
    app.run(debug=True, port=5000)