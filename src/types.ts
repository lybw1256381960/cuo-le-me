export enum MistakeCategory {
  COMMUNICATION = "沟通",
  PROCRASTINATION = "拖延",
  DECISION = "决策",
  EMOTION = "控制",
  HABIT = "习惯",
  OTHER = "其他",
}

export interface MistakeEntry {
  id: string;
  rawText: string;
  background?: string;
  category: MistakeCategory;
  painLevel: number; // 1-7
  bodySignals: string[];
  emotions: string[];
  painText?: string;
  emotionText?: string;
  createdAt: string;
  status: "待反思" | "已生成原则" | "复发过" | "已改善" | "已归档";
  tags?: string[];
  isDraft?: boolean;
  attachments?: { name: string; url: string; type: string; file?: File }[];
  
  // Reflection fields (AI summaries)
  title?: string;
  eventSummary?: string;
  facts?: string[];
  directCause?: string;
  nearCause?: string;
  middleCause?: string;
  distantCause?: string;
  rootCause?: string;
  improvementStrategy?: string;
  principleText?: string;
  nextAction?: string;
  triggerScene?: string;
  warningSignal?: string;
  hasReminder?: boolean;
  reminderScene?: string;
  reminderFrequency?: string;
  reminderTime?: string;
  enablePush?: boolean;
  pushTime?: string;
  
  // Recurrence / Review Log history
  recurrenceNote?: string;
  recurrenceLog?: Array<{
    date: string;
    note: string;
    wasEffective: string; // "有效" | "部分有效" | "无效"
    needsUpdate: string; // "不需要" | "需要微调" | "需要重写"
  }>;
}

export interface UserProfile {
  nickname: string;
  statusText: string;
  avatarEmoji: string;
  aiTone: "温和陪伴" | "理性倾听" | "麻辣批判" | "严肃顾问";
  isPrivateOnly: boolean;
}
