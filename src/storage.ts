/**
 * Safe LocalStorage Utility with Fallback Mechanism
 * Ensures mistake analysis assets are never lost, even on parse failures, sandbox blocks, or QuotaExceededError.
 */

import { initialMistakes, defaultProfile } from "./mockData";
import { API_BASE_URL } from "./config/api";

// In-Memory Backup stream for session resilience
const memoryBackup: Record<string, string> = {
  "clm_user_mistakes": JSON.stringify(initialMistakes),
  "clm_user_profile": JSON.stringify(defaultProfile),
  "clm_user_streak": "25",
  "clm_is_logged_in": "false",
  "clm_user_evaluations": "[]"
};

const sessionMemoryBackup: Record<string, string> = {};
const REMOTE_STATE_BASE_PATH = `${API_BASE_URL}/api/state`;
const REMOTE_STATE_PREFIXES = ["clm_", "vone_"];
let remoteHydrationPromise: Promise<boolean> | null = null;

// Safe feature detection at module load to avoid security exceptions
let isLocalStorageAvailable = false;
let isSessionStorageAvailable = false;

try {
  if (typeof window !== "undefined" && window.localStorage) {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
  }
} catch (e) {
  isLocalStorageAvailable = false;
}

try {
  if (typeof window !== "undefined" && window.sessionStorage) {
    const testKey = "__session_test__";
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    isSessionStorageAvailable = true;
  }
} catch (e) {
  isSessionStorageAvailable = false;
}

/**
 * Triggers a web-wide custom event to show the gentle "数据重新构建中" UI toast/banner
 */
function triggerRecoveryToast(reason: string) {
  console.warn("Storage fallback activated. Reason:", reason);
  if (typeof window !== "undefined") {
    const event = new CustomEvent("clm-storage-recovery", {
      detail: {
        message: "数据重构中 · 已自动加载安全备份",
        reason
      }
    });
    window.dispatchEvent(event);
  }
}

function canSyncKeyRemotely(key: string) {
  return REMOTE_STATE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function warnRemoteSyncFailure(action: string, error: unknown) {
  console.warn(`Remote storage ${action} failed:`, error);
}

function getRemoteStateUrl(key: string) {
  return `${REMOTE_STATE_BASE_PATH}/${encodeURIComponent(key)}`;
}

async function sendRemoteState(key: string, value: string) {
  if (typeof window === "undefined" || typeof fetch === "undefined" || !canSyncKeyRemotely(key)) {
    return;
  }

  try {
    await fetch(getRemoteStateUrl(key), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ value }),
    });
  } catch (error) {
    warnRemoteSyncFailure(`write '${key}'`, error);
  }
}

async function deleteRemoteState(key: string) {
  if (typeof window === "undefined" || typeof fetch === "undefined" || !canSyncKeyRemotely(key)) {
    return;
  }

  try {
    await fetch(getRemoteStateUrl(key), {
      method: "DELETE",
      credentials: "include",
    });
  } catch (error) {
    warnRemoteSyncFailure(`delete '${key}'`, error);
  }
}

function collectSyncableLocalState() {
  const data: Record<string, string> = {};

  for (const [key, value] of Object.entries(memoryBackup)) {
    if (canSyncKeyRemotely(key)) {
      data[key] = value;
    }
  }

  if (!isLocalStorageAvailable) {
    return data;
  }

  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !canSyncKeyRemotely(key)) {
        continue;
      }

      const value = window.localStorage.getItem(key);
      if (typeof value === "string") {
        data[key] = value;
      }
    }
  } catch (error) {
    warnRemoteSyncFailure("collect local state", error);
  }

  return data;
}

export async function hydrateSafeStorageFromServer() {
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return false;
  }

  if (remoteHydrationPromise) {
    return remoteHydrationPromise;
  }

  remoteHydrationPromise = (async () => {
    try {
      const response = await fetch(REMOTE_STATE_BASE_PATH, {
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      const remoteData = payload?.data;
      if (!remoteData || typeof remoteData !== "object" || Array.isArray(remoteData)) {
        return false;
      }

      for (const [key, remoteValue] of Object.entries(remoteData)) {
        if (!canSyncKeyRemotely(key) || typeof remoteValue !== "string") {
          continue;
        }

        const localValue = isLocalStorageAvailable ? window.localStorage.getItem(key) : null;
        const valueToUse = localValue ?? remoteValue;
        memoryBackup[key] = valueToUse;

        if (isLocalStorageAvailable && localValue === null) {
          window.localStorage.setItem(key, remoteValue);
        }
      }

      const localState = collectSyncableLocalState();
      if (Object.keys(localState).length > 0) {
        await fetch(`${REMOTE_STATE_BASE_PATH}/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ data: localState }),
        });
      }

      return true;
    } catch (error) {
      warnRemoteSyncFailure("hydrate", error);
      return false;
    }
  })();

  return remoteHydrationPromise;
}

export const safeStorage = {
  getItem(key: string, defaultValue: string = ""): string {
    try {
      if (!isLocalStorageAvailable) {
        return memoryBackup[key] !== undefined ? memoryBackup[key] : defaultValue;
      }
      
      const item = window.localStorage.getItem(key);
      if (item === null) {
        // No item found, initialize it in backup memory and return default
        return memoryBackup[key] !== undefined ? memoryBackup[key] : defaultValue;
      }

      // If key is a JSON object, dry-run parse check to capture corruption early
      if (item.trim().startsWith("{") || item.trim().startsWith("[")) {
        try {
          JSON.parse(item);
        } catch (parseError) {
          triggerRecoveryToast(`Key '${key}' JSON parsing corrupted. Re-indexing backup config.`);
          const backupValue = memoryBackup[key] !== undefined ? memoryBackup[key] : defaultValue;
          // Repair broken local storage item immediately with backup stream
          this.setItem(key, backupValue);
          return backupValue;
        }
      }
      
      // Update memory backup stream to keep it hot
      memoryBackup[key] = item;
      return item;
    } catch (e: any) {
      triggerRecoveryToast(`Read blocked or failed: ${e.message || "Security Exception"}`);
      return memoryBackup[key] !== undefined ? memoryBackup[key] : defaultValue;
    }
  },

  setItem(key: string, value: string): boolean {
    // Keep internal memory backup completely synchronized
    memoryBackup[key] = value;
    void sendRemoteState(key, value);
    
    try {
      if (!isLocalStorageAvailable) {
        return false;
      }
      
      window.localStorage.setItem(key, value);
      return true;
    } catch (e: any) {
      // LocalStorage Quota Exceeded or Security Sandboxed Container Blocked
      triggerRecoveryToast(`写入限制 (${e.name === "QuotaExceededError" ? "空间溢出" : "权限受限"}) - 已切至高保真内存备份`);
      return false;
    }
  },

  removeItem(key: string) {
    delete memoryBackup[key];
    void deleteRemoteState(key);
    try {
      if (isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore
    }
  }
};

export const safeSessionStorage = {
  getItem(key: string, defaultValue: string = ""): string {
    try {
      if (!isSessionStorageAvailable) {
        return sessionMemoryBackup[key] !== undefined ? sessionMemoryBackup[key] : defaultValue;
      }
      return window.sessionStorage.getItem(key) || (sessionMemoryBackup[key] !== undefined ? sessionMemoryBackup[key] : defaultValue);
    } catch (e) {
      return sessionMemoryBackup[key] !== undefined ? sessionMemoryBackup[key] : defaultValue;
    }
  },

  setItem(key: string, value: string): boolean {
    sessionMemoryBackup[key] = value;
    try {
      if (!isSessionStorageAvailable) {
        return false;
      }
      window.sessionStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  },

  removeItem(key: string) {
    delete sessionMemoryBackup[key];
    try {
      if (isSessionStorageAvailable) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore
    }
  }
};
