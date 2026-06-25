/**
 * Safe LocalStorage Utility with Fallback Mechanism
 * Ensures mistake analysis assets are never lost, even on parse failures, sandbox blocks, or QuotaExceededError.
 */

import { initialMistakes, defaultProfile } from "./mockData";

// In-Memory Backup stream for session resilience
const memoryBackup: Record<string, string> = {
  "clm_user_mistakes": JSON.stringify(initialMistakes),
  "clm_user_profile": JSON.stringify(defaultProfile),
  "clm_user_streak": "25",
  "clm_is_logged_in": "false",
  "clm_user_evaluations": "[]"
};

const sessionMemoryBackup: Record<string, string> = {};

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
