// Biến cấu hình
let apiKey = '';
let systemPrompt = '';
let currentLanguage = 'vi'; // Mặc định là tiếng Việt

// Đối tượng chứa các văn bản trong nhiều ngôn ngữ
const translations = {
    vi: {
        appTitle: 'Trợ lý FMC',
        toggleLanguage: 'English',
        inputPlaceholder: 'Nhập tin nhắn của bạn...',
        sendButton: 'Gửi',
        newChatButton: 'Cuộc trò chuyện mới',
        welcomeMessage: 'Chào mừng bạn đến với Trợ lý FMC! Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện.',
        loadingMessage: 'Đang tải phản hồi...',
        loadingSuggestions: 'Đang tạo câu hỏi gợi ý...',
        errorLoadingConfig: 'Lỗi khi tải cấu hình: ',
        errorMessage: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn: ',
        regenerateResponse: 'Tạo lại câu trả lời',
        regenerateSuggestions: 'Tạo lại câu hỏi gợi ý',
        noSuggestions: 'Không thể tạo câu hỏi gợi ý.',
        customer: 'Khách hàng',
        assistant: 'Trợ lý FMC',
        chatbot: 'Chatbot FMC',
        // Cập nhật đường dẫn
        systemPromptFile: 'AI/system_prompt.txt'
    },
    en: {
        appTitle: 'FMC Assistant',
        toggleLanguage: 'Tiếng Việt',
        inputPlaceholder: 'Type your message...',
        sendButton: 'Send',
        newChatButton: 'New Chat',
        welcomeMessage: 'Welcome to FMC Assistant! Send a message to start a conversation.',
        loadingMessage: 'Loading response...',
        loadingSuggestions: 'Generating suggested questions...',
        errorLoadingConfig: 'Error loading configuration: ',
        errorMessage: 'Sorry, an error occurred while processing your request: ',
        regenerateResponse: 'Regenerate response',
        regenerateSuggestions: 'Regenerate suggestions',
        noSuggestions: 'Could not generate suggested questions.',
        customer: 'Customer',
        assistant: 'FMC Assistant',
        chatbot: 'FMC Chatbot',
        // Cập nhật đường dẫn
        systemPromptFile: 'AI/system_prompt_en.txt'
    }
};

// Khởi tạo marked.js
marked.setOptions({
    breaks: true, // Bật xuống dòng tự động
    gfm: true     // Bật GitHub Flavored Markdown
});

// Lưu trữ lịch sử cuộc trò chuyện
let conversationHistory = [];

// DOM Elements
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const newChatButton = document.getElementById('newChatButton');
const languageToggle = document.getElementById('language-toggle');
const appTitle = document.getElementById('app-title');

// Cập nhật ngôn ngữ giao diện
function updateLanguage() {
    const t = translations[currentLanguage];
    
    // Cập nhật tiêu đề và nút
    appTitle.textContent = t.appTitle;
    languageToggle.innerHTML = `<i class="fas fa-language"></i> ${t.toggleLanguage}`;
    userInput.placeholder = t.inputPlaceholder;
    sendButton.innerHTML = `<i class="fas fa-paper-plane"></i> ${t.sendButton}`;
    newChatButton.innerHTML = `<i class="fas fa-plus-circle"></i> ${t.newChatButton}`;
    
    // Tải system prompt theo ngôn ngữ
    loadSystemPrompt();
}

// Sự kiện chuyển đổi ngôn ngữ
languageToggle.addEventListener('click', function() {
    currentLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    updateLanguage();
    
    // Hiển thị thông báo chào mừng mới
    startNewChat();
});

// Tải API key và System Prompt từ file
async function loadConfigurations() {
    try {
        // Tải API key (cập nhật đường dẫn)
        const apiKeyResponse = await fetch('AI/apikey.txt');
        if (!apiKeyResponse.ok) {
            throw new Error('Không thể tải API key');
        }
        apiKey = await apiKeyResponse.text();
        apiKey = apiKey.trim();
        
        // Tải System Prompt theo ngôn ngữ
        await loadSystemPrompt();
        
        // Hiển thị thông báo chào mừng
        appendMessage(translations[currentLanguage].chatbot, translations[currentLanguage].welcomeMessage);
    } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
        appendMessage(translations[currentLanguage].chatbot, translations[currentLanguage].errorLoadingConfig + error.message);
    }
}

// Tải System Prompt theo ngôn ngữ
async function loadSystemPrompt() {
    try {
        const systemPromptFile = translations[currentLanguage].systemPromptFile;
        const systemPromptResponse = await fetch(systemPromptFile);
        if (!systemPromptResponse.ok) {
            throw new Error('Không thể tải System Prompt');
        }
        systemPrompt = await systemPromptResponse.text();
    } catch (error) {
        console.error('Lỗi khi tải System Prompt:', error);
        appendMessage(translations[currentLanguage].chatbot, translations[currentLanguage].errorLoadingConfig + error.message);
    }
}

// Sự kiện khi nhấn nút Send
sendButton.addEventListener('click', sendMessage);

// Sự kiện khi nhấn nút New Chat
newChatButton.addEventListener('click', startNewChat);

// Hàm bắt đầu cuộc trò chuyện mới
function startNewChat() {
    // Xóa tất cả tin nhắn
    messagesDiv.innerHTML = '';
    
    // Reset lịch sử cuộc trò chuyện
    conversationHistory = [];
    
    // Hiển thị thông báo chào mừng mới
    appendMessage(translations[currentLanguage].chatbot, translations[currentLanguage].welcomeMessage);
}

// Sự kiện khi nhấn phím trong textarea
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            return;
        } else {
            event.preventDefault();
            sendMessage();
        }
    }
});

// Hàm gửi tin nhắn
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        if (!apiKey || !systemPrompt) {
            appendMessage(translations[currentLanguage].chatbot, translations[currentLanguage].errorLoadingConfig);
            return;
        }
        
        appendMessage(translations[currentLanguage].customer, message);
        
        conversationHistory.push({
            role: "user",
            parts: [{ text: message }]
        });
        
        userInput.value = '';
        userInput.style.height = 'auto';
        
        getGeminiResponse();
    }
}

// Hàm hiển thị tin nhắn
function appendMessage(sender, message, isMarkdown = false) {
    const messageElement = document.createElement('div');
    let messageClass = '';
    
    if (sender === translations[currentLanguage].customer) {
        messageClass = 'user-message';
    } else if (sender === translations[currentLanguage].assistant) {
        messageClass = 'bot-message';
    } else {
        messageClass = 'system-message';
    }
    
    messageElement.className = `message ${messageClass}`;
    
    const senderElement = document.createElement('div');
    senderElement.className = 'message-sender';
    
    if (sender === translations[currentLanguage].customer) {
        senderElement.innerHTML = `<i class="fas fa-user"></i> ${sender}:`;
    } else if (sender === translations[currentLanguage].assistant) {
        senderElement.innerHTML = `<i class="fas fa-robot"></i> ${sender}:`;
    } else {
        senderElement.innerHTML = `<i class="fas fa-info-circle"></i> ${sender}:`;
    }
    
    messageElement.appendChild(senderElement);
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    
    if (isMarkdown && sender === translations[currentLanguage].assistant) {
        contentElement.innerHTML = marked.parse(message);
    } else {
        contentElement.textContent = message;
    }
    
    messageElement.appendChild(contentElement);
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageElement;
}

// Hàm thêm nút thao tác
function addActionsToMessage(messageElement, isLatestResponse = true) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'message-actions';
    
    if (isLatestResponse) {
        const regenerateButton = document.createElement('button');
        regenerateButton.className = 'action-button';
        regenerateButton.innerHTML = `<i class="fas fa-redo-alt"></i> ${translations[currentLanguage].regenerateResponse}`;
        regenerateButton.addEventListener('click', regenerateResponse);
        actionsContainer.appendChild(regenerateButton);
    }
    
    const regenerateSuggestionsButton = document.createElement('button');
    regenerateSuggestionsButton.className = 'action-button';
    regenerateSuggestionsButton.innerHTML = `<i class="fas fa-lightbulb"></i> ${translations[currentLanguage].regenerateSuggestions}`;
    regenerateSuggestionsButton.addEventListener('click', () => {
        const oldSuggestions = messageElement.querySelector('.suggested-questions');
        if (oldSuggestions) {
            messageElement.removeChild(oldSuggestions);
        }
        generateSuggestedQuestions(messageElement);
    });
    actionsContainer.appendChild(regenerateSuggestionsButton);
    
    messageElement.appendChild(actionsContainer);
}

// Hàm tạo lại câu trả lời
function regenerateResponse() {
    if (conversationHistory.length >= 2) {
        conversationHistory.pop();
        
        const lastBotMessage = messagesDiv.querySelector('.bot-message:last-of-type');
        if (lastBotMessage) {
            messagesDiv.removeChild(lastBotMessage);
        }
        
        getGeminiResponse();
    }
}

// Hàm gọi API Gemini
async function getGeminiResponse() {
    const loadingId = 'loading-' + Date.now();
    const loadingElement = document.createElement('div');
    loadingElement.id = loadingId;
    loadingElement.className = 'message system-message';
    
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    loadingElement.appendChild(spinner);
    
    const loadingText = document.createTextNode(translations[currentLanguage].loadingMessage);
    loadingElement.appendChild(loadingText);
    
    messagesDiv.appendChild(loadingElement);
    loadingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    const currentScrollPosition = messagesDiv.scrollTop;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const requestBody = {
        contents: conversationHistory,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const geminiResponse = data.candidates[0].content.parts[0].text;
        
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) {
            messagesDiv.removeChild(loadingMsg);
        }
        
        const messageElement = appendMessage(translations[currentLanguage].assistant, geminiResponse, true);
        addActionsToMessage(messageElement);
        
        conversationHistory.push({
            role: "model",
            parts: [{ text: geminiResponse }]
        });
        
        messagesDiv.scrollTop = currentScrollPosition;
        
        setTimeout(() => {
            const additionalScrollAmount = 150; 
            messagesDiv.scrollTo({
                top: currentScrollPosition + additionalScrollAmount,
                behavior: 'smooth'
            });
        }, 100);
        
        generateSuggestedQuestions(messageElement);
    } catch (error) {
        console.error('Error:', error);
        
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) {
            messagesDiv.removeChild(loadingMsg);
        }
        
        appendMessage(translations[currentLanguage].chatbot, translations[currentLanguage].errorMessage + error.message);
    }
}

// Hàm tạo câu hỏi gợi ý
async function generateSuggestedQuestions(messageElement) {
    try {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggested-questions';
        const spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        suggestionsContainer.appendChild(spinner);
        suggestionsContainer.appendChild(document.createTextNode(translations[currentLanguage].loadingSuggestions));
        messageElement.appendChild(suggestionsContainer);
        
        const suggestionsPrompt = currentLanguage === 'vi' ? 
            `Dựa vào cuộc trò chuyện trên, hãy đề xuất 5 câu hỏi tiếp theo mà người dùng có thể quan tâm. 
            Chỉ trả về 5 câu hỏi dưới dạng danh sách đánh số từ 1-5, mỗi câu trên một dòng. 
            Không thêm bất kỳ chữ hoặc giải thích nào khác. 
            Câu hỏi phải ngắn gọn, trực tiếp và liên quan đến ngữ cảnh cuộc trò chuyện hiện tại, không lặp lại với các câu hỏi trước, không tạo câu hởi về giá, thời gian chờ hay thời gian khám.` :
            `Based on the conversation above, suggest 5 follow-up questions that the user might be interested in.
            Only return 5 questions as a numbered list from 1-5, one question per line.
            Do not add any additional text or explanations.
            Questions should be concise, direct, and relevant to the current conversation context, Do not repeat previous questions, do not create questions about prices, waiting times or examination times.`;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const requestBody = {
            contents: [
                ...conversationHistory,
                { role: "user", parts: [{ text: suggestionsPrompt }] }
            ]
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const suggestionsText = data.candidates[0].content.parts[0].text;
        
        const questions = suggestionsText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.match(/^\d+\./) || line.match(/^-/))
            .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
            .filter(line => line.length > 0)
            .slice(0, 5);
        
        suggestionsContainer.innerHTML = '';
        
        if (questions.length > 0) {
            questions.forEach(question => {
                const button = document.createElement('button');
                button.className = 'question-button';
                button.innerHTML = `<i class="fas fa-plus"></i> ${question}`;
                button.addEventListener('click', () => {
                    if (userInput.value.trim() !== '') {
                        userInput.value += '\n\n';
                    }
                    userInput.value += question;
                    userInput.focus();
                    userInput.style.height = 'auto';
                    userInput.style.height = (userInput.scrollHeight) + 'px';
                });
                suggestionsContainer.appendChild(button);
            });
        } else {
            suggestionsContainer.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${translations[currentLanguage].noSuggestions}`;
        }
    } catch (error) {
        console.error('Error generating suggestions:', error);
        if (messageElement.querySelector('.suggested-questions')) {
            messageElement.removeChild(messageElement.querySelector('.suggested-questions'));
        }
    }
}

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Tải cấu hình khi trang web được tải
document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('chatLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
    updateLanguage();
    loadConfigurations();
});

// Lưu ngôn ngữ được chọn
languageToggle.addEventListener('click', function() {
    localStorage.setItem('chatLanguage', currentLanguage);
});

// Debug version để kiểm tra message (đoạn code này không cần thiết cho chức năng chính)
const FIXED_HEIGHT = 700;
function sendFixedHeight() {
    console.log('Sending height:', FIXED_HEIGHT);
    window.parent.postMessage({ height: FIXED_HEIGHT }, '*');
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded triggered');
    sendFixedHeight();
    setTimeout(() => {
        console.log('Delayed height send triggered');
        sendFixedHeight();
    }, 300);
});
document.getElementById('restart-chat-btn')?.addEventListener('click', () => {
    console.log('Restart button clicked');
    setTimeout(sendFixedHeight, 100);
});