import tensorflow as tf

# Load the TensorFlow SavedModel
converter = tf.lite.TFLiteConverter.from_saved_model("saved_model")

# Convert the model to TensorFlow Lite format
tflite_model = converter.convert()

# Save the converted model
with open("model.tflite", "wb") as f:
    f.write(tflite_model)

print("✅ TensorFlow model successfully converted to TFLite!")