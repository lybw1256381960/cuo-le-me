import React, { useState } from "react";
import { ArrowLeft, Clock, Bell, Sparkles, MessageSquare, Check } from "lucide-react";
import { MistakeEntry } from "../../types";
import GlassIcon from "../GlassIcon";

interface ReminderSettingsProps {
  principle: MistakeEntry;
  onBack: () => void;
  onSaveReminder: (id: string, reminder: { scene: string; frequency: string; time: string; enablePush: boolean; pushTime: string }) => void;
}

export default function ReminderSettings({ principle, onBack, onSaveReminder }: ReminderSettingsProps) {
  const [scene, setScene] = useState(principle.reminderScene || "会议前");
  const [frequency, setFrequency] = useState(principle.reminderFrequency || "每周");
  const [remindTime, setRemindTime] = useState(principle.reminderTime || "提前15分钟");
  const [previewText, setPreviewText] = useState(
    principle.principleText || "下次遇到类似场景，记得：先沟通对齐目标，再开始执行细节"
  );
  
  // ADDED: Scheduled Push Toggles and times
  const [enablePush, setEnablePush] = useState(principle.enablePush || false);
  const [pushTime, setPushTime] = useState(principle.pushTime || "21:00");

  const scenes = ["会议前", "睡前复盘", "每周复盘", "自定义"];
  const frequencies = ["一次", "每周", "每月"];
  const times = ["提前15分钟", "提前30分钟", "定时提醒"];

  const handleSave = () => {
    onSaveReminder(principle.id, {
      scene,
      frequency,
      time: remindTime,
      enablePush,
      pushTime,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent h-full text-neutral-800 relative">
      {/* Header */}
      <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-white/20 bg-white/45 sticky top-0 backdrop-blur-md z-40">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-stone-200/50">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <span className="text-sm font-semibold font-display tracking-wider text-sage-dark">
          设置原则卡提醒
        </span>
        <div className="w-9" />
      </div>

      {/* Main Form Fields scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 pb-24">
        <div className="text-center">
          <div className="inline-block p-3.5 bg-amber-500/10 text-amber-600 rounded-full select-none mb-3 animate-pulse-gently">
            <Bell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-black text-sage-dark font-display">
            “吾日三省”提醒触达
          </h2>
          <p className="text-xs text-mocha mt-1">
            将反思原则转化为大脑生理警示，实现特定高阻力时刻的安全避坑。
          </p>
        </div>

        {/* 1. Reminder Scenarios selection (单选 chips) */}
        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">
            1. 提醒场景触发
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {scenes.map((sc) => {
              const isSelected = scene === sc;
              return (
                <button
                  key={sc}
                  onClick={() => setScene(sc)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                    isSelected 
                      ? "bg-sage border-sage text-white shadow-xs" 
                      : "bg-white border-stone-200 text-[#7B7268] hover:bg-stone-50"
                  }`}
                >
                  {sc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Reminder Frequency Selection (单选 chips) */}
        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">
            2. 提醒频率
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {frequencies.map((fq) => {
              const isSelected = frequency === fq;
              return (
                <button
                  key={fq}
                  onClick={() => setFrequency(fq)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all ${
                    isSelected 
                      ? "bg-sage border-sage text-white shadow-xs" 
                      : "bg-white border-stone-200 text-[#7B7268] hover:bg-stone-50"
                  }`}
                >
                  {fq}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Pretime option selectors */}
        <div>
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3">
            3. 具体通知时机
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {times.map((tm) => {
              const isSelected = remindTime === tm;
              return (
                <button
                  key={tm}
                  onClick={() => setRemindTime(tm)}
                  className={`py-3 px-2 rounded-2xl text-xs font-bold border text-center transition-all ${
                    isSelected 
                      ? "bg-sage border-sage text-white shadow-xs" 
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {tm}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Periodic Push Notification Tasks Setup */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/60 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-[#1E3F39] flex items-center gap-1.5">
                <GlassIcon emoji="⏰" size="xs" /> 开启今日践行评价定时推送
              </h4>
              <p className="text-[10.5px] text-stone-500 font-semibold mt-1">
                每日定时通知，引导您反思、登记此原则的今日实践，并自动同步折线图报告。
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-2">
              <input 
                type="checkbox" 
                checked={enablePush} 
                onChange={(e) => setEnablePush(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {enablePush && (
            <div className="space-y-3.5 animate-fade-in pt-3 border-t border-dashed border-stone-100">
              <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest block">
                选择每日推送触达时间
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["20:00", "21:00", "22:00", "23:00"].map((t) => {
                  const isSel = pushTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPushTime(t)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition-all ${
                        isSel 
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-xs font-black" 
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {/* Instant Test Trigger Banner */}
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/60 space-y-2 text-center pt-3 mt-1.5 select-none">
                <span className="text-[9.5px] font-black text-emerald-850 uppercase tracking-widest flex items-center justify-center gap-1">
                  <GlassIcon emoji="✨" size="xs" /> 极速模拟测试通道
                </span>
                <p className="text-[10px] text-stone-600 font-semibold leading-relaxed">
                  不想多过一天？点击下方按钮可立即为您模拟触发一次当前原则的每日践行评价推送提醒：
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if ((window as any).vone_trigger_test_push) {
                      (window as any).vone_trigger_test_push(principle.id, principle.title || "今日原则践行自审", principle.principleText || "");
                      alert("🔔 【立即触发成功】每日自审系统通知已下发！请点击首页顶部出现的黄绿色通知框，填报践行评价并查看报告同步线。");
                    } else {
                      alert("正在加载连接通道，先点击保存后再进行测试哦！");
                    }
                  }}
                  className="mt-1 w-full py-2 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:brightness-105 active:scale-95 text-white font-black text-[10.5px] rounded-full shadow-xs flex items-center justify-center gap-1"
                >
                  <GlassIcon emoji="🔔" size="xs" /> 立即触发系统推送(测试)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Notification text preview */}
        <div className="bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-100/70 p-5 rounded-3xl space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C35A3A]">
            <Sparkles className="w-4 h-4 animate-pulse" />
            提醒通知预览展示
          </div>
          <div className="text-sm font-extrabold text-[#2F3E3A] italic leading-relaxed pt-2">
            “下次遇到（<span className="text-coral underline underline-offset-3">{scene}</span>）类似场景，深度提醒：{previewText}”
          </div>
          <div className="text-[10px] text-stone-400 font-mono text-right pt-2 border-t border-dashed border-stone-200">
            推送时钟时间：2026-06-12 (周五) 20:00
          </div>
        </div>
      </div>

      {/* Persistent Button */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F7F3EC]/90 backdrop-blur-sm p-4 border-t border-stone-200/50 z-30">
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 to-sage hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-sm tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          保存安全通知提醒
        </button>
      </div>
    </div>
  );
}
