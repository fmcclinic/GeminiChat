// js/ui.js
import * as DOM from './dom.js';
import { translations } from './config.js';
// Import các hàm từ main.js để xử lý sự kiện click của nút gợi ý (Fix Circular Dependency)
import { handleSendMessage } from './main.js'; 

// Cập nhật giao diện theo ngôn ngữ được chọn
export function updateLanguageUI(lang) {
    const t = translations[lang];
    DOM.appTitle.textContent = t.appTitle;
    DOM.languageToggle.innerHTML = `<i class="fas fa-language"></i> ${t.toggleLanguage}`;
    DOM.userInput.placeholder = t.inputPlaceholder;
    DOM.sendButton.innerHTML = `<i class="fas fa-paper-plane"></i> ${t.sendButton}`;
    DOM.newChatButton.innerHTML = `<i class="fas fa-plus-circle"></i> ${t.newChatButton}`;
}

// Hiển thị tin nhắn lên màn hình
export function appendMessage(sender, message, lang, isMarkdown = false) {
    const messageElement = document.createElement('div');
    const t = translations[lang];
    let messageClass = '';

    if (sender === t.customer) messageClass = 'user-message';
    else if (sender === t.assistant) messageClass = 'bot-message';
    else messageClass = 'system-message';

    messageElement.className = `message ${messageClass}`;

    const senderElement = document.createElement('div');
    senderElement.className = 'message-sender';
    if (sender === t.customer) senderElement.innerHTML = `<i class="fas fa-user"></i> ${sender}:`;
    else if (sender === t.assistant) senderElement.innerHTML = `<i class="fas fa-robot"></i> ${sender}:`;
    else senderElement.innerHTML = `<i class="fas fa-info-circle"></i> ${sender}:`;
    messageElement.appendChild(senderElement);

    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    if (isMarkdown) {
        // Đảm bảo thư viện marked.js đã được tải trong index.html
        contentElement.innerHTML = marked.parse(message); 
    } else {
        contentElement.textContent = message;
    }
    messageElement.appendChild(contentElement);

    DOM.messagesDiv.appendChild(messageElement);
    DOM.messagesDiv.scrollTop = DOM.messagesDiv.scrollHeight;
    return messageElement;
}

// Xóa tất cả tin nhắn trên giao diện
export function clearMessages() {
    DOM.messagesDiv.innerHTML = '';
}


// ============== CÁC HÀM MỚI ĐƯỢC THÊM ===================

/**
 * Xóa một phần tử khỏi DOM.
 * @param {HTMLElement} element - Phần tử cần xóa.
 */
export function removeElement(element) { // <-- Đã thêm export
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Tạo và hiển thị các nút câu hỏi gợi ý bên dưới tin nhắn bot.
 * @param {HTMLElement} targetElement - Tin nhắn bot chứa gợi ý.
 * @param {Array<string>} suggestions - Danh sách các câu hỏi gợi ý.
 */
export function createSuggestedQuestionsContainer(targetElement, suggestions) { // <-- Đã thêm export
    const container = document.createElement('div');
    container.className = 'suggested-questions-container';
    
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggested-question-button';
        button.textContent = suggestion;
        
        button.addEventListener('click', () => {
            // Đặt câu hỏi vào input
            DOM.userInput.value = suggestion;
            // Gọi hàm gửi tin nhắn từ main.js (Bây giờ nó đã được export)
            handleSendMessage();
        });
        container.appendChild(button);
    });

    targetElement.appendChild(container);
}