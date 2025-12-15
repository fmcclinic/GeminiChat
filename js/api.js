// js/api.js
// Đã loại bỏ tham số apiKey và chuyển hướng đến Serverless Function /api/chat

/**
 * Hàm gọi API để lấy phản hồi từ Gemini (thông qua Serverless Function).
 * @param {Array} conversationHistory - Lịch sử cuộc trò chuyện.
 * @param {string} systemPrompt - Hướng dẫn hệ thống.
 * @returns {Promise<string>} Phản hồi văn bản từ bot.
 */
export async function getGeminiResponse(conversationHistory, systemPrompt) {
    const url = '/api/chat'; // <-- Gọi Serverless Function của Vercel
    
    // Gửi dữ liệu cần thiết (không bao gồm API key)
    const requestBody = {
        conversationHistory: conversationHistory,
        systemPrompt: systemPrompt
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        // Ném lỗi chi tiết từ Serverless Function
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorData.details || errorData.error}`);
    }

    const data = await response.json();
    // Serverless Function api/chat.js sẽ trả về { text: "..." }
    return data.text; 
}

// Lưu ý: Tạm thời loại bỏ hàm generateSuggestedQuestions vì nó có logic phức tạp
// và có thể cần một Serverless Function riêng biệt (api/suggestions.js) hoặc được kết hợp trong api/chat.js.
// Nếu bạn muốn triển khai tính năng này, bạn cần tạo thêm file Serverless Function cho nó.