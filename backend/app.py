from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
import os, tempfile
import cv2
import uuid

app = Flask(__name__)
CORS(app)

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
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.close()
    file.save(temp_file.name)

    try:
        if suffix in [".jpg", ".jpeg", ".png"]:
            results = model(temp_file.name)
            predictions = []
            for pred in results[0].boxes:
                cls = int(pred.cls[0])
                conf = float(pred.conf[0])
                predictions.append(results[0].names[cls])

            # Save the image with bounding boxes
            result_frame = results[0].plot()
            image_result_path = os.path.join("static", f"{uuid.uuid4().hex}.jpg")
            cv2.imwrite(image_result_path, result_frame)

            return jsonify({
                "detections": predictions,
                "image_url": f"https://capstone-project-e9ct.onrender.com/{image_result_path}"
            })

        elif suffix in [".mp4", ".mov", ".avi", ".mkv"]:
            video_output_path, predictions = detect_video_and_save(temp_file.name)
            filename = os.path.basename(video_output_path)

            return jsonify({
                "detections": predictions,
                "video_url": f"https://capstone-project-e9ct.onrender.com/static/{filename}"
            })

        else:
            return jsonify({"error": "Unsupported file type"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        import time
        time.sleep(1)
        try:
            os.unlink(temp_file.name)
        except Exception:
            pass

def detect_video_and_save(file_path):
    cap = cv2.VideoCapture(file_path)
    filename = f"{uuid.uuid4().hex}_out.mp4"
    output_path = os.path.join("static", filename)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    detections = set()

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = model.predict(source=frame, show=False, conf=0.25, verbose=False)
        for pred in results[0].boxes:
            cls = int(pred.cls[0])
            detections.add(results[0].names[cls])
        result_frame = results[0].plot()
        out.write(result_frame)

    cap.release()
    out.release()
    return output_path, list(detections)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print("Flask server is starting...")
    app.run(host="0.0.0.0", port=port)
