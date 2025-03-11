import torch
import onnx
from ultralytics import YOLO  # Import YOLO for YOLO-based models

# Load the trained PyTorch model
model = YOLO("yolo_pothole_model.pt")  # Replace with your model file

# Dummy input for model export (Adjust shape based on model requirements)
dummy_input = torch.randn(1, 3, 640, 640)  # Example for an image classification model

# Export the model to ONNX format
torch.onnx.export(
    model.model,  # PyTorch model (YOLO model inside)
    dummy_input,
    "model.onnx",  # Output file
    export_params=True,
    opset_version=11,  # Use opset 11 for better compatibility
    input_names=["input"],
    output_names=["output"]
)

print("✅ PyTorch model successfully converted to ONNX!")