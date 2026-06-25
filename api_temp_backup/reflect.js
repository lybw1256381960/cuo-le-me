"use strict";
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
var apiKey = process.env.GEMINI_API_KEY;
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var aiClient, content, prompt_1, response, text, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (req.method !== 'POST') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
                        return [2 /*return*/, res.status(500).json({ error: 'GEMINI_API_KEY not configured' })];
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
                    content = req.body.content;
                    prompt_1 = "\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u5FC3\u667A\u6210\u957F\u6559\u7EC3\u3002\u8BF7\u5206\u6790\u4EE5\u4E0B\u81EA\u7701\u65E5\u8BB0\uFF0C\u7ED9\u51FA\u6DF1\u5EA6\u7684\u53CD\u601D\u53CD\u9988\u548C\u6539\u8FDB\u5EFA\u8BAE\uFF08200-300\u5B57\uFF09\uFF1A\n\n".concat(content || "无内容", "\n\n\u8BF7\u4ECE\u4EE5\u4E0B\u51E0\u4E2A\u89D2\u5EA6\u5206\u6790\uFF1A\n1. \u89C9\u5BDF\u6DF1\u5EA6\uFF1A\u7528\u6237\u5BF9\u81EA\u5DF1\u9519\u8BEF\u7684\u8BA4\u8BC6\u6709\u591A\u6DF1\uFF1F\n2. \u60C5\u7EEA\u6A21\u5F0F\uFF1A\u662F\u5426\u5B58\u5728\u91CD\u590D\u7684\u60C5\u7EEA\u53CD\u5E94\u6A21\u5F0F\uFF1F\n3. \u6539\u8FDB\u65B9\u5411\uFF1A\u7ED9\u51FA\u5177\u4F53\u53EF\u884C\u7684\u6539\u8FDB\u5EFA\u8BAE\u3002");
                    return [4 /*yield*/, aiClient.models.generateContent({
                            model: "gemini-2.5-flash",
                            contents: prompt_1,
                            config: {
                                maxOutputTokens: 400,
                                temperature: 0.7,
                            }
                        })];
                case 2:
                    response = _b.sent();
                    text = ((_a = response.text) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                    return [2 /*return*/, res.json({ reflection: text })];
                case 3:
                    err_1 = _b.sent();
                    console.error("Reflect API Error:", err_1);
                    return [2 /*return*/, res.status(500).json({ error: 'Failed to generate reflection' })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
