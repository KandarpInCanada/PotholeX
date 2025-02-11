import os
import cv2
import boto3
import numpy as np
import logging
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from botocore.exceptions import NoCredentialsError, ClientError

app = Flask(__name__)
AWS_BUCKET_NAME = "your-s3-bucket-name"
AWS_REGION = "us-east-1"
s3 = boto3.client("s3", region_name=AWS_REGION)
model = YOLO("yolo_pothole_model.pt")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
CONFIDENCE_THRESHOLD = 0.5
logging.basicConfig(level=logging.INFO)

def allowed_file(filename):
    """Check if the uploaded file has a valid extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/detect", methods=["POST"])
def detect_pothole():
    """API endpoint for pothole detection with S3 integration."""
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
    file = request.files["file"]
    threshold = request.form.get("threshold", CONFIDENCE_THRESHOLD, type=float)
    if file.filename == "":
        return jsonify({"status": "error", "message": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        s3.upload_fileobj(file, AWS_BUCKET_NAME, f"uploads/{filename}")
        original_file_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/uploads/{filename}"
        result = process_image_from_s3(f"uploads/{filename}", threshold)
        if "output_image_url" not in result:
            return jsonify({
                "status": "success",
                "detection": "no",
                "confidence_threshold": result["confidence_threshold"],
                "message": result["message"],
                "original_image_url": original_file_url
            })
        return jsonify({
            "status": "success",
            "detection": "yes",
            "confidence_threshold": result["confidence_threshold"],
            "original_image_url": original_file_url,
            "processed_image_url": result["output_image_url"]
        })
    return jsonify({"status": "error", "message": "Invalid file format"}), 400

def process_image_from_s3(s3_image_key, threshold):
    """Downloads image from S3, processes with YOLO, and uploads result."""
    local_image_path = f"/tmp/{os.path.basename(s3_image_key)}"
    s3.download_file(AWS_BUCKET_NAME, s3_image_key, local_image_path)
    img = cv2.imread(local_image_path)
    results = model(img)
    detections = results[0].boxes.data if results[0].boxes is not None else []
    filtered_detections = [det for det in detections if det[4] >= threshold] if len(detections) > 0 else []
    if len(filtered_detections) == 0:
        return {"message": "No pothole detected", "confidence_threshold": threshold}
    processed_filename = f"processed_{os.path.basename(s3_image_key)}"
    processed_image_path = f"/tmp/{processed_filename}"
    cv2.imwrite(processed_image_path, results[0].plot())
    s3.upload_file(processed_image_path, AWS_BUCKET_NAME, f"processed/{processed_filename}")
    processed_image_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/processed/{processed_filename}"
    return {
        "message": "Pothole detected",
        "confidence_threshold": threshold,
        "output_image_url": processed_image_url
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)