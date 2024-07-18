import requests
import json
import mysql.connector
from mysql.connector import Error
import hashlib

def run_workflow(api_key, user_id, inputs=None, response_mode='blocking', files=None):
    url = ''
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    payload = {
        'inputs': inputs if inputs is not None else {},
        'response_mode': 'blocking',
        'user': user_id
    }

    if files:
        payload['files'] = files

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        print('Success:', response.json())
    else:
        print('Error:', response.status_code, response.text)

if __name__ == '__main__':
    api_key = ''
    user_id = '1001'
    inputs = {
        'history': "##Prompt：你是提取历史数据的AI吗",
    }

    run_workflow(api_key, user_id, inputs)

