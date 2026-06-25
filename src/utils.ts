import { MistakeEntry } from "./types";

/**
 * Dynamic map calculations for pain level colors using HSL interpolation interfaces.
 * Maps pain rating values (1-7) to a continuous color curve:
 * - 1 is Cyan-Teal (170)
 * - 4 is Yellow (45)
 * - 7 is Red (0)
 */
export function getPainColorHSL(val: number) {
  const v = Math.min(7, Math.max(1, val));
  const t = (v - 1) / 6; // progress from 0 to 1
  
  // Interpolating Hues:
  // Level 1: Cyan-Teal/Mint (H=175)
  // Level 4: Warm Yellow (H=45)
  // Level 7: Coral Red (H=0)
  let h = 0;
  if (t <= 0.5) {
    // 175 down to 45
    h = 175 - (175 - 45) * (t / 0.5);
  } else {
    // 45 down to 0
    h = 45 - 45 * ((t - 0.5) / 0.5);
  }

  // Softening HSL output for a gentle, healing/therapy-themed pastel aesthetic
  // Saturation lowered from 82%+ to 45% - 55% for beautiful, premium low-intensity soft shades
  const bg = `hsl(${Math.round(h)}, 55%, 52%)`;
  const glow = `hsla(${Math.round(h)}, 55%, 52%, 0.22)`;
  const glowSoft = `hsla(${Math.round(h)}, 55%, 52%, 0.08)`;
  const shadow = `0 4px 12px hsla(${Math.round(h)}, 55%, 50%, 0.18)`;
  const diffuseGlow = `0 0 16px hsla(${Math.round(h)}, 55%, 52%, 0.25)`;
  
  // Card borders and outer soft halos for MistakesList
  const border = `hsla(${Math.round(h)}, 45%, 48%, 0.18)`;
  const borderHover = `hsla(${Math.round(h)}, 50%, 48%, 0.35)`;
  const cardGlow = `inset 0 0 3px rgba(255, 255, 255, 0.45), inset 0 1.5px 3.5px rgba(255, 255, 255, 0.45), 0 10px 30px hsla(${Math.round(h)}, 45%, 48%, 0.02)`;
  const cardGlowHover = `inset 0 0 3.5px rgba(255, 255, 255, 0.45), inset 0 2px 5px rgba(255, 255, 255, 0.45), 0 24px 44px hsla(${Math.round(h)}, 45%, 48%, 0.08)`;

  return {
    h,
    bg,
    glow,
    glowSoft,
    shadow,
    diffuseGlow,
    border,
    borderHover,
    cardGlow,
    cardGlowHover
  };
}

/**
 * Filters a list of mistake entries to match a specific date string (format YYYY-MM-DD) precisely.
 * Parses the ISO-8601 createdAt field and matches against the target date.
 */
export function filterMistakesByDate(mistakes: MistakeEntry[], targetDateStr: string): MistakeEntry[] {
  if (!targetDateStr) return [];
  
  return mistakes.filter(item => {
    if (!item.createdAt) return false;
    
    // Attempt standard slice if format is YYYY-MM-DD
    if (item.createdAt.startsWith(targetDateStr)) {
      return true;
    }
    
    // Parse to verify actual year-month-day matching
    try {
      const d = new Date(item.createdAt);
      if (isNaN(d.getTime())) return false;
      const year = d.getTime() ? d.getFullYear() : 0;
      const mIndex = d.getMonth();
      const monthStr = String(mIndex + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      const entryDateStr = `${year}-${monthStr}-${dayStr}`;
      return entryDateStr === targetDateStr;
    } catch (_) {
      return false;
    }
  });
}

/**
 * Checks if a mistake entry meets the criteria to be classified as a Draft.
 * A mistake is classified as a Draft ONLY if:
 * 1. It is explicitly marked as draft (isDraft === true).
 * 2. It has NOT been described clearly (e.g., rawText is empty or too short).
 * 3. It is still pending reflection (status === "待反思") AND multiple steps were skipped/left completely empty (meaning no substantial content was entered in background, pain, emotions, causes).
 * 4. Otherwise, if it has been described clearly, or has a generated principle, or has been reflected/archived, it remains in the mistake book (错题本).
 */
export function isMistakeDraft(item: MistakeEntry): boolean {
  // If explicitly flagged as draft
  if (item.isDraft === true) {
    return true;
  }

  // If the raw description is missing or extremely barebones
  if (!item.rawText || item.rawText.trim() === "" || item.rawText.trim().length < 5) {
    return true;
  }

  // If it is already reflected/archived or has a principle, it is NEVER a draft
  if (item.status === "已生成原则" || item.status === "已归档" || (item.principleText && item.principleText.trim() !== "")) {
    return false;
  }

  // For pending mistakes ("待反思"), check if multiple steps were skipped.
  // Count key empty fields
  const isBackgroundEmpty = !item.background || item.background.trim() === "";
  const isPainTextEmpty = !item.painText || item.painText.trim() === "";
  const isEmotionTextEmpty = !item.emotionText || item.emotionText.trim() === "";
  const isDirectCauseEmpty = !item.directCause || item.directCause.trim() === "";

  let emptyStepsCount = 0;
  if (isBackgroundEmpty) emptyStepsCount++;
  if (isPainTextEmpty) emptyStepsCount++;
  if (isEmotionTextEmpty) emptyStepsCount++;
  if (isDirectCauseEmpty) emptyStepsCount++;

  // If they skipped 3 or more steps out of these 4 key parts, AND they haven't finished reflection, classify it as a draft.
  // This keeps the mistake book clean from heavily skipped, empty-clickthrough sessions.
  if (emptyStepsCount >= 3 && item.status === "待反思") {
    return true;
  }

  return false;
}

/**
 * Safely copy text to whiteboard/clipboard, compatible with sandboxed iframes.
 */
export function safeCopyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch((err) => {
        console.warn("Failed to copy with navigator.clipboard:", err);
        return fallbackCopy(text);
      });
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return !!successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
}


