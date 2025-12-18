// IELTS Writing Fill-in-the-Blank Practice App with AI

// 状态管理
const state = {
    originalText: '',
    blanks: [],
    currentAnswers: {},
    isChecked: false,
    showingAnswers: false,
    apiConfig: {
        endpoint: 'https://yunwu.ai/v1/chat/completions',
        model: '',
        apiKey: ''
    },
    history: []
};

// DOM 元素
const elements = {
    apiConfigSection: document.getElementById('api-config-section'),
    apiConfigContent: document.getElementById('api-config-content'),
    toggleConfigBtn: document.getElementById('toggle-config-btn'),
    apiEndpoint: document.getElementById('api-endpoint'),
    apiModel: document.getElementById('api-model'),
    apiKey: document.getElementById('api-key'),
    toggleKeyBtn: document.getElementById('toggle-key-btn'),
    saveConfigBtn: document.getElementById('save-config-btn'),
    testApiBtn: document.getElementById('test-api-btn'),
    configStatus: document.getElementById('config-status'),
    inputSection: document.getElementById('input-section'),
    practiceSection: document.getElementById('practice-section'),
    resultSection: document.getElementById('result-section'),
    essayInput: document.getElementById('essay-input'),
    essayDisplay: document.getElementById('essay-display'),
    blankRatio: document.getElementById('blank-ratio'),
    ratioDisplay: document.getElementById('ratio-display'),
    generateBtn: document.getElementById('generate-btn'),
    loadingIndicator: document.getElementById('loading-indicator'),
    checkBtn: document.getElementById('check-btn'),
    showAnswersBtn: document.getElementById('show-answers-btn'),
    resetBtn: document.getElementById('reset-btn'),
    newEssayBtn: document.getElementById('new-essay-btn'),
    progressText: document.getElementById('progress-text'),
    accuracyText: document.getElementById('accuracy-text'),
    correctCount: document.getElementById('correct-count'),
    wrongCount: document.getElementById('wrong-count'),
    accuracyRate: document.getElementById('accuracy-rate'),
    wrongWordsList: document.getElementById('wrong-words-list'),
    wrongWordsSection: document.getElementById('wrong-words-section'),
    sidebar: document.getElementById('sidebar'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn')
};

// 初始化
function init() {
    loadConfig();
    loadHistory();
    
    // API 配置事件
    elements.toggleConfigBtn.addEventListener('click', toggleConfigPanel);
    elements.toggleKeyBtn.addEventListener('click', toggleKeyVisibility);
    elements.saveConfigBtn.addEventListener('click', saveConfig);
    elements.testApiBtn.addEventListener('click', testApiKey);
    
    // 滑块事件
    elements.blankRatio.addEventListener('input', (e) => {
        elements.ratioDisplay.textContent = `${e.target.value}%`;
    });
    
    // 按钮事件
    elements.generateBtn.addEventListener('click', generatePractice);
    elements.checkBtn.addEventListener('click', checkAnswers);
    elements.showAnswersBtn.addEventListener('click', toggleShowAnswers);
    elements.resetBtn.addEventListener('click', resetPractice);
    elements.newEssayBtn.addEventListener('click', newEssay);
    
    // 历史记录事件
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // 如果已有配置，折叠配置面板
    if (state.apiConfig.apiKey && state.apiConfig.model) {
        elements.apiConfigContent.classList.add('collapsed');
        elements.toggleConfigBtn.classList.add('rotated');
    }
}

// 切换配置面板
function toggleConfigPanel() {
    elements.apiConfigContent.classList.toggle('collapsed');
    elements.toggleConfigBtn.classList.toggle('rotated');
}

// 切换密钥可见性
function toggleKeyVisibility() {
    const isPassword = elements.apiKey.type === 'password';
    elements.apiKey.type = isPassword ? 'text' : 'password';
    elements.toggleKeyBtn.innerHTML = isPassword 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
           </svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
           </svg>`;
}

// 加载配置
function loadConfig() {
    const saved = localStorage.getItem('ielts-api-config');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            state.apiConfig = { ...state.apiConfig, ...config };
            elements.apiEndpoint.value = state.apiConfig.endpoint;
            elements.apiModel.value = state.apiConfig.model;
            elements.apiKey.value = state.apiConfig.apiKey;
        } catch (e) {
            console.error('Failed to load config:', e);
        }
    }
}

// 保存配置
function saveConfig() {
    state.apiConfig.endpoint = elements.apiEndpoint.value.trim();
    state.apiConfig.model = elements.apiModel.value.trim();
    state.apiConfig.apiKey = elements.apiKey.value.trim();
    
    localStorage.setItem('ielts-api-config', JSON.stringify(state.apiConfig));
    
    elements.configStatus.textContent = '✓ 已保存';
    elements.configStatus.className = 'config-status success';
    setTimeout(() => {
        elements.configStatus.textContent = '';
    }, 2000);
}

// 测试 API Key
async function testApiKey() {
    const endpoint = elements.apiEndpoint.value.trim();
    const model = elements.apiModel.value.trim();
    const apiKey = elements.apiKey.value.trim();
    
    if (!endpoint || !model || !apiKey) {
        elements.configStatus.textContent = '✗ 请填写完整配置';
        elements.configStatus.className = 'config-status error';
        return;
    }
    
    // 显示测试中状态
    elements.testApiBtn.disabled = true;
    elements.configStatus.textContent = '⏳ 测试中...';
    elements.configStatus.className = 'config-status testing';
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'user', content: 'Hi, please respond with "OK" only.' }
                ],
                max_tokens: 10
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `HTTP ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
            } catch (e) {
                errorMsg = errorText.substring(0, 100) || errorMsg;
            }
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            elements.configStatus.textContent = '✓ 连接成功！';
            elements.configStatus.className = 'config-status success';
        } else {
            throw new Error('响应格式异常');
        }
    } catch (error) {
        console.error('API 测试失败:', error);
        elements.configStatus.textContent = `✗ ${error.message}`;
        elements.configStatus.className = 'config-status error';
    } finally {
        elements.testApiBtn.disabled = false;
        setTimeout(() => {
            if (elements.configStatus.textContent.startsWith('✓') || 
                elements.configStatus.textContent.startsWith('✗')) {
                // 保持显示5秒后清除
                setTimeout(() => {
                    elements.configStatus.textContent = '';
                }, 5000);
            }
        }, 0);
    }
}

// 生成练习
async function generatePractice() {
    const text = elements.essayInput.value.trim();
    if (!text) {
        alert('请先输入范文！');
        return;
    }
    
    if (!state.apiConfig.apiKey || !state.apiConfig.model) {
        alert('请先配置 API Key 和模型 ID！');
        elements.apiConfigContent.classList.remove('collapsed');
        elements.toggleConfigBtn.classList.remove('rotated');
        return;
    }
    
    state.originalText = text;
    state.isChecked = false;
    state.showingAnswers = false;
    state.currentAnswers = {};
    
    const ratio = parseInt(elements.blankRatio.value);
    
    // 显示加载状态
    elements.loadingIndicator.classList.remove('hidden');
    elements.generateBtn.disabled = true;
    
    try {
        // 调用 AI 获取挖空结果
        const blanks = await callAIForBlanks(text, ratio);
        state.blanks = blanks;
        
        // 保存到历史记录（包含挖空信息）
        saveToHistory(text, blanks);
        
        // 渲染练习界面
        renderPractice();
        
        // 切换视图
        elements.inputSection.classList.add('hidden');
        elements.practiceSection.classList.remove('hidden');
        elements.resultSection.classList.add('hidden');
        
        // 聚焦第一个输入框
        setTimeout(() => {
            const firstInput = document.querySelector('.blank-input');
            if (firstInput) firstInput.focus();
        }, 100);
    } catch (error) {
        console.error('AI 调用失败:', error);
        alert(`AI 调用失败: ${error.message}`);
    } finally {
        elements.loadingIndicator.classList.add('hidden');
        elements.generateBtn.disabled = false;
    }
}

// 调用 AI 进行智能挖空
async function callAIForBlanks(text, ratio) {
    const wordCount = text.split(/\s+/).length;
    const targetBlankCount = Math.max(3, Math.floor(wordCount * ratio / 100));
    
    const prompt = `你是一个雅思写作教学专家。请分析以下雅思作文，并选择约 ${targetBlankCount} 个适合作为填空练习的词汇或短语进行挖空。

挖空选择标准（按优先级）：
1. 高分连接词和过渡词（如 however, therefore, moreover, consequently, nevertheless 等）
2. 学术高分词汇（如 significant, crucial, facilitate, mitigate, unprecedented 等）
3. 固定搭配和短语（如 play a crucial role, have an impact on, in terms of 等）
4. 关键动词和形容词
5. 介词搭配

要求：
- 挖空的内容应该是背诵时容易遗忘但又重要的表达
- 避免挖空过于简单的常用词（如 the, is, a, to 等）
- 短语要完整挖空，不要只挖其中一个词
- 挖空分布要均匀，不要集中在某一段

请以 JSON 格式返回，格式如下：
{
  "blanks": [
    {"word": "挖空的原文词汇或短语", "reason": "挖空原因"},
    ...
  ]
}

注意：
- word 字段必须与原文完全一致（包括大小写）
- 只返回 JSON，不要有其他内容

原文：
${text}`;

    const response = await fetch(state.apiConfig.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiConfig.apiKey}`
        },
        body: JSON.stringify({
            model: state.apiConfig.model,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.3
        })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
        throw new Error('AI 返回内容为空');
    }
    
    // 解析 JSON
    let parsed;
    try {
        // 尝试提取 JSON（处理可能有 markdown 代码块的情况）
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('无法找到 JSON 内容');
        }
    } catch (e) {
        console.error('JSON 解析失败:', content);
        throw new Error('AI 返回格式错误，无法解析');
    }
    
    if (!parsed.blanks || !Array.isArray(parsed.blanks)) {
        throw new Error('AI 返回格式错误：缺少 blanks 数组');
    }
    
    // 在原文中查找位置
    const blanks = [];
    const usedRanges = [];
    
    for (const item of parsed.blanks) {
        const word = item.word;
        let index = 0;
        
        // 查找所有出现位置，选择未被使用的
        while ((index = text.indexOf(word, index)) !== -1) {
            // 检查是否重叠
            const isOverlapping = usedRanges.some(range => 
                !(index + word.length <= range.start || index >= range.end)
            );
            
            if (!isOverlapping) {
                blanks.push({
                    word: word,
                    index: index,
                    length: word.length,
                    reason: item.reason
                });
                usedRanges.push({ start: index, end: index + word.length });
                break;
            }
            index += 1;
        }
    }
    
    // 按位置排序
    return blanks.sort((a, b) => a.index - b.index);
}

// 渲染练习界面
function renderPractice() {
    let html = '';
    let lastIndex = 0;
    
    for (let i = 0; i < state.blanks.length; i++) {
        const blank = state.blanks[i];
        
        // 添加空格前的文本
        html += escapeHtml(state.originalText.substring(lastIndex, blank.index));
        
        // 添加输入框（宽度 = 字符数 * 字符宽度 + padding补偿）
        const inputWidth = Math.max(90, blank.word.length * 11 + 30);
        html += `<span class="blank-wrapper">`;
        html += `<input type="text" class="blank-input" data-index="${i}" `;
        html += `style="width: ${inputWidth}px" `;
        html += `placeholder="${i + 1}" `;
        html += `autocomplete="off" autocapitalize="off" spellcheck="false">`;
        html += `<span class="blank-tooltip">#${i + 1}${blank.reason ? ': ' + blank.reason : ''}</span>`;
        html += `</span>`;
        
        lastIndex = blank.index + blank.length;
    }
    
    // 添加剩余文本
    html += escapeHtml(state.originalText.substring(lastIndex));
    
    elements.essayDisplay.innerHTML = html;
    
    // 绑定输入事件
    const inputs = document.querySelectorAll('.blank-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            state.currentAnswers[index] = e.target.value;
            updateProgress();
            
            // 实时反馈：检查输入是否正确
            if (!state.isChecked) {
                updateInputFeedback(input, index);
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else if (e.key === 'Enter') {
                    checkAnswers();
                }
            }
        });
    });
    
    updateProgress();
}

// 实时反馈：更新输入框样式
function updateInputFeedback(input, index) {
    const userInput = (input.value || '').trim().toLowerCase();
    const correctAnswer = state.blanks[index].word.toLowerCase();
    
    // 移除之前的反馈样式
    input.classList.remove('feedback-correct', 'feedback-wrong', 'feedback-partial');
    
    if (!userInput) {
        // 输入为空，不显示反馈
        return;
    }
    
    if (userInput === correctAnswer) {
        // 完全正确
        input.classList.add('feedback-correct');
    } else if (correctAnswer.startsWith(userInput)) {
        // 部分正确（正在输入中）
        input.classList.add('feedback-partial');
    } else {
        // 错误
        input.classList.add('feedback-wrong');
    }
}

// 更新进度
function updateProgress() {
    const filled = Object.values(state.currentAnswers).filter(v => v && v.trim()).length;
    const total = state.blanks.length;
    elements.progressText.textContent = `${filled} / ${total}`;
}

// 检查答案
function checkAnswers() {
    if (state.isChecked) return;
    state.isChecked = true;
    
    const inputs = document.querySelectorAll('.blank-input');
    let correct = 0;
    let wrong = 0;
    const wrongWords = [];
    
    inputs.forEach((input, index) => {
        const userAnswer = (input.value || '').trim().toLowerCase();
        const correctAnswer = state.blanks[index].word.toLowerCase();
        
        if (userAnswer === correctAnswer) {
            input.classList.add('correct');
            correct++;
        } else {
            input.classList.add('wrong');
            wrong++;
            wrongWords.push({
                userAnswer: input.value || '(空)',
                correctAnswer: state.blanks[index].word
            });
        }
        input.disabled = true;
    });
    
    // 显示结果
    showResults(correct, wrong, wrongWords);
}

// 显示结果
function showResults(correct, wrong, wrongWords) {
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    elements.correctCount.textContent = correct;
    elements.wrongCount.textContent = wrong;
    elements.accuracyRate.textContent = `${accuracy}%`;
    elements.accuracyText.textContent = `正确率: ${accuracy}%`;
    
    // 显示错词
    if (wrongWords.length > 0) {
        elements.wrongWordsSection.style.display = 'block';
        elements.wrongWordsList.innerHTML = wrongWords.map(w => 
            `<span class="wrong-word-tag">${escapeHtml(w.userAnswer)} → <span class="correct-answer">${escapeHtml(w.correctAnswer)}</span></span>`
        ).join('');
    } else {
        elements.wrongWordsSection.style.display = 'none';
    }
    
    elements.resultSection.classList.remove('hidden');
    
    // 滚动到结果
    elements.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 显示/隐藏答案
function toggleShowAnswers() {
    state.showingAnswers = !state.showingAnswers;
    const inputs = document.querySelectorAll('.blank-input');
    
    if (state.showingAnswers) {
        inputs.forEach((input, index) => {
            if (!input.classList.contains('correct')) {
                input.value = state.blanks[index].word;
                input.classList.add('revealed');
            }
        });
        elements.showAnswersBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            隐藏答案
        `;
    } else {
        inputs.forEach((input, index) => {
            if (input.classList.contains('revealed')) {
                input.value = state.currentAnswers[index] || '';
                input.classList.remove('revealed');
            }
        });
        elements.showAnswersBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            显示答案
        `;
    }
}

// 重新开始（重新调用 AI 挖空）
async function resetPractice() {
    state.isChecked = false;
    state.showingAnswers = false;
    state.currentAnswers = {};
    
    elements.resultSection.classList.add('hidden');
    elements.accuracyText.textContent = '';
    
    // 重新调用 AI 挖空
    const ratio = parseInt(elements.blankRatio.value);
    
    elements.loadingIndicator.classList.remove('hidden');
    elements.practiceSection.style.opacity = '0.5';
    
    try {
        const blanks = await callAIForBlanks(state.originalText, ratio);
        state.blanks = blanks;
        renderPractice();
    } catch (error) {
        console.error('AI 调用失败:', error);
        alert(`AI 调用失败: ${error.message}`);
    } finally {
        elements.loadingIndicator.classList.add('hidden');
        elements.practiceSection.style.opacity = '1';
    }
    
    // 重置显示答案按钮
    elements.showAnswersBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
        显示答案
    `;
    
    // 聚焦第一个输入框
    setTimeout(() => {
        const firstInput = document.querySelector('.blank-input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// 换篇练习
function newEssay() {
    state.originalText = '';
    state.blanks = [];
    state.currentAnswers = {};
    state.isChecked = false;
    state.showingAnswers = false;
    
    elements.essayInput.value = '';
    elements.accuracyText.textContent = '';
    
    elements.inputSection.classList.remove('hidden');
    elements.practiceSection.classList.add('hidden');
    elements.resultSection.classList.add('hidden');
    
    elements.essayInput.focus();
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 历史记录功能 ====================

// 加载历史记录
function loadHistory() {
    const saved = localStorage.getItem('ielts-essay-history');
    if (saved) {
        try {
            state.history = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load history:', e);
            state.history = [];
        }
    }
    renderHistory();
}

// 保存到历史记录（包含挖空信息）
function saveToHistory(text, blanks) {
    const preview = text.substring(0, 50).replace(/\s+/g, ' ').trim();
    const hash = simpleHash(text);
    
    // 查找是否已存在
    const existingIndex = state.history.findIndex(h => h.hash === hash);
    
    if (existingIndex !== -1) {
        // 更新已存在的记录（更新 blanks 和练习次数）
        state.history[existingIndex].blanks = blanks;
        state.history[existingIndex].practiceCount++;
        state.history[existingIndex].lastPractice = Date.now();
        // 移到最前面
        const item = state.history.splice(existingIndex, 1)[0];
        state.history.unshift(item);
    } else {
        // 添加新记录（包含 blanks）
        state.history.unshift({
            id: Date.now(),
            hash: hash,
            text: text,
            blanks: blanks,
            preview: preview + (text.length > 50 ? '...' : ''),
            practiceCount: 1,
            createdAt: Date.now(),
            lastPractice: Date.now()
        });
        
        // 限制历史记录数量（最多20条）
        if (state.history.length > 20) {
            state.history = state.history.slice(0, 20);
        }
    }
    
    localStorage.setItem('ielts-essay-history', JSON.stringify(state.history));
    renderHistory();
}

// 简单哈希函数
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// 渲染历史记录
function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }
    
    const html = state.history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div class="history-content" onclick="loadFromHistory(${index})">
                <div class="history-preview">${escapeHtml(item.preview)}</div>
                <div class="history-meta">
                    <span class="history-count">练习 ${item.practiceCount} 次</span>
                    <span class="history-time">${formatTime(item.lastPractice)}</span>
                </div>
            </div>
            <button class="history-delete" onclick="deleteHistory(${index})" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    elements.historyList.innerHTML = html;
}

// 格式化时间
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 从历史记录加载
function loadFromHistory(index) {
    const item = state.history[index];
    if (!item) return;
    
    // 如果有保存的 blanks，直接进入练习模式
    if (item.blanks && item.blanks.length > 0) {
        state.originalText = item.text;
        state.blanks = item.blanks;
        state.isChecked = false;
        state.showingAnswers = false;
        state.currentAnswers = {};
        
        // 更新练习次数
        item.practiceCount++;
        item.lastPractice = Date.now();
        localStorage.setItem('ielts-essay-history', JSON.stringify(state.history));
        renderHistory();
        
        // 渲染练习界面
        renderPractice();
        
        // 切换视图
        elements.inputSection.classList.add('hidden');
        elements.practiceSection.classList.remove('hidden');
        elements.resultSection.classList.add('hidden');
        
        // 重置显示答案按钮
        elements.showAnswersBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            显示答案
        `;
        
        // 聚焦第一个输入框
        setTimeout(() => {
            const firstInput = document.querySelector('.blank-input');
            if (firstInput) firstInput.focus();
        }, 100);
    } else {
        // 兼容旧记录：没有 blanks 就填入输入框
        elements.essayInput.value = item.text;
        elements.inputSection.classList.remove('hidden');
        elements.practiceSection.classList.add('hidden');
        elements.resultSection.classList.add('hidden');
        elements.essayInput.focus();
    }
}

// 删除历史记录
function deleteHistory(index) {
    state.history.splice(index, 1);
    localStorage.setItem('ielts-essay-history', JSON.stringify(state.history));
    renderHistory();
}

// 重新复习（保持相同挖空，重置输入框）
function retryPractice() {
    state.isChecked = false;
    state.showingAnswers = false;
    state.currentAnswers = {};
    
    elements.resultSection.classList.add('hidden');
    elements.accuracyText.textContent = '';
    
    // 重新渲染练习（使用现有的 blanks）
    renderPractice();
    
    // 重置显示答案按钮
    elements.showAnswersBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>
        显示答案
    `;
    
    // 聚焦第一个输入框
    setTimeout(() => {
        const firstInput = document.querySelector('.blank-input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// 清空历史记录
function clearHistory() {
    if (state.history.length === 0) return;
    if (confirm('确定要清空所有历史记录吗？')) {
        state.history = [];
        localStorage.removeItem('ielts-essay-history');
        renderHistory();
    }
}

// 启动应用
init();
