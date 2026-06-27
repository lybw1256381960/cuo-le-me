import React, { useState, useEffect, useRef } from "react";
import { Home, BookOpen, Award, User, Compass, Mic, Plus, Clock, X, Camera, ImageIcon, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
import { MistakeEntry, MistakeCategory, UserProfile } from "./types";

// Mock preloads
import { initialMistakes, defaultProfile } from "./mockData";
import { hydrateSafeStorageFromServer, safeStorage, safeSessionStorage } from "./storage";
import { isMistakeDraft } from "./utils";
import GlassIcon from "./components/GlassIcon";

// Components & Screens
import MobileFrame from "./components/MobileFrame";
import HomeDashboard from "./components/screens/HomeDashboard";
import QuickNote from "./components/screens/QuickNote";
import StepAnalysis from "./components/screens/StepAnalysis";
import MistakesList from "./components/screens/MistakesList";
import MistakeDetail from "./components/screens/MistakeDetail";
import PrinciplesLibrary from "./components/screens/PrinciplesLibrary";
import PrincipleDetail from "./components/screens/PrincipleDetail";
import ReminderSettings from "./components/screens/ReminderSettings";
import RecurrenceMark from "./components/screens/RecurrenceMark";
import PersonalReport from "./components/screens/PersonalReport";
import SettingsPage from "./components/screens/SettingsPage";
import DraftBox from "./components/screens/DraftBox";

// High-Fidelity Brand Integration mockups
import BrandGuide from "./components/BrandGuide";
import BreathMeditation from "./components/screens/BreathMeditation";
import MoodCheckin from "./components/screens/MoodCheckin";
import WelcomeScreen from "./components/screens/WelcomeScreen";
import OnboardingGuide from "./components/screens/OnboardingGuide";

export default function App() {
  const appHostRef = useRef<HTMLDivElement>(null);
  const isDraggingMicRef = useRef<boolean>(false);
  const [micPos, setMicPos] = useState(() => {
    try {
      const saved = safeStorage.getItem("vone_mic_position");
      if (saved) {
        const parsed = JSON.parse(saved);
        let rx = parseFloat(parsed.x);
        let ry = parseFloat(parsed.y);
        if (isNaN(rx)) rx = 0;
        if (isNaN(ry)) ry = 0;
        // Bulletproof clamp: ensure the bubble stays within visible viewport bounds
        const clampedX = Math.max(-280, Math.min(20, rx));
        const clampedY = Math.max(-550, Math.min(50, ry));
        return { x: clampedX, y: clampedY };
      }
      return { x: 0, y: 0 };
    } catch {
      return { x: 0, y: 0 };
    }
  });
  // Login Session & Flow States
  // [SCREENSHOT MODE] Bypass splash/login/onboarding for screenshot script
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);

  const handleOnboardingComplete = () => {
    safeSessionStorage.setItem("clm_has_completed_onboarding", "true");
    safeStorage.setItem("clm_has_completed_onboarding", "true");
    setHasCompletedOnboarding(true);
    setCurrentTab("首页");
    setActiveSubScreen(null);
  };

  // Main Tab State
  const [currentTab, currentTabSet] = useState<"首页" | "错题" | "原则" | "我的">("首页");
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const setCurrentTab = (t: "首页" | "错题" | "原则" | "我的") => {
    if (t === currentTab) return;
    setIsTabLoading(true);
    setTimeout(() => {
      currentTabSet(t);
    }, 240);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 580);
  };
  
  // Overlay Portal State
  const [activeSubScreen, setActiveSubScreen] = useState<
    | null
    | "quickNote"
    | "voiceAssistant"
    | "analyse"
    | "mistakeDetail"
    | "principleDetail"
    | "reminderSettings"
    | "recurrenceMark"
    | "personalReport"
    | "breathMeditation"
    | "moodDailyCheckin"
    | "draftBox"
  >(null);

  const [resumedDraft, setResumedDraft] = useState<MistakeEntry | null>(null);

  // Voice Interaction States
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceMethodToOpen, setVoiceMethodToOpen] = useState<string>("语音");
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string>("");

  const startVoiceAssistantSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("设备暂时无法调用麦克风录入。");
      setIsVoiceRecording(true);
      setTimeout(() => {
        setVoiceTranscript("刚才给客户汇报方案的时候，我的有些论据准备不够充分，面对客户的连续质问，我瞬间感觉手心出汗、心跳加速，整个人非常紧绷...");
        setIsVoiceRecording(false);
      }, 2400);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        setVoiceError("");
      };

      recognition.onerror = (e: any) => {
        setVoiceError(`识别失败: ${e.error || "网络微扰"}`);
        setIsVoiceRecording(false);
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVoiceTranscript(transcript);
        }
      };

      recognition.start();
    } catch (err: any) {
      setVoiceError(`初始化失败: ${err.message}`);
      setIsVoiceRecording(false);
    }
  };

  // Vone.Lin synchrony states
  const [currentMockupType, setCurrentMockupType] = useState<"morning" | "mood" | "breathing" | "insights" | "default">("default");
  const [showMobileBrand, setShowMobileBrand] = useState(false);
  const [showMicOnboarding, setShowMicOnboarding] = useState<boolean>(false);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  // Error Recovery UI Message State
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const globalToastTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const handleRecovery = (e: any) => {
      setRecoveryMessage(e.detail?.message || "数据重构中 · 已自动加载安全备份");
      setTimeout(() => {
        setRecoveryMessage(null);
      }, 3500);
    };
    
    const handleSystemToast = (e: any) => {
      if (e.detail && e.detail.message) {
        setGlobalToast(e.detail.message);
        if (globalToastTimeoutRef.current) {
          clearTimeout(globalToastTimeoutRef.current);
        }
        globalToastTimeoutRef.current = setTimeout(() => {
          setGlobalToast(null);
        }, 4500);
      }
    };

    window.addEventListener("clm-storage-recovery", handleRecovery);
    window.addEventListener("app-system-toast", handleSystemToast as EventListener);
    return () => {
      window.removeEventListener("clm-storage-recovery", handleRecovery);
      window.removeEventListener("app-system-toast", handleSystemToast as EventListener);
      if (globalToastTimeoutRef.current) {
        clearTimeout(globalToastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const isDismissed = safeStorage.getItem("vone_mic_onboarding_dismissed") === "true";
    if (!isDismissed) {
      setShowMicOnboarding(true);
    }
  }, []);

  // Core Data States
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [selectedMistakeId, setSelectedMistakeId] = useState<string | null>(null);
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState<number>(25);
  const [skipAnalyzeStage, setSkipAnalyzeStage] = useState<boolean>(false);

  // Initialize and load persistent data from database-backed safe storage
  useEffect(() => {
    let isMounted = true;

    const loadPersistentData = async () => {
      await hydrateSafeStorageFromServer();

      if (!isMounted) {
        return;
      }

      const savedMistakes = safeStorage.getItem("clm_user_mistakes");
      const savedProfile = safeStorage.getItem("clm_user_profile");
      const savedStreak = safeStorage.getItem("clm_user_streak");

      if (savedMistakes) {
        try {
          setMistakes(JSON.parse(savedMistakes));
        } catch (e) {
          setMistakes(initialMistakes);
        }
      } else {
        setMistakes(initialMistakes);
        safeStorage.setItem("clm_user_mistakes", JSON.stringify(initialMistakes));
      }

      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
        } catch (e) {
          setUserProfile(defaultProfile);
        }
      }

      if (savedStreak) {
        setStreakCount(parseInt(savedStreak));
      }

      setIsDataReady(true);
    };

    loadPersistentData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state modifications to browser storage
  const saveMistakesToStorage = (updatedList: MistakeEntry[]) => {
    setMistakes(updatedList);
    safeStorage.setItem("clm_user_mistakes", JSON.stringify(updatedList));
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    safeStorage.setItem("clm_user_profile", JSON.stringify(updatedProfile));
  };

  // Revert / Restore built-in demo datasets for test cycles
  const handleRestoreDemoData = () => {
    setMistakes(initialMistakes);
    setSelectedMistakeId(null);
    setSelectedPrincipleId(null);
    setStreakCount(25);
    safeStorage.setItem("clm_user_mistakes", JSON.stringify(initialMistakes));
    safeStorage.setItem("clm_user_streak", "25");
    safeStorage.removeItem("clm_has_completed_onboarding");
    safeSessionStorage.removeItem("clm_has_completed_onboarding");
    setHasCompletedOnboarding(false);
    setCurrentTab("首页");
    setActiveSubScreen(null);
  };

  // Callback: Save new mistake record from StepAnalysis Wizards
  const handleSaveMistake = (entry: MistakeEntry) => {
    const exists = mistakes.find((x) => x.id === entry.id);
    let updated: MistakeEntry[];
    if (exists) {
      updated = mistakes.map((x) => (x.id === entry.id ? entry : x));
    } else {
      updated = [entry, ...mistakes];
      // Increment personal streak
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      safeStorage.setItem("clm_user_streak", nextStreak.toString());
    }
    saveMistakesToStorage(updated);
    
    // Auto highlight created detail
    setSelectedMistakeId(entry.id);
  };

  // Callback: Save quick note logs converting to revision workflows
  const handleSaveQuickNote = (
    draft: Partial<MistakeEntry>, 
    startReview: boolean, 
    skipToReflection: boolean = false,
    draftIdToReplace?: string
  ) => {
    const existing = draftIdToReplace ? mistakes.find((m) => m.id === draftIdToReplace) : null;
    const fullDraft: MistakeEntry = {
      id: draftIdToReplace || "m-" + Date.now(),
      rawText: draft.rawText || "未命名快速草稿",
      background: draft.background || existing?.background,
      category: draft.category || MistakeCategory.OTHER,
      painLevel: draft.painLevel || 3,
      bodySignals: draft.bodySignals || [],
      emotions: draft.emotions || [],
      painText: draft.painText || existing?.painText,
      emotionText: draft.emotionText || existing?.emotionText,
      createdAt: existing?.createdAt || new Date().toISOString().substring(0, 16).replace("T", " "),
      status: draftIdToReplace ? (existing?.status || "待反思") : "待反思",
      isDraft: draft.isDraft,
      tags: draft.tags || existing?.tags || [],
      attachments: draft.attachments || existing?.attachments,
      title: draft.title || existing?.title,
      eventSummary: draft.eventSummary || existing?.eventSummary,
      facts: draft.facts || existing?.facts,
      directCause: draft.directCause || existing?.directCause,
      nearCause: draft.nearCause || existing?.nearCause,
      middleCause: draft.middleCause || existing?.middleCause,
      distantCause: draft.distantCause || existing?.distantCause,
      rootCause: draft.rootCause || existing?.rootCause,
      improvementStrategy: draft.improvementStrategy || existing?.improvementStrategy,
      principleText: draft.principleText || existing?.principleText,
      nextAction: draft.nextAction || existing?.nextAction,
      triggerScene: draft.triggerScene || existing?.triggerScene,
      warningSignal: draft.warningSignal || existing?.warningSignal,
      recurrenceLog: existing?.recurrenceLog || [],
    };

    let updated: MistakeEntry[];
    if (draftIdToReplace) {
      updated = mistakes.map((item) => item.id === draftIdToReplace ? fullDraft : item);
    } else {
      updated = [fullDraft, ...mistakes];
    }
    saveMistakesToStorage(updated);
    
    // Reset resumed state
    setResumedDraft(null);

    if (draft.isDraft) {
      setActiveSubScreen("draftBox");
    } else if (startReview) {
      // Launch 5Why 6-step deep analyzer directly
      setSelectedMistakeId(fullDraft.id);
      setSkipAnalyzeStage(skipToReflection);
      setActiveSubScreen("analyse");
    } else {
      // Direct save and open list
      setCurrentTab("错题");
      setActiveSubScreen(null);
    }
  };

  // Callback: Save Reminder setting properties
  const handleSaveReminderSet = (id: string, rem: { scene: string; frequency: string; time: string; enablePush: boolean; pushTime: string }) => {
    const updated = mistakes.map((x) => {
      if (x.id === id) {
        return {
          ...x,
          hasReminder: true,
          reminderScene: rem.scene,
          reminderFrequency: rem.frequency,
          reminderTime: rem.time,
          enablePush: rem.enablePush,
          pushTime: rem.pushTime,
        };
      }
      return x;
    });
    saveMistakesToStorage(updated);
    setActiveSubScreen("principleDetail"); // return path
  };

  // State variables for Active Notification Banner & Practicing Evaluation Questionnaire
  const [activeNotification, setActiveNotification] = useState<{
    principleId: string;
    title: string;
    principleText: string;
  } | null>(null);

  const [showEvaluationModalId, setShowEvaluationModalId] = useState<string | null>(null);
  const [evaluationScore, setEvaluationScore] = useState<number>(5);
  const [evaluationNote, setEvaluationNote] = useState<string>("");

  // Register system-wide trigger for simulated push reminders
  useEffect(() => {
    (window as any).vone_trigger_test_push = (id: string, title: string, text: string) => {
      setActiveNotification({
        principleId: id,
        title,
        principleText: text,
      });
    };
    return () => {
      delete (window as any).vone_trigger_test_push;
    };
  }, []);

  // Save the score into Recharts and log feedback histories
  const handleSaveEvaluation = (principleId: string, score: number, note: string) => {
    const saved = safeStorage.getItem("clm_user_evaluations");
    let arr: any[] = [];
    if (saved) {
      try { arr = JSON.parse(saved); } catch(e) {}
    }
    const newEval = {
      id: "eval-" + Date.now(),
      principleId,
      score,
      note,
      date: new Date().toISOString().substring(0, 10)
    };
    arr.push(newEval);
    safeStorage.setItem("clm_user_evaluations", JSON.stringify(arr));

    const updated = mistakes.map((x) => {
      if (x.id === principleId) {
        return {
          ...x,
          status: "已生成原则" as const,
          recurrenceLog: [
            ...(x.recurrenceLog || []),
            {
              date: new Date().toISOString().substring(0, 10),
              note: `【每日践行评分: ${score}/7】自省心得: "${note || "今天完美笃行达标！"}"`,
              wasEffective: "有效",
              needsUpdate: "否"
            }
          ]
        };
      }
      return x;
    });
    saveMistakesToStorage(updated);

    // Hide mod & reset
    setShowEvaluationModalId(null);
    setEvaluationScore(5);
    setEvaluationNote("");

    // Auto navigate to the analysis chart
    setActiveSubScreen("personalReport");
    setCurrentMockupType("default");
  };

  // Callback: Commit a recurrence mistake log (Screenshot 11 "是否又犯了?")
  const handleSaveRecurrenceCheckin = (id: string, log: { note: string; wasEffective: string; needsUpdate: string }) => {
    const dateToday = new Date().toISOString().substring(0, 10);
    const updated = mistakes.map((x) => {
      if (x.id === id) {
        const itemHistory = x.recurrenceLog || [];
        return {
          ...x,
          status: "复发过" as const,
          recurrenceLog: [
            ...itemHistory,
            {
              date: dateToday,
              note: log.note,
              wasEffective: log.wasEffective,
              needsUpdate: log.needsUpdate,
            },
          ],
        };
      }
      return x;
    });
    saveMistakesToStorage(updated);
    
    // Switch path to show update principle or mistake files
    setActiveSubScreen("mistakeDetail");
  };

  // Active object finders
  const activeMistakeObj = selectedMistakeId ? mistakes.find((x) => x.id === selectedMistakeId) || null : null;
  const activePrincipleObj = selectedPrincipleId ? mistakes.find((x) => x.id === selectedPrincipleId) || null : null;

  const handleSelectMockup = (type: "morning" | "mood" | "breathing" | "insights" | "default") => {
    setCurrentMockupType(type);
    if (type === "morning") {
      setCurrentTab("首页");
      setActiveSubScreen(null);
    } else if (type === "mood") {
      setActiveSubScreen("moodDailyCheckin");
    } else if (type === "breathing") {
      setActiveSubScreen("breathMeditation");
    } else if (type === "insights") {
      setActiveSubScreen("personalReport");
    } else {
      setActiveSubScreen(null);
    }
  };

  return (
    <div 
      id="vone-workspace-root" 
      className="min-h-screen w-full flex items-center justify-center py-4 px-2 overflow-hidden relative bg-[#EBF7EE]"
      style={{
        background: `
          radial-gradient(circle at 85% 12%, rgba(251, 255, 80, 0.45) 0%, rgba(251, 255, 80, 0) 55%),
          radial-gradient(circle at 15% 42%, rgba(142, 255, 108, 0.4) 0%, rgba(142, 255, 108, 0) 65%),
          radial-gradient(circle at 65% 88%, rgba(45, 230, 217, 0.45) 0%, rgba(45, 230, 217, 0) 55%),
          radial-gradient(circle at 50% 50%, rgba(245, 253, 248, 0.95) 0%, rgba(245, 253, 248, 0.5) 100%)
        `
      }}
    >
      {/* Decorative calm background ambient light orbs */}
      <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-[#E0F0F8]/25 blur-3xl pointer-events-none select-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-[#C0E890]/15 blur-3xl pointer-events-none select-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[40%] right-[25%] w-80 h-80 rounded-full bg-[#FFF9B1]/25 blur-3xl pointer-events-none select-none animate-pulse" style={{ animationDuration: '12s' }} />

      {/* Floating subtle brand name background label */}
      <div className="absolute top-6 left-8 hidden md:block select-none opacity-40">
        <span className="text-[10px] font-black tracking-widest text-[#5E7F73] uppercase font-mono">Ocean Calm Wave Series · Vone.Lin</span>
      </div>

      {/* Responsive centered phone chassis */}
      <div className="relative scale-95 sm:scale-100 transition-all duration-300">
        <MobileFrame>
          {/* Global SVG definitions for premium gradients */}
          <svg className="absolute w-0 h-0 pointer-events-none" width="0" height="0">
            <defs>
              <linearGradient id="premiumYGBGrad" x1="10%" y1="10%" x2="90%" y2="90%">
                <stop offset="0%" stopColor="#FFF886" stopOpacity={0.9} />   {/* High-end Clear Pastel Yellow */}
                <stop offset="45%" stopColor="#34D399" stopOpacity={0.9} />  {/* Clear Mint/Teal Green */}
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.9} /> {/* Clear Sky/Pastel Blue */}
              </linearGradient>
            </defs>
          </svg>

          {recoveryMessage && (
            <div className="absolute top-16 left-4 right-4 bg-[#FFF9E6]/95 border border-amber-500/20 p-2.5 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 animate-fade-in text-[10.5px] text-amber-900 font-extrabold select-none backdrop-blur-md">
              <div className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 animate-pulse">
                ⚙️
              </div>
              <div className="flex-1 min-w-0">
                <p className="leading-tight">{recoveryMessage}</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {globalToast && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.95 }}
                onClick={() => setGlobalToast(null)}
                className="absolute top-16 left-4 right-4 bg-stone-900/95 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-xl z-50 flex items-start gap-2.5 cursor-pointer border border-white/10 select-none"
              >
                <div className="shrink-0">
                  <GlassIcon emoji="🌱" size="xs" />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-[11px] font-bold leading-normal text-left">{globalToast}</p>
                </div>
                <X className="w-3.5 h-3.5 text-white/50 shrink-0 hover:text-white self-center" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isDataReady ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full px-8 text-center bg-white/35">
              <div className="w-14 h-14 rounded-full bg-white/80 border border-white/70 shadow-[0_8px_28px_rgba(30,63,57,0.12)] flex items-center justify-center animate-pulse">
                <GlassIcon emoji="🌱" size="sm" />
              </div>
              <p className="mt-4 text-xs font-black tracking-widest text-[#1E3F39]">同步自省数据中</p>
              <p className="mt-1 text-[10px] font-semibold text-[#5B6B67]">正在连接本地数据库...</p>
            </div>
          ) : !isLoggedIn ? (
            <WelcomeScreen 
              onLoginSuccess={(method) => {
                safeSessionStorage.setItem("clm_is_logged_in", "true");
                safeSessionStorage.removeItem("clm_has_completed_onboarding");
                safeStorage.setItem("clm_is_logged_in", "true");
                setIsLoggedIn(true);
                safeStorage.removeItem("clm_has_completed_onboarding");
                setHasCompletedOnboarding(false);
              }} 
            />
          ) : !hasCompletedOnboarding ? (
            <OnboardingGuide onComplete={handleOnboardingComplete} />
          ) : (
            <div 
              id="portable-app-host" 
              ref={appHostRef} 
              className="flex-1 flex flex-col h-full relative overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 85% 12%, rgba(251, 255, 80, 0.45) 0%, rgba(251, 255, 80, 0) 55%),
                  radial-gradient(circle at 15% 42%, rgba(142, 255, 108, 0.4) 0%, rgba(142, 255, 108, 0) 65%),
                  radial-gradient(circle at 65% 88%, rgba(45, 230, 217, 0.45) 0%, rgba(45, 230, 217, 0) 55%),
                  radial-gradient(circle at 50% 50%, rgba(245, 253, 248, 0.95) 0%, rgba(245, 253, 248, 0.5) 100%)
                `
              }}
            >
              
              {/* Diffuse yellow-blue-green 'breathing light' loader overlay for tab changes */}
              <AnimatePresence>
                {isTabLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
                    style={{
                      background: `
                        radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.35) 0%, rgba(56, 189, 248, 0) 60%),
                        radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0) 60%),
                        radial-gradient(circle at 50% 50%, rgba(253, 230, 138, 0.28) 0%, rgba(253, 230, 138, 0) 60%),
                        rgba(255, 255, 255, 0.82)
                      `,
                      backdropFilter: "blur(28px) saturate(160%) brightness(105%)"
                    }}
                  >
                    {/* SVG gooey liquid filter definition */}
                    <svg className="absolute w-0 h-0" width="0" height="0">
                      <defs>
                        <filter id="gooey-fluid-loader">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
                          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                        </filter>
                      </defs>
                    </svg>

                    {/* Gooey connected liquid bubbles layer with blue, yellow and green colors */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ filter: "url(#gooey-fluid-loader)" }}>
                      {/* Floating round liquid cells */}
                      <motion.div
                        className="absolute w-28 h-28 rounded-full bg-emerald-400/35"
                        style={{ left: "28%", top: "36%" }}
                        animate={{
                          x: [0, 48, -25, 0],
                          y: [0, -32, 38, 0],
                          scale: [1, 1.15, 0.9, 1]
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute w-24 h-24 rounded-full bg-sky-400/35"
                        style={{ left: "48%", top: "42%" }}
                        animate={{
                          x: [0, -42, 32, 0],
                          y: [0, 38, -28, 0],
                          scale: [1.1, 0.88, 1.15, 1.1]
                        }}
                        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      />
                      <motion.div
                        className="absolute w-26 h-26 rounded-full bg-amber-300/30"
                        style={{ left: "38%", top: "44%" }}
                        animate={{
                          x: [-15, 28, -35, -15],
                          y: [10, 25, -30, 10],
                          scale: [0.93, 1.12, 0.96, 0.93]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                      />
                    </div>

                    {/* Highly readable text content layered on top */}
                    <div className="relative z-10 flex flex-col items-center">
                      <motion.div 
                        className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.18)] border border-white/80 relative"
                        animate={{
                          scale: [0.93, 1.05, 0.93],
                          boxShadow: [
                            "0 8px 32px rgba(16,185,129,0.15)",
                            "0 12px 48px rgba(56,189,248,0.25)",
                            "0 8px 32px rgba(16,185,129,0.15)"
                          ]
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="animate-bounce">
                          <GlassIcon emoji="🌱" size="sm" />
                        </div>
                      </motion.div>
                      
                      <h4 className="mt-5 text-sm font-black tracking-widest text-[#1E3F39] uppercase font-display">
                        自省空间唤醒中
                      </h4>
                      <p className="mt-1.5 text-[11px] text-[#5B6B67] font-semibold max-w-[210px] leading-relaxed">
                        正在载入时光轨迹与不二过原则提示...
                      </p>
                      
                      <div className="flex gap-2 justify-center items-center mt-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* ================= PRIMARY NAVIGATION CHANNELS (TABS BODY) ================= */}
              {(activeSubScreen === null || activeSubScreen === "voiceAssistant") && (
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent">
                  
                  {/* View selectors based on current active bottom tab */}
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {currentTab === "首页" && (
                      <HomeDashboard
                        user={userProfile}
                        streakCount={streakCount}
                        onNavigateToReflect={() => {
                          setSelectedMistakeId(null);
                          setVoiceMethodToOpen("文本记录");
                          setActiveSubScreen("quickNote");
                        }}
                        onNavigateToReport={() => setActiveSubScreen("personalReport")}
                        onNavigateToPrinciples={() => setCurrentTab("原则")}
                        onNavigateToQuickNote={() => { setVoiceMethodToOpen("文本记录"); setActiveSubScreen("quickNote"); }}
                        onNavigateToAnalyse={() => {
                          setSelectedMistakeId(null);
                          setActiveSubScreen("analyse");
                        }}
                        onNavigateToMistakesList={() => {
                          setCurrentTab("错题");
                        }}
                        onNavigateToMood={() => setActiveSubScreen("moodDailyCheckin")}
                        onNavigateToBreathing={() => setActiveSubScreen("breathMeditation")}
                        onNavigateToDraftBox={() => setActiveSubScreen("draftBox")}
                      />
                    )}

                    {currentTab === "错题" && (
                      <MistakesList
                        mistakes={mistakes}
                        onSelectMistake={(id) => {
                          setSelectedMistakeId(id);
                          setActiveSubScreen("mistakeDetail");
                        }}
                        onStartNewReflect={() => {
                          setSelectedMistakeId(null);
                          setActiveSubScreen("analyse");
                        }}
                        onUpdateMistakes={saveMistakesToStorage}
                        onOpenDraftBox={() => {
                          setActiveSubScreen("draftBox");
                        }}
                      />
                    )}

                    {currentTab === "原则" && (
                      <PrinciplesLibrary
                        mistakes={mistakes}
                        onSelectPrinciple={(id) => {
                          setSelectedPrincipleId(id);
                          setActiveSubScreen("principleDetail");
                        }}
                        onOpenReminderSetup={(item) => {
                          setSelectedPrincipleId(item.id);
                          setActiveSubScreen("reminderSettings");
                        }}
                      />
                    )}

                    {currentTab === "我的" && (
                      <SettingsPage
                        user={userProfile}
                        onChangeUser={handleUpdateProfile}
                        onRestoreMockData={handleRestoreDemoData}
                        onOpenReport={() => setActiveSubScreen("personalReport")}
                        onLogout={() => {
                          safeSessionStorage.removeItem("clm_is_logged_in");
                          safeSessionStorage.removeItem("clm_has_completed_onboarding");
                          safeStorage.removeItem("clm_is_logged_in");
                          safeStorage.removeItem("clm_has_completed_onboarding");
                          setIsLoggedIn(false);
                          setHasCompletedOnboarding(false);
                        }}
                      />
                    )}
                  </div>

                  {/* Persistent bottom navigation ribbon matching PRD/Images with rounded high-end curves */}
                  <div 
                    id="global-bottom-bar-navigation" 
                    className="absolute bottom-0 left-0 right-0 h-18 bg-white/40 border-t border-white/60 backdrop-blur-[24px] flex items-center justify-around px-2 z-40 select-none pb-2 pt-1.5 rounded-t-[28px] shadow-[0_-5px_24px_rgba(30,63,57,0.06)]"
                    style={{ marginLeft: "0px", paddingLeft: "10px" }}
                  >
                    {[
                      { name: "首页", icon: "home" },
                      { name: "错题", icon: "book" },
                      { name: "原则", icon: "award" },
                      { name: "我的", icon: "user" },
                    ].map((tab, idx) => {
                      const isSelected = currentTab === tab.name;
                      const styleClass = `w-5 h-5 transition-transform duration-200 ${
                        isSelected ? "scale-112" : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`;

                      const renderNavIcon = () => {
                        if (tab.icon === "home") {
                          return (
                            <svg viewBox="0 0 24 24" fill="none" className={styleClass}>
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={isSelected ? "url(#premiumYGBGrad)" : "none"} fillOpacity={isSelected ? 0.22 : 0} />
                              <path d="M9 22V12h6v10" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          );
                        }
                        if (tab.icon === "book") {
                          return (
                            <svg viewBox="0 0 24 24" fill="none" className={styleClass}>
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={isSelected ? "url(#premiumYGBGrad)" : "none"} fillOpacity={isSelected ? 0.22 : 0} />
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={isSelected ? "url(#premiumYGBGrad)" : "none"} fillOpacity={isSelected ? 0.22 : 0} />
                            </svg>
                          );
                        }
                        if (tab.icon === "award") {
                          return (
                            <svg viewBox="0 0 24 24" fill="none" className={styleClass}>
                              <circle cx="12" cy="8" r="7" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={isSelected ? "url(#premiumYGBGrad)" : "none"} fillOpacity={isSelected ? 0.22 : 0} />
                              <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          );
                        }
                        // user
                        return (
                          <svg viewBox="0 0 24 24" fill="none" className={styleClass}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="7" r="4" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={isSelected ? "url(#premiumYGBGrad)" : "none"} fillOpacity={isSelected ? 0.22 : 0} />
                          </svg>
                        );
                      };

                      return (
                        <div
                          key={tab.name}
                          onClick={() => setCurrentTab(tab.name as any)}
                          role="button"
                          tabIndex={0}
                          className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all active:scale-90 cursor-pointer outline-none"
                        >
                          <div className="flex flex-col items-center justify-center">
                            {renderNavIcon()}
                            <span 
                              className={`text-[10px] mt-1 font-bold font-display scale-95 tracking-wide ${isSelected ? "text-[#34D399] font-black" : "text-stone-500"}`}
                              style={idx === 0 ? { width: "24.25px", marginLeft: "0px", paddingLeft: "0px", paddingTop: "0px" } : undefined}
                            >
                              {tab.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* End of tab channels body */}
                </div>
              )}

              {/* Floating Mic QuickNote Trigger with Framer Motion Draggable (appears globally on other screens too) */}
              {activeSubScreen !== "quickNote" && activeSubScreen !== "voiceAssistant" && activeSubScreen !== "analyse" && activeSubScreen !== "breathMeditation" && activeSubScreen !== "moodDailyCheckin" && (
                <motion.div
                  drag
                  dragConstraints={appHostRef}
                  dragElastic={0.1}
                  dragMomentum={false}
                  onDragStart={() => {
                    isDraggingMicRef.current = true;
                    // Auto-hide onboarding on drag
                    safeStorage.setItem("vone_mic_onboarding_dismissed", "true");
                    setShowMicOnboarding(false);
                  }}
                  onDragEnd={(event, info) => {
                    let nextX = micPos.x + (info.offset.x || 0);
                    let nextY = micPos.y + (info.offset.y || 0);
                    if (isNaN(nextX)) nextX = 0;
                    if (isNaN(nextY)) nextY = 0;
                    // Clamp to safe screen coordinates
                    const clampedX = Math.max(-280, Math.min(20, nextX));
                    const clampedY = Math.max(-550, Math.min(50, nextY));
                    setMicPos({ x: clampedX, y: clampedY });
                    safeStorage.setItem("vone_mic_position", JSON.stringify({ x: clampedX, y: clampedY }));
                    setTimeout(() => {
                      isDraggingMicRef.current = false;
                    }, 80);
                  }}
                  onTap={() => {
                    if (isDraggingMicRef.current) return;
                    setVoiceTranscript("");
                    setVoiceError("");
                    setActiveSubScreen("voiceAssistant");
                    safeStorage.setItem("vone_mic_onboarding_dismissed", "true");
                    setShowMicOnboarding(false);
                  }}
                  style={{ 
                    touchAction: "none",
                    x: micPos.x,
                    y: micPos.y,
                    background: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, rgba(253, 230, 138, 0.72) 36%, rgba(167, 243, 208, 0.75) 68%, rgba(147, 197, 253, 0.8) 100%)",
                    backdropFilter: "blur(20px) saturate(140%) brightness(105%)",
                    boxShadow: "0 10px 28px -4px rgba(30, 63, 57, 0.28), inset 0 1px 2px rgba(255, 255, 255, 0.88)"
                  }}
                  className="absolute bottom-22 right-6 z-50 cursor-grab active:cursor-grabbing w-14 h-14 rounded-full flex items-center justify-center border border-white/80 overflow-visible group animate-fade-in select-none"
                  title="语音快记"
                >
                  {showMicOnboarding && (
                    <>
                      {/* Warm multi-layered breathing ring lights guiding the user */}
                      <div className="absolute w-24 h-24 rounded-full bg-emerald-400/20 animate-ping pointer-events-none z-0" style={{ animationDuration: "2.8s" }} />
                      <div className="absolute w-18 h-18 rounded-full bg-[#CCECD5]/40 animate-pulse pointer-events-none z-0" style={{ animationDuration: "1.8s" }} />
                      
                      {/* Micro pointing speech bubble to prevent obstruction but yield extreme guidance */}
                      <div className="absolute right-15 bottom-1.5 w-44 bg-white/95 backdrop-blur-md p-3 rounded-[20px] border border-emerald-100 shadow-[0_10px_24px_-5px_rgba(30,63,57,0.15)] flex flex-col gap-1 z-50 select-none animate-bounce pointer-events-auto" style={{ animationDuration: "3.5s" }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                          <span className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            极简引导 🎙️
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              safeStorage.setItem("vone_mic_onboarding_dismissed", "true");
                              setShowMicOnboarding(false);
                            }}
                            className="text-[8px] bg-stone-100 text-[#8E8575] hover:text-stone-900 font-extrabold px-1.5 py-0.5 rounded-md cursor-pointer"
                          >
                            忽略
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-600 font-extrabold leading-tight flex items-center justify-center gap-0.5">
                          点这里快速语音记错，一键沉淀温和自省原则 <GlassIcon emoji="✨" size="xs" />
                        </p>
                        {/* Tiny triangle arrow pointing to the button */}
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-emerald-100 rotate-45 pointer-events-none" />
                      </div>
                    </>
                  )}

                  {/* Soft background pulse feedback on hover */}
                  <span className="absolute inset-0 bg-white/15 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 pointer-events-none" />
                  <span className="absolute inset-0 bg-gradient-to-tr from-[#E6F4EA]/15 to-transparent animate-pulse opacity-40 pointer-events-none" />
                  
                  {/* 3D Solid glass bubble specular shine highlights */}
                  <div className="absolute top-1.5 left-2.5 w-8 h-4 bg-white/60 rounded-full blur-[0.8px] rotate-[-20deg] pointer-events-none" />
                  <div className="absolute bottom-1 right-2.5 w-4 h-2 bg-white/20 rounded-full blur-[0.5px] rotate-[20deg] pointer-events-none" />

                  <svg viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 relative z-10 shrink-0" style={{ filter: "drop-shadow(0 1.5px 3px rgba(16,185,129,0.22))" }}>
                    <rect x="9" y="2" width="6" height="12" rx="3" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" fill="url(#premiumYGBGrad)" fillOpacity="0.15" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white shadow-xs animate-pulse z-20" />
                </motion.div>
              )}

              {/* ================= PORTALS / OVERLAY VIEW ROUTINGS ================= */}
              
               {/* Portal 1: QuickNote Memo screen */}
              {activeSubScreen === "quickNote" && (
                <QuickNote
                  initialDraft={resumedDraft || (voiceTranscript ? {
                    id: "temp_" + Date.now(),
                    rawText: voiceTranscript,
                    category: MistakeCategory.OTHER,
                    painLevel: 4,
                    bodySignals: ["心悸", "紧绷"],
                    emotions: ["目标偏离"],
                    eventSummary: voiceTranscript,
                    facts: [voiceTranscript],
                    status: "待反思",
                    isDraft: true,
                    isVoiceDraft: true,
                    lastUpdated: new Date().toISOString()
                  } : null)}
                  defaultMethod={voiceMethodToOpen}
                  onSaveQuick={handleSaveQuickNote}
                  onClose={() => {
                    setResumedDraft(null);
                    setVoiceTranscript("");
                    setActiveSubScreen(null);
                  }}
                  onOpenDrafts={() => {
                    setActiveSubScreen("draftBox");
                  }}
                />
              )}

              {/* Portal 1.5: Draft Box Screen */}
              {activeSubScreen === "draftBox" && (
                <DraftBox
                  drafts={mistakes.filter(isMistakeDraft)}
                  onResumeDraft={(draft) => {
                    setResumedDraft(draft);
                    setActiveSubScreen("quickNote");
                  }}
                  onDeleteDrafts={(ids) => {
                    const updated = mistakes.filter((m) => !ids.includes(m.id));
                    saveMistakesToStorage(updated);
                  }}
                  onClose={() => {
                    setActiveSubScreen(null);
                  }}
                />
              )}

              {/* Portal 2: 6 Steps Analysis Wizard */}
              {activeSubScreen === "analyse" && (
                <StepAnalysis
                  currentMistake={activeMistakeObj}
                  initialStep={skipAnalyzeStage ? 7 : 1}
                  onSave={handleSaveMistake}
                  onClose={() => setActiveSubScreen(null)}
                />
              )}

              {/* Portal 3: Mistake Details */}
              {activeSubScreen === "mistakeDetail" && activeMistakeObj && (
                <MistakeDetail
                  mistake={activeMistakeObj}
                  onBack={() => {
                    setSelectedMistakeId(null);
                    setActiveSubScreen(null);
                  }}
                  onModify={(id) => {
                    setSelectedMistakeId(id);
                    setActiveSubScreen("analyse");
                  }}
                  onMarkRecurrence={(id) => {
                    setSelectedMistakeId(id);
                    setActiveSubScreen("recurrenceMark");
                  }}
                />
              )}

              {/* Portal 4: Principle Details */}
              {activeSubScreen === "principleDetail" && activePrincipleObj && (
                <PrincipleDetail
                  principle={activePrincipleObj}
                  onBack={() => {
                    setSelectedPrincipleId(null);
                    setActiveSubScreen(null);
                  }}
                  onSetupReminder={(item) => {
                    setSelectedPrincipleId(item.id);
                    setActiveSubScreen("reminderSettings");
                  }}
                  onEdit={(id) => {
                    setSelectedMistakeId(id);
                    setActiveSubScreen("analyse");
                  }}
                />
              )}

              {/* Portal 5: Principle Reminder Settings */}
              {activeSubScreen === "reminderSettings" && activePrincipleObj && (
                <ReminderSettings
                  principle={activePrincipleObj}
                  onBack={() => setActiveSubScreen("principleDetail")}
                  onSaveReminder={handleSaveReminderSet}
                />
              )}

              {/* Portal 6: Recurrence Tracking checkmarks */}
              {activeSubScreen === "recurrenceMark" && activeMistakeObj && (
                <RecurrenceMark
                  mistake={activeMistakeObj}
                  onBack={() => setActiveSubScreen("mistakeDetail")}
                  onConfirmRecurrence={handleSaveRecurrenceCheckin}
                />
              )}

              {/* Portal 7: Personal Diagnostic Report Analytics */}
              {activeSubScreen === "personalReport" && (
                <PersonalReport
                  mistakes={mistakes}
                  onBack={() => {
                    setActiveSubScreen(null);
                    setCurrentMockupType("default");
                  }}
                />
              )}

              {/* Portal 8: High Fidelity Breath meditation exercise (Mockup 3) */}
              {activeSubScreen === "breathMeditation" && (
                <BreathMeditation
                  onClose={() => {
                    setActiveSubScreen(null);
                    setCurrentMockupType("default");
                  }}
                />
              )}

              {/* Portal 9: High Fidelity Mood dial checkin (Mockup 2) */}
              {activeSubScreen === "moodDailyCheckin" && (
                <MoodCheckin
                  onClose={() => {
                    setActiveSubScreen(null);
                    setCurrentMockupType("default");
                  }}
                  onSaveMood={(mood, score, comment) => {
                    // Add custom log entry to mistakes block or save to local state!
                    const moodLogEntry: MistakeEntry = {
                      id: "mood-" + Date.now(),
                      title: `今日心情感知：${mood.split(" / ")[1]}`,
                      rawText: `今日在 Vone.Lin 进行了心情状况打卡。感知状态是：${mood}（平衡打分：${score}%）。感悟备注: “${comment}”`,
                      category: MistakeCategory.OTHER,
                      painLevel: 1,
                      bodySignals: ["呼吸舒放", "身心平静"],
                      emotions: [mood.split(" / ")[1] || "平静"],
                      createdAt: new Date().toISOString().substring(0, 16).replace("T", " "),
                      status: "已生成原则",
                      eventSummary: `在今日完成了情绪状态自查：${mood}。`,
                      facts: [`心情平衡值调节至 ${score}%。`, `心情自白记录: "${comment}"`],
                      principleText: `当情绪浮动在：${mood} 阶段，我先慢呼吸4下保持平衡，放松肩膀，如水般自然承载。`,
                      nextAction: "继续保持深长呼吸，将当下松弛平稳的心态维持24小时。"
                    };
                    saveMistakesToStorage([moodLogEntry, ...mistakes]);
                  }}
                />
              )}

              {/* Dynamic Native Reminders Push Alert Notification Banner */}
              {activeNotification && (
                <div className="absolute top-16 left-4 right-4 bg-gradient-to-tr from-[#EBF7EE] to-white border-2 border-emerald-500/30 p-4 rounded-3xl shadow-2xl z-50 flex flex-col gap-2.5 animate-fade-in divide-y divide-stone-100 select-none">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-2xl bg-emerald-500 text-white shadow-xs shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-widest font-black text-emerald-800 flex items-center gap-0.5 whitespace-nowrap">
                        <GlassIcon emoji="⏰" size="xs" /> 每日智能实践提醒推送
                      </span>
                      <h4 className="text-xs font-black text-[#1E3F39] truncate mt-0.5">
                        {activeNotification.title}
                      </h4>
                      <p className="text-[10.5px] text-stone-600 font-semibold leading-relaxed mt-1">
                        “下次遇到此场景，深度提醒自己：{activeNotification.principleText}”
                      </p>
                    </div>
                  </div>
                  <div className="pt-2.5 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-stone-400 font-bold flex items-center gap-0.5 whitespace-nowrap">
                      点击按钮登记今日得分 <GlassIcon emoji="📈" size="xs" />
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setActiveNotification(null)}
                        className="px-3 py-1.5 rounded-full text-[10px] font-bold text-stone-400 hover:text-stone-600 active:scale-95 bg-stone-50"
                      >
                        忽略
                      </button>
                      <button
                        onClick={() => {
                          setShowEvaluationModalId(activeNotification.principleId);
                          setActiveNotification(null);
                        }}
                        className="px-4 py-1.5 rounded-full text-[10px] font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-95 shadow-sm"
                      >
                        填写评价
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Self-Practice Score Evaluation Questionnaire Popup Modal */}
              {showEvaluationModalId && (
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-end justify-center animate-fade-in">
                  <div className="bg-white w-full rounded-t-[36px] p-6 pb-8 space-y-6 shadow-2xl max-h-[85%] overflow-y-auto animate-slide-up border-t border-stone-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GlassIcon emoji="📈" size="sm" />
                        <div>
                          <h3 className="text-sm font-black text-sage-dark">今日原则践行自审</h3>
                          <p className="text-[10px] text-stone-400 mt-0.5">温和客观评估今日实践水平</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowEvaluationModalId(null)}
                        className="text-stone-400 hover:text-stone-600 text-xs font-bold p-1 rounded-full bg-stone-50"
                      >
                        关闭
                      </button>
                    </div>

                    <div className="space-y-2 select-none">
                      <p className="text-[10.5px] font-semibold text-stone-500">
                        正在审查的践行原则：
                      </p>
                      <div className="bg-[#F7F3EC]/70 p-4 rounded-2xl border border-stone-200/50">
                        <p className="text-xs font-extrabold text-neutral-800 leading-relaxed italic">
                          “{mistakes.find(x => x.id === showEvaluationModalId)?.principleText || "先沟通对齐目标，再开始执行细节"}”
                        </p>
                      </div>
                    </div>

                    {/* Step 1: Score range card */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-extrabold text-[#7B7268] tracking-widest uppercase font-sans">
                        <span>今日笃行达标打分：</span>
                        <span className="text-emerald-600 font-display font-black text-sm">{evaluationScore}/7</span>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/40">
                        <input
                          type="range"
                          min="1"
                          max="7"
                          value={evaluationScore}
                          onChange={(e) => setEvaluationScore(parseInt(e.target.value))}
                          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between mt-3 text-[10px] text-stone-400 font-bold px-1 select-none">
                          <span>毫无遵循</span>
                          <span>勉强</span>
                          <span>达标</span>
                          <span>完美笃行</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Mindful reflection experiences */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-[#7B7268] tracking-widest uppercase block">
                        今日践行感言及自律心得 (选填)
                      </label>
                      <textarea
                        value={evaluationNote}
                        onChange={(e) => setEvaluationNote(e.target.value)}
                        placeholder="记录一两句今日遵循或遗忘时的具体情形、启发..."
                        maxLength={200}
                        rows={3}
                        className="w-full p-2.5 text-xs border border-stone-200 rounded-2xl outline-none focus:border-emerald-500 resize-none font-semibold text-neutral-800 bg-stone-50"
                      />
                    </div>

                    <button
                      onClick={() => handleSaveEvaluation(showEvaluationModalId, evaluationScore, evaluationNote)}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-sage hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs tracking-wider shadow-md active:scale-95 select-none transition-all uppercase flex items-center justify-center gap-1.5"
                    >
                      <span>提交评价并对齐折线图</span> <GlassIcon emoji="🚀" size="xs" />
                    </button>
                  </div>
                </div>
              )}

              {/* Portal 10: Dynamic Voice Assistant Overlay Dialog (matching Image 2) */}
              {activeSubScreen === "voiceAssistant" && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
                  <motion.div 
                    initial={{ scale: 0.92, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 15 }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="w-full max-w-[340px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/85"
                  >
                    
                    {/* Top Header Banner with Green/Blue gradient */}
                    <div className="bg-gradient-to-r from-[#C2ECD5] to-[#81D4FA] px-5 py-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs animate-pulse">
                          <Mic className="w-4.5 h-4.5 text-emerald-600 stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13.5px] font-black text-stone-900 tracking-tight">错了么语音助手</span>
                          <span className="text-[10px] font-extrabold text-[#115e59] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                            {isVoiceRecording ? "正在聆听..." : "已经在聆听..."}
                          </span>
                        </div>
                      </div>
                      
                      {/* Close button on Top-Right */}
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsVoiceRecording(false);
                          setActiveSubScreen(null);
                        }} 
                        className="w-8 h-8 rounded-full bg-white/70 hover:bg-white/95 active:scale-90 flex items-center justify-center transition-all cursor-pointer border border-white/40 shadow-xs"
                      >
                        <X className="w-4 h-4 text-stone-700 stroke-[3]" />
                      </button>
                    </div>

                    {/* Modal Center Body */}
                    <div className="p-6 bg-stone-50/10 flex flex-col items-center justify-center space-y-6">
                      
                      {/* Large pulsing glowing crystal glass sphere representing microphone helper */}
                      <div className="relative flex items-center justify-center py-4">
                        
                        {/* Ambient pulsing ring glows */}
                        <div className="absolute w-40 h-40 rounded-full bg-emerald-400/15 animate-ping pointer-events-none" style={{ animationDuration: "2.8s" }} />
                        <div className="absolute w-32 h-32 rounded-full bg-sky-300/15 animate-pulse pointer-events-none" style={{ animationDuration: "1.8s" }} />
                        
                        {/* The main marble bubble representing glowing glass sphere */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isVoiceRecording) {
                              setIsVoiceRecording(false);
                              // Transition to Edit (QuickNote)
                              setVoiceMethodToOpen("文本记录");
                              setActiveSubScreen("quickNote");
                            } else {
                              startVoiceAssistantSpeech();
                            }
                          }}
                          className="relative w-[130px] h-[130px] rounded-full border border-white/90 overflow-visible cursor-pointer flex items-center justify-center select-none active:scale-95 hover:scale-102 transition-all outline-none"
                          style={{
                            background: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 243, 199, 0.72) 36%, rgba(209, 250, 229, 0.75) 68%, rgba(147, 197, 253, 0.8) 100%)",
                            boxShadow: "0 14px 40px rgba(30, 63, 57, 0.16), inset 0 2px 3px rgba(255, 255, 255, 0.9)"
                          }}
                        >
                          {/* Glossy light glaze bar specular shine */}
                          <div className="absolute top-2.5 left-7 w-[68px] h-9 bg-white/50 rounded-full blur-[0.6px] rotate-[-22deg] pointer-events-none" />
                          
                          <Mic className={`w-10 h-10 text-emerald-800 stroke-[2.5] relative z-10 ${isVoiceRecording ? "animate-bounce" : ""}`} />
                        </button>
                      </div>

                      {/* Quick Commands list matching Figure 2 exactly */}
                      <div className="w-full space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-black text-stone-400 tracking-wider">快捷指令</span>
                        </div>
                        
                        {/* Card 1: 拍照记录 */}
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceMethodToOpen("拍照");
                            setActiveSubScreen("quickNote");
                          }}
                          className="w-full p-3.5 bg-white hover:bg-[#F3FAF7] border border-stone-200/40 hover:border-emerald-200/50 rounded-[22px] shadow-sm flex items-center justify-between active:scale-98 transition-all cursor-pointer group animate-fade-in"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-[#EEFDF5] text-emerald-600 rounded-xl group-hover:bg-white transition-colors">
                              <Camera className="w-4.5 h-4.5 stroke-[2]" />
                            </div>
                            <span className="text-[13px] font-bold text-stone-600 group-hover:text-[#1E3F39]">“拍照记录”</span>
                          </div>
                          <ChevronRight className="w-4.5 h-4.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* Card 2: 相册导入 */}
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceMethodToOpen("相册");
                            setActiveSubScreen("quickNote");
                          }}
                          className="w-full p-3.5 bg-white hover:bg-[#F3FAF7] border border-stone-200/40 hover:border-emerald-200/50 rounded-[22px] shadow-sm flex items-center justify-between active:scale-98 transition-all cursor-pointer group animate-fade-in"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-[#EBF8FE] text-sky-600 rounded-xl group-hover:bg-white transition-colors">
                              <ImageIcon className="w-4.5 h-4.5 stroke-[2]" />
                            </div>
                            <span className="text-[13px] font-bold text-stone-600 group-hover:text-[#1E3F39]">“相册导入”</span>
                          </div>
                          <ChevronRight className="w-4.5 h-4.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* Card 3: 文件导入 */}
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceMethodToOpen("文件");
                            setActiveSubScreen("quickNote");
                          }}
                          className="w-full p-3.5 bg-white hover:bg-[#F3FAF7] border border-stone-200/40 hover:border-emerald-200/50 rounded-[22px] shadow-sm flex items-center justify-between active:scale-98 transition-all cursor-pointer group animate-fade-in"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-[#FFFBEA] text-amber-600 rounded-xl group-hover:bg-white transition-colors">
                              <FileText className="w-4.5 h-4.5 stroke-[2]" />
                            </div>
                            <span className="text-[13px] font-bold text-stone-600 group-hover:text-[#1E3F39]">“文件导入”</span>
                          </div>
                          <ChevronRight className="w-4.5 h-4.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* Bottom Instruction Banner card */}
                      <div className="w-full p-4 bg-[#FFFDF4]/80 border border-amber-200/30 rounded-2xl flex items-center gap-3 shadow-2xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                        <div className="text-[11.5px] font-bold text-[#A76F43] text-left leading-relaxed">
                          {isVoiceRecording ? "正在聆听并记录输入中，再次点击按钮完成并编辑" : "点击麦克风按钮开始说话或选择快捷指令"}
                        </div>
                      </div>
                      
                      {/* Live transcription content feedback */}
                      {isVoiceRecording && (
                        <div className="w-full text-center animate-pulse pt-1">
                          <span className="text-[10.5px] font-mono text-emerald-800 bg-[#E8F5E9]/85 border border-emerald-100/50 px-3 py-1 rounded-full text-center inline-block max-w-[280px] truncate">
                            ✍️ {voiceTranscript || "正在捕捉录音事实..."}
                          </span>
                        </div>
                      )}

                      {voiceError && (
                        <div className="w-full text-center text-[10px] text-rose-500 font-bold bg-rose-50 border border-rose-100 p-2 rounded-xl flex items-center justify-center gap-1">
                          <GlassIcon emoji="⚠️" size="xs" /> {voiceError}
                        </div>
                      )}

                    </div>
                  </motion.div>
                </div>
              )}

            </div>
          )}
        </MobileFrame>
      </div>
    </div>
  );
}
