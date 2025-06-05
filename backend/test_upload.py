import requests

# 设置本地 Flask 服务器地址
url = "http://127.0.0.1:5000/predict"

image_path = "sharkkk.png" 

with open(image_path, "rb") as f:
    files = {"file": (image_path, f, "multipart/form-data")}
    response = requests.post(url, files=files)

if response.status_code == 200:
    print(" Succcess!：")
    print(response.json())
else:
    print(f" Error：{response.status_code}")
    print(response.text)
