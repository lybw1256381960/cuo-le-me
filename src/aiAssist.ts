import { MistakeCategory } from "./types";
import { API_BASE_URL } from "./config/api";

export type UiAttachment = {
  name: string;
  url: string;
  type: string;
  file?: File;
};

export type AiAssistResult = {
  title?: string;
  polished_text?: string;
  event_summary?: string;
  background_draft?: string;
  category_suggestion?: string;
  pain_level?: number;
  body_signals?: string[];
  emotions?: string[];
  pain_text?: string;
  emotion_text?: string;
  facts?: string[];
  direct_cause?: string;
  near_cause?: string;
  middle_cause?: string;
  distant_cause?: string;
  root_cause?: string;
  improvement_strategy?: string;
  principle_text?: string;
  next_action?: string;
  trigger_scene?: string;
  warning_signal?: string;
  tags?: string[];
  follow_up_questions?: string[];
  safety_note?: string;
  isSimulated?: boolean;
};

export type AiAssistPayload = {
  stage: "quick-note" | "analysis" | "5why";
  recordMethod?: string;
  rawText?: string;
  background?: string;
  category?: MistakeCategory | string;
  painLevel?: number;
  bodySignals?: string[];
  emotions?: string[];
  painText?: string;
  emotionText?: string;
  attachments?: UiAttachment[];
};

const MAX_IMAGE_BYTES = 1_250_000;
const MAX_TEXT_CHARS = 12_000;
const TEXT_FILE_PATTERN = /\.(txt|md|csv|json|log|xml|html|css|js|jsx|ts|tsx)$/i;

const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ""));
  reader.onerror = () => reject(reader.error || new Error("读取文件失败"));
  reader.readAsDataURL(file);
});

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("图片解析失败"));
  image.src = src;
});

async function prepareImageForAi(file: File) {
  const originalDataUrl = await readFileAsDataUrl(file);
  if (file.size <= MAX_IMAGE_BYTES) {
    return {
      data: originalDataUrl.includes(",") ? originalDataUrl.split(",")[1] : originalDataUrl,
      mimeType: file.type || "image/jpeg",
    };
  }

  const image = await loadImage(originalDataUrl);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    return {
      data: originalDataUrl.includes(",") ? originalDataUrl.split(",")[1] : originalDataUrl,
      mimeType: file.type || "image/jpeg",
    };
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
  return {
    data: compressedDataUrl.includes(",") ? compressedDataUrl.split(",")[1] : compressedDataUrl,
    mimeType: "image/jpeg",
  };
}

const isTextLikeFile = (file: File) => {
  return file.type.startsWith("text/") || TEXT_FILE_PATTERN.test(file.name);
};

async function buildAttachmentPayload(attachments: UiAttachment[] = []) {
  const payload = [];
  let imageCount = 0;

  for (const attachment of attachments.slice(0, 5)) {
    const file = attachment.file;
    const mimeType = file?.type || attachment.type || "application/octet-stream";
    const base = {
      name: attachment.name,
      type: attachment.type || mimeType,
      mimeType,
      size: file?.size || 0,
    };

    if (!file) {
      payload.push(base);
      continue;
    }

    if (mimeType.startsWith("image/") && imageCount < 3) {
      const imagePayload = await prepareImageForAi(file);
      payload.push({ ...base, type: imagePayload.mimeType, mimeType: imagePayload.mimeType, data: imagePayload.data });
      imageCount += 1;
      continue;
    }

    if (isTextLikeFile(file)) {
      const text = (await file.text()).slice(0, MAX_TEXT_CHARS);
      payload.push({ ...base, text });
      continue;
    }

    payload.push(base);
  }

  return payload;
}

async function requestLegacyReflectAssist(payload: AiAssistPayload): Promise<AiAssistResult> {
  const response = await fetch(`${API_BASE_URL}/api/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawText: payload.rawText,
      background: payload.background,
      category: payload.category,
      painLevel: payload.painLevel,
      bodySignals: payload.bodySignals,
      emotions: payload.emotions,
      painText: payload.painText,
      emotionText: payload.emotionText,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI剖析兜底失败: ${response.status}`);
  }

  const data = await response.json();
  return {
    title: data.title,
    polished_text: payload.rawText || data.event_summary,
    event_summary: data.event_summary,
    background_draft: payload.background,
    category_suggestion: String(payload.category || ""),
    pain_level: payload.painLevel,
    body_signals: payload.bodySignals,
    emotions: data.emotions || payload.emotions,
    pain_text: payload.painText,
    emotion_text: payload.emotionText,
    facts: data.facts,
    direct_cause: data.direct_cause,
    near_cause: data.near_cause,
    middle_cause: data.middle_cause,
    distant_cause: data.distant_cause,
    root_cause: data.root_cause,
    improvement_strategy: data.improvement_strategy,
    principle_text: data.principle_text,
    next_action: data.next_action,
    trigger_scene: data.tags?.length ? `下次遇到 ${data.tags.join("、")} 等类似场景时` : undefined,
    warning_signal: "心跳变快、语速变快、想立即辩解或逃避",
    tags: data.tags,
    follow_up_questions: [
      "这条草稿里还有哪个事实需要补充？",
      "下次遇到同类场景，我能先做哪一个小动作？",
      "根本原因是否真的能被我改变？"
    ],
    safety_note: data.safety_note || "这是兼容旧后端生成的AI草稿，可继续修改。",
    isSimulated: data.isSimulated,
  };
}

export async function requestAiNoteAssist(payload: AiAssistPayload): Promise<AiAssistResult> {
  const attachmentPayload = await buildAttachmentPayload(payload.attachments);
  const response = await fetch(`${API_BASE_URL}/api/ai-assist-note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stage: payload.stage,
      recordMethod: payload.recordMethod,
      rawText: payload.rawText,
      background: payload.background,
      category: payload.category,
      painLevel: payload.painLevel,
      bodySignals: payload.bodySignals,
      emotions: payload.emotions,
      painText: payload.painText,
      emotionText: payload.emotionText,
      attachments: attachmentPayload,
    }),
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 502 || response.status === 504) {
      return requestLegacyReflectAssist(payload);
    }
    throw new Error(`AI辅助生成失败: ${response.status}`);
  }

  return response.json();
}
