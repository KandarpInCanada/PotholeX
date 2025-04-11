import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import { supabase } from "./supabase"
import Constants from "expo-constants"

// Add this at the top of the file after imports
const isExpoGo = Constants.appOwnership === "expo"

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

/**
 * Registers the device for push notifications and saves the token to the database
 * @returns The Expo push token
 */
export async function registerForPushNotificationsAsync() {
  let token

  // Add a warning for Expo Go users
  if (isExpoGo) {
    console.log(
      "Push notifications have limited functionality in Expo Go. Consider using a development build for full functionality.",
    )
  }

  // Check if the device is physical (not a simulator/emulator)
  if (Device.isDevice) {
    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    // If we don't have permission yet, ask for it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    // If we still don't have permission, exit
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return null
    }

    // Get the token
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "81aa287b-9181-4ab6-a423-666bb996cdfd", // Using the projectId from app.json
      })
    ).data
    console.log(token)
  } else {
    console.log("Must use physical device for push notifications")
  }

  // Special handling for Android
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

// Improve error handling in savePushToken function
export async function savePushToken(userId: string, token: string) {
  try {
    if (!userId || !token) {
      console.log("Missing userId or token, cannot save push token")
      return
    }

    // First check if the user exists in the profiles table
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

    // Now it's safe to save the token
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

// Update the getAdminPushTokens function to avoid using a join that requires a relationship
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

    // Extract the admin user IDs
    const adminIds = adminProfiles.map((profile) => profile.id)

    // Then fetch push tokens for those admin users
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

/**
 * Send a push notification to specified tokens
 * @param tokens Array of Expo push tokens
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to send with the notification
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
    // Use Expo's push notification service
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

// Update the saveNotification function to be absolutely sure it doesn't use recipient_id
export async function saveNotification(reportId: string, title: string, message: string, forAdmins = false) {
  try {
    // Create an object with only the fields that exist in your database schema
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
    // Return null but don't throw so it doesn't break report submission
    return null
  }
}

// Update the notifyAdminsAboutNewReport function with better error handling
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
    // 1. Get all admin tokens
    const adminTokens = await getAdminPushTokens()
    console.log(`Found ${adminTokens.length} admin tokens`)

    // 2. Prepare notification content
    const title = "New Pothole Report"
    const body = `A new ${reportDetails.severity} pothole was reported at ${reportDetails.location}`

    // 3. Save notification to database - with extra error handling
    try {
      console.log("Attempting to save notification to database")
      await saveNotification(
        reportId,
        title,
        body,
        true, // For admins only
      )
      console.log("Notification saved successfully")
    } catch (saveError) {
      console.error("Failed to save notification to database:", saveError)
      // Continue with push notification even if database save fails
    }

    // 4. Send push notification to all admin devices
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
    // Don't rethrow the error to prevent report submission failure
  }
}

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
    // 1. Get user's push token
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

    // 2. Prepare notification content
    const title = "Report Status Updated"
    const body = `Your pothole report at ${reportDetails.location} has been updated to: ${formatStatus(newStatus)}`

    // 3. Save notification to database
    try {
      console.log("Saving notification to database")
      await saveNotification(
        reportId,
        title,
        body,
        false, // Not for admins, for regular user
      )
      console.log("Notification saved successfully")
    } catch (saveError) {
      console.error("Failed to save notification to database:", saveError)
      // Continue with push notification even if database save fails
    }

    // 4. Send push notification to user's devices
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

/**
 * Get notifications for a user
 * @param isAdmin Whether the user is an admin
 * @param limit Optional limit of notifications to fetch
 * @returns Array of notifications
 */
export async function getNotifications(isAdmin: boolean, limit = 50) {
  try {
    let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit)

    // If user is admin, get admin notifications, else get regular notifications
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
