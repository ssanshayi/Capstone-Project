from flask import Flask, request, jsonify, send_file
from ultralytics import YOLO
import os, tempfile
import cv2

app = Flask(__name__)
model = YOLO("best.pt")

@app.route("/") 
def home():
    return "YOLOv8 backend is running!"

@app.route("/predict", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    suffix = os.path.splitext(file.filename)[-1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        file.save(temp_file.name)
        try:
            if suffix in [".jpg", ".jpeg", ".png"]:
                results = model(temp_file.name)
                predictions = []
                for pred in results[0].boxes:
                    cls = int(pred.cls[0])
                    conf = float(pred.conf[0])
                    predictions.append({
                        "class": results[0].names[cls],
                        "confidence": round(conf, 2)
                    })
                return jsonify(predictions)
            elif suffix in [".mp4", ".mov", ".avi", ".mkv"]:
                output_path = detect_video_and_save(temp_file.name)
                return send_file(output_path, mimetype='video/mp4')
            else:
                return jsonify({"error": "Unsupported file type"}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            import time
            time.sleep(1)
    try:
        os.unlink(temp_file.name)
    except PermissionError:
        pass

def detect_video_and_save(file_path):
    cap = cv2.VideoCapture(file_path)
    output_path = file_path.replace('.mp4', '_out.mp4')
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = model.predict(source=frame, show=False, conf=0.25, verbose=False)
        result_frame = results[0].plot()
        out.write(result_frame)

    cap.release()
    out.release()
    return output_path

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print("Flask server is starting...")
    app.run(host="0.0.0.0", port=port)
