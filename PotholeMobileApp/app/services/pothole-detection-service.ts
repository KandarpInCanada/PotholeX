/**
 * Pothole Detection Service
 *
 * Provides functionality for detecting potholes in images using an external API:
 * - Sending images to the pothole detection API
 * - Processing detection results
 * - Checking API health status
 *
 * This service communicates with a machine learning model API that analyzes
 * images and returns pothole detection results with confidence scores.
 */

const API_URL = "http://192.168.2.42:5000"
const CONFIDENCE_THRESHOLD = 0.5

/**
 * Represents a single pothole detection result from the API
 */
export interface PotholeDetection {
  class: string
  confidence: number
  bbox: [number, number, number, number] // [x1, y1, x2, y2] bounding box coordinates
}

/**
 * Represents the complete detection result for an image
 */
export interface DetectionResult {
  filename: string
  detections: PotholeDetection[]
  isValidPothole: boolean // Determined based on confidence threshold
  highestConfidence: number // Highest confidence score among all detections
}

/**
 * Uploads an image to the pothole detection API and processes the results
 *
 * This function:
 * 1. Sends the image to the detection API
 * 2. Processes the API response
 * 3. Calculates the highest confidence score
 * 4. Determines if the image contains a valid pothole based on confidence threshold
 *
 * @param imageUri - Local URI of the image to analyze
 * @returns Detection result with pothole information and validity assessment
 */
export const detectPothole = async (imageUri: string): Promise<DetectionResult> => {
  try {
    console.log("Sending image for pothole detection:", imageUri)

    const formData = new FormData()
    const fileType = imageUri.split(".").pop() || "jpg"

    formData.append("file", {
      uri: imageUri,
      name: `pothole.${fileType}`,
      type: `image/${fileType}`,
    } as any)

    const response = await fetch(`${API_URL}/predict_json`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    let highestConfidence = 0
    if (result.detections && result.detections.length > 0) {
      highestConfidence = Math.max(...result.detections.map((d: PotholeDetection) => d.confidence))
    }

    const isValidPothole = highestConfidence >= CONFIDENCE_THRESHOLD

    return {
      ...result,
      isValidPothole,
      highestConfidence,
    }
  } catch (error) {
    console.error("Error detecting pothole:", error)
    throw error
  }
}

/**
 * Checks if the pothole detection API server is available
 *
 * Makes a simple GET request to the API health endpoint to verify
 * that the server is running and accessible.
 *
 * @returns Boolean indicating if the API is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
    })
    return response.ok
  } catch (error) {
    console.error("API health check failed:", error)
    return false
  }
}

export default {
  detectPothole,
  checkApiHealth,
}
