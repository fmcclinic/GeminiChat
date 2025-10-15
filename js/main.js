// js/main.js
import { translations } from './config.js';
import * as DOM from './dom.js';
import { updateLanguageUI, appendMessage, clearMessages } from './ui.js';
import { getGeminiResponse, generateSuggestedQuestions } from './api.js';

// ---- STATE MANAGEMENT ----
let apiKey = '';
let systemPrompt = '';
let currentLanguage = 'vi';
let conversationHistory = [];

// ---- INITIALIZATION ----
document.addEventListener('DOMContentLoaded', initializeChat);

async function initializeChat() {
    // Load ngôn ngữ đã lưu
    const savedLanguage = localStorage.getItem('chatLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    updateLanguageUI(currentLanguage);
    
    // Tải cấu hình
    try {
        await loadConfigurations();
        const t = translations[currentLanguage];
        appendMessage(t.chatbot, t.welcomeMessage, currentLanguage);
    } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
        const t = translations[currentLanguage];
        appendMessage(t.chatbot, t.errorLoadingConfig + error.message, currentLanguage);
    }
}

async function loadConfigurations() {
    // Tải API key
    const apiKeyResponse = await fetch('AI/apikey.txt');
    if (!apiKeyResponse.ok) throw new Error('Không thể tải API key');
    apiKey = (await apiKeyResponse.text()).trim();

    // Tải System Prompt
    await loadSystemPrompt();
}

async function loadSystemPrompt() {
    const t = translations[currentLanguage];
    const systemPromptResponse = await fetch(t.systemPromptFile);
    if (!systemPromptResponse.ok) throw new Error('Không thể tải System Prompt');
    systemPrompt = await systemPromptResponse.text();
}

// ---- EVENT LISTENERS ----
DOM.sendButton.addEventListener('click', handleSendMessage);
DOM.newChatButton.addEventListener('click', startNewChat);
DOM.languageToggle.addEventListener('click', handleLanguageToggle);
DOM.userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
    }
});
DOM.userInput.addEventListener('input', () => {
    DOM.userInput.style.height = 'auto';
    DOM.userInput.style.height = `${DOM.userInput.scrollHeight}px`;
});


// ---- HANDLER FUNCTIONS ----
function startNewChat() {
    clearMessages();
    conversationHistory = [];
    const t = translations[currentLanguage];
    appendMessage(t.chatbot, t.welcomeMessage, currentLanguage);
}

function handleLanguageToggle() {
    currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    localStorage.setItem('chatLanguage', currentLanguage);
    updateLanguageUI(currentLanguage);
    loadSystemPrompt();
    startNewChat();
}

async function handleSendMessage() {
    const message = DOM.userInput.value.trim();
    if (!message) return;

    const t = translations[currentLanguage];
    appendMessage(t.customer, message, currentLanguage);
    conversationHistory.push({ role: "user", parts: [{ text: message }] });

    DOM.userInput.value = '';
    DOM.userInput.style.height = 'auto';

    try {
        const responseText = await getGeminiResponse(apiKey, conversationHistory, systemPrompt);
        appendMessage(t.assistant, responseText, currentLanguage, true);
        conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        appendMessage(t.chatbot, t.errorMessage + error.message, currentLanguage);
    }
}

// =================================================================
// ==== PHỤC HỒI MÃ GỬI CHIỀU CAO CHO TRANG WEB MẸ (PHIÊN BẢN SỬA LỖI) ====
// =================================================================

/**
 * Gửi chiều cao của container chính đến cửa sổ cha (trang web lớn hơn).
 */
function sendHeightToParent() {
    // Lấy phần tử container chính của chatbot
    const container = document.querySelector('.container');
    if (!container) return; // Dừng lại nếu không tìm thấy container

    // Lấy chiều cao thực tế của container
    const height = container.scrollHeight;
    
    // Gửi message cho cửa sổ cha
    window.parent.postMessage({ height: height }, '*');
    //console.log(`Sent height to parent: ${height}px`);
}

// Gửi chiều cao khi trang được tải xong
document.addEventListener('DOMContentLoaded', () => {
    // Sử dụng một bộ đếm thời gian trễ hơn một chút để đảm bảo CSS đã được áp dụng
    setTimeout(sendHeightToParent, 500);
});

// Sử dụng MutationObserver để theo dõi mọi thay đổi trong DOM (tin nhắn mới,...)
// và gửi lại chiều cao khi có thay đổi. Đây là cách hiệu quả nhất.
const observer = new MutationObserver(() => {
    sendHeightToParent();
});

// Bắt đầu theo dõi các thay đổi trong phần tin nhắn
observer.observe(DOM.messagesDiv, {
    childList: true, // theo dõi thêm/xóa tin nhắn
    subtree: true    // theo dõi các thay đổi trong tin nhắn
});

// Gửi lại chiều cao khi bắt đầu cuộc trò chuyện mới
DOM.newChatButton.addEventListener('click', () => setTimeout(sendHeightToParent, 100));