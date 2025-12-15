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
        // Đọc thông báo lỗi chi tiết từ Serverless Function
        const errorData = await response.json();
        // Ném lỗi chi tiết từ Serverless Function
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorData.details || errorData.error}`);
    }

    const data = await response.json();
    // Serverless Function api/chat.js sẽ trả về { text: "..." }
    return data.text; 
}

// Lưu ý: Hàm generateSuggestedQuestions đã được loại bỏ hoàn toàn để giải quyết lỗi.
// Nếu muốn khôi phục, bạn cần thêm logic Serverless Function cho nó.
