// js/main.js
import { translations } from './config.js';
import * as DOM from './dom.js';
import { updateLanguageUI, appendMessage, clearMessages, createSuggestedQuestionsContainer, removeElement } from './ui.js';
import { getGeminiResponse, generateSuggestedQuestions } from './api.js';

// ---- STATE MANAGEMENT ----
// Đã loại bỏ let apiKey = '';
let systemPrompt = '';
let currentLanguage = 'vi';
let conversationHistory = [];
let isProcessing = false; // Ngăn chặn người dùng gửi tin nhắn liên tục

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
        // Hiển thị tin nhắn chào mừng
        appendMessage(t.chatbot, t.welcomeMessage, currentLanguage);
        
        // Kích hoạt các nút sau khi tải xong (thêm logic này)
        DOM.sendButton.disabled = false;
        DOM.newChatButton.disabled = false;
        DOM.languageToggle.disabled = false;


    } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
        const t = translations[currentLanguage];
        appendMessage(t.chatbot, t.errorLoadingConfig + error.message, currentLanguage);
    }
    
    // Thiết lập Event Listeners (chuyển logic từ cuối file lên đây)
    setupEventListeners();
}

/**
 * Tải System Prompt (không tải API Key nữa).
 */
async function loadConfigurations() {
    // Đã xóa toàn bộ logic tải API key từ AI/apikey.txt
    
    // 1. Tải System Prompt (dựa trên ngôn ngữ hiện tại)
    await loadSystemPrompt();

    // LƯU Ý QUAN TRỌNG: Key được xử lý an toàn trong Serverless Function (api/chat.js).
}

async function loadSystemPrompt() {
    const t = translations[currentLanguage];
    const systemPromptResponse = await fetch(t.systemPromptFile);
    if (!systemPromptResponse.ok) throw new Error('Không thể tải System Prompt');
    systemPrompt = await systemPromptResponse.text();
}

// ---- EVENT LISTENERS SETUP ----
function setupEventListeners() {
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
    // Thêm listener cho newChatButton để gửi lại chiều cao sau khi dọn dẹp
    DOM.newChatButton.addEventListener('click', () => setTimeout(sendHeightToParent, 100));
}

// ---- HANDLER FUNCTIONS ----
function startNewChat() {
    clearMessages();
    conversationHistory = [];
    const t = translations[currentLanguage];
    appendMessage(t.chatbot, t.welcomeMessage, currentLanguage);
    
    // Đảm bảo không còn ở trạng thái tải
    isProcessing = false;
    setUIState(false); 
}

function handleLanguageToggle() {
    currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    localStorage.setItem('chatLanguage', currentLanguage);
    updateLanguageUI(currentLanguage);
    loadSystemPrompt();
    startNewChat();
}

async function handleSendMessage() {
    const userText = DOM.userInput.value.trim();
    if (isProcessing || userText === '') return;

    const t = translations[currentLanguage];
    
    // 1. Chuẩn bị UI và State
    isProcessing = true;
    DOM.userInput.value = '';
    DOM.userInput.style.height = 'auto';
    setUIState(true);

    // 2. Thêm tin nhắn người dùng vào lịch sử và UI
    appendMessage(t.customer, userText, currentLanguage);
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    // 3. Hiển thị thông báo đang tải
    const loadingMessageElement = appendMessage(t.chatbot, t.loadingMessage, currentLanguage);

    try {
        // 4. Gọi API (KHÔNG CẦN TRUYỀN API KEY)
        const responseText = await getGeminiResponse(conversationHistory, systemPrompt);
        
        // 5. Cập nhật tin nhắn bot
        loadingMessageElement.remove(); 
        appendMessage(t.assistant, responseText, currentLanguage, true);
        
        // 6. Thêm tin nhắn bot vào lịch sử
        conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
        
        // 7. Tạo và hiển thị câu hỏi gợi ý (nếu cần, cần sửa lại hàm này)
        // Lưu ý: Nếu bạn chưa có hàm createSuggestedQuestionsContainer trong ui.js, hãy bỏ qua dòng này hoặc thêm nó vào.
        // await handleSuggestedQuestions(responseText, lastBotMessageElement); 

    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        loadingMessageElement.remove();
        appendMessage(t.chatbot, t.errorMessage + error.message, currentLanguage);
        // Xóa tin nhắn người dùng khỏi lịch sử nếu bot không phản hồi được
        conversationHistory.pop(); 
    } finally {
        // 8. Hoàn tất xử lý
        isProcessing = false;
        setUIState(false);
    }
}

// Hàm hỗ trợ vô hiệu hóa/kích hoạt UI
function setUIState(disabled) {
    DOM.sendButton.disabled = disabled;
    DOM.userInput.disabled = disabled;
    // DOM.languageToggle.disabled = disabled; // Có thể giữ lại để người dùng vẫn đổi được ngôn ngữ
    // DOM.newChatButton.disabled = disabled; // Có thể giữ lại để người dùng vẫn bắt đầu chat mới
}


// =================================================================
// ==== MÃ GỬI CHIỀU CAO CHO TRANG WEB MẸ ====
// =================================================================

/**
 * Gửi chiều cao của container chính đến cửa sổ cha (trang web lớn hơn).
 */
function sendHeightToParent() {
    const container = document.querySelector('.container');
    if (!container) return; 

    const height = container.scrollHeight;
    
    window.parent.postMessage({ height: height }, '*');
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(sendHeightToParent, 500);
});

// Sử dụng MutationObserver để theo dõi mọi thay đổi trong DOM
const observer = new MutationObserver(() => {
    sendHeightToParent();
});

observer.observe(DOM.messagesDiv, {
    childList: true, 
    subtree: true    
});

window.addEventListener('resize', sendHeightToParent);