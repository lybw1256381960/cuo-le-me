"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var genai_1 = require("@google/genai");
// 环境变量（在 Vercel 上配置）
var apiKey = process.env.GEMINI_API_KEY;
// Fallback 数据（当 API 无法访问时使用）
var getFallbackWeeklyReport = function (selectedCycle) {
    var cycleName = selectedCycle || "本周";
    return {
        trendAnalysis: "\u9488\u5BF9 [".concat(cycleName, "] \u7684\u6570\u636E\u5206\u6790\uFF1A\u7531\u4E8E\u4F60\u79EF\u6781\u8DF5\u884C\u4E86\"\u6162\u51B3\u7B56\"\u4E0E\"\u60C5\u7EEA\u949D\u5316\"\u7684\u4E3B\u52A8\u963B\u65AD\u59FF\u52BF\uFF0C\u5728\u8FD9\u4E2A\u5468\u5468\u671F\u5185\uFF0C\u6C9F\u901A\u53CA\u9632\u536B\u5E94\u6FC0\u6027\u51B2\u7A81\u7684\u89E6\u53D1\u73B0\u5C40\u660E\u663E\u56DE\u843D\u7EA6 40%\uFF0C\u81EA\u7701\u590D\u76D8\u7684\u4E3B\u52A8\u8986\u76D6\u7387\u6500\u767B\u81F3 88% \u7684\u5386\u5386\u53F2\u6700\u9AD8\u70B9\uFF0C\u8868\u660E\u4F60\u6B63\u6709\u610F\u8BC6\u5730\u5C06\u9519\u8BEF\u8F6C\u5316\u4E3A\u5FC3\u667A\u8D44\u4EA7\uFF0C\u6548\u7387\u5448\u4F18\u3002"),
        keywords: ["情绪退浪", "慢两拍决策", "无评判事实", "动作级止损", "内视安全感"],
        advice: "1. 每次在进入高频博弈或工作宣讲会前，先默读一遍原则，并用舌头顶住上颚，用这一物理微动作提前切断",
        防御应激: 防御应激,
        "。\n2. 在物理视角最显眼的地方贴上黄色小圆点，作为『先记3个要点』的强提醒，构建条件反射。": 
    };
};
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var cycle, aiClient, prompt_1, response, text, parsed, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (req.method !== 'POST') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    cycle = req.body.cycle;
                    // 如果没有配置 API Key，返回 fallback 数据
                    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
                        console.log('No valid GEMINI_API_KEY found, using fallback data');
                        return [2 /*return*/, res.json(__assign(__assign({}, getFallbackWeeklyReport(cycle)), { isSimulated: true }))];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    aiClient = new genai_1.GoogleGenAI({
                        apiKey: apiKey,
                        httpOptions: {
                            headers: {
                                "User-Agent": "aistudio-build",
                            },
                        },
                    });
                    prompt_1 = "\u4F60\u662F\"\u9519\u4E86\u5417\"\u4EBA\u751F\u81EA\u7701\u966A\u4F34\u7684\u9AD8\u7EA7AI\u5FC3\u667A\u5206\u6790\u5E08\u3002\u8BF7\u4F9D\u636E\u7528\u6237\u5728 [".concat(cycle || "本周", "] \u7684\u590D\u76D8\u503E\u5411\uFF08\u6CE8\u91CD\u4E8B\u5B9E\u5265\u79BB\u3001\u5FC3\u795E\u547C\u5438\u963B\u65AD\u7B49\uFF09\uFF0C\u751F\u6210\u4E00\u671F\u7EDD\u5999\u7684\u3001\u6781\u5177\u4EBA\u6587\u5173\u6000\u4E0E\u5206\u6790\u6D1E\u5BDF\u7684\u6210\u957F\u62A5\u544A\u3002\n\u8BF7\u751F\u6210\u4E09\u4E2A\u5185\u5BB9\uFF1A\n1. \u9519\u9898\u8D8B\u52BF\u5206\u6790\uFF1A\u4E00\u5C0F\u6BB5\u8BDD\uFF0C\u603B\u7ED3\u8FD1\u671F\u5931\u8BEF\u53D1\u751F\u5E76\u5F97\u5230\u7406\u667A\u590D\u76D8\u7684\u81EA\u6108\u8D70\u5411\u3002\n2. \u53CD\u601D\u5173\u952E\u8BCD\u4E91\u56FE\uFF1A\u8F93\u51FA 5 \u4E2A\u53CD\u6620\u8FD9\u4E00\u9636\u6BB5\u5FC3\u667A\u6210\u957F\u3001\u5145\u6EE1\u54F2\u5B66\u6216\u884C\u52A8\u4E3B\u4E49\u7F8E\u611F\u7684\u77ED\u8BCD\uFF08\u5982\uFF1A\u6162\u51B3\u7B56\u3001\u60C5\u7EEA\u9632\u536B\u7B49\uFF09\u3002\n3. \u884C\u52A8\u6539\u8FDB\u5EFA\u8BAE\uFF1A\u63D0\u51FA 2 \u70B9\u6781\u5177\u7269\u7406\u64CD\u4F5C\u6027\u3001\u53EF\u4EE5\u7ACB\u523B\u7EC3\u4E60\u7684\u5FAE\u52A8\u4F5C\u5EFA\u8BAE\uFF08\u5982\uFF1A\u7528\u624B\u89E6\u78B0\u624B\u8155\u3001\u8D34\u7EB8\u63D0\u793A\u5F15\u5BFC\uFF09\u3002\n\n\u8BF7\u4E25\u683C\u9075\u5FAA\u4EE5\u4E0B JSON \u67B6\u6784\u8FDB\u884C\u8FD4\u56DE\uFF0C\u4E0D\u8981\u5E26\u6709 ```json \u6807\u8BB0\uFF0C\u53EA\u8981\u7EAF\u51C0\u7684 valid JSON String\uFF1A\n{\n  \"trendAnalysis\": \"\u4E00\u5C0F\u6BB5\u7EDD\u5999\u751F\u52A8\u7684\u5206\u6790\u6587\u5B57...\",\n  \"keywords\": [\"\u8BCD1\", \"\u8BCD2\", \"\u8BCD3\", \"\u8BCD4\", \"\u8BCD5\"],\n  \"advice\": \"\u884C\u52A8\u5EFA\u8BAE\u7684\u591A\u884C\u62FC\u63A5\u6587\u672C...\"\n}");
                    return [4 /*yield*/, aiClient.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: prompt_1,
                            config: {
                                maxOutputTokens: 500,
                                temperature: 0.7,
                            }
                        })];
                case 2:
                    response = _b.sent();
                    text = ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                    // 清理代码块标记
                    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
                    parsed = JSON.parse(text);
                    return [2 /*return*/, res.json(__assign(__assign({}, parsed), { isSimulated: false }))];
                case 3:
                    err_1 = _b.sent();
                    console.error("Gemini Weekly Report API Error:", err_1);
                    // 返回 fallback 数据
                    return [2 /*return*/, res.json(__assign(__assign({}, getFallbackWeeklyReport(cycle)), { isSimulated: true }))];
                case 4: return [2 /*return*/];
            }
        });
    });
}
