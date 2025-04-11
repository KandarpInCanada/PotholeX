// Configure the API URL - replace with your actual server URL
const API_URL = "http://192.168.2.42:5000" // Update this with your server address
const CONFIDENCE_THRESHOLD = 0.5 // Minimum confidence to consider a valid pothole

export interface PotholeDetection {
  class: string
  confidence: number
  bbox: [number, number, number, number] // [x1, y1, x2, y2]
}

export interface DetectionResult {
  filename: string
  detections: PotholeDetection[]
  isValidPothole: boolean
  highestConfidence: number
}

/**
 * Uploads an image to the pothole detection API and returns the detection results
 */
export const detectPothole = async (imageUri: string): Promise<DetectionResult> => {
  try {
    console.log("Sending image for pothole detection:", imageUri)

    // Create form data for the image upload
    const formData = new FormData()
    const fileType = imageUri.split(".").pop() || "jpg"

    formData.append("file", {
      uri: imageUri,
      name: `pothole.${fileType}`,
      type: `image/${fileType}`,
    } as any)

    // Make the API request
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

    // Parse the response
    const result = await response.json()

    // Calculate the highest confidence score
    let highestConfidence = 0
    if (result.detections && result.detections.length > 0) {
      highestConfidence = Math.max(...result.detections.map((d: PotholeDetection) => d.confidence))
    }

    // Determine if this is a valid pothole based on confidence threshold
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
 * Checks if the API server is available
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
