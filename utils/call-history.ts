// Type for a call history entry
export interface CallHistoryEntry {
  phoneNumber: string
  timestamp: number
  duration?: number
}

// Maximum number of entries to store
const MAX_HISTORY_ENTRIES = 5

// Local storage key
const STORAGE_KEY = "twilio-dialer-call-history"

// Get call history from local storage
export function getCallHistory(): CallHistoryEntry[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedHistory = localStorage.getItem(STORAGE_KEY)
    return storedHistory ? JSON.parse(storedHistory) : []
  } catch (error) {
    console.error("Error reading call history from local storage:", error)
    return []
  }
}

// Add a new call to the history
export function addCallToHistory(phoneNumber: string, duration?: number): CallHistoryEntry[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const history = getCallHistory()

    // Create new entry
    const newEntry: CallHistoryEntry = {
      phoneNumber,
      timestamp: Date.now(),
      duration,
    }

    // Add to the beginning of the array
    const updatedHistory = [newEntry, ...history.filter((entry) => entry.phoneNumber !== phoneNumber)]

    // Limit to MAX_HISTORY_ENTRIES
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ENTRIES)

    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory))

    return limitedHistory
  } catch (error) {
    console.error("Error adding call to history:", error)
    return []
  }
}

// Format timestamp to readable date/time
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}
