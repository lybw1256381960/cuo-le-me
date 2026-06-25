import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, TrendingDown, Share2, Compass, AlertCircle, CalendarRange, Star, Cpu, Sparkles, FileDown, Copy, Check, X, Award } from "lucide-react";
import { safeStorage } from "../../storage";
import { safeCopyToClipboard } from "../../utils";
import GlassIcon from "../GlassIcon";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

interface PersonalReportProps {
  onBack: () => void;
  mistakes?: any[];
}

export default function PersonalReport({ onBack, mistakes }: PersonalReportProps) {
  const [cycle, setCycle] = useState<string>("双周周期");
  const [nestedLevel, setNestedLevel] = useState<"summary" | "detail">("summary");
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");

  const slideVariants = {
    initial: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? 80 : -80,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
      },
    },
    exit: (dir: "forward" | "backward") => ({
      x: dir === "forward" ? -80 : 80,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
      },
    }),
  };

  // Load mistakes from prop or local storage fallback
  let userMistakes = mistakes;
  if (!userMistakes) {
    const saved = safeStorage.getItem("clm_user_mistakes");
    if (saved) {
      try {
        userMistakes = JSON.parse(saved);
      } catch (e) {
        userMistakes = [];
      }
    } else {
      userMistakes = [];
    }
  }

  // Compute counts for each category specifically aligning with requested "习惯、工作、情绪、社交等"
  const counts: Record<string, number> = {
    "社交沟通": 0,
    "工作拖延": 0,
    "日常决策": 0,
    "情绪控制": 0,
    "高效习惯": 0,
    "其他": 0,
  };

  userMistakes?.forEach((m: any) => {
    const readableCat = m.category || "其他";
    if (counts[readableCat] !== undefined) {
      counts[readableCat]++;
    } else {
      const lower = String(readableCat).toLowerCase();
      if (lower.includes("沟通") || lower.includes("communication") || lower.includes("social") || lower.includes("社交")) {
        counts["社交沟通"]++;
      } else if (lower.includes("拖延") || lower.includes("procrastination") || lower.includes("work") || lower.includes("工作")) {
        counts["工作拖延"]++;
      } else if (lower.includes("决策") || lower.includes("decision")) {
        counts["日常决策"]++;
      } else if (lower.includes("控制") || lower.includes("emotion") || lower.includes("情绪")) {
        counts["情绪控制"]++;
      } else if (lower.includes("习惯") || lower.includes("habit")) {
        counts["高效习惯"]++;
      } else {
        counts["其他"]++;
      }
    }
  });

  // Scale data for Recharts Radar representation (higher value means more mistakes/gaps in that quadrant)
  const categoryRadarData = [
    { subject: "社交沟通", "短板程度": Math.max(25, Math.min(100, (counts["社交沟通"] * 30) || 55)) },
    { subject: "高效习惯", "短板程度": Math.max(20, Math.min(100, (counts["高效习惯"] * 25) || 45)) },
    { subject: "情绪控制", "短板程度": Math.max(30, Math.min(100, (counts["情绪控制"] * 30) || 75)) },
    { subject: "日常决策", "短板程度": Math.max(15, Math.min(100, (counts["日常决策"] * 25) || 35)) },
    { subject: "工作拖延", "短板程度": Math.max(20, Math.min(100, (counts["工作拖延"] * 25) || 50)) },
    { subject: "其他难题", "短板程度": Math.max(10, Math.min(100, (counts["其他"] * 25) || 20)) },
  ];

  // Dynamically compute counts for custom tags representation
  const tagCounts: { [tag: string]: number } = {};
  userMistakes?.forEach((m: any) => {
    if (m.tags && Array.isArray(m.tags)) {
      m.tags.forEach((tag: string) => {
        const cleaned = tag.trim();
        if (cleaned) {
          tagCounts[cleaned] = (tagCounts[cleaned] || 0) + 1;
        }
      });
    }
  });

  const tagPieData = Object.entries(tagCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const hasTagData = tagPieData.length > 0;
  const finalPieData = hasTagData
    ? tagPieData
    : [
        { name: "高频", value: 5 },
        { name: "重要", value: 3 },
        { name: "待观察", value: 2 },
        { name: "需要关注", value: 1 },
      ];

  const PIE_COLORS = ["#5E7F73", "#C35A3A", "#D9A241", "#4A6E82", "#7E6A93", "#9B8570", "#CE7B50", "#52A084"];
  const [aiReportData, setAiReportData] = useState<{trendAnalysis: string, keywords: string[], advice: string} | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [showAIReportModal, setShowAIReportModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const [heatmapView, setHeatmapView] = useState<"month" | "year">("month");

  const getPracticeHeatmapData = (mode: "month" | "year") => {
    let s = safeStorage.getItem("clm_user_evaluations");
    let evv: any[] = [];
    if (s) {
      try { evv = JSON.parse(s); } catch (e) {}
    }

    const today = new Date();
    const dataPoints: any[] = [];

    if (mode === "month") {
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOffset = new Date(year, month, 1).getDay();

      for (let d = 1; d <= daysInMonth; d++) {
        const currentDate = new Date(year, month, d);
        const dayOfWeek = currentDate.getDay();
        const absoluteDayOffset = d + firstDayOffset - 1;
        const weekIndex = Math.floor(absoluteDayOffset / 7) + 1;

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        
        const actualCheckin = evv.find(e => {
          if (!e.date) return false;
          return e.date === dateStr || e.date.endsWith(`-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
        });

        let score = 0;
        let isReal = false;
        let note = "今日暂无原则践行评分";

        if (actualCheckin) {
          score = actualCheckin.score || 8;
          isReal = true;
          note = actualCheckin.note || "主动打卡践行，自我阻断偏误";
        } else {
          const isPast = currentDate.getTime() < today.getTime();
          if (isPast) {
            const hash = d * 13 + month * 7;
            if (hash % 10 < 8) {
              score = 6 + (hash % 5);
              note = "历史践行归档稳定";
              isReal = false;
            }
          }
        }

        dataPoints.push({
          x: weekIndex,
          y: dayOfWeek,
          score: score,
          date: dateStr,
          dayLabel: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][dayOfWeek],
          weekLabel: `W${weekIndex}`,
          note: note,
          isReal: isReal
        });
      }
    } else {
      for (let m = 0; m < 12; m++) {
        const isPastMonth = m <= today.getMonth();
        for (let w = 1; w <= 5; w++) {
          let score = 0;
          let note = "本月该度量阶段未开启原则打卡";
          let isReal = false;

          const dateStr = `2026-${String(m + 1).padStart(2, "0")} (W${w})`;

          const matches = evv.filter(e => {
            if (!e.date) return false;
            try {
              const dParts = new Date(e.date);
              return dParts.getMonth() === m;
            } catch(err) {
              return false;
            }
          });

          if (matches.length > 0 && w === Math.ceil(today.getDate() / 7) && m === today.getMonth()) {
            const sum = matches.reduce((acc, curr) => acc + (curr.score || 8), 0);
            score = Math.round(sum / matches.length);
            isReal = true;
            note = `本周期实际原则践行 ${matches.length} 次，平均稳定性评分 ${score} 分`;
          } else if (isPastMonth) {
            const hash = m * 31 + w * 17;
            if (hash % 5 !== 0) {
              score = 6 + (hash % 4);
              note = `历史跨度平均稳定性 ${score} 分`;
              isReal = false;
            }
          }

          dataPoints.push({
            x: m + 1,
            y: w,
            score: score,
            date: dateStr,
            dayLabel: `第 ${w} 周`,
            weekLabel: `${m + 1}月`,
            note: note,
            isReal: isReal
          });
        }
      }
    }

    return dataPoints;
  };

  const renderHeatSquare = (props: any) => {
    const { cx, cy, payload } = props;
    const score = payload.score;
    let fillCol = "#FAF8F2";
    if (score > 0 && score <= 3) fillCol = "#FFF1CC";
    else if (score > 3 && score <= 6) fillCol = "#C1E3C8";
    else if (score > 6 && score <= 8) fillCol = "#5E7F73";
    else if (score > 8) fillCol = "#1E3F39";
    
    return (
      <rect 
        x={cx - 7} 
        y={cy - 7} 
        width={14} 
        height={14} 
        rx={3} 
        ry={3} 
        fill={fillCol}
        stroke="rgba(30,63,57,0.12)"
        strokeWidth={0.5}
      />
    );
  };

  const handleGenerateAIReport = async () => {
    setIsGeneratingReport(true);
    setShowAIReportModal(true);
    setAiReportData(null);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/generate-weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cycle }),
      });
      const data = await resp.json();
      if (data) {
        setAiReportData(data);
      }
    } catch (err) {
      console.error("AI report generation failed:", err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyText = () => {
    if (!aiReportData) return;
    const textToCopy = `【错了吗】自省成长智慧周报 (${cycle})
-----------------------------------------
【错题趋势分析】
${aiReportData.trendAnalysis}

【核心反思关键词】
${aiReportData.keywords ? aiReportData.keywords.join(" • ") : ""}

【心智改良建议】
${aiReportData.advice}
-----------------------------------------
不让每一次痛苦虚流，做自己最温柔的引路人。`;
    safeCopyToClipboard(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        setIsCopied(false);
      });
  };

  const handleGenerateShareImage = () => {
    if (!aiReportData) return;
    setIsGeneratingImage(true);
    
    setTimeout(() => {
      // Offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsGeneratingImage(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;

      // Theme Gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#FAF8ED");
      grad.addColorStop(0.2, "#EEF9F4");
      grad.addColorStop(0.8, "#FCFAF2");
      grad.addColorStop(1, "#FAF7ED");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ambient decoration
      ctx.fillStyle = "rgba(94, 127, 115, 0.05)";
      ctx.beginPath();
      ctx.arc(80, 250, 240, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(232, 168, 106, 0.05)";
      ctx.beginPath();
      ctx.arc(520, 850, 200, 0, Math.PI * 2);
      ctx.fill();

      // Heading block
      ctx.fillStyle = "#1E3F39";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("【 错了吗 • 心智自省智慧周报 】", 40, 80);

      ctx.fillStyle = "#8E8575";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`周期区间: ${cycle}  ·  AI 智慧模型提炼成果`, 45, 115);

      // Divider line
      ctx.strokeStyle = "rgba(30, 63, 57, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, 140);
      ctx.lineTo(560, 140);
      ctx.stroke();

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split("");
        let line = "";
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n];
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
      };

      // Part 1
      ctx.fillStyle = "#1EBE70";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("📈 本周错题趋势分析", 45, 185);

      ctx.fillStyle = "#3F3935";
      ctx.font = "14px sans-serif";
      const trendEndY = wrapText(
        aiReportData.trendAnalysis || "错题退潮趋势符合良好认知演进步调。",
        45,
        220,
        510,
        24
      );

      // Part 2
      const keywordsY = trendEndY + 60;
      ctx.fillStyle = "#A16207";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("☁️ 核心反思关键词标签", 45, keywordsY);

      ctx.font = "bold 13px sans-serif";
      let cursorX = 45;
      let cursorY = keywordsY + 35;
      (aiReportData.keywords || ["自省察觉", "沟通改进", "认知闭环"]).forEach((word) => {
        const textWidth = ctx.measureText(word).width;
        ctx.fillStyle = "rgba(94, 127, 115, 0.08)";
        ctx.beginPath();
        ctx.rect(cursorX - 8, cursorY - 18, textWidth + 16, 26);
        ctx.fill();

        ctx.fillStyle = "#1E3F39";
        ctx.fillText(word, cursorX, cursorY);
        cursorX += textWidth + 30;
        if (cursorX > 500) {
          cursorX = 45;
          cursorY += 40;
        }
      });

      // Part 3
      const adviceY = cursorY + 65;
      ctx.fillStyle = "#0369A1";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("🌱 行动习惯改进指引", 45, adviceY);

      ctx.fillStyle = "#3F3935";
      ctx.font = "14px sans-serif";
      const lines = (aiReportData.advice || "持续自省不重复折损。").split("\n");
      let textCursorY = adviceY + 35;
      lines.forEach((line) => {
        textCursorY = wrapText(line, 45, textCursorY, 510, 24) + 24;
      });

      // Bottom Signature
      ctx.strokeStyle = "rgba(30, 63, 57, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 990);
      ctx.lineTo(560, 990);
      ctx.stroke();

      ctx.fillStyle = "#1E3F39";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("错 了 吗", 262, 1025);

      ctx.fillStyle = "#7B7268";
      ctx.font = "italic 11px sans-serif";
      ctx.fillText("“ 不让每一次痛苦虚流，做自己最温柔的引路人 ”", 150, 1055);

      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `错了吗_心智成长周报_${cycle}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Export canvas card image failed:", err);
      }
      setIsGeneratingImage(false);
    }, 1000);
  };

  // Dynamic Radar Chart coverage analyzer covering 5 main cognitive quadrants
  const getRadarData = (selectedCycle: string) => {
    switch (selectedCycle) {
      case "原周分析":
        return [
          { subject: "情绪察觉", A: 85, B: 70, fullMark: 100 },
          { subject: "事实拆解", A: 70, B: 60, fullMark: 100 },
          { subject: "行动践行", A: 75, B: 65, fullMark: 100 },
          { subject: "原则提炼", A: 91, B: 78, fullMark: 100 },
          { subject: "长期认知", A: 65, B: 52, fullMark: 100 },
        ];
      case "月度汇总":
        return [
          { subject: "情绪察觉", A: 92, B: 80, fullMark: 100 },
          { subject: "事实拆解", A: 88, B: 75, fullMark: 100 },
          { subject: "行动践行", A: 90, B: 70, fullMark: 100 },
          { subject: "原则提炼", A: 96, B: 85, fullMark: 100 },
          { subject: "长期认知", A: 85, B: 65, fullMark: 100 },
        ];
      default: // 双周周期
        return [
          { subject: "情绪察觉", A: 78, B: 72, fullMark: 100 },
          { subject: "事实拆解", A: 74, B: 68, fullMark: 100 },
          { subject: "行动践行", A: 80, B: 70, fullMark: 100 },
          { subject: "原则提炼", A: 85, B: 80, fullMark: 100 },
          { subject: "长期认知", A: 72, B: 60, fullMark: 100 },
        ];
    }
  };

  const getReportData = (selectedCycle: string) => {
    switch (selectedCycle) {
      case "原周分析":
        return {
          metricBadges: [
            { title: "本周专注自省冥想", value: "7", desc: "周连续复盘天数", tag: "天", color: "text-[#5E7F73]" },
            { title: "单周错误改善效率高", value: "88%", desc: "单周习惯替代重置率", tag: "^", color: "text-[#1E3F39]" },
            { title: "本周觉察控制等级", value: "A", desc: "本周觉察等级", tag: "级", color: "text-[#5E7F73]" },
            { title: "单周防卫情绪降幅", value: "-35%", desc: "防卫性应激反应下降", tag: "%", color: "text-[#1E3F39]" },
          ],
          emotionList: [
            { name: "主动慢速深呼吸阻断机制", val: 82, color: "bg-[#C0E890]" },
            { name: "防守型应激情绪出现频率", val: 24, color: "bg-[#FFF9B1]" },
            { name: "会前战术性焦虑缓和占比", val: 20, color: "bg-[#E0F0F8]" },
            { name: "今日习惯原则追踪完成度", val: 90, color: "bg-[#5E7F73]" },
          ],
          improvementProgress: [
            { name: "本周口头反思预演实践率", val: 85 },
            { name: "今日原则每日追踪提醒接纳度", val: 95 },
          ],
          summary: "本周单周分析：由于高频遵循了『在大声切入辩护前先长呼吸4次』以及『记下对方三个论点』的行为卡片，你成功化解了2次例行沟通危机！情绪愉悦性与平静感增加。保持这个姿势，下周继续笃行不怠！"
        };
      case "月度汇总":
        return {
          metricBadges: [
            { title: "月度记录累计复盘数", value: "31", desc: "当月累计反思数", tag: "次", color: "text-[#5E7F73]" },
            { title: "同类问题月度不再犯", value: "82%", desc: "月度零犯错达成率", tag: "^", color: "text-[#1E3F39]" },
            { title: "月度综合质量星级", value: "S-", desc: "月度复盘质量星级", tag: "级", color: "text-[#5E7F73]" },
            { title: "高阶情商心律提升度", value: "+38%", desc: "情商及心律掌控力提升", tag: "%", color: "text-[#1E3F39]" },
          ],
          emotionList: [
            { name: "主动内化深度思考执行率", val: 88, color: "bg-[#C0E890]" },
            { name: "全局心智模型自洽调和度", val: 78, color: "bg-[#FFF9B1]" },
            { name: "对外社交抗压力弹性感知", val: 12, color: "bg-[#E0F0F8]" },
            { name: "正念自洽心流常态化比例", val: 40, color: "bg-[#5E7F73]" },
          ],
          improvementProgress: [
            { name: "月度核心不二过通关达成率", val: 76 },
            { name: "自我原则库深度沉淀认可度", val: 84 },
          ],
          summary: "本月月度汇总：恭喜你！安全感构建、腹式舒放呼吸以及屏幕便利贴等在日常中产生了难以估量的稳固心智模型。当脑内防卫激应反应来临时，你不仅能够提前2s察觉呼吸局促，还能将其提炼为包容且深刻的个人行为资产！表现完美！"
        };
      default: // 双周周期 (Original)
        return {
          metricBadges: [
            { title: "由于坚持复盘天数", value: "25", desc: "连续复盘天数", tag: "天", color: "text-[#5E7F73]" },
            { title: "错误改善掌握指数", value: "63%", desc: "错误改进掌握率", tag: "^", color: "text-[#1E3F39]" },
            { title: "综合成长评级", value: "A-", desc: "整体成长评级", tag: "级", color: "text-[#5E7F73]" },
            { title: "沟通/执行效益增速", value: "+15%", desc: "决策及干练度提升", tag: "%", color: "text-[#1E3F39]" },
          ],
          emotionList: [
            { name: "习惯反思主导率", val: 73, color: "bg-[#C0E890]" },
            { name: "技术抉择困惑度", val: 39, color: "bg-[#FFF9B1]" },
            { name: "工作防守型焦虑", val: 30, color: "bg-[#E0F0F8]" },
            { name: "情绪掌控度反馈", val: 18, color: "bg-[#5E7F73]" },
          ],
          improvementProgress: [
            { name: "错误排查复盘进度", val: 54 },
            { name: "成功反思执行达成率", val: 62 },
          ],
          summary: "双周周期总结：本周期内由“慢决策”与“身心平衡练习”产生的正向防护极其显著。身体与言行逐渐自发遵循温和内省逻辑。建议对“原则详情”中设立的每日提醒保持追踪，持续保持温和自洽！"
        };
    }
  };

  const getChartData = (selectedCycle: string) => {
    // Load local stored evaluations from system notifications
    let s = safeStorage.getItem("clm_user_evaluations");
    let evv: any[] = [];
    if (s) {
      try { evv = JSON.parse(s); } catch(e) {}
    }

    let points = [];
    switch (selectedCycle) {
      case "原周分析":
        points = [
          { name: "周一", "反思效率": 65, "原则践行频率": 58, "上周期基准": 45 },
          { name: "周二", "反思效率": 72, "原则践行频率": 62, "上周期基准": 50 },
          { name: "周三", "反思效率": 60, "原则践行频率": 66, "上周期基准": 52 },
          { name: "周四", "反思效率": 85, "原则践行频率": 75, "上周期基准": 48 },
          { name: "周五", "反思效率": 78, "原则践行频率": 70, "上周期基准": 55 },
          { name: "周六", "反思效率": 90, "原则践行频率": 82, "上周期基准": 60 },
          { name: "周日", "反思效率": 98, "原则践行频率": 92, "上周期基准": 58 }
        ];
        if (evv.length > 0) {
          const totalRating = evv.reduce((acc, curr) => acc + (curr.score || 5), 0);
          const avgPct = Math.round((totalRating / (evv.length * 7)) * 100);
          // dynamically reflect in Sunday and Saturday values
          points[5]["原则践行频率"] = Math.min(100, Math.round(avgPct * 0.95));
          points[6]["原则践行频率"] = Math.min(100, avgPct);
        }
        break;
      case "月度汇总":
        points = [
          { name: "W1", "反思效率": 55, "原则践行频率": 48, "上周期基准": 40 },
          { name: "W2", "反思效率": 68, "原则践行频率": 60, "上周期基准": 45 },
          { name: "W3", "反思效率": 75, "原则践行频率": 68, "上周期基准": 52 },
          { name: "W4", "反思效率": 82, "原则践行频率": 74, "上周期基准": 48 },
          { name: "W5", "反思效率": 92, "原则践行频率": 88, "上周期基准": 55 }
        ];
        if (evv.length > 0) {
          const totalRating = evv.reduce((acc, curr) => acc + (curr.score || 5), 0);
          const avgPct = Math.round((totalRating / (evv.length * 7)) * 100);
          points[4]["原则践行频率"] = Math.min(100, avgPct);
        }
        break;
      default: // 双周周期 (Default)
        points = [
          { name: "05/01", "反思效率": 58, "原则践行频率": 50, "上周期基准": 42 },
          { name: "05/08", "反思效率": 70, "原则践行频率": 58, "上周期基准": 46 },
          { name: "05/15", "反思效率": 64, "原则践行频率": 66, "上周期基准": 50 },
          { name: "05/22", "反思效率": 82, "原则践行频率": 74, "上周期基准": 52 },
          { name: "05/30", "反思效率": 91, "原则践行频率": 83, "上周期基准": 56 }
        ];
        if (evv.length > 0) {
          const totalRating = evv.reduce((acc: number, curr: any) => acc + (curr.score || 5), 0);
          const avgPct = Math.round((totalRating / (evv.length * 7)) * 100);
          points[4]["原则践行频率"] = Math.min(100, avgPct);
        }
        break;
    }
    return points;
  };

  const getDailyStabilityData = () => {
    let s = safeStorage.getItem("clm_user_evaluations");
    let evv: any[] = [];
    if (s) {
      try { evv = JSON.parse(s); } catch(e) {}
    }

    if (evv.length === 0) {
      return [
        { date: "06-10", "评分": 7.5, "备注": "初次实践，略显局促" },
        { date: "06-11", "评分": 8.0, "备注": "深呼吸控制良好" },
        { date: "06-12", "评分": 8.5, "备注": "防卫情绪明显降温" },
        { date: "06-13", "评分": 7.0, "备注": "有少量防御辩解行为" },
        { date: "06-14", "评分": 9.0, "备注": "完美说出原则行动" },
        { date: "06-15", "评分": 9.5, "备注": "完全包容对方论点" },
        { date: "06-16", "评分": 9.2, "备注": "情绪波动完美阻断" }
      ];
    }

    const sorted = [...evv].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map((item) => {
      let dateLabel = "06-16";
      if (item.date) {
        try {
          const parts = item.date.split("-");
          dateLabel = parts.length >= 3 ? `${parts[1]}-${parts[2]}` : item.date;
        } catch(err) {
          dateLabel = item.date;
        }
      }
      return {
        date: dateLabel,
        "评分": item.score || 8,
        "备注": item.note || "践行稳定"
      };
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 border border-stone-200/50 rounded-2xl shadow-md text-[10px] font-semibold text-neutral-700">
          <p className="font-extrabold text-[#1E3F39] mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
              <span className="font-mono text-[11px] font-black text-[#1E3F39]">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const reportData = getReportData(cycle);
  const chartData = getChartData(cycle);
  const radarData = getRadarData(cycle);
  const metricBadges = reportData.metricBadges;
  const emotionList = reportData.emotionList;
  const improvementProgress = reportData.improvementProgress;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="flex-1 flex flex-col bg-linear-to-b from-[#E2F5FC] via-[#E8F8F0] to-[#F1F9F6] h-full text-neutral-850 relative no-scrollbar animate-fade-in"
    >
      
      {/* Ultra-Premium iOS Style Top Bar */}
      <div className="px-5 pt-4 pb-3.5 flex items-center justify-between border-b border-stone-200/5 bg-white/40 backdrop-blur-md sticky top-0 z-45">
        <button 
          onClick={nestedLevel === "detail" ? () => {
            setSlideDirection("backward");
            setNestedLevel("summary");
          } : onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-white/45 active:scale-95 transition-all text-[#1E3F39] flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
        </button>
        <div className="flex-1 text-center pl-4">
          <span className="text-sm font-black tracking-wider text-[#1E3F39] block text-center">
            {nestedLevel === "detail" ? "维度图表分析" : "个人报告"}
          </span>
        </div>
        <div 
          onClick={() => {
            alert("正在生成反思报告的高精预览长图，您可以在本地相册直接查看。");
          }}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-all active:scale-95 cursor-pointer select-none"
        >
          <span className="text-[10px] font-black tracking-tighter text-[#1C3E37]/50 mr-1 opacity-90 inline-block translate-y-[-1px]">•••</span>
          <span className="text-xs font-black text-[#1C3E37] tracking-wide">预览</span>
        </div>
      </div>
 
      {/* Contents Area scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-2.5 space-y-6 no-scrollbar pb-24">
        <AnimatePresence mode="wait" custom={slideDirection}>
          {nestedLevel === "summary" ? (
            <motion.div
              key="summary-view"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Premium Pill Indicator matching "数据分析汇总" capsule in the image */}
              <div className="flex justify-start pt-1">
                <div 
                  className="px-4 py-2 bg-white/80 border border-[#A7F3D0]/30 rounded-full text-[#1E3F39] text-xs font-black tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.08)] flex items-center gap-1.5"
                  style={{
                    boxShadow: "0 8px 32px rgba(16, 185, 129, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.82)"
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  数据分析汇总
                </div>
              </div>

              {/* 2. Bento grid "关键指标" Cards (1:1 Replica from Screen Standard) */}
              <div className="bg-white/70 backdrop-blur-[24px] rounded-[24px] p-5 border border-white/80 shadow-[0_12px_36px_rgba(30,63,57,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.85)] space-y-4">
                <div className="flex justify-between items-center px-0.5">
                  <h3 className="text-sm font-black text-[#1E3F39] flex items-center gap-1.5">
                    关键指标
                  </h3>
                  <span className="text-[9px] text-[#1E3F39]/40 font-extrabold font-mono uppercase tracking-widest">《核心数据指标概览》</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Box 1: Continuous Reflection Days */}
                  <div className="bg-[#EBF1FF] rounded-[18px] p-3 flex flex-col items-center justify-between text-center border border-[#DCE4FF]/60 h-24 shadow-[0_2px_8px_rgba(59,130,246,0.02)]">
                    <GlassIcon emoji="📅" size="xs" />
                    <span className="text-xl font-black text-blue-600 font-mono">25</span>
                    <span className="text-[9.5px] text-blue-900/80 font-bold w-full">连续复盘天数</span>
                  </div>
                  {/* Box 2: Habit Resolution improvement */}
                  <div className="bg-[#FFFBEB] rounded-[18px] p-3 flex flex-col items-center justify-between text-center border border-[#FEF3C7]/60 h-24 shadow-[0_2px_8px_rgba(217,119,6,0.02)]">
                    <GlassIcon emoji="🧭" size="xs" />
                    <span className="text-xl font-black text-amber-600 font-mono">63%</span>
                    <span className="text-[9.5px] text-amber-900/80 font-bold w-full">错误改进掌握率</span>
                  </div>
                  {/* Box 3: Growth assessment Rating */}
                  <div className="bg-[#F0FDF4] rounded-[18px] p-3 flex flex-col items-center justify-between text-center border border-[#DCFCE7]/60 h-24 shadow-[0_2px_8px_rgba(22,163,74,0.02)]">
                    <GlassIcon emoji="🛡️" size="xs" />
                    <span className="text-xl font-black text-emerald-600 font-mono">A-</span>
                    <span className="text-[9.5px] text-emerald-900/80 font-bold w-full">整体评级</span>
                  </div>
                  {/* Box 4: Velocity multiplier */}
                  <div className="bg-[#FDF2F8] rounded-[18px] p-3 flex flex-col items-center justify-between text-center border border-[#FCE7F3]/60 h-24 shadow-[0_2px_8px_rgba(219,39,119,0.02)]">
                    <GlassIcon emoji="📈" size="xs" />
                    <span className="text-xl font-black text-pink-600 font-mono">+15%</span>
                    <span className="text-[9.5px] text-pink-900/80 font-bold w-full">效率提升百分比</span>
                  </div>
                </div>
              </div>

              {/* 3. Row container: Sentiment distribution & custom progressions */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Left item: Sentiment distribution progress sliders */}
                <div className="bg-white/70 backdrop-blur-[24px] rounded-[24px] p-4.5 border border-white/80 shadow-[0_12px_36px_rgba(30,63,57,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.85)] flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center border-b border-stone-100/40 pb-2">
                    <span className="text-xs font-black text-[#1E3F39]">情绪分布</span>
                    <span className="text-[8px] text-[#1E3F39]/40 font-bold uppercase font-mono tracking-widest">Emotions</span>
                  </div>
                  
                  <div className="space-y-3.5 py-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-[#4E5D58]">
                        <span>专注</span>
                        <span className="font-mono text-stone-700">73%</span>
                      </div>
                      <div className="w-full bg-[#EBF5F3] h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#A3E635]" style={{ width: "73%" }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-[#4E5D58]">
                        <span>困惑</span>
                        <span className="font-mono text-stone-700">39%</span>
                      </div>
                      <div className="w-full bg-[#EBF5F3] h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#FCA5A5]" style={{ width: "39%" }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-[#4E5D58]">
                        <span>焦虑</span>
                        <span className="font-mono text-stone-700">30%</span>
                      </div>
                      <div className="w-full bg-[#EBF5F3] h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#FDE047]" style={{ width: "30%" }} />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-[#4E5D58]">
                        <span>放松</span>
                        <span className="font-mono text-stone-700">18%</span>
                      </div>
                      <div className="w-full bg-[#EBF5F3] h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#7DD3FC]" style={{ width: "18%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center scale-95 border-t border-stone-100/40 pt-2 text-[8px] font-black text-[#6B7C77]/80">
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" /> 专注</span>
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#FCA5A5]" /> 困惑</span>
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#FDE047]" /> 焦虑</span>
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#7DD3FC]" /> 放松</span>
                  </div>
                </div>

                {/* Right item: Error troubleshooting / resolution index metrics */}
                <div className="bg-white/70 backdrop-blur-[24px] rounded-[24px] p-4.5 border border-white/80 shadow-[0_12px_36px_rgba(30,63,57,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.85)] flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center border-b border-stone-100/40 pb-2">
                    <span className="text-xs font-black text-[#1E3F39]">改进进度</span>
                    <span className="text-[8px] text-[#1E3F39]/40 font-bold uppercase font-mono tracking-widest">Progress</span>
                  </div>

                  <div className="space-y-5 py-2.5">
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold text-[#5B6B67] leading-none">
                        错误排查复盘进度
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#EBF5F3] h-2.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#7DD3FC]" style={{ width: "54%" }} />
                        </div>
                        <span className="font-mono text-cyan-600 font-extrabold text-[10px]">54%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold text-[#5B6B67] leading-none">
                        成功反思记忆进度
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#EBF5F3] h-2.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#FCA5A5]" style={{ width: "62%" }} />
                        </div>
                        <span className="font-mono text-rose-500 font-extrabold text-[10px]">62%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-100/40 pt-2 text-center text-[8.5px] font-black text-teal-800 bg-emerald-500/5 rounded-xl py-1.5 flex items-center justify-center gap-1">
                    <GlassIcon emoji="🔔" size="xs" /> 智能复盘达成率稳固提速
                  </div>
                </div>
              </div>

              {/* 4. Card: "当前周期错误趋势" Area curve */}
              <div className="bg-white/70 backdrop-blur-[24px] rounded-[24px] p-5 border border-white/80 shadow-[0_12px_36px_rgba(30,63,57,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.85)] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-[#1E3F39]">当前周期错误趋势</h4>
                    <p className="text-[11px] text-[#5B6B67] font-semibold mt-1">整体走势呈下降趋势，记录成效较显著</p>
                  </div>
                  {/* Beautiful non-disturbing chevron stack on the right representing trends */}
                  <div className="flex flex-col gap-0.5 items-center justify-center scale-90 opacity-80 mr-1">
                    <span className="text-[#38BDF8] text-[10px] font-black leading-none">▼</span>
                    <span className="text-[#38BDF8] text-[10px] font-black leading-none -mt-1.5 opacity-70">▼</span>
                    <span className="text-[#38BDF8] text-[10px] font-black leading-none -mt-1.5 opacity-40">▼</span>
                  </div>
                </div>

                <div className="h-28 w-full relative pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { x: "Mon", val: 56 },
                      { x: "Tue", val: 32 },
                      { x: "Wed", val: 48 },
                      { x: "Thu", val: 18 },
                      { x: "Fri", val: 24 },
                      { x: "Sat", val: 14 }
                    ]} margin={{ top: 12, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWaveSingle" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="x" hide />
                      <YAxis hide domain={[0, 75]} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-stone-900/90 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-md backdrop-blur-md">
                                走势指数: {payload[0].value}%
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#38BDF8" 
                        strokeWidth={4.5} 
                        fillOpacity={1} 
                        fill="url(#colorWaveSingle)" 
                        dot={{ r: 4, fill: '#38BDF8', stroke: '#FFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 5. Card: "与往期错误趋势与对比" Double Area Curves */}
              <div className="bg-white/70 backdrop-blur-[24px] rounded-[24px] p-5 border border-white/80 shadow-[0_12px_36px_rgba(30,63,57,0.06),_inset_0_1.5px_3.5px_rgba(255,255,255,0.85)] space-y-3.5">
                <div className="flex justify-between items-center border-b border-stone-100/40 pb-2">
                  <div>
                    <h4 className="text-sm font-black text-[#1E3F39]">与往期错误趋势与对比</h4>
                    <p className="text-[11px] text-[#5B6B67] font-semibold mt-1">相较于上个月偶尔几次居高，整体向好</p>
                  </div>
                  <div className="flex gap-2 text-[10px] font-extrabold text-[#1E3F39]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                      本月
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                      上月
                    </span>
                  </div>
                </div>

                <div className="h-36 w-full relative pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: "W1", "本月": 28, "上月": 42 },
                      { name: "W2", "本月": 45, "上月": 30 },
                      { name: "W3", "本月": 20, "上月": 55 },
                      { name: "W4", "本月": 35, "上月": 25 },
                      { name: "W5", "本月": 14, "上月": 32 }
                    ]} margin={{ top: 15, right: 8, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWaveMonthThis" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.28}/>
                          <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorWaveMonthLast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.18}/>
                          <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(30, 63, 57, 0.04)" strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#6B7C77', fontSize: 9.5, fontWeight: 'bold' }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false}
                        domain={[0, 70]}
                        tick={{ fill: '#6B7C77', fontSize: 8.5, fontWeight: 'bold' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.96)",
                          border: "1px solid rgba(255, 255, 255, 0.8)",
                          borderRadius: "16px",
                          boxShadow: "0 10px 25px rgba(20,50,45,0.08)",
                          fontSize: "10px",
                          fontWeight: "bold"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="本月" 
                        stroke="#14B8A6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorWaveMonthThis)" 
                        dot={{ r: 4, fill: '#14B8A6', stroke: '#FFF', strokeWidth: 1.5 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="上月" 
                        stroke="#F59E0B" 
                        strokeWidth={1.5} 
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#colorWaveMonthLast)" 
                        dot={{ r: 3, fill: '#FBBF24', stroke: '#FFF', strokeWidth: 1.2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 6. Capsule Status Note - representing the blue capsule list footer in the picture */}
              <div 
                className="w-full bg-[#E5F3FE]/85 backdrop-blur-md rounded-2xl py-3 px-5 text-center"
                style={{
                  border: "1px solid rgba(144, 202, 249, 0.4)",
                  boxShadow: "0 8px 30px rgba(30, 63, 57, 0.02)"
                }}
              >
                <span className="text-[12px] font-black text-[#1E3B5E] tracking-normal">
                  + 整体走势呈下降趋势，继续保持！
                </span>
              </div>

              {/* 7. Action triggers in linear bento arrangement */}
              <div className="flex flex-col gap-3.5 pt-1 pb-2">
                {/* Transparency action pill link */}
                <button 
                  onClick={() => {
                    setSlideDirection("forward");
                    setNestedLevel("detail");
                  }}
                  className="w-full py-4 px-10 rounded-full font-black text-sm text-[#1C3E37] select-none bg-white/70 border border-white/80 shadow-[0_8px_32px_rgba(30,63,57,0.05)] hover:bg-white active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4.5 h-4.5 text-emerald-800 animate-spin-slow" />
                  <span>更多维度深度图表分析</span>
                </button>

                {/* Golden Orange "导出与分享" button from the image */}
                <button 
                  onClick={() => {
                    alert("个人报告已保存至系统，并为您匹配了专属导师咨询通道。随时可点击分享二维码。");
                  }}
                  className="w-full py-4.5 rounded-full font-black text-sm text-white select-none bg-gradient-to-r from-[#FFB84D] to-[#FFA14A] shadow-[0_12px_36px_rgba(255,161,74,0.28)] active:scale-97 hover:scale-101 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>导出与分享</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              custom={slideDirection}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >


        {/* 8. Title header for deeper analysis */}
        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block bg-[#C0E890]/80 text-[#1E3F39] text-[9.5px] font-black px-2.5 py-0.5 rounded-full tracking-wide">
              DIAGNOSTIC MODULES
            </span>
            <span className="text-[10px] text-[#5B6B67] font-bold">深度多维心智分析卡</span>
          </div>
          <h4 className="text-sm font-black text-[#1E3F39] mt-1">自我认知纠偏深度短板雷达图</h4>
        </div>

        {/* 9. Render Cycle selector widget */}
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-xs p-2 border border-stone-200/30 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#5B6B67] font-bold pl-2 flex items-center gap-1.5 select-none">
            <CalendarRange className="w-4 h-4 text-[#5E7F73]" />
            自省对比周期
          </span>
          <div className="flex gap-1">
            {["原周分析", "双周周期", "月度汇总"].map((item) => {
              const isSelected = cycle === item;
              return (
                <button
                  key={item}
                  onClick={() => setCycle(item)}
                  className={`text-[10px] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-[#C0E890] text-[#1E3F39] shadow-[0_2px_4px_rgba(192,232,144,0.3)]" 
                      : "bg-transparent text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#5E7F73]/15 shadow-xs space-y-4 font-sans">
          <div className="border-b border-stone-100 pb-2.5">
            <h3 className="text-[10px] font-black text-[#5B6B67] uppercase tracking-widest font-mono">
              一、 反思维度覆盖范围 · Reflection Dimensions
            </h3>
            <p className="text-[9px] text-[#8E8575] font-semibold mt-0.5 leading-normal">
              五维评估：情绪察觉、事实拆解、行动践行、原则提炼、长期认知五个心智象限
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative scale-102">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="#f2efe9" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#4E6B60', fontSize: 10, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#8E8575', fontSize: 8 }}
                  axisLine={false}
                />
                <Radar
                  name="本期深度值"
                  dataKey="A"
                  stroke="#5E7F73"
                  fill="#5E7F73"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="自省基准值"
                  dataKey="B"
                  stroke="#C0E890"
                  fill="#C0E890"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={15} 
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 9, fontWeight: 'bold', paddingTop: 5 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 pt-1.5 border-t border-dashed border-stone-100 justify-between text-[9px] text-stone-500 font-bold">
            <span className="flex flex-col gap-1.5 w-[200px] pr-5">
              <span className="w-2 h-2 rounded-full bg-[#5E7F73]" />
              本期在 <span className="text-[#1E3F39] font-black">原则提炼 / 情绪察觉</span> 维度表现优异
            </span>
            <span className="text-emerald-750 font-mono font-black scale-95">和解均值: 优 ⭐</span>
          </div>
        </div>

        {/* 3.5 Mistakes Categories Radar Chart */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/40 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-2.5">
            <h3 className="text-[10px] font-black text-rose-700 uppercase tracking-widest font-mono">
              三(2)、 错题归类与自省短板分布 · Category Distribution
            </h3>
            <p className="text-[9px] text-[#8E8575] font-semibold mt-0.5 leading-normal">
              实时结构化各核心维度（习惯、工作、情绪、社交等）错因频次与心智短板
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative scale-102">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={categoryRadarData}>
                <PolarGrid stroke="#f2efe9" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#C35A3A', fontSize: 10, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#8E8575', fontSize: 8 }}
                  axisLine={false}
                />
                <Radar
                  name="短板严重度 (频数加权)"
                  dataKey="短板程度"
                  stroke="#C35A3A"
                  fill="#C35A3A"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={15} 
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 9, fontWeight: 'bold', paddingTop: 5 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 pt-1.5 border-t border-dashed border-stone-100 justify-between text-[9px] text-stone-500 font-bold">
            <span className="flex flex-col gap-1.5 w-[200px] pr-5">
              <span className="w-2 h-2 rounded-full bg-[#C35A3A]" />
              统计发现你的最大成长短板在： <span className="text-[#C35A3A] font-extrabold">情绪控制与社交沟通</span>
            </span>
            <span className="text-rose-750 font-mono font-black scale-95 flex items-center gap-1 w-auto">漏洞攻坚 <GlassIcon emoji="🛡️" size="xs" /></span>
          </div>
        </div>

        {/* 三(3). Mistake custom tags distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/40 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-2.5">
            <h3 className="text-[10px] font-black text-rose-700 uppercase tracking-widest font-mono">
              三(3)、 标签维度自省分布 · Tag Analytics
            </h3>
            <p className="text-[9px] text-[#8E8575] font-semibold mt-0.5 leading-normal">
              {hasTagData 
                ? "基于你在我的错题中标记的个性标签分布，多维度感知自我认知的纠偏核心" 
                : "当前尚无用户自定义标签，下方展示示例分布（可点击“我的错题”右上角“标签管理”进行批量划分）"
              }
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative scale-102">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="38%"
                  outerRadius="72%"
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} 个错题`, '标签统计']}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e1dbcf",
                    borderRadius: "16px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#333"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-stone-100 justify-center">
            {finalPieData.map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5B6B67] bg-stone-50 border border-stone-150 rounded-md px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                {item.name}: <span className="font-mono text-[#1E3F39]">{item.value}次</span>
              </span>
            ))}
          </div>
        </div>

        {/* 4. Action Progress list */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/40 shadow-xs space-y-3">
          <h3 className="text-[10px] font-black text-[#5B6B67] uppercase tracking-widest border-b border-stone-100 pb-2.5 font-mono">
            四、 行为原则达成指标 · Execution Progress
          </h3>
          <div className="space-y-4">
            {improvementProgress.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#1E3F39]">{item.name}</h4>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-[#5E7F73] h-full rounded-full" style={{ width: `${item.val}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-mono font-extrabold text-[#1E3F39]">{item.val}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Dual Efficiency Trend line - Recharts */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/40 shadow-xs space-y-4">
          <h3 className="text-[10px] font-black text-[#5B6B67] uppercase tracking-widest border-b border-stone-100 pb-2.5 font-mono">
            五、 双效能周期演进趋势 · Reflection & Principles
          </h3>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f2efe9" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#8E8575', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tick={{ fill: '#8E8575', fontSize: 9 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={24} 
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 10, fontWeight: 'bold', color: '#1E3F39', paddingBottom: 10 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="反思效率" 
                  stroke="#5E7F73" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 5 }} 
                  dot={{ r: 2.5, strokeWidth: 1.5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="原则践行频率" 
                  stroke="#C0E890" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 5 }}
                  dot={{ r: 2.5, strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-stone-500 font-bold">
            <span className="flex items-center gap-1 text-[#3B544E]">
              <span className="w-2.5 h-2.5 bg-[#5E7F73] rounded-full inline-block" />
              主频效能双向温和增长
            </span>
            <span className="text-[#5E7F73]">
              {cycle === "原周分析" ? "单周实践攀登 88% ☘️" : cycle === "月度汇总" ? "月度沉淀攀升 92% ⭐" : "双效能显著提速 63% ☘️"}
            </span>
          </div>
        </div>
 
        {/* 6. With previous period error comparison - Recharts Area */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/40 shadow-xs space-y-4">
          <h3 className="text-[10px] font-black text-[#5B6B67] uppercase tracking-widest border-b border-stone-100 pb-2.5 font-mono">
            六、 历周期效能对比剖析 · Period Comparisons
          </h3>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5E7F73" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5E7F73" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFF9B1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FFF9B1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f2efe9" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#8E8575', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tick={{ fill: '#8E8575', fontSize: 9 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={24} 
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 10, fontWeight: 'bold', paddingBottom: 10 }}
                />
                <Area 
                  type="monotone" 
                  name="本期综合效能"
                  dataKey="反思效率" 
                  stroke="#5E7F73" 
                  fillOpacity={1} 
                  fill="url(#colorCur)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  name="上期对照基准"
                  dataKey="上周期基准" 
                  stroke="#D3C9AD" 
                  fillOpacity={1} 
                  fill="url(#colorBase)" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex gap-4 text-[10px] text-stone-500 font-bold border-t border-stone-100 pt-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 bg-[#5E7F73]/70 rounded-xs inline-block" />
              本期记录数据
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 bg-[#FFF9B1] rounded-xs inline-block border border-stone-300" />
              上期对照基准
            </span>
          </div>
        </div>

        {/* 7. Daily Practice Stability Trend line */}
        <div id="daily-practice-stability-chart" className="bg-white rounded-3xl p-5 border border-stone-200/40 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-2.5">
            <h3 className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-pulse" />
              七、 每日践行评分记录稳定性趋势 · Stability Trend
            </h3>
            <p className="text-[9px] text-[#8E8575] font-semibold mt-0.5 leading-normal">
              实时追溯你在不二过行动原则中提交的每一次量化反馈评分，评定践行波动的控制力
            </p>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getDailyStabilityData()} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f2efe9" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#8E8575', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 10]}
                  tick={{ fill: '#8E8575', fontSize: 9 }}
                />
                <Tooltip 
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const dataObj = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3 border border-indigo-100 rounded-2xl shadow-md text-[10px] font-semibold text-neutral-700 max-w-[200px]">
                          <p className="font-extrabold text-[#1E3F39] mb-1 flex items-center gap-1"><GlassIcon emoji="📅" size="xs" /> 日期: {label}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] inline-block" />
                            <span>践行评分:</span>
                            <span className="font-mono text-xs font-black text-indigo-700">{dataObj["评分"]} 分</span>
                          </div>
                          {dataObj["备注"] && (
                            <p className="text-[9.5px] text-stone-500 mt-1 leading-normal border-t border-stone-100 pt-1 flex items-center gap-1">
                              <GlassIcon emoji="💬" size="xs" /> {dataObj["备注"]}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="评分" 
                  stroke="#6366F1" 
                  strokeWidth={3} 
                  activeDot={{ r: 6, stroke: '#FFF', strokeWidth: 2 }} 
                  dot={{ r: 3, fill: '#6366F1', stroke: '#FFF', strokeWidth: 1.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between text-[10px] text-stone-500 font-bold bg-[#6366F1]/5 p-3 rounded-2xl border border-[#6366F1]/10">
            <span className="flex items-center gap-1.5 text-indigo-900 w-[199px]">
              <Compass className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              践行稳定性评定:
            </span>
            <span className="text-indigo-755 font-black flex items-center gap-1 w-[200px]">
              {getDailyStabilityData().length > 0 ? (
                <>
                  连续原则认知抗阻阻断率 92.4% <GlassIcon emoji="🍀" size="xs" />
                </>
              ) : "暂无历史波动指标"}
            </span>
          </div>
        </div>
 
        {/* Bottom review summary */}
        <div className="bg-[#5E7F73] text-[#FFFDF2] p-5 rounded-[28px] shadow-xs">
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#C0E890]">整体改善和解建议</h4>
            <p className="text-[11px] font-semibold leading-relaxed mt-2 w-[290px]">
              {reportData.summary}
            </p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
 
      {/* AI Weekly Report Modal */}
      {showAIReportModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-[#FFFDF6] border border-[#EBE7D3] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[82vh] relative animate-[bounce_0.3s_ease]">
            {/* Header */}
            <div className="p-5 border-b border-stone-200/50 flex justify-between items-center bg-[#FFFDF6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EAF8F1] flex items-center justify-center font-display">
                  <Award className="w-4.5 h-4.5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#1E3F39]">心智深度成长周报</h3>
                  <p className="text-[10px] text-[#8E8575] font-black uppercase tracking-wider">{cycle} · AI 智慧提炼</p>
                </div>
              </div>
              <button onClick={() => setShowAIReportModal(false)} className="p-1.5 rounded-full hover:bg-stone-100 cursor-pointer">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {isGeneratingReport ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5E7F73] border-t-transparent mb-4"></div>
                  <p className="text-xs font-black text-[#1E3F39]">Gemini 正在重构多维自省报告...</p>
                  <p className="text-[10px] text-[#5B6B67] mt-1.5 max-w-[200px] leading-relaxed">分析错题退潮趋势，剥离防卫偏执，提炼本周心智原则关键词</p>
                </div>
              ) : aiReportData ? (
                <>
                  {/* Part 1: 错题趋势分析 */}
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1 bg-[#EAF8F1] border border-[#C6F2D6] text-[#1EBE70] text-[9.5px] font-black px-2.5 py-0.5 rounded-full">
                      <GlassIcon emoji="📈" size="xs" /> 本周错题趋势剖析
                    </span>
                    <p className="text-xs text-stone-700 font-semibold leading-relaxed bg-white/70 p-4 rounded-2xl border border-stone-200/40 shadow-xs font-sans">
                      {aiReportData.trendAnalysis}
                    </p>
                  </div>

                  {/* Part 2: 反思关键词云图 */}
                  <div className="space-y-2">
                    <span className="inline-block bg-amber-50 border border-amber-100 text-amber-800 text-[9.5px] font-black px-2.5 py-0.5 rounded-full">
                      ☁️ 核心词云标签
                    </span>
                    <div className="flex flex-wrap gap-2 p-3.5 bg-white/70 rounded-2xl border border-stone-200/40 shadow-xs">
                      {aiReportData.keywords && aiReportData.keywords.map((word, idx) => {
                        const colors = [
                          "bg-emerald-50 text-emerald-805 border-emerald-200/40",
                          "bg-amber-50 text-amber-805 border-amber-200/40",
                          "bg-blue-50 text-blue-805 border-blue-200/40",
                          "bg-indigo-50 text-indigo-805 border-indigo-200/40"
                        ];
                        const col = colors[idx % colors.length];
                        return (
                          <span key={idx} className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all active:scale-95 ${col}`}>
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part 3: 行动改进建议 */}
                  <div className="space-y-2">
                    <span className="inline-block bg-sky-50 border border-sky-100 text-sky-800 text-[9.5px] font-black px-2.5 py-0.5 rounded-full">
                      🌱 行动习惯改进方案
                    </span>
                    <div className="bg-white/70 p-4 rounded-2xl border border-stone-200/40 shadow-xs text-xs text-stone-750 font-semibold leading-relaxed whitespace-pre-line font-sans">
                      {aiReportData.advice}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-stone-500 font-bold">周报生成失败，请稍后重试。</p>
                </div>
              )}
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-4 bg-white/90 border-t border-stone-200/40 flex flex-col gap-2 shrink-0 z-10 w-full rounded-b-[32px]">
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleCopyText}
                  disabled={!aiReportData}
                  className="flex-1 py-3 border border-stone-300 rounded-full font-black text-[11.5px] tracking-wide text-stone-700 flex items-center justify-center gap-1 hover:bg-stone-50 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "复制已提炼文本" : "一键复制"}</span>
                </button>

                <button
                  onClick={handleGenerateShareImage}
                  disabled={!aiReportData || isGeneratingImage}
                  className="flex-1 py-3 border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-full font-black text-[11.5px] tracking-wide flex items-center justify-center gap-1 hover:bg-emerald-100/70 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  <span>{isGeneratingImage ? "生成中..." : "生成分享长图"}</span>
                </button>
              </div>

              <button
                onClick={() => setShowAIReportModal(false)}
                className="w-full py-2.5 bg-[#5E7F73] hover:bg-[#1E3F39] text-white rounded-full font-black text-[11px] tracking-wide flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>保存并关闭</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sharing action */}
      <div className="px-6 py-4 border-t border-stone-200/40 bg-[#FFFDF2]/80 backdrop-blur-md sticky bottom-0 z-30">
        <button
          onClick={handleGenerateAIReport}
          className="w-full py-3.5 rounded-full font-black text-xs text-white uppercase select-none bg-gradient-to-r from-[#FCD34D] via-[#F59E0B] to-[#EF4444] shadow-[0_8px_24px_rgba(245,124,0,0.22)] active:scale-97 hover:scale-102 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-spin animate-duration-3000" />
          <span>导出并生成属于你的 AI 周报报告</span>
        </button>
      </div>
    </motion.div>
  );
}
