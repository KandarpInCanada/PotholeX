import { supabase, type PotholeReport, ReportStatus, type Profile, SeverityLevel } from "../../lib/supabase"
import * as FileSystem from "expo-file-system"
import { SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET_NAME } from "../../config/env";

// Get user profile
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

// Save report
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
    return { success: true, data: data?.[0] }
  } catch (error: any) {
    console.error("Error in saveReport:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}

export const uploadReportImages = async (images: string[], reportId: string): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = []
    for (let i = 0; i < images.length; i++) {
      try {
        const uri = images[i]
        console.log(`Processing image ${i}:`, uri)
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(uri)
        if (!fileInfo.exists) {
          console.error(`File does not exist: ${uri}`)
          continue
        }
        // Get file extension
        const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg"
        const fileName = `${reportId}_${i}.${fileExt}`
        const filePath = `reports/${reportId}/${fileName}`
        // For debugging
        console.log(`File exists: ${fileInfo.exists}, size: ${fileInfo.size}, uri: ${uri}`)
        // Create a FormData object (more reliable than blob for React Native)
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

// Get all reports
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

// Get user's reports
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

// Get report by ID
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

// Like a report
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

// Delete a report
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

