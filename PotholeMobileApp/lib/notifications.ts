// Add this file-level documentation at the top of the file after imports
/**
 * Notifications Module
 *
 * This module handles all notification-related functionality including:
 * - Push notification registration and token management
 * - Sending notifications to users and admins
 * - Storing and retrieving notifications from the database
 * - Notification status management (read/unread)
 *
 * The module integrates with Expo's notification system and Supabase for persistence.
 */
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import { supabase } from "./supabase"
import Constants from "expo-constants"
const isExpoGo = Constants.appOwnership === "expo"
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Update the registerForPushNotificationsAsync function comment
/**
 * Registers the device for push notifications and saves the token to the database
 *
 * This function:
 * 1. Checks if running in Expo Go (limited functionality)
 * 2. Verifies the device is physical (not a simulator)
 * 3. Requests notification permissions if not already granted
 * 4. Retrieves and returns the Expo push token
 * 5. Sets up Android notification channel if on Android
 *
 * @returns {Promise<string|null>} The Expo push token or null if registration failed
 */
export async function registerForPushNotificationsAsync() {
  let token
  if (isExpoGo) {
    console.log(
      "Push notifications have limited functionality in Expo Go. Consider using a development build for full functionality.",
    )
  }
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return null
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "81aa287b-9181-4ab6-a423-666bb996cdfd", // Using the projectId from app.json
      })
    ).data
    console.log(token)
  } else {
    console.log("Must use physical device for push notifications")
  }
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }
  return token
}

// Update the savePushToken function comment
/**
 * Saves a user's push notification token to the database
 *
 * This function performs validation to ensure:
 * 1. Both userId and token are provided
 * 2. The user exists in the profiles table
 * 3. The token is properly upserted to avoid duplicates
 *
 * @param {string} userId - The user's unique identifier
 * @param {string} token - The Expo push notification token
 * @returns {Promise<void>}
 */
export async function savePushToken(userId: string, token: string) {
  try {
    if (!userId || !token) {
      console.log("Missing userId or token, cannot save push token")
      return
    }
    const { data: userExists, error: userCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()
    if (userCheckError) {
      if (userCheckError.code === "PGRST116") {
        console.log("User does not exist in profiles table, cannot save push token")
        return
      }
      console.error("Error checking user existence:", userCheckError)
      return
    }
    if (!userExists) {
      console.log("User does not exist in profiles table, cannot save push token")
      return
    }
    const { error } = await supabase
      .from("push_tokens")
      .upsert({ user_id: userId, token, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    if (error) {
      console.error("Error saving push token:", error)
      return
    }
    console.log("Push token saved successfully")
  } catch (error) {
    console.error("Error saving push token:", error)
  }
}

// Update the getAdminPushTokens function comment
/**
 * Retrieves push notification tokens for all admin users
 *
 * This implementation uses a two-step process:
 * 1. First fetches all admin user IDs from profiles table
 * 2. Then retrieves push tokens associated with those admin IDs
 *
 * This approach avoids complex joins and potential relationship issues.
 *
 * @returns {Promise<string[]>} Array of admin push tokens
 */
export async function getAdminPushTokens() {
  try {
    // First, get all admin user IDs
    const { data: adminProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_admin", true)
    if (profilesError) {
      console.error("Error fetching admin profiles:", profilesError)
      return []
    }
    if (!adminProfiles || adminProfiles.length === 0) {
      console.log("No admin profiles found")
      return []
    }
    const adminIds = adminProfiles.map((profile) => profile.id)
    const { data: tokenData, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token")
      .in("user_id", adminIds)

    if (tokensError) {
      console.error("Error fetching push tokens:", tokensError)
      return []
    }
    return tokenData?.map((item) => item.token) || []
  } catch (error) {
    console.error("Error fetching admin push tokens:", error)
    return []
  }
}

// Update the sendPushNotification function comment
/**
 * Sends push notifications to specified devices
 *
 * Uses Expo's push notification service to deliver notifications to multiple
 * recipients simultaneously. Each notification includes title, body, and optional
 * custom data payload.
 *
 * @param {string[]} tokens - Array of Expo push tokens to send notifications to
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {object} data - Additional data to include with the notification (default: {})
 * @returns {Promise<object|null>} Response from Expo's push service or null on error
 */
export async function sendPushNotification(tokens: string[], title: string, body: string, data: object = {}) {
  if (!tokens.length) {
    console.log("No tokens to send notifications to")
    return
  }
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data,
  }))
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    })
    const result = await response.json()
    console.log("Push notification response:", result)
    return result
  } catch (error) {
    console.error("Error sending push notification:", error)
    throw error
  }
}

// Update the saveNotification function comment
/**
 * Saves a notification to the database
 *
 * Creates a record in the notifications table with appropriate metadata.
 * This function is designed to work with the specific schema of the notifications table,
 * carefully avoiding any fields that don't exist in the schema.
 *
 * @param {string} reportId - ID of the pothole report this notification relates to
 * @param {string} title - Notification title
 * @param {string} message - Notification message content
 * @param {boolean} forAdmins - Whether this notification is for admin users (default: false)
 * @returns {Promise<object|null>} The created notification data or null on error
 */
export async function saveNotification(reportId: string, title: string, message: string, forAdmins = false) {
  try {
    const notificationData = {
      report_id: reportId,
      title,
      message,
      for_admins: forAdmins,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    console.log("Saving notification with data:", notificationData)
    const { data, error } = await supabase.from("notifications").insert(notificationData)
    if (error) {
      console.error("Error saving notification:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error saving notification:", error)
    return null
  }
}

// Update the notifyAdminsAboutNewReport function comment
/**
 * Notifies all admin users about a newly submitted pothole report
 *
 * Complete notification workflow that:
 * 1. Retrieves all admin push tokens
 * 2. Prepares notification content based on report details
 * 3. Saves the notification to the database for persistence
 * 4. Sends push notifications to all admin devices
 *
 * The function includes comprehensive error handling to ensure report submission
 * is not affected by notification failures.
 *
 * @param {string} reportId - ID of the newly created report
 * @param {object} reportDetails - Details about the report
 * @param {string} reportDetails.location - Location description of the pothole
 * @param {string} reportDetails.severity - Severity level of the pothole
 * @param {string} reportDetails.category - Category of the pothole
 * @returns {Promise<void>}
 */
export async function notifyAdminsAboutNewReport(
  reportId: string,
  reportDetails: {
    location: string
    severity: string
    category: string
  },
) {
  console.log("Starting notification process for report:", reportId)

  try {
    const adminTokens = await getAdminPushTokens()
    console.log(`Found ${adminTokens.length} admin tokens`)
    const title = "New Pothole Report"
    const body = `A new ${reportDetails.severity} pothole was reported at ${reportDetails.location}`
    try {
      console.log("Attempting to save notification to database")
      await saveNotification(
        reportId,
        title,
        body,
        true,
      )
      console.log("Notification saved successfully")
    } catch (saveError) {
      console.error("Failed to save notification to database:", saveError)
    }
    if (adminTokens.length > 0) {
      try {
        console.log("Sending push notifications to admins")
        await sendPushNotification(adminTokens, title, body, {
          reportId,
          type: "new_report",
          severity: reportDetails.severity,
          category: reportDetails.category,
        })
        console.log("Push notifications sent successfully")
      } catch (pushError) {
        console.error("Error sending push notifications:", pushError)
      }
    }
    console.log("Notification process completed")
  } catch (error) {
    console.error("Error in notifyAdminsAboutNewReport:", error)
  }
}

// Update the notifyUserAboutStatusChange function comment
/**
 * Notifies a user when their report status has been updated
 *
 * Complete notification workflow that:
 * 1. Retrieves the user's push tokens
 * 2. Prepares notification content with formatted status
 * 3. Saves the notification to the database for persistence
 * 4. Sends push notifications to the user's devices
 *
 * @param {string} reportId - ID of the report that was updated
 * @param {string} userId - ID of the user who submitted the report
 * @param {string} newStatus - The new status of the report
 * @param {object} reportDetails - Details about the report
 * @param {string} reportDetails.location - Location description of the pothole
 * @returns {Promise<void>}
 */
// Add this new function after the notifyAdminsAboutNewReport function
export async function notifyUserAboutStatusChange(
  reportId: string,
  userId: string,
  newStatus: string,
  reportDetails: {
    location: string
  },
) {
  console.log(`Starting notification process for status change of report ${reportId} to user ${userId}`)

  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", userId)
    if (tokenError) {
      console.error("Error fetching user push token:", tokenError)
      return
    }
    const userTokens = tokenData?.map((item) => item.token) || []
    console.log(`Found ${userTokens.length} user tokens`)
    const title = "Report Status Updated"
    const body = `Your pothole report at ${reportDetails.location} has been updated to: ${formatStatus(newStatus)}`
    try {
      console.log("Saving notification to database")
      await saveNotification(
        reportId,
        title,
        body,
        false,
      )
      console.log("Notification saved successfully")
    } catch (saveError) {
      console.error("Failed to save notification to database:", saveError)
    }
    if (userTokens.length > 0) {
      try {
        console.log("Sending push notification to user")
        await sendPushNotification(userTokens, title, body, {
          reportId,
          type: "status_change",
          newStatus,
        })
        console.log("Push notification sent successfully")
      } catch (pushError) {
        console.error("Error sending push notification:", pushError)
      }
    }
    console.log("Status change notification process completed")
  } catch (error) {
    console.error("Error in notifyUserAboutStatusChange:", error)
  }
}

// Update the formatStatus function comment
/**
 * Formats a status code into a user-friendly display string
 *
 * Converts internal status codes (like "in_progress") to properly capitalized
 * and formatted strings for display to users (like "In Progress").
 *
 * @param {string} status - The internal status code
 * @returns {string} User-friendly formatted status text
 */
// Helper function to format status for user-friendly display
function formatStatus(status: string): string {
  switch (status) {
    case "submitted":
      return "Submitted"
    case "in_progress":
      return "In Progress"
    case "fixed":
      return "Fixed"
    case "rejected":
      return "Rejected"
    default:
      return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

// Update the getNotifications function comment
/**
 * Retrieves notifications for a user based on their admin status
 *
 * Fetches notifications from the database with:
 * - Filtering based on whether they're for admins or regular users
 * - Sorting by creation date (newest first)
 * - Optional limit on the number of notifications returned
 *
 * @param {boolean} isAdmin - Whether to fetch admin notifications
 * @param {number} limit - Maximum number of notifications to retrieve (default: 50)
 * @returns {Promise<Array>} Array of notification objects
 */
/**
 * Get notifications for a user
 * @param isAdmin Whether the user is an admin
 * @param limit Optional limit of notifications to fetch
 * @returns Array of notifications
 */
export async function getNotifications(isAdmin: boolean, limit = 50) {
  try {
    let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit)
    if (isAdmin) {
      query = query.eq("for_admins", true)
    } else {
      query = query.eq("for_admins", false)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

// Update the markNotificationsAsRead function comment
/**
 * Marks multiple notifications as read in a single operation
 *
 * Updates the is_read status to true for all specified notification IDs.
 * This is more efficient than updating notifications individually.
 *
 * @param {string[]} notificationIds - Array of notification IDs to mark as read
 * @returns {Promise<void>}
 */
/**
 * Mark notifications as read
 * @param notificationIds Array of notification IDs to mark as read
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    if (!notificationIds.length) return
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", notificationIds)
    if (error) throw error
  } catch (error) {
    console.error("Error marking notifications as read:", error)
  }
}

// Update the countUnreadNotifications function comment
/**
 * Counts unread notifications for a user based on their admin status
 *
 * Performs an optimized count query that:
 * - Filters by read status (unread only)
 * - Filters by whether notifications are for admins or regular users
 * - Returns only the count, not the actual notification data
 *
 * @param {boolean} isAdmin - Whether to count admin notifications
 * @returns {Promise<number>} Count of unread notifications
 */
/**
 * Count unread notifications
 * @param isAdmin Whether to count admin notifications
 * @returns Count of unread notifications
 */
export async function countUnreadNotifications(isAdmin: boolean) {
  try {
    let query = supabase.from("notifications").select("id", { count: "exact" }).eq("is_read", false)
    if (isAdmin) {
      query = query.eq("for_admins", true)
    } else {
      query = query.eq("for_admins", false)
    }
    const { count, error } = await query
    if (error) throw error
    return count || 0
  } catch (error) {
    console.error("Error counting unread notifications:", error)
    return 0
  }
}
