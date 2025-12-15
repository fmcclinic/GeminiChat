// js/ui.js
import * as DOM from './dom.js';
import { translations } from './config.js';
// Thêm import cho hàm xử lý tin nhắn
import { handleSendMessage } from './main.js'; // <-- Cần import để xử lý click

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
 * Xóa một phần tử khỏi DOM
 * (Mặc dù hàm này đơn giản, nó được giữ lại vì main.js đã import nó)
 * @param {HTMLElement} element - Phần tử cần xóa.
 */
export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Tạo và hiển thị các nút câu hỏi gợi ý bên dưới tin nhắn bot.
 * @param {HTMLElement} targetElement - Tin nhắn bot chứa gợi ý.
 * @param {Array<string>} suggestions - Danh sách các câu hỏi gợi ý.
 */
export function createSuggestedQuestionsContainer(targetElement, suggestions) {
    const container = document.createElement('div');
    container.className = 'suggested-questions-container';
    
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggested-question-button';
        button.textContent = suggestion;
        
        button.addEventListener('click', () => {
            // Đặt câu hỏi vào input và gửi
            DOM.userInput.value = suggestion;
            // Gọi hàm gửi tin nhắn từ main.js
            // Lưu ý: Việc import handleSendMessage từ main.js tạo ra Circular Dependency,
            // nhưng đây là cách đơn giản nhất để kích hoạt chức năng gửi tin nhắn từ button.
            // Nếu bạn gặp vấn đề, hãy khai báo lại logic gửi tin nhắn tại đây.
            // Tạm thời, ta sẽ gọi handleSendMessage (nếu nó được export từ main.js)
            if (typeof handleSendMessage === 'function') {
                handleSendMessage();
            } else {
                // Nếu handleSendMessage không được export từ main.js (vì nó không có trong mã bạn cung cấp)
                // Ta phải tự kích hoạt sự kiện click của nút Gửi.
                DOM.sendButton.click();
            }
        });
        container.appendChild(button);
    });

    targetElement.appendChild(container);
}