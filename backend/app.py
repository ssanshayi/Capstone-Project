from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
from moviepy.editor import ImageSequenceClip
import os, tempfile, cv2, uuid, numpy as np

app = Flask(__name__)
CORS(app)

model = YOLO("best.pt")
os.makedirs("static/results", exist_ok=True)

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
            if results[0].boxes is not None:
                for pred in results[0].boxes:
                    cls = int(pred.cls[0])
                    predictions.append(results[0].names[cls])
            result_frame = results[0].plot()
            filename = f"{uuid.uuid4().hex}.jpg"
            image_result_path = os.path.join("static/results", filename)
            cv2.imwrite(image_result_path, result_frame)
            return jsonify({
                "detections": predictions,
                "media_url": f"/static/results/{filename}",
                "type": "image"
            })

        elif suffix == ".mp4":
            video_output_path, predictions, frame_count, per_second = detect_video_and_save(temp_file.name)
            filename = os.path.basename(video_output_path)
            return jsonify({
                "detections": predictions,
                "media_url": f"/static/results/{filename}",
                "type": "video",
                "frames_written": frame_count,
                "detections_per_second": per_second
            })

        else:
            return jsonify({"error": "Only image (.jpg/.png) and .mp4 video are supported."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        try:
            os.unlink(temp_file.name)
        except Exception:
            pass

@app.route("/static/results/<path:filename>")
def serve_static(filename):
    ext = os.path.splitext(filename)[-1].lower()
    mimetype = "video/mp4" if ext == ".mp4" else "image/jpeg"
    return send_file(os.path.join("static/results", filename), mimetype=mimetype)

def detect_video_and_save(file_path):
    cap = cv2.VideoCapture(file_path)
    filename = f"{uuid.uuid4().hex}_out.avi"
    output_path = os.path.join("static/results", filename)

    if not cap.isOpened():
        raise RuntimeError("Failed to open input video.")

    fourcc = cv2.VideoWriter_fourcc(*'XVID')  # 使用 AVI 常见编码
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        raise RuntimeError("Failed to create output video file.")

    detections = set()
    frame_count = 0
    skip_frame = 10
    written_frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % skip_frame != 0:
            out.write(frame)
            written_frame_count += 1
            continue

        results = model.predict(source=frame, show=False, conf=0.25, verbose=False, imgsz=512)
        if results[0].boxes is not None:
            for pred in results[0].boxes:
                cls = int(pred.cls[0])
                detections.add(results[0].names[cls])
        result_frame = results[0].plot()
        out.write(result_frame)
        written_frame_count += 1

    cap.release()
    out.release()

    if written_frame_count == 0:
        black = np.zeros((int(height), int(width), 3), dtype=np.uint8)
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        out.write(black)
        out.release()
        written_frame_count = 1

    duration = written_frame_count / fps
    fps_int = int(fps)
    per_second_results = {}

    for sec in range(int(duration) + 1):
        per_second_results[sec] = []

    cap2 = cv2.VideoCapture(file_path)
    current_frame = 0
    while True:
        ret, frame = cap2.read()
        if not ret:
            break
        if current_frame % fps_int == 0:
            results = model.predict(source=frame, show=False, conf=0.25, verbose=False, imgsz=512)
            if results[0].boxes is not None:
                for pred in results[0].boxes:
                    cls = int(pred.cls[0])
                    name = results[0].names[cls]
                    sec = current_frame // fps_int
                    if name not in per_second_results[sec]:
                        per_second_results[sec].append(name)
        current_frame += 1
    cap2.release()

    return output_path, list(detections), written_frame_count, per_second_results

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
