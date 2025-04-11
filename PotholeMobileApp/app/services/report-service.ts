/**
 * Report Service
 *
 * Manages all pothole report-related operations including:
 * - Creating new reports
 * - Uploading report images to Supabase storage
 * - Fetching reports (all, user-specific, or by ID)
 * - Liking and deleting reports
 *
 * This service acts as an abstraction layer between the UI components
 * and the Supabase backend for all report-related operations.
 */

import { supabase, type PotholeReport, ReportStatus, type Profile, SeverityLevel } from "../../lib/supabase"
import * as FileSystem from "expo-file-system"
import { SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET_NAME } from "../../config/env"
import { notifyAdminsAboutNewReport } from "../../lib/notifications"

/**
 * Retrieves the current user's profile from Supabase
 *
 * @returns The user profile with ID and email or null if not authenticated/error
 */
export const getUserProfile = async (): Promise<(Profile & { id: string; email: string }) | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }
  return { ...data, id: user.id, email: user.email }
}

/**
 * Saves a new pothole report to the database
 *
 * This function:
 * 1. Verifies the user is authenticated
 * 2. Prepares the report data with default values for missing fields
 * 3. Inserts the report into the database
 * 4. Sends notifications to admins about the new report (non-blocking)
 *
 * @param report - The pothole report data to save
 * @returns Object containing success status, data (if successful), and error (if failed)
 */
export const saveReport = async (
  report: PotholeReport,
): Promise<{ success: boolean; data?: PotholeReport; error?: any }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError) {
      console.error("Auth error:", authError)
      return { success: false, error: "Please log in again to continue" }
    }
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }
    const reportData = {
      ...report,
      user_id: user.id,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      images: report.images || [],
      description: report.description || "",
      category: report.category || "",
      severity: report.severity || SeverityLevel.MEDIUM,
      road_condition: report.road_condition || "Dry",
      status: ReportStatus.SUBMITTED,
    }

    const { data, error } = await supabase.from("pothole_reports").insert(reportData).select("*")
    if (error) {
      console.error("Supabase insert error:", error)
      return {
        success: false,
        error: "Failed to create report. Please try again.",
      }
    }

    if (data && data.length > 0) {
      const savedReport = data[0]
      setTimeout(() => {
        try {
          notifyAdminsAboutNewReport(savedReport.id, {
            location: savedReport.location || "Unknown location",
            severity: savedReport.severity,
            category: savedReport.category,
          }).catch((err) => console.error("Notification error (caught):", err))
        } catch (notificationError) {
          console.error("Error sending notification:", notificationError)
        }
      }, 0)
    }

    return { success: true, data: data?.[0] }
  } catch (error: any) {
    console.error("Error in saveReport:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

/**
 * Uploads report images to Supabase storage
 *
 * This function:
 * 1. Processes each image in the provided array
 * 2. Verifies the file exists on the device
 * 3. Creates a unique file path for each image
 * 4. Uploads the image using FormData (compatible with React Native)
 * 5. Returns an array of public URLs for the uploaded images
 *
 * @param images - Array of local image URIs to upload
 * @param reportId - Report ID to associate with the images
 * @returns Array of public URLs for the uploaded images
 */
export const uploadReportImages = async (images: string[], reportId: string): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = []
    for (let i = 0; i < images.length; i++) {
      try {
        const uri = images[i]
        console.log(`Processing image ${i}:`, uri)
        const fileInfo = await FileSystem.getInfoAsync(uri)
        if (!fileInfo.exists) {
          console.error(`File does not exist: ${uri}`)
          continue
        }
        const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg"
        const fileName = `${reportId}_${i}.${fileExt}`
        const filePath = `reports/${reportId}/${fileName}`
        console.log(`File exists: ${fileInfo.exists}, size: ${fileInfo.size}, uri: ${uri}`)
        const formData = new FormData()
        formData.append("file", {
          uri: uri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any)
        const supabaseUrl = SUPABASE_URL
        const supabaseKey = SUPABASE_ANON_KEY
        const bucketName = STORAGE_BUCKET_NAME
        console.log(supabaseUrl)
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "x-upsert": "true",
          },
          body: formData,
        })
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`)
        }
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`
        uploadedUrls.push(publicUrl)
      } catch (imageError) {
        console.error(`Error uploading image ${i}:`, imageError)
      }
    }
    return uploadedUrls
  } catch (error) {
    console.error("Error in uploadReportImages:", error)
    return []
  }
}

/**
 * Retrieves all pothole reports from the database
 *
 * Fetches all reports with associated user profile information,
 * ordered by creation date (newest first).
 *
 * @returns Array of pothole reports with profile information
 */
export const getAllReports = async (): Promise<PotholeReport[]> => {
  try {
    const { data, error } = await supabase
      .from("pothole_reports")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching reports:", error)
    return []
  }
}

/**
 * Retrieves all reports created by the current user
 *
 * @returns Array of pothole reports created by the current user
 */
export const getUserReports = async (): Promise<PotholeReport[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []
    const { data, error } = await supabase
      .from("pothole_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching user reports:", error)
    return []
  }
}

/**
 * Retrieves a specific pothole report by ID
 *
 * Fetches a single report with associated user profile information.
 *
 * @param id - The ID of the report to retrieve
 * @returns The pothole report with profile information or null if not found
 */
export const getReportById = async (id: string): Promise<PotholeReport | null> => {
  try {
    const { data, error } = await supabase
      .from("pothole_reports")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq("id", id)
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching report:", error)
    return null
  }
}

/**
 * Increments the like count for a specific report
 *
 * Uses a Supabase RPC function to safely increment the likes counter.
 *
 * @param reportId - The ID of the report to like
 * @returns Boolean indicating success or failure
 */
export const likeReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc("increment_likes", {
      report_id: reportId,
    })
    if (error) {
      console.error("Error liking report:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Error in likeReport:", error)
    return false
  }
}

/**
 * Deletes a specific pothole report
 *
 * @param reportId - The ID of the report to delete
 * @returns Boolean indicating success or failure
 */
export const deleteReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("pothole_reports").delete().eq("id", reportId)
    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting report:", error)
    return false
  }
}

export default {
  getUserProfile,
  saveReport,
  uploadReportImages,
  getAllReports,
  getUserReports,
  getReportById,
  likeReport,
  deleteReport,
}
