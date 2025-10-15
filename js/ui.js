// js/ui.js
import * as DOM from './dom.js';
import { translations } from './config.js';

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