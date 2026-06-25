import { MistakeEntry, MistakeCategory, UserProfile } from "./types";

export const initialMistakes: MistakeEntry[] = [
  {
    id: "m-1",
    title: "在会议上打断了同事发言",
    rawText: "在当天的周会上面，当讨论到技术方案的时候，我觉得写得太多没有要点，心里非常急躁。听不下去直接提高了音量，打断了小李的汇报，直接说『你先说结论，后看细节，不然浪费大家时间』。场面一度十分尴尬，事后我感到非常后悔，知道自己太有侵略性了。",
    background: "2026-06-11，在双周项目技术方案校准会。在场的有开端设计、产品、服务端主程和测试主责人。",
    category: MistakeCategory.COMMUNICATION,
    painLevel: 4,
    bodySignals: ["头痛", "肩颈紧张", "心悸"],
    emotions: ["尴尬", "内疚", "挫败"],
    createdAt: "2026-06-11 11:32",
    status: "已生成原则",
    eventSummary: "双周周会上急躁打断同事细节汇报，造成尴尬的技术校正冲突。",
    facts: [
      "会上面小李关于服务端性能调优方案汇报长达1.5分钟，未得出明确路线结论。",
      "用户情绪急躁，嗓门明显抬高以打断小李的细节发言。",
      "直接采用评判式表达，指出此发言虚耗时间，令场面瞬间冷场。"
    ],
    directCause: "表面上因为对方汇报语速慢、细节散碎，自己缺乏耐性，出言打断喧宾夺主。",
    nearCause: "在潜意识中把我打断对方方案的指责过程，理解为自己维护部门效能和表现个人干练水平的资本。",
    middleCause: "会前技术大纲仅列明主要调优大方向，未能对汇报人的演讲结构设定事前时间约定。",
    distantCause: "长期拥有主导对话、推崇军事化高压效能的团队认知模式，不习惯接收不流畅的中间数据。",
    rootCause: "个人内心缺乏足够的客观耐性与倾听安全感，自我意愿扩张过切，未能将『表达对事物的关切』与『表达对人的基本尊重』作界限剥离。",
    improvementStrategy: "确立先结论、后论据的发言模板。规定自己即使听命细节困乏，也要先用纸笔记下疑难并深吸一口气，会后进行一句话确认，避免粗暴插嘴。",
    principleText: "先结论，后细节。下次被质疑或需要纠偏汇报时，我先深吸气记录，等对方停顿时先赞同其论据广度，再问清楚对方最担心的核心问题是什么，随后进行补充。",
    nextAction: "在接下来的24小时内，在电脑边贴一张『心怀同理，记录倾听』的表情便利贴，作为下次周会汇报的事前预警标记。",
    hasReminder: true,
    reminderScene: "会议前",
    reminderFrequency: "每周",
    reminderTime: "提前15分钟",
    recurrenceLog: [
      {
        date: "2026-06-12",
        note: "在今天下午的工作交对接会上，遇到小吴啰嗦表述，原本想抢白，想到刚才原则，深呼吸改用笔记录下要点，等到他结束，先给出了肯定，反馈极好！",
        wasEffective: "有效",
        needsUpdate: "不需要"
      }
    ]
  },
  {
    id: "m-2",
    title: "推进计划前未沟通直接执行",
    rawText: "拿到新的研发测试节点分工后，我觉得我们组完全可以提速执行，没跟大家对齐细节就直接拉分支写起代码了，结果中间测试同事因为用例没准备完彻底停摆，多方反常加班，大家怨声载道。",
    background: "在新产品的研发第二周期排程启动阶段。",
    category: MistakeCategory.COMMUNICATION,
    painLevel: 5,
    bodySignals: ["头痛", "睡眠不好"],
    emotions: ["焦虑", "失望", "沮丧"],
    createdAt: "2026-06-08 18:40",
    status: "待反思"
  },
  {
    id: "m-3",
    title: "重要任务拖到截止前才开始",
    rawText: "年中述职PPT本应该早做大纲，但我一想到大纲要重新归档，就心里打退堂鼓。每天看着方案打游戏或处理杂事挪移注意，直到述职前最后一个晚上面红耳赤加班到凌晨4点仓促堆叠字句，表现大打折扣，整个人精疲力竭。",
    background: "年中技术述职答辩演职现场前夕，在公司个人独立工位上。",
    category: MistakeCategory.PROCRASTINATION,
    painLevel: 5,
    bodySignals: ["肩颈紧张", "头晕", "睡眠不好"],
    emotions: ["无助", "内疚", "焦虑", "害怕"],
    createdAt: "2026-06-05 09:12",
    status: "已生成原则",
    eventSummary: "年中高级晋升及述职演示，完美拖延引致整晚恶性窒息急促产出，错失大纲骨干论证。",
    facts: [
      "准备期长达20天，前19天均未写下一字骨架说明。",
      "在述职答辩考评前夕，熬夜至清晨4时完成，身心指标极度退化。",
      "述职逻辑跳跃生硬，部分PPT排版出现大面积留白和文字格式不一问题。"
    ],
    directCause: "过度担忧最终技术晋升评分落榜，在重型情绪负载下把写PPT归类为痛苦工作，引发大脑天然抗拒拖延。",
    nearCause: "认为自己反正无法拿出一套所有人顶礼膜拜的晋升纲要，所以先摆烂或降低期待能作为防备性自我辩护。",
    middleCause: "将目标定得太宏大、神圣，没有对任务做日级的粗草稿敏捷分解和白板沙龙。",
    distantCause: "自傲于早年的快速临急抱佛脚成功经验，忽略了公司大型综合晋升需要稳健周详演练的工程事实。",
    rootCause: "心智上无法理清『完美』与『完成』的区别，在非理性期待中试图逃避中间可能被证伪不完美的过程。",
    improvementStrategy: "实行5分钟起跑原则与不考究排版的粗草图先试政策。先将年中重点述职写成3张纸大小，再填充美化样式，用大颗粒周计划代替死锁截止期。",
    principleText: "完成优于完美。下次遇到述职任务，我必须保证在前3天拉出1页纸粗框大纲，不加任何视觉效果，强迫第一版草图先跑通汇报脉络。",
    nextAction: "在24小时内新建一个名为『粗大纲骨架方案』的本地PPT模板工程作为演习种子。",
    hasReminder: true,
    reminderScene: "睡前复盘",
    reminderFrequency: "每月",
    reminderTime: "提前30分钟"
  },
  {
    id: "m-4",
    title: "没有收集信息就仓促做决定",
    rawText: "技术栈选型时，有人说Node做并发很香，我觉得这个团队都在写JavaScript可以直接开发上手，就大手一挥直接订了选用，根本没测高并发和重算场景，写到一半遇到性能崩溃不得已全部用Golang重写，痛不欲生耽搁上线一整旬。",
    background: "大型即时零售中台高并发调峰服务选型阶段。",
    category: MistakeCategory.DECISION,
    painLevel: 3,
    bodySignals: ["胃部不适", "胸口闷", "头痛"],
    emotions: ["懊悔", "无助", "失望"],
    createdAt: "2026-05-28 14:05",
    status: "已生成原则"
  }
];

export const defaultProfile: UserProfile = {
  nickname: "朋友",
  statusText: "在成长的路上，慢慢变好",
  avatarEmoji: "😊",
  aiTone: "温和陪伴",
  isPrivateOnly: true
};
