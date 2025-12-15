// js/main.js
import { translations } from './config.js';
import * as DOM from './dom.js';
// Đã thêm createSuggestedQuestionsContainer và removeElement
import { 
    updateLanguageUI, 
    appendMessage, 
    clearMessages,
    createSuggestedQuestionsContainer,
    removeElement // Dù không dùng trực tiếp ở đây, vẫn cần import nếu ui.js export
} from './ui.js';
import { getGeminiResponse, generateSuggestedQuestions } from './api.js';

// ---- STATE MANAGEMENT ----
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
        
        // Kích hoạt các nút sau khi tải xong
        DOM.sendButton.disabled = false;
        DOM.newChatButton.disabled = false;
        DOM.languageToggle.disabled = false;


    } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
        const t = translations[currentLanguage];
        appendMessage(t.chatbot, t.errorLoadingConfig + error.message, currentLanguage);
    }
    
    // Thiết lập Event Listeners
    setupEventListeners();
}

/**
 * Tải System Prompt (Không tải API Key).
 */
async function loadConfigurations() {
    // Đã xóa toàn bộ logic tải API key từ AI/apikey.txt
    await loadSystemPrompt();
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

/**
 * Xử lý sự kiện bắt đầu cuộc trò chuyện mới.
 */
export function startNewChat() { // <-- Đã thêm export
    clearMessages();
    conversationHistory = [];
    const t = translations[currentLanguage];
    appendMessage(t.chatbot, t.welcomeMessage, currentLanguage);
    
    // Đảm bảo không còn ở trạng thái tải
    isProcessing = false;
    setUIState(false); 
}

/**
 * Xử lý sự kiện chuyển đổi ngôn ngữ.
 */
export function handleLanguageToggle() { // <-- Đã thêm export
    currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    localStorage.setItem('chatLanguage', currentLanguage);
    updateLanguageUI(currentLanguage);
    loadSystemPrompt();
    startNewChat();
}

/**
 * Xử lý sự kiện gửi tin nhắn.
 */
export async function handleSendMessage() { // <-- Đã thêm export
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
        const lastBotMessageElement = appendMessage(t.assistant, responseText, currentLanguage, true); // Lưu lại element này
        
        // 6. Thêm tin nhắn bot vào lịch sử
        conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
        
        // 7. Tạo và hiển thị câu hỏi gợi ý
        await handleSuggestedQuestions(responseText, lastBotMessageElement); 

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

/**
 * Xử lý việc tạo lại và hiển thị câu hỏi gợi ý.
 */
async function handleSuggestedQuestions(botResponseText, targetElement) {
    const t = translations[currentLanguage];
    
    // Xóa container gợi ý cũ (nếu có)
    const existingContainer = targetElement.querySelector('.suggested-questions-container');
    if (existingContainer) existingContainer.remove();

    // Chuẩn bị prompt cho gợi ý
    const suggestionsPrompt = `Dựa trên phản hồi cuối cùng này: "${botResponseText}", hãy tạo ra 3-4 câu hỏi gợi ý liên quan mà người dùng có thể hỏi tiếp. Trả lời chỉ bằng danh sách các câu hỏi, mỗi câu hỏi trên một dòng, không có số thứ tự hay ký hiệu.`;
    
    // 1. Hiển thị thông báo đang tải gợi ý
    const loadingSuggestionsElement = appendMessage(t.chatbot, t.loadingSuggestions, currentLanguage);
    loadingSuggestionsElement.className = 'message system-message loading-suggestions';

    try {
        // 2. Gọi API để tạo gợi ý (sử dụng hàm generateSuggestedQuestions đã import)
        // Lưu ý: Tùy theo logic của api/chat.js (hoặc api/suggestions.js)
        const suggestionsText = await generateSuggestedQuestions(conversationHistory, suggestionsPrompt);
        
        // 3. Xử lý kết quả và hiển thị
        loadingSuggestionsElement.remove();
        if (suggestionsText) {
            const suggestions = suggestionsText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            createSuggestedQuestionsContainer(targetElement, suggestions);
        } else {
            // Hiển thị thông báo không có gợi ý nếu API trả về rỗng
            // appendMessage(t.chatbot, t.noSuggestions, currentLanguage); // Tắt thông báo này để UI sạch hơn
        }
    } catch (error) {
        console.error('Lỗi khi tạo câu hỏi gợi ý:', error);
        loadingSuggestionsElement.remove();
        // Không cần hiển thị lỗi nặng, chỉ bỏ qua gợi ý
    }
}

/**
 * Thiết lập trạng thái UI (vô hiệu hóa/kích hoạt input/button).
 * @param {boolean} disabled - Trạng thái vô hiệu hóa.
 */
function setUIState(disabled) {
    DOM.sendButton.disabled = disabled;
    DOM.userInput.disabled = disabled;
    // DOM.languageToggle.disabled = disabled; // Giữ nguyên, không vô hiệu hóa
    // DOM.newChatButton.disabled = disabled; // Giữ nguyên, không vô hiệu hóa
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