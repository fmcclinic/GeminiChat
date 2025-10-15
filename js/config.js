// js/config.js

// Xuất đối tượng translations để các module khác có thể sử dụng
export const translations = {
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
        systemPromptFile: 'AI/system_prompt_en.txt'
    }
};