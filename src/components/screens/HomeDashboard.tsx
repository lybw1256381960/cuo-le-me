import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import GlassIcon from "../GlassIcon";
import {
  Bell,
  Sparkles,
  TrendingUp,
  Compass,
  ChevronRight,
  Plus,
  Lightbulb,
  CheckSquare,
  Menu,
  Target,
  Pencil,
  MessageCircle,
  Star,
  Heart,
  Calendar,
  RefreshCw,
  ChevronLeft,
  X,
  Copy,
  Check,
} from "lucide-react";
import { UserProfile, MistakeEntry } from "../../types";
import { safeStorage } from "../../storage";
import { filterMistakesByDate, safeCopyToClipboard } from "../../utils";

interface HomeDashboardProps {
  user: UserProfile;
  streakCount: number;
  onNavigateToReflect: () => void;
  onNavigateToReport: () => void;
  onNavigateToPrinciples: () => void;
  onNavigateToQuickNote: () => void;
  onNavigateToAnalyse?: () => void;
  onNavigateToMistakesList?: () => void;
  onNavigateToMood?: () => void;
  onNavigateToBreathing?: () => void;
  onNavigateToDraftBox?: () => void;
}

// Daily mind reflection principles
const GOLDEN_QUOTES = [
  {
    quote:
      "“犯错是真理的邻居。每一次面对不完美与局促，都是我们与未知的自我重建稳固连接的伟大高光契机。”",
    author: "和解海洋 · 睿智哲学",
    tag: "心智重构",
  },
  {
    quote:
      "“在大声争辩或切入辩解前，先做4次舒缓的腹式深呼吸。给每一个情绪以退潮的空间。”",
    author: "4遍呼吸阻断法",
    tag: "情绪自恰",
  },
  {
    quote:
      "“你并非真正的『犯了错』，你只是在日常长河中，勇敢地上演了一场原本可以更加优雅的探索引航实验。”",
    author: "自我和解 · 实验思维",
    tag: "容错艺术",
  },
  {
    quote:
      "“真正的包容，是不仅理解外界的多变与他人的偏倚，更是坦然承载并拥抱自己偶尔泛红的小小局限。”",
    author: "内心觉察 · Vone",
    tag: "自我接纳",
  },
  {
    quote:
      "“属于你的行为原则，并非自我限制的刻板戒律，而是我们在红尘急流边缘，为自己拉起的一条充满善意的保护索。”",
    author: "不二过原则 · 提炼卡片",
    tag: "睿智心力",
  },
];

// Reusable micro-parallax mouse hover hook for premium tactile glass bubble interaction with 3D perspective tilt
function useBubbleParallax() {
  const [tilt, setTilt] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const maxOffset = 5; // soft micro-offset to preserve reading stability
    const maxRotation = 4; // delicate 3D tilt degree

    const px = (e.clientX - rect.left) / rect.width; // 0 to 1
    const py = (e.clientY - rect.top) / rect.height; // 0 to 1

    const x = (px - 0.5) * 2 * maxOffset;
    const y = (py - 0.5) * 2 * maxOffset;

    const rX = -(py - 0.5) * 2 * maxRotation;
    const rY = (px - 0.5) * 2 * maxRotation;

    setTilt({ x, y, rotateX: rX, rotateY: rY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
    setTilt({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  return {
    style: {
      transform: isHovered
        ? `perspective(800px) translate3d(${tilt.x}px, ${tilt.y}px, 6px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isActive ? 0.96 : 1.035})`
        : "perspective(800px) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: isActive
        ? "transform 0.05s ease-out, background-color 0.1s ease"
        : isHovered
        ? "transform 0.15s cubic-bezier(0.25, 1.25, 0.5, 1.25), background-color 0.3s ease"
        : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease",
      transformStyle: "preserve-3d" as const,
      willChange: "transform",
    },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  };
}

// Generate infinite horizontal sliding list of days: fully sorted chronological range from 2024 to 2028
const START_DATE = new Date(2024, 0, 1);
const END_DATE = new Date(2028, 11, 31);
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CALENDAR_DAYS: Array<{
  year: number;
  month: string;
  monthIndex: number;
  day: string;
  weekday: string;
  dateStr: string;
  hasLeaf: boolean;
}> = [];

// Populate all calendar days in sorted chronological order without duplicate risks from local/timezone offsets
const seenDates = new Set<string>();
const tempDate = new Date(
  START_DATE.getFullYear(),
  START_DATE.getMonth(),
  START_DATE.getDate(),
  12,
  0,
  0,
); // midday avoids DST jumps

while (tempDate.getFullYear() <= 2028) {
  const year = tempDate.getFullYear();
  const mIndex = tempDate.getMonth();
  const dVal = tempDate.getDate();
  const dayNum = String(dVal).padStart(2, "0");
  const monthNum = String(mIndex + 1).padStart(2, "0");
  const dateStr = `${year}-${monthNum}-${dayNum}`;

  if (!seenDates.has(dateStr)) {
    seenDates.add(dateStr);
    const hasLeaf = dVal % 6 === 0 || dVal % 7 === 2 || dVal === 8;

    CALENDAR_DAYS.push({
      year,
      month: monthNames[mIndex],
      monthIndex: mIndex,
      day: dayNum,
      weekday: weekdayNames[tempDate.getDay()],
      dateStr,
      hasLeaf,
    });
  }

  // Advance by precisely 24 hours to the next midday
  tempDate.setTime(tempDate.getTime() + 24 * 60 * 60 * 1000);
}

// Seed data deterministically mapping dates
const getLinkedDayData = (dateStr: string) => {
  const parts = dateStr.split("-");
  const dayVal = parseInt(parts[2]) || 8;
  const seed = dayVal % 5;
  const data: Record<
    number,
    {
      pendingMistakes: number;
      statQuick: number;
      statReflect: number;
      statPrinciple: number;
      principleText: string;
      recentMistakeTitle: string;
      recentCategory: string;
      recentStatus: string;
      recentDateLabel: string;
      waveOpacity: string;
    }
  > = {
    0: {
      pendingMistakes: 0,
      statQuick: 2,
      statReflect: 1,
      statPrinciple: 5,
      principleText: "在急促发言前，先聆听他人的情绪基底。",
      recentMistakeTitle: "对竞品分析表态过于武断，主观推断多于数据支持",
      recentCategory: "沟通阻断",
      recentStatus: "已提炼原则",
      recentDateLabel: dateStr,
      waveOpacity: "opacity-20",
    },
    1: {
      pendingMistakes: 1,
      statQuick: 4,
      statReflect: 2,
      statPrinciple: 3,
      principleText: "不带防卫态度，接纳自己可能错失的一角。",
      recentMistakeTitle: "因任务延误直接驳回他人方案，语气带有些许急躁",
      recentCategory: "管理与协作",
      recentStatus: "待反思",
      recentDateLabel: dateStr,
      waveOpacity: "opacity-35",
    },
    2: {
      pendingMistakes: 2,
      statQuick: 5,
      statReflect: 3,
      statPrinciple: 2,
      principleText: "先停一停，在争辩前呼吸四五遍，再做决定。",
      recentMistakeTitle: "打断了同事对新方案的阐明，未提供完整展示契机",
      recentCategory: "沟通",
      recentStatus: "待反思",
      recentDateLabel: dateStr,
      waveOpacity: "opacity-50",
    },
    3: {
      pendingMistakes: 3,
      statQuick: 7,
      statReflect: 4,
      statPrinciple: 1,
      principleText: "沟通时音量降低3分贝，语速自愿放慢20%。",
      recentMistakeTitle: "在即时群聊回复过于冷峻，可能引发协作误会",
      recentCategory: "客户服务",
      recentStatus: "待反思",
      recentDateLabel: dateStr,
      waveOpacity: "opacity-65",
    },
    4: {
      pendingMistakes: 0,
      statQuick: 8,
      statReflect: 6,
      statPrinciple: 6,
      principleText: "接受多变的环境，把每一次局促化为自我高光保护索。",
      recentMistakeTitle: "因为临时时程冲突而产生微小浮躁，缺乏情绪平衡",
      recentCategory: "情绪平衡",
      recentStatus: "已生成原则",
      recentDateLabel: dateStr,
      waveOpacity: "opacity-80",
    },
  };
  return data[seed];
};

export default function HomeDashboard({
  user,
  streakCount,
  onNavigateToReflect,
  onNavigateToReport,
  onNavigateToPrinciples,
  onNavigateToQuickNote,
  onNavigateToAnalyse,
  onNavigateToMistakesList,
  onNavigateToMood,
  onNavigateToBreathing,
  onNavigateToDraftBox,
}: HomeDashboardProps) {
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  const defaultIdx = (() => {
    const idx = CALENDAR_DAYS.findIndex(
      (item) => item.dateStr === "2026-10-08",
    );
    return idx !== -1 ? idx : 1011;
  })();

  // Selected calendar day index reference
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(defaultIdx);
  const selectedDateIdxRef = useRef<number>(defaultIdx);
  selectedDateIdxRef.current = selectedDateIdx;

  const listContainerRef = useRef<HTMLDivElement>(null);
  const [dayMistakes, setDayMistakes] = useState<MistakeEntry[]>([]);
  const [isListFadingIn, setIsListFadingIn] = useState<boolean>(false);

  // States for high-end mood daily check-in card color ripple animation
  const [moodCoords, setMoodCoords] = useState({ x: 0, y: 0 });
  const [isMoodHovered, setIsMoodHovered] = useState(false);
  const [isMoodActive, setIsMoodActive] = useState(false);

  // useEffect listener to update list data and scroll on selected date idx changes
  useEffect(() => {
    const activeDateItem = CALENDAR_DAYS[selectedDateIdx];
    if (!activeDateItem) return;

    // 1. Force retrieval of updated mistake entries from browser safeStorage directly
    const savedMistakesRaw = safeStorage.getItem("clm_user_mistakes");
    let allMistakes: MistakeEntry[] = [];
    if (savedMistakesRaw) {
      try {
        allMistakes = JSON.parse(savedMistakesRaw);
      } catch (e) {
        console.error("Failed to parse user mistakes inside HomeDashboard", e);
      }
    }

    // 2. Use our specialized high-integrity precision filter to match target date YYYY-MM-DD
    const filtered = filterMistakesByDate(allMistakes, activeDateItem.dateStr);
    setDayMistakes(filtered);

    // Skip the visual transition and scrolling on initial entry
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    // 3. Highlight the update with a brief fade-in visual state indicator
    setIsListFadingIn(true);
    const fadeTimer = setTimeout(() => {
      setIsListFadingIn(false);
    }, 450);

    return () => {
      clearTimeout(fadeTimer);
    };
  }, [selectedDateIdx]);

  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isChangingDate, setIsChangingDate] = useState<boolean>(false);
  const [isDeepReviewOpen, setIsDeepReviewOpen] = useState<boolean>(false);

  // Click to copy golden quote state
  const [toast, setToast] = useState<string | null>(null);
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  const handleCopyQuote = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    // Strip quotes for a cleaner look when copying
    const cleanText = text.replace(/[“”"']/g, "");
    safeCopyToClipboard(cleanText)
      .then((success) => {
        if (success) {
          setToast("已成功复制主理人金句！");
          setCopiedQuote(true);
          setTimeout(() => setCopiedQuote(false), 2000);
          setTimeout(() => setToast(null), 2500);
        } else {
          setToast("复制失败，请手动选择复制");
          setTimeout(() => setToast(null), 2500);
        }
      })
      .catch(() => {
        setToast("复制失败，请手动选择复制");
        setTimeout(() => setToast(null), 2500);
      });
  };

  // Full-screen calendar year & month selectors
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(9); // 0-indexed, October is 9

  // Scroll viewport anchor for date roll center alignment
  const dateScrollerRef = useRef<HTMLDivElement>(null);

  // Dynamic daily AI inline golden quote state
  const [quoteIdx, setQuoteIdx] = useState<number>(
    defaultIdx % GOLDEN_QUOTES.length,
  );
  const [isRotating, setIsRotating] = useState(false);

  // Physics-based scrolling constants and active state tracking
  const pitch = 72; // Spacing/width offset between each date index
  const [scrollOffset, setScrollOffset] = useState<number>(defaultIdx * 72);
  const [scrollerWidth, setScrollerWidth] = useState<number>(360);

  // Top-level Dashboard container ref and portal properties
  const rootRef = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [wheelOffset, setWheelOffset] = useState({ top: 0, left: 0 });

  // Refs for continuous physics loops to prevent React state closure trapping outside frame limits
  const scrollOffsetRef = useRef<number>(defaultIdx * 72);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartOffsetRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const isFirstMountRef = useRef<boolean>(true);

  // Math bound clamp helper
  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  // Initialize bounds trackers, set up offset calibration and ResizeObserver
  useEffect(() => {
    setPortalTarget(rootRef.current);

    // Force parent scroll container to top on load to make sure calendar is fully visible
    if (rootRef.current) {
      const scrollableParent = rootRef.current.closest(".overflow-y-auto");
      if (scrollableParent) {
        scrollableParent.scrollTop = 0;
      }
    }

    if (dateScrollerRef.current) {
      setScrollerWidth(
        dateScrollerRef.current.getBoundingClientRect().width || 360,
      );
    }

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScrollerWidth(entry.contentRect.width || 360);
      }
    });

    if (dateScrollerRef.current) {
      obs.observe(dateScrollerRef.current);
    }

    const updateOfs = () => {
      if (dateScrollerRef.current && rootRef.current) {
        const wRect = dateScrollerRef.current.getBoundingClientRect();
        const rRect = rootRef.current.getBoundingClientRect();
        setWheelOffset({
          top: wRect.top - rRect.top,
          left: wRect.left - rRect.left,
        });
      }
    };

    updateOfs();
    window.addEventListener("resize", updateOfs);
    // Periodic polling as absolute fallback for dynamic Iframe size adjustments
    const intervalId = setInterval(updateOfs, 500);

    return () => {
      obs.disconnect();
      window.removeEventListener("resize", updateOfs);
      clearInterval(intervalId);
      setPortalTarget(null);
    };
  }, []);

  // Handle active calendar day changed without obscuring the calendar wheel
  const handleDateSelect = (index: number, forceOverlay = false) => {
    if (index === selectedDateIdxRef.current) return;
    selectedDateIdxRef.current = index;
    setSelectedDateIdx(index);
    setQuoteIdx(index % GOLDEN_QUOTES.length);
  };

  // Click-to-shuffle quote on the golden quote card (can cycle independently!)
  const handleShuffleQuote = () => {
    setIsRotating(true);
    setQuoteIdx((prev) => (prev + 1) % GOLDEN_QUOTES.length);
    setTimeout(() => setIsRotating(false), 450);
  };

  // Pointer event handlers modeling physics friction slide
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartOffsetRef.current = scrollOffsetRef.current;
    dragStartXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const currentX = e.clientX;
    const currentTime = performance.now();
    const dt = currentTime - lastTimeRef.current;
    const dx = currentX - lastXRef.current;

    const deltaX = currentX - dragStartXRef.current;
    const rawOffset = dragStartOffsetRef.current - deltaX;
    const maxOffset = (CALENDAR_DAYS.length - 1) * pitch;
    // Limit bounds slightly with rubber-banding cushion to keep calendar in bounds
    scrollOffsetRef.current = Math.max(-120, Math.min(maxOffset + 120, rawOffset));
    setScrollOffset(scrollOffsetRef.current);

    // Smoothly calculate active selected date index dynamically during drag!
    const nearestIdx = Math.max(
      0,
      Math.min(
        CALENDAR_DAYS.length - 1,
        Math.round(scrollOffsetRef.current / pitch),
      ),
    );
    if (selectedDateIdxRef.current !== nearestIdx) {
      handleDateSelect(nearestIdx, false); // select silently without showing full-screen loading masks during active gesture
    }

    if (dt > 1) {
      const currentVel = -(dx / dt) * 16.6;
      velocityRef.current = velocityRef.current * 0.4 + currentVel * 0.6;
    }

    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Auto-calculate the final target snap index
    const nearestIdx = Math.max(
      0,
      Math.min(
        CALENDAR_DAYS.length - 1,
        Math.round(scrollOffsetRef.current / pitch),
      ),
    );

    // Smoothly snap to target on drag release
    if (Math.abs(velocityRef.current) < 4.8) {
      handleDateSelect(nearestIdx, true); // trigger standard selection transition and healing glow mask
    } else {
      velocityRef.current = clamp(velocityRef.current, -38, 38); // Limit extreme velocity range
      const projectedFutureOffset =
        scrollOffsetRef.current + velocityRef.current * 7.5;
      const targetFutureIdx = Math.max(
        0,
        Math.min(
          CALENDAR_DAYS.length - 1,
          Math.round(projectedFutureOffset / pitch),
        ),
      );
      handleDateSelect(targetFutureIdx, true);
    }
  };

  // Unified spring physics loop handling sliding momentum, decay friction, and smooth centering on click and selection
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;

      let nextOffset = scrollOffsetRef.current;

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 1.15) {
          // Inertia slide
          nextOffset += velocityRef.current;
          velocityRef.current *= 0.965; // smooth friction decay for gorgeous kinetic flow
          scrollOffsetRef.current = nextOffset;
          setScrollOffset(nextOffset);

          // Dynamically track nearest focused date
          const nearestIdx = Math.max(
            0,
            Math.min(CALENDAR_DAYS.length - 1, Math.round(nextOffset / pitch)),
          );
          if (selectedDateIdxRef.current !== nearestIdx) {
            handleDateSelect(nearestIdx, false); // silent during inertia kinetic gliding
          }
        } else {
          // Responsive spring-mass-damper snapping system model (stiffness: 0.18, damping ratio: 0.7)
          const targetOffset = selectedDateIdxRef.current * pitch;
          const diff = targetOffset - nextOffset;

          const stiffnessValue = 0.18;
          const dampingCoefficient = 0.7;
          const springForce = stiffnessValue * diff;

          velocityRef.current =
            velocityRef.current * dampingCoefficient + springForce;
          nextOffset += velocityRef.current;

          if (Math.abs(diff) > 0.05 || Math.abs(velocityRef.current) > 0.05) {
            scrollOffsetRef.current = nextOffset;
            setScrollOffset(nextOffset);
          } else if (scrollOffsetRef.current !== targetOffset) {
            scrollOffsetRef.current = targetOffset;
            setScrollOffset(targetOffset);
            velocityRef.current = 0;
          }
        }
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => {
      active = false;
    };
  }, []); // Run on mount only to prevent loop duplicate reconstruction and frame dropping

  // Handle click on calendar days to smooth select and glide center
  const handleBubbleClick = (index: number) => {
    if (isDraggingRef.current) return;
    velocityRef.current = 0;
    if (selectedDateIdxRef.current === index) {
      setIsDeepReviewOpen(true);
    } else {
      handleDateSelect(index);
    }
  };

  const activeDateItem = CALENDAR_DAYS[selectedDateIdx];
  const activeDayData = getLinkedDayData(activeDateItem.dateStr);

  // Dynamic statistics and text resolved from real browser localStorage mistakes for selected date
  const displayPendingCount =
    dayMistakes.length > 0
      ? dayMistakes.filter((m) => m.status === "待反思").length
      : activeDayData.pendingMistakes;

  const displayStatQuick =
    dayMistakes.length > 0 ? dayMistakes.length : activeDayData.statQuick;

  const displayStatReflect =
    dayMistakes.length > 0
      ? dayMistakes.filter((m) => m.status !== "待反思").length
      : activeDayData.statReflect;

  const displayStatPrinciple =
    dayMistakes.length > 0
      ? dayMistakes.filter((m) => m.status === "已生成原则" || m.principleText)
          .length
      : activeDayData.statPrinciple;

  // Under mock dates we show dynamic quote/tips. If there's a real mistake, we can show its generated principle or fall back to mock
  const displayPrincipleText =
    dayMistakes.length > 0 &&
    dayMistakes.find((m) => m.principleText)?.principleText
      ? dayMistakes.find((m) => m.principleText)!.principleText
      : activeDayData.principleText;

  // Dynamic deterministic calculation of daily quote based on selected date
  const quoteIndex =
    Math.abs(
      activeDateItem.dateStr
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0),
    ) % GOLDEN_QUOTES.length;
  const activeTip = GOLDEN_QUOTES[quoteIndex];

  // Create micro-parallax responsive hook instances for all interactive bubbles
  const bubbleTip = useBubbleParallax();
  const bubble1 = useBubbleParallax();
  const bubble2 = useBubbleParallax();
  const bubble3 = useBubbleParallax();
  const bubble4 = useBubbleParallax();
  const bubble5 = useBubbleParallax();
  const bubble6 = useBubbleParallax();
  const bubble7 = useBubbleParallax();
  const bubble8 = useBubbleParallax();

  // Handle month decrement in full-screen Mistakes Calendar
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  // Handle month increment in full-screen Mistakes Calendar
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  // Build current Gregorian grid for full-screen view
  const buildCurrentMonthDays = () => {
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday
    // Convert so Monday is 0 index, Sunday is 6
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysArr = [];
    // Prefix empty slots
    for (let i = 0; i < startOffset; i++) {
      daysArr.push(null);
    }
    // Days
    for (let d = 1; d <= totalDays; d++) {
      daysArr.push(d);
    }
    return daysArr;
  };

  // Find index in CALENDAR_DAYS array corresponding to selected calendar node
  const handleSelectFromCalendarModal = (day: number) => {
    const monthNum = String(calendarMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const targetDateStr = `${calendarYear}-${monthNum}-${dayStr}`;

    const matchIdx = CALENDAR_DAYS.findIndex(
      (item) => item.dateStr === targetDateStr,
    );
    if (matchIdx !== -1) {
      // ALWAYS warp scroll offset instantly to matchIdx * pitch so it snaps cleanly without long dizzying kinetic sliding or glitches
      scrollOffsetRef.current = matchIdx * pitch;
      setScrollOffset(matchIdx * pitch);
      velocityRef.current = 0;
      handleDateSelect(matchIdx, true);
    } else {
      // Fallback: If outside pre-populated 5-year bounds, insert in order
      const customDateObj = new Date(calendarYear, calendarMonth, day);
      const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const newDayItem = {
        year: calendarYear,
        month: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ][calendarMonth],
        monthIndex: calendarMonth,
        day: dayStr,
        weekday: weekdayNames[customDateObj.getDay()],
        dateStr: targetDateStr,
        hasLeaf: day % 4 === 0,
      };
      // Find proper sorted index to keep order
      let insertIdx = CALENDAR_DAYS.findIndex(
        (item) => item.dateStr > targetDateStr,
      );
      if (insertIdx === -1) {
        CALENDAR_DAYS.push(newDayItem);
        insertIdx = CALENDAR_DAYS.length - 1;
      } else {
        CALENDAR_DAYS.splice(insertIdx, 0, newDayItem);
      }

      // Warp scroll offset instantly to prevent scroll jumps
      scrollOffsetRef.current = insertIdx * pitch;
      setScrollOffset(insertIdx * pitch);
      velocityRef.current = 0;

      handleDateSelect(insertIdx, true);
    }
    setIsCalendarOpen(false);
  };

  const monthNamesZh = [
    "一月 · 孟春",
    "二月 · 仲春",
    "三月 · 季春",
    "四月 · 孟夏",
    "五月 · 仲夏",
    "六月 · 季夏",
    "七月 · 孟秋",
    "八月 · 仲秋",
    "九月 · 季秋",
    "十月 · 孟冬",
    "十一月 · 仲冬",
    "十二月 · 季冬",
  ];

  // Selected date Trigonometric cylindrical project properties for precise matching and visual alignment
  const selectedDx = selectedDateIdx * pitch - scrollOffset;
  const containerW = 325.677; // scroller dimensions
  const selectedT = selectedDx / 165;
  const selectedTheta = selectedT * (Math.PI / 3.2);

  // High-precision circular arc coordinates
  const sweepRadius = 90;
  const horizontalRadius = 158;
  const centerYOffset = 100;

  const selectedX = containerW / 2 + horizontalRadius * Math.sin(selectedTheta);
  const selectedY = centerYOffset - sweepRadius * Math.cos(selectedTheta);
  const selectedScale = 0.8 + 0.4 * Math.exp(-2.2 * selectedT * selectedT);

  return (
    <div
      ref={rootRef}
      className="flex-1 flex flex-col bg-transparent pb-24 relative select-none"
    >
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -10, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-12 left-1/2 z-50 bg-emerald-900/95 text-white backdrop-blur-[8px] px-5 py-2.5 rounded-full shadow-[0_12px_36px_rgba(30,63,57,0.22)] border border-emerald-500/30 flex items-center gap-2 text-xs font-bold leading-none select-none pointer-events-none"
          >
            <GlassIcon emoji="🍃" size="xs" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar: Menu & Alert */}
      <div className="px-6 pt-5 pb-2 flex items-center justify-between">
        <Menu
          className="w-5.5 h-5.5 text-stone-700 hover:scale-110 active:scale-95 cursor-pointer"
          onClick={() => setShowMenuDrawer(true)}
        />
        <span className="text-sm font-black text-stone-800 tracking-wide font-display">
          首页
        </span>
        <div
          className="relative hover:scale-110 active:scale-95 cursor-pointer"
          onClick={() => setShowNotificationsDrawer(true)}
        >
          <Bell className="w-5.5 h-5.5 text-[#5E7F73]" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
        </div>
      </div>

      {/* Slogan Banner */}
      <div className="px-6 py-3">
        <h1 className="text-xl font-black text-[#1E3F39] tracking-tight">
          早上好，{user.nickname || "朋友"}
        </h1>
        <p className="text-[12.5px] text-[#5B6B67] mt-1 font-semibold flex items-center gap-1.5 font-display">
          <span>愿你在反思中，越来越清醒。</span>
          <span className="animate-pulse-gently text-sm flex items-center justify-center w-4 h-4 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4zm-5 11a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4zm10 0a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4zM12 10v9"
                stroke="url(#premiumYGBGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="url(#premiumYGBGrad)"
                fillOpacity="0.25"
              />
            </svg>
          </span>
        </p>
      </div>

      {/* Curved/Arc Date Wheel Section */}
      <div
        className="px-6 pt-2 pb-6 flex flex-col relative overflow-hidden w-full"
        style={{ height: "173px", maxWidth: "367.667px" }}
      >
        {/* Scroller Upper Control Bar with visual hint */}
        <div className="w-full flex items-center justify-between gap-1 mb-2">
          <span className="text-[10px] text-stone-400 font-extrabold select-none flex items-center gap-1">
            <span className="inline-flex w-3 h-3 items-center justify-center mr-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path
                  d="M12 3v4M12 17v4M3 12h4M17 12h4M7.05 7.05l2.83 2.83M14.12 14.12l2.83 2.83M16.95 7.05l-2.83 2.83M9.88 14.12l-2.83 2.83"
                  stroke="url(#premiumYGBGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span> 左右滑动触发圆弧形心流轨迹
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCalendarYear(activeDateItem.year);
              setCalendarMonth(activeDateItem.monthIndex);
              setIsCalendarOpen(true);
            }}
            className="flex items-center gap-1 text-[10.5px] bg-white/75 text-[#3A6056] border border-white/80 backdrop-blur-[12px] px-3.5 py-1.5 rounded-2xl hover:bg-white active:scale-95 transition-all shadow-xs font-black"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="4" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" fill="url(#premiumYGBGrad)" fillOpacity="0.15" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span>进入错题日历</span>
          </button>
        </div>

        {/* Date Wheel with Cylinder Arc trajectory transforms */}
        <div
          className="relative w-full px-0 py-0"
          style={{
            paddingTop: "0px",
            paddingLeft: "0px",
            paddingBottom: "0px",
          }}
        >
          {/* Visual guiding SVG Bezier track backing */}
          <svg
            className="absolute inset-x-0 top-3 w-full h-[115px] pointer-events-none opacity-45 -z-10"
            viewBox="0 0 360 115"
            preserveAspectRatio="none"
          >
            <path
              d="M 15 88 Q 180 16, 345 88"
              fill="none"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Subtle cyan-teal background diffusion light pool under the scroller */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-14 bg-emerald-300/10 rounded-full blur-xl pointer-events-none -z-10" />

          <motion.div
            ref={dateScrollerRef}
            className="relative mx-auto overflow-visible touch-none select-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              touchAction: "none",
              height: "128px",
              width: "325.677px",
              marginRight: "0px",
              paddingLeft: "0px",
            }}
          >
            {CALENDAR_DAYS.map((item, idx) => {
              const isSelected = selectedDateIdx === idx;

              // Spacing along the linear axis: each index spaced by 'pitch' (e.g., 72px)
              const dx = idx * pitch - scrollOffset;

              // Normalize coordinate center
              const containerWidthVisible = 325.677;
              const maxDist = 165;
              const t = dx / maxDist;

              // Skip items far off screen programmatically to prevent side spill and guarantee smooth layout
              if (Math.abs(t) > 1.22) return null;

              // Trigonometric cylindrical rotation path conversion (Math.sin & Math.cos)
              const theta = t * (Math.PI / 3.2);
              const xPos = containerWidthVisible / 2 + 158 * Math.sin(theta);
              const yPos = 100 - 90 * Math.cos(theta);

              // Bell curve formulas for scale, opacity, and rotation representing gear-like rotative transition
              const scaleValue = 0.8 + 0.4 * Math.exp(-2.2 * t * t);
              const opacityValue = 0.4 + 0.6 * Math.exp(-1.5 * t * t);
              const rotateYVal = t * -28;
              const bubbleWidth = 58;

              return (
                <motion.div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBubbleClick(idx);
                  }}
                  className={`absolute shrink-0 w-[58px] h-20 rounded-2xl flex flex-col items-center justify-center select-none cursor-pointer group ${
                    isSelected
                      ? "border border-emerald-500/10 shadow-md"
                      : "bg-white/45 border border-stone-200/20 hover:bg-white/60"
                  }`}
                  style={{
                    left: `${xPos - bubbleWidth / 2}px`,
                    top: `${yPos}px`,
                    width: `${bubbleWidth}px`,
                    height: "80px",
                    ...(isSelected ? {
                      background: "linear-gradient(135deg, rgba(186, 230, 253, 0.72) 0%, rgba(209, 250, 229, 0.65) 50%, rgba(254, 243, 199, 0.65) 100%)",
                      backdropFilter: "blur(18px) saturate(145%)",
                      boxShadow: "inset 0 0 0 1.5px rgba(255, 255, 255, 0.82), 0 12px 28px -4px rgba(30, 63, 57, 0.12)",
                    } : {})
                  }}
                  animate={{
                    scale: scaleValue,
                    opacity: opacityValue,
                    rotateY: rotateYVal,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 24,
                  }}
                >
                  {/* Glowing background diffuse auras for outstanding focus alignment */}
                  {isSelected && (
                    <>
                      <div
                        className="absolute -inset-1.5 bg-gradient-to-tr from-sky-400/20 via-emerald-400/20 to-amber-300/20 rounded-2xl -z-10 blur-md opacity-85 pointer-events-none"
                        style={{ filter: "blur(4px)" }}
                      />
                      {/* Glossy Reflection Highlight Capsule (Pill shape) at Top-Left */}
                      <div className="absolute top-1.5 left-1.5 w-1.5 h-6 rounded-full bg-white/65 blur-[0.3px] pointer-events-none z-10" />
                      {/* Sprout Leaf decoration in Bottom-Right */}
                      <div className="absolute bottom-1 right-1 pointer-events-none z-10 flex items-end justify-end">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-700/80">
                          <path d="M12 21C12 21 11.5 16.5 13.5 12.5C15.2 9.1 18.2 7.8 19.2 7.3C19.2 7.3 18.2 10.7 15.3 12.7C12.4 14.5 12 21 12 21Z" fill="currentColor" />
                          <path d="M12 21C12 21 12 17.5 9.8 14.2C8 11.5 5.5 10.3 4.5 9.8C4.5 9.8 7.2 11.2 9 14.5C10.4 16.8 12 21 12 21Z" fill="currentColor" opacity="0.72" />
                        </svg>
                      </div>
                    </>
                  )}

                  <div className="relative z-10 w-full h-full flex flex-col items-center justify-center" style={{ gap: '2px' }}>
                    <div className="flex items-center justify-center h-[14px]">
                      <span className={`text-[9px] font-bold tracking-widest uppercase leading-none ${isSelected ? "text-[#1E3F39]/70 font-black" : "text-stone-400"}`}>
                        {item.month}
                      </span>
                    </div>
                    <div className="flex items-center justify-center h-[28px]">
                      <span className={`text-[21px] font-black font-display tracking-tight leading-none ${isSelected ? "text-[#1E3F39] font-extrabold" : "text-[#4A5D58]"}`} style={{ fontFeatureSettings: "'tnum'", fontVariantNumeric: 'tabular-nums' }}>
                        {item.day}
                      </span>
                    </div>
                    <div className="flex items-center justify-center h-[12px]">
                      <span className={`text-[8.5px] font-extrabold uppercase tracking-wider leading-none ${isSelected ? "text-[#1E3F39]/60" : "text-stone-500"}`}>
                        {item.weekday}
                      </span>
                    </div>
                  </div>
                  {item.hasLeaf && (
                    <GlassIcon emoji="🌱" size="xs" className="scale-[0.5] origin-top-right absolute top-0.5 right-0.5 opacity-75" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Main Content Sections with micro-parallax and soft bubble glass textures */}
      <div className="px-6 space-y-4 pt-1.5 relative">
        {/* Custom inline style overrides for the premium healing breathing animation */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes breathingPulse {
            0% { opacity: 0.48; transform: scale(0.985); }
            50% { opacity: 0.88; transform: scale(1.008); }
            100% { opacity: 0.48; transform: scale(0.985); }
          }
          .animate-breathing-pulse {
            animation: breathingPulse 2.6s ease-in-out infinite;
          }
          @keyframes focusBreathing {
            0%, 100% { transform: scale(0.98); opacity: 0.72; }
            50% { transform: scale(1.025); opacity: 1; }
          }
          .animate-focus-breathing {
            display: inline-block;
            animation: focusBreathing 4.2s ease-in-out infinite;
          }
          @keyframes borderPulse {
            0%, 100% {
              border-color: rgba(56, 189, 248, 0.7); /* Sky blue border */
              box-shadow: 0 0 16px rgba(16, 185, 129, 0.35), inset 0 0 0 1.5px rgba(255, 255, 255, 0.85); /* Emerald glow */
            }
            33% {
              border-color: rgba(16, 185, 129, 0.7); /* Emerald green border */
              box-shadow: 0 0 16px rgba(245, 158, 11, 0.35), inset 0 0 0 1.5px rgba(255, 255, 255, 0.85); /* Amber glow */
            }
            66% {
              border-color: rgba(245, 158, 11, 0.7); /* Amber yellow border */
              box-shadow: 0 0 16px rgba(56, 189, 248, 0.35), inset 0 0 0 1.5px rgba(255, 255, 255, 0.85); /* Sky blue glow */
            }
          }
          .animate-ring-pulse {
            animation: borderPulse 4.8s infinite ease-in-out;
          }
        `,
          }}
        />

        <AnimatePresence mode="popLayout">
          {isChangingDate && (
            <motion.div
              key="healing-diffuse-breath-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              layoutId="changing-date-shield"
              className="absolute inset-x-6 top-0 bottom-0 rounded-[32px] z-30 flex flex-col items-center justify-center border border-white/80 shadow-[0_15px_45px_rgba(30,63,57,0.12)] select-none overflow-hidden animate-breathing-pulse"
              style={{
                background: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(28px) saturate(160%) brightness(105%)",
              }}
            >
              {/* Luminous Diffuse Breathing Blobs */}
              <motion.div
                className="absolute w-64 h-64 rounded-full bg-sky-400/35 blur-3xl pointer-events-none -top-12 -left-12"
                animate={{
                  scale: [1, 1.15, 0.9, 1.08, 1],
                  x: [0, 20, -15, 10, 0],
                  y: [0, -15, 20, -10, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute w-64 h-64 rounded-full bg-emerald-400/35 blur-3xl pointer-events-none -bottom-16 -right-16"
                animate={{
                  scale: [1.1, 0.9, 1.15, 1, 1.1],
                  x: [0, -15, 20, -10, 0],
                  y: [0, 20, -15, 12, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute w-56 h-56 rounded-full bg-amber-300/30 blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [0.95, 1.12, 0.98, 1.05, 0.95],
                  x: [-20, 10, -5, 15, -20],
                  y: [15, -15, 10, -5, 15],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />

              <div className="relative z-10 flex flex-col items-center p-6 text-center">
                {/* Therapeutic animated clover/leaf loader */}
                <motion.div
                  className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.18)] border border-white/80 relative mb-4"
                  animate={{
                    scale: [0.93, 1.08, 0.93],
                    boxShadow: [
                      "0 8px 32px rgba(16,185,129,0.15)",
                      "0 12px 48px rgba(56,189,248,0.25)",
                      "0 8px 32px rgba(16,185,129,0.15)",
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative z-10 animate-bounce">
                    <GlassIcon emoji="🌱" size="sm" />
                  </div>
                </motion.div>

                <h4 className="text-[13px] font-black tracking-widest text-[#1E3F39] text-center font-display uppercase">
                  心流轨迹载入中 · 稍候
                </h4>
                <p className="mt-1.5 text-[10.5px] text-[#5B6B67] font-semibold tracking-wide text-center max-w-[190px] leading-relaxed">
                  正在为您同步 2026-{activeDateItem.month}月{activeDateItem.day}
                  日 安全备份的反思数据包...
                </p>

                {/* Glowing progressive markers */}
                <div className="flex gap-2 justify-center items-center mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          ref={listContainerRef}
          layout
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
          animate={{
            opacity: isChangingDate ? 0.32 : isListFadingIn ? 0.6 : 1,
            scale: isChangingDate ? 0.98 : isListFadingIn ? 0.99 : 1,
            y: isChangingDate ? 6 : isListFadingIn ? 4 : 0,
            filter: isChangingDate ? "blur(3px)" : "blur(0px)",
          }}
        >
          {/* 今日反思小贴士 Card */}
          <div
            onClick={onNavigateToAnalyse || onNavigateToReflect}
            className="clm-card rounded-[26px] p-5.5 cursor-pointer relative overflow-hidden bg-gradient-to-br from-[#FFFCEE] to-[#FFF8E7] border border-[#FFF0D4] shadow-[0_8px_30px_rgb(253,230,138,0.06)]"
            {...bubbleTip}
          >
            {/* Ambient subtle glowing spot inside card */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 bg-[#FFF2DE] hover:bg-[#FFEACD] border border-[#FEE2B3] text-[#A16207] px-2.5 py-1 rounded-full text-[10px] font-black transition-all">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0">
                  <path
                    d="M12 3v4M12 17v4M3 12h4M17 12h4M7.05 7.05l2.83 2.83M14.12 14.12l2.83 2.83M16.95 7.05l-2.83 2.83M9.88 14.12l-2.83 2.83"
                    stroke="url(#premiumYGBGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span>今日推荐 • 反思小贴士</span>
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-100/50 border border-amber-200/40 px-2.5 py-0.5 rounded-full">
                {activeTip.tag}
              </span>
            </div>

            <p className="text-[13px] text-stone-800 font-medium italic leading-relaxed font-sans mb-3 pr-2 select-none">
              {activeTip.quote}
            </p>

            <div className="flex justify-between items-center text-[10.5px] font-extrabold select-none">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#8E8575]">— {activeTip.author}</span>
                <button
                  type="button"
                  onClick={(e) => handleCopyQuote(e, activeTip.quote)}
                  className="px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200/60 text-amber-800 hover:scale-103 active:scale-95 border border-amber-250/50 transition-all text-[9.5px] font-black cursor-pointer shadow-3xs flex items-center gap-1 shrink-0"
                >
                  {copiedQuote ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 shrink-0">
                        <path d="M20 6L9 17l-5-5" stroke="url(#premiumYGBGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-emerald-700">已复制</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 shrink-0">
                        <rect x="9" y="9" width="13" height="13" rx="3" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" fill="url(#premiumYGBGrad)" fillOpacity="0.15" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>复制金句</span>
                    </>
                  )}
                </button>
              </div>
              <span className="text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 hover:translate-x-0.5 transition-transform">
                点击开始反思{" "}
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </div>
          </div>

          {/* Module 1: "我刚犯了个错" Action block with soft bubble corner & parallax */}
          <div
            onClick={onNavigateToQuickNote}
            className="clm-card rounded-[26px] p-5.5 flex items-center justify-between cursor-pointer"
            {...bubble1}
          >
            <div className="flex items-center gap-3.5">
              <GlassIcon emoji="📝" size="lg" className="animate-pulse-gently" />
              <div>
                <h3 className="text-[14.5px] font-black text-[#1E3F39]">
                  我刚犯了个错
                </h3>
                <p className="text-[11px] text-[#8E8575] font-extrabold mt-0.5">
                  快速记录当下情绪与事实
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToQuickNote();
              }}
              className="w-11 h-11 rounded-full bg-[#C0E890] hover:brightness-[1.04] active:scale-90 flex items-center justify-center text-[#1E3F39] font-black shadow-md border-2 border-white/60 transition-transform cursor-pointer"
            >
              <Plus className="w-5.5 h-5.5 stroke-[3]" />
            </button>
          </div>

          {/* Module 2: Connected side-by-side indicators */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left panel: Pending mistakes */}
            <div
              onClick={onNavigateToMistakesList || onNavigateToReflect}
              className="clm-card rounded-[22px] p-4.5 min-h-[110px] cursor-pointer flex flex-col justify-between"
              {...bubble2}
            >
              <div className="flex items-center gap-1.5 text-[#5E7F73]">
                <GlassIcon emoji="🎫" size="xs" />
                <h4 className="text-[10px] font-extrabold uppercase text-[#1E3F39] tracking-wider">
                  待反思错题
                </h4>
              </div>
              <p className="text-[13px] text-stone-700 font-extrabold mt-3 leading-tight animate-fade-in">
                <span className="text-xl text-emerald-800 font-black mr-1">
                  {displayPendingCount}
                </span>
                条待反思错题
              </p>
            </div>

            {/* Right panel: Principles reflection suggestion */}
            <div
              onClick={onNavigateToPrinciples}
              className="clm-card rounded-[22px] p-4.5 min-h-[110px] cursor-pointer flex flex-col justify-between"
              {...bubble3}
            >
              <div className="flex items-center gap-1 text-[#1E3F39]">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 shrink-0 animate-pulse-gently">
                  <circle cx="12" cy="12" r="10" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" fill="url(#premiumYGBGrad)" fillOpacity="0.1" />
                  <circle cx="12" cy="12" r="6" stroke="url(#premiumYGBGrad)" strokeWidth="2.5" />
                  <circle cx="12" cy="12" r="2" fill="url(#premiumYGBGrad)" />
                </svg>
                <h4 className="text-[10px] font-extrabold uppercase text-[#1E3F39] tracking-wider">
                  今日原则提醒
                </h4>
              </div>
              <p className="text-[10.5px] text-stone-600 font-extrabold mt-2 leading-snug line-clamp-2">
                {displayPrincipleText}
              </p>
            </div>
          </div>

          {/* Dedicated High-End Mood Daily Check-in Card with flowing frosted glass & ripple animation */}
          <div
            onClick={onNavigateToMood}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMoodCoords({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
            onMouseEnter={() => setIsMoodHovered(true)}
            onMouseLeave={() => {
              setIsMoodHovered(false);
              setIsMoodActive(false);
            }}
            onMouseDown={() => setIsMoodActive(true)}
            onMouseUp={() => setIsMoodActive(false)}
            className="mood-flow-card p-5.5 cursor-pointer relative group overflow-hidden"
            style={{
              transform: isMoodActive
                ? "scale(0.96) translateY(0px)"
                : isMoodHovered
                ? "translateY(-4px) scale(1.035)"
                : "translateY(0px) scale(1)",
              transition: isMoodActive
                ? "transform 0.05s ease-out"
                : isMoodHovered
                ? "transform 0.15s cubic-bezier(0.25, 1.25, 0.5, 1.25), background 0.3s ease"
                : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease",
            }}
          >
            {/* Ambient dynamic cursor-relative ripple background */}
            <div 
              className="absolute rounded-full pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: moodCoords.x,
                top: moodCoords.y,
                width: isMoodHovered ? "320px" : "0px",
                height: isMoodHovered ? "320px" : "0px",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(192, 232, 144, 0.4) 0%, rgba(129, 212, 250, 0.35) 45%, rgba(254, 243, 199, 0.2) 75%, transparent 100%)",
                filter: "blur(20px)",
                opacity: isMoodHovered ? 0.95 : 0,
                zIndex: 0,
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <GlassIcon emoji="🌸" size="lg" className="animate-pulse-gently" />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                      心灵绿洲
                    </span>
                    <span className="text-[9px] bg-amber-500/10 text-amber-800 font-black px-2 py-0.5 rounded-full border border-amber-500/10 uppercase tracking-wider">
                      每日必修
                    </span>
                  </div>
                  <h3 className="text-[14.5px] font-black text-[#1E3F39] mt-1.5">
                    心境每日打卡
                  </h3>
                  <p className="text-[11px] text-[#8E8575] font-extrabold mt-0.5">
                    记录此刻身心晴雨，在接纳中探寻平静
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-white/85 border border-white/70 flex items-center justify-center text-[#1E3F39] shadow-sm group-hover:scale-112 active:scale-90 transition-all cursor-pointer">
                <ChevronRight className="w-5 h-5 text-emerald-800 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Module 3: Growth Chart Panel */}
          <div
            className="clm-card rounded-[26px] p-5 relative overflow-hidden transition-all"
            {...bubble4}
          >
            <div className="flex items-center justify-between border-b border-stone-200/20 pb-2.5">
              <h3 className="text-[11.5px] font-black text-[#1E3F39] tracking-tight">
                成长概览（本周）
              </h3>
              <span className="text-[9.5px] text-[#8E8575] font-mono font-extrabold bg-white/70 px-2 py-0.5 rounded-full border border-stone-200/10">
                10.05-10.15
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-4 relative z-10">
              <div className="flex flex-col items-center">
                <div className="p-1.5 rounded-lg text-[#5E7F73] mb-1">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <span className="text-xl font-black font-display text-emerald-800 animate-fade-in">
                  {displayStatQuick}
                </span>
                <span className="text-[9px] text-[#8E8575] font-bold mt-0.5">
                  快记
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-1.5 rounded-lg text-[#5D6D63] mb-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xl font-black font-display text-emerald-800 animate-fade-in">
                  {displayStatReflect}
                </span>
                <span className="text-[9px] text-[#8E8575] font-bold mt-0.5">
                  反思
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-1.5 rounded-lg text-amber-600 mb-1">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <span className="text-xl font-black font-display text-amber-700 animate-fade-in">
                  {displayStatPrinciple}
                </span>
                <span className="text-[9px] text-[#8E8575] font-bold mt-0.5">
                  原则
                </span>
              </div>
            </div>

            {/* Custom vector therapeutic landscaping bottom curve */}
            <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden pointer-events-none select-none z-0">
              <svg
                viewBox="0 0 300 40"
                className="w-full h-full text-[#C0E890]/40 preserve-3d"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,25 C40,40 100,10 160,30 C220,50 260,20 300,35 L300,40 L0,40 Z"
                  fill="#C0E890"
                  opacity="0.32"
                />
              </svg>
            </div>
          </div>

          {/* Module 4: Recent Mistakes Log panel */}
          <div className="space-y-2">
            <h3 className="text-[12px] font-black text-[#1E3F39] tracking-tight px-1 flex items-center justify-between">
              <span>
                {dayMistakes.length > 0 ? "该日错题记录" : "最近错题"}
              </span>
              {dayMistakes.length > 0 && (
                <span className="text-[9.5px] text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  真实记录 • {dayMistakes.length} 条
                </span>
              )}
            </h3>

            {dayMistakes.length > 0 ? (
              <div className="space-y-2">
                {dayMistakes.map((mistake) => (
                  <div
                    key={mistake.id}
                    onClick={onNavigateToMistakesList}
                    className="clm-card rounded-[22px] p-4.5 text-left hover:border-emerald-500/30 transition-all cursor-pointer backdrop-blur-md bg-white/90 border border-stone-200/50 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] text-amber-800 font-extrabold bg-[#FFF2DE] border border-amber-200/40 px-2 py-0.5 rounded-md">
                        {mistake.category}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          mistake.status === "待反思"
                            ? "bg-amber-100/60 text-amber-900 border border-amber-200"
                            : "bg-emerald-100/60 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {mistake.status}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-black text-[#1E3F39] leading-snug">
                      {mistake.title || mistake.rawText}
                    </h4>
                    {mistake.principleText && (
                      <p className="text-[10.5px] text-emerald-800/80 mt-2 italic border-l-2 border-emerald-500/30 pl-2 font-medium">
                        提炼原则：{mistake.principleText}
                      </p>
                    )}
                    <div className="text-[9px] text-[#8E8575] font-semibold mt-2.5 text-right">
                      录入时间：
                      {new Date(mistake.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-[9.5px] text-[#8E8575] font-semibold ml-1.5 mb-1.5 italic">
                  * 该日期无新增错题记录，自动为您推荐展示案例：
                </div>
                <div
                  className="clm-card rounded-[22px] p-4.5 text-left"
                  {...bubble5}
                >
                  <h4 className="text-[13.5px] font-black text-[#1E3F39] leading-snug animate-fade-in">
                    {activeDayData.recentMistakeTitle}
                  </h4>

                  <div className="flex items-center justify-between mt-3 text-[10px] gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="truncate bg-[#E0F0F8] text-[#1E3F39] font-black px-2 py-0.5 rounded-md shadow-3xs">
                        {activeDayData.recentCategory}
                      </span>
                      <span className="shrink-0 bg-amber-500/10 text-amber-900 font-extrabold px-2 py-0.5 rounded-md border border-amber-200/30 shadow-3xs whitespace-nowrap">
                        {activeDayData.recentStatus}
                      </span>
                    </div>
                    <span className="shrink-0 text-[#8E8575] font-semibold whitespace-nowrap">
                      {activeDayData.recentDateLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ENHANCED: Full-screen "Mistakes Calendar" ("错题日历") view with Month & Year Selectors */}
      {isCalendarOpen && (
        <div
          onClick={() => setIsCalendarOpen(false)}
          className="fixed inset-0 bg-[#1E3F39]/65 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 backdrop-blur-[32px] w-full max-w-sm rounded-[36px] p-6 border border-white/90 shadow-2xl relative overflow-hidden cursor-default"
          >
            {/* Background glass shine */}
            <div className="absolute -top-24 -left-24 w-52 h-52 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#C0E890]/30 rounded-full blur-3xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCalendarOpen(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-all active:scale-90 shadow-xs z-10 cursor-pointer"
            >
              <X className="w-4 h-4 text-stone-700" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-2.5 mb-5 text-left relative z-10">
              <span className="p-1">
                <GlassIcon emoji="📅" size="md" />
              </span>
              <div>
                <h3 className="text-sm font-black text-[#1E3F39]">
                  错题时光自省日历
                </h3>
                <p className="text-[10px] text-stone-500 font-extrabold">
                  点击任何一日即可跨越时光，深度和解
                </p>
              </div>
            </div>

            {/* Year & Month select bars */}
            <div className="bg-stone-500/5 rounded-2xl p-2.5 flex items-center justify-between gap-2.5 mb-4 relative z-10 border border-stone-200/10">
              {/* Month selector with arrow buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-white active:scale-90 text-[#1E3F39] border border-transparent hover:border-stone-250/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-[#1E3F39] min-w-[76px] text-center">
                  {monthNamesZh[calendarMonth]}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-white active:scale-90 text-[#1E3F39] border border-transparent hover:border-stone-250/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Year Select input picker */}
              <div className="flex items-center gap-1 bg-white/80 border border-stone-200/40 px-2.5 py-1 rounded-xl">
                <select
                  value={calendarYear}
                  onChange={(e) => setCalendarYear(parseInt(e.target.value))}
                  className="text-xs font-black text-[#1E3F39] bg-transparent outline-none cursor-pointer pr-1"
                >
                  <option value={2024}>2024 年</option>
                  <option value={2025}>2025 年</option>
                  <option value={2026}>2026 年</option>
                  <option value={2027}>2027 年</option>
                  <option value={2028}>2028 年</option>
                </select>
              </div>
            </div>

            {/* Days list grid system starts here */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-2.5 select-none relative z-10 w-fit mx-auto">
              {["一", "二", "三", "四", "五", "六", "日"].map((label, lidx) => (
                <span
                  key={lidx}
                  className="text-[10px] font-black text-stone-400"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-1.5 relative z-10 w-fit mx-auto">
              {buildCurrentMonthDays().map((day, cellIndex) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-cell-${cellIndex}`}
                      className="h-8 w-8 text-transparent select-none"
                    />
                  );
                }

                // Check if this cell matches the selected date
                const monthNum = String(calendarMonth + 1).padStart(2, "0");
                const dayStr = String(day).padStart(2, "0");
                const currentCellDateStr = `${calendarYear}-${monthNum}-${dayStr}`;
                const isCellSelected =
                  activeDateItem.dateStr === currentCellDateStr;

                // Let's seed hasLeaf on repeating factors (same criteria or similar)
                const isLeafy = day % 6 === 0 || day % 7 === 2 || day === 8;

                return (
                  <button
                    key={`day-cell-${day}`}
                    onClick={() => handleSelectFromCalendarModal(day)}
                    className={`h-8 w-8 rounded-xl text-[11px] font-bold relative flex items-center justify-center transition-all ${
                      isCellSelected
                        ? "bg-[#C0E890] text-[#1E3F39] font-black scale-110 shadow-md ring-2 ring-emerald-600/20"
                        : "bg-white/60 hover:bg-emerald-50 text-stone-700 hover:scale-105 active:scale-95 border border-stone-250/10"
                    }`}
                  >
                    <span>{day}</span>
                    {isLeafy && (
                      <GlassIcon emoji="🌱" size="xs" className="scale-[0.45] origin-bottom-right absolute -bottom-1 -right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Guide hint footer */}
            <div className="mt-5 text-[10px] text-[#416B61] bg-[#416B61]/5 p-3 rounded-2xl flex items-start gap-1.5 text-left leading-normal relative z-10 border border-[#416B61]/10">
              <GlassIcon emoji="💡" size="xs" />
              <p className="font-extrabold text-stone-600">
                标记了 <span className="text-emerald-700 text-xs">🌱</span>{" "}
                的日子记录有历史错题与自省轨迹。点击即可载入进行温故重构。
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Deep Review Card overlay inline */}
      {isDeepReviewOpen && (
        <div className="fixed inset-0 bg-[#1E3F39]/55 backdrop-blur-md flex items-center justify-center z-[200] p-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className="w-full max-w-sm rounded-[32px] p-6 text-stone-800 relative overflow-hidden flex flex-col gap-4 border border-white/70"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 253, 250, 0.92) 100%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255, 255, 255, 0.8), 0 24px 64px rgba(30, 63, 57, 0.22)",
            }}
          >
            {/* Visual glow spotlights inside the card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/15 rounded-full blur-2xl pointer-events-none -translate-y-6 translate-x-6" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none translate-y-6 -translate-x-6" />

            {/* Header info */}
            <div className="flex items-start justify-between relative z-10 w-full">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#C0E890]/30 border border-white/60 flex items-center justify-center text-xl text-emerald-800 shadow-inner">
                  🌿
                </div>
                <div className="text-left">
                  <h3 className="text-[15px] font-black text-[#1E3F39] tracking-tight">
                    每日深度轨迹回顾
                  </h3>
                  <p className="text-[10px] text-stone-500 font-extrabold uppercase font-mono tracking-wider mt-0.5">
                    {activeDateItem.year}年{activeDateItem.month}月
                    {activeDateItem.day}日 · {activeDateItem.weekday}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeepReviewOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 transition-colors flex items-center justify-center text-stone-600 hover:text-stone-800 active:scale-90"
              >
                <X className="w-4 h-4 text-[#1E3F39]" />
              </button>
            </div>

            {/* Main Stats Block */}
            <div className="clm-card rounded-2xl p-4 relative z-10 text-left border border-white/50 bg-white/45">
              <div className="text-[11px] font-extrabold uppercase text-[#5E7F73] tracking-widest mb-3 flex items-center gap-1.5 border-b border-[#5E7F73]/10 pb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                <span>心流和解指标摘要</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-1">
                <div className="bg-white/55 px-2 py-2 rounded-xl flex flex-col justify-center border border-white/70 shadow-xs">
                  <span className="text-lg font-black font-display text-emerald-800">
                    {displayStatQuick}
                  </span>
                  <span className="text-[9px] text-[#8E8575] font-bold">
                    快记
                  </span>
                </div>
                <div className="bg-white/55 px-2 py-2 rounded-xl flex flex-col justify-center border border-white/70 shadow-xs">
                  <span className="text-lg font-black font-display text-emerald-800">
                    {displayStatReflect}
                  </span>
                  <span className="text-[9px] text-[#8E8575] font-bold">
                    反思
                  </span>
                </div>
                <div className="bg-white/55 px-2 py-2 rounded-xl flex flex-col justify-center border border-white/70 shadow-xs">
                  <span className="text-lg font-black font-display text-[#1E3F39]">
                    {displayStatPrinciple}
                  </span>
                  <span className="text-[9px] text-[#8E8575] font-bold">
                    原则
                  </span>
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-[10.5px] font-extrabold text-stone-600 bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-600/10">
                <span className="flex items-center gap-1 whitespace-nowrap"><GlassIcon emoji="🌱" size="xs" /> 待深化反思：</span>
                <span className="text-emerald-800 font-bold">
                  {displayPendingCount} 条未竟项
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-3 relative z-10 overflow-y-auto max-h-[180px] pr-0.5 text-left">
              {/* Daily dynamic principle */}
              <div className="bg-white/50 border border-white/60 p-3.5 rounded-2xl shadow-xs">
                <div className="text-[9.5px] font-extrabold text-[#1E3F39] flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-emerald-600" />
                  <span>今日警醒与行动原则：</span>
                </div>
                <p className="text-[11.5px] text-stone-700 font-bold leading-relaxed">
                  {displayPrincipleText}
                </p>
              </div>

              {/* Recent mistake logged on this day */}
              <div className="bg-white/50 border border-white/60 p-3.5 rounded-2xl shadow-xs">
                <div className="text-[9.5px] font-extrabold text-[#1E3F39] flex items-center gap-1 mb-1.5">
                  <Lightbulb className="w-3 h-3 text-amber-600" />
                  <span>载入的历史自省：</span>
                </div>
                <h4 className="text-[12px] font-extrabold text-stone-800 leading-snug">
                  {dayMistakes.length > 0
                    ? dayMistakes[0].title || dayMistakes[0].rawText
                    : activeDayData.recentMistakeTitle}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-emerald-500/10 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-black">
                    {dayMistakes.length > 0
                      ? dayMistakes[0].category
                      : activeDayData.recentCategory}
                  </span>
                  <span className="bg-amber-500/10 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-black">
                    {dayMistakes.length > 0
                      ? dayMistakes[0].status
                      : activeDayData.recentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Therapeutic Zen tip */}
            <div className="p-3 bg-[#C0E890]/20 rounded-2xl text-[10.5px] text-[#1E3F39] font-bold text-left flex gap-1.5 relative z-10 border border-[#C0E890]/40 leading-normal items-start">
              <GlassIcon emoji="☘️" size="xs" />
              <p className="text-stone-600 font-extrabold">
                “错题”是我们对心智局促的探索记录。愿能接纳往昔，以更通透澄澈的眼光重新审视周遭之多变。
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. Left Side Menu Drawer */}
      <AnimatePresence>
        {showMenuDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenuDrawer(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Panel sliding from left */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 left-0 w-4/5 max-w-[290px] bg-white border-r border-stone-200 shadow-2xl flex flex-col h-full text-stone-800 p-5 z-50 justify-between font-sans select-none"
            >
              <div className="space-y-6">
                {/* Header Profile with Close */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 pl-0.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/shark_avatar.png" // User-provided image
                      alt="用户头像"
                      className="w-11 h-11 rounded-full border border-emerald-200/50 object-cover shadow-3xs"
                    />
                    <div>
                      <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-wider font-mono">
                        自省空间主人
                      </h3>
                      <p className="text-sm font-black text-stone-800 leading-snug mt-0.5">
                        {user.nickname || "不二自省家"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMenuDrawer(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Subtitle status line */}
                <div className="bg-[#5E7F73]/5 border border-[#5E7F73]/10 px-4 py-2.5 rounded-xl text-[10.5px] text-[#2C4840] font-extrabold leading-normal text-left flex items-center gap-2 flex-wrap">
                  <GlassIcon emoji="🌱" size="xs" /> 连续练习：连续反思{" "}
                  <span className="text-emerald-700 font-mono font-extrabold text-xs">
                    {streakCount}
                  </span>{" "}
                  天，心智正向汇聚中。
                </div>

                {/* Navigation lists */}
                <div className="space-y-1">
                  <p className="text-[9px] text-[#8E8575] font-black uppercase tracking-widest pl-1 mb-2 text-left">
                    反思应用罗盘导航
                  </p>

                  {/* Draft Box Shortcut */}
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      if (onNavigateToDraftBox) onNavigateToDraftBox();
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-stone-50 rounded-xl hover:translate-x-1.5 transition-all text-stone-700 cursor-pointer"
                  >
                    <GlassIcon emoji="📝" size="xs" />
                    <span className="text-xs font-black">未完草稿箱</span>
                  </button>

                  {/* Principles list */}
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      onNavigateToPrinciples();
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-stone-50 rounded-xl hover:translate-x-1.5 transition-all text-stone-700 cursor-pointer"
                  >
                    <GlassIcon emoji="💡" size="xs" />
                    <span className="text-xs font-black">自省原则库一览</span>
                  </button>

                  {/* Breath Meditation */}
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      if (onNavigateToBreathing) onNavigateToBreathing();
                    }}
                    className="w-full flex items-center gap-4 p-3 text-left hover:bg-stone-50 rounded-xl hover:translate-x-1.5 transition-all text-stone-700 cursor-pointer"
                  >
                    <GlassIcon emoji="🍵" size="xs" />
                    <span className="text-xs font-black">每日心流呼吸</span>
                  </button>

                  {/* Mood diary */}
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      if (onNavigateToMood) onNavigateToMood();
                    }}
                    className="w-full flex items-center justify-between p-3 text-left mood-flow-card hover:translate-x-1 transition-all cursor-pointer group mt-1.5"
                  >
                    {/* Ripple container inside sidebar drawer button */}
                    <div className="mood-color-ripple-container">
                      <div className="mood-color-ripple-blob" />
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                      <GlassIcon emoji="🌸" size="xs" />
                      <span className="text-xs font-black text-stone-800">心境每日打卡</span>
                    </div>

                    <div className="relative z-10 text-[9.5px] text-emerald-800 bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded-full font-black group-hover:scale-105 transition-all">
                      打卡
                    </div>
                  </button>
                </div>

                {/* AI Listener setting summary overview */}
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-[9px] text-[#8E8575] font-black uppercase tracking-widest pl-1 mb-2 text-left font-display">
                    我的 AI 倾听师音调
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-stone-700">
                      当前模式：{user.aiTone || "理性陪伴"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-stone-400 font-bold border-t border-stone-100 pt-4 leading-normal mt-5">
                <div className="flex items-center justify-center gap-1 mb-0.5"><GlassIcon emoji="🍃" size="xs" /> 治愈错题 App v1.50</div>
                <p className="mt-0.5">不二过即是至善 · 自我探索引航仪</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Right Side Notifications Drawer */}
      <AnimatePresence>
        {showNotificationsDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationsDrawer(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Panel sliding from right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 right-0 w-4/5 max-w-[290px] bg-white border-l border-stone-200 shadow-2xl flex flex-col h-full text-stone-800 p-5 z-50 justify-between select-none"
            >
              <div className="space-y-5.5 overflow-y-auto no-scrollbar pb-6 text-left">
                {/* Header Notifications with Close */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <GlassIcon emoji="🔔" size="xs" />
                    <div>
                      <h3 className="text-[11px] font-black text-stone-400 uppercase tracking-wider font-mono">
                        通知与警报
                      </h3>
                      <p className="text-xs font-black text-stone-800 mt-0.5">
                        最近 3 条未读足迹
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotificationsDrawer(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Notifications stack */}
                <div className="space-y-3">
                  {/* Notification card 1: Warning alert */}
                  <div className="p-3 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl border border-rose-500/15 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 whitespace-nowrap">
                        <GlassIcon emoji="⚠️" size="xs" /> 频繁发生警告
                      </span>
                      <span className="text-[8px] text-stone-400 font-mono font-bold">
                        10分钟前
                      </span>
                    </div>
                    <p className="text-xs font-black text-rose-900 leading-snug pb-0.5">
                      高频发生警告
                    </p>
                    <p className="text-[10px] text-stone-500 leading-normal font-bold">
                      你最近在“决策思考”分类中的痛感级别偏高，建议调阅已归纳的第
                      3 号不二过原则予以预防。
                    </p>
                  </div>

                  {/* Notification card 2: Healthy nudge */}
                  <div className="p-3 bg-[#C0E890]/10 hover:bg-[#C0E890]/15 rounded-2xl border border-[#C0E890]/25 transition-colors space-y-1 session-card">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] bg-[#E9F8DF] text-emerald-800 px-1.5 py-0.5 rounded font-black font-display flex items-center gap-0.5 whitespace-nowrap">
                        <GlassIcon emoji="💡" size="xs" /> 午间心流自醒
                      </span>
                      <span className="text-[8px] text-stone-400 font-mono font-bold">
                        2小时前
                      </span>
                    </div>
                    <p className="text-xs font-black text-[#1E3F39] leading-snug pb-0.5">
                      呼吸是心境的晴雨表
                    </p>
                    <p className="text-[10px] text-stone-500 leading-normal font-bold">
                      静下心来，开启 1
                      分钟的「腹式呼吸训练」，让紧绷的身体微粒随空气流动而释然。
                    </p>
                  </div>

                  {/* Notification card 3: Footprint celebration */}
                  <div className="p-3 bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl border border-amber-500/15 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 whitespace-nowrap">
                        <GlassIcon emoji="🎯" size="xs" /> 心智里程碑
                      </span>
                      <span className="text-[8px] text-stone-400 font-mono font-bold">
                        昨天 18:30
                      </span>
                    </div>
                    <p className="text-xs font-black text-amber-900 leading-snug pb-0.5">
                      原则库完美起航
                    </p>
                    <p className="text-[10px] text-stone-500 leading-normal font-bold">
                      恭喜！你已累计提炼了多条核心行为自省原则，今日全脑心智专注效率指数回升
                      12%。
                    </p>
                  </div>
                </div>

                {/* Reminder push quick switches */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <p className="text-[9px] text-[#8E8575] font-black uppercase tracking-widest pl-1 text-left">
                    每日自省提醒开关
                  </p>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-stone-700">
                        推送每日复盘原则
                      </span>
                      <div className="w-8 h-4 rounded-full bg-emerald-500 flex justify-end p-0.5 items-center cursor-pointer">
                        <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-stone-500">
                      <span>默认推送时间</span>
                      <span className="bg-white border border-stone-250 px-2 py-0.5 rounded cursor-pointer font-mono text-stone-700 hover:bg-stone-50">
                        21:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button at bottom */}
              <button
                onClick={() => setShowNotificationsDrawer(false)}
                className="w-full py-2.5 rounded-full bg-[#1E3F39] hover:bg-[#1E3F39]/95 text-white font-black text-xs shadow-xs mt-1.5 cursor-pointer text-center"
              >
                我知道了 · 关闭警报
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
