// api/chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Lấy API Key từ biến môi trường
const apiKey = process.env.GEMINI_API_KEY;

// Cấu hình Model (Giữ nguyên model bạn yêu cầu)
const MODEL_NAME = "gemini-2.5-flash"; 

export default async function handler(req, res) {
    // 1. Chỉ chấp nhận method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Kiểm tra API Key
    if (!apiKey) {
        console.error("❌ Lỗi: Thiếu GEMINI_API_KEY trong biến môi trường.");
        return res.status(500).json({ 
            error: 'Server Configuration Error', 
            details: 'API Key is missing on the server.' 
        });
    }

    try {
        // 3. Lấy dữ liệu từ Client
        const { conversationHistory, systemPrompt } = req.body;

        if (!conversationHistory) {
            return res.status(400).json({ error: 'Missing conversationHistory' });
        }

        // 4. Khởi tạo Google Generative AI Client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            systemInstruction: systemPrompt // System prompt được cấu hình ở đây
        });

        // 5. Chuẩn bị lịch sử chat cho đúng định dạng của SDK
        // SDK yêu cầu format: { role: 'user' | 'model', parts: [{ text: '...' }] }
        // Dữ liệu từ main.js gửi lên đã đúng format này chưa? 
        // Dựa vào main.js của bạn: conversationHistory.push({ role: "user", parts: [{ text: userText }] });
        // -> Dữ liệu đã ĐÚNG chuẩn, có thể truyền trực tiếp.
        
        // Tuy nhiên, tin nhắn cuối cùng cần được tách ra để gửi vào hàm sendMessage (đối với chat session) 
        // HOẶC dùng generateContent nếu muốn gửi toàn bộ context mỗi lần (stateless).
        // Cách an toàn nhất cho Serverless (Stateless) là gửi toàn bộ history dưới dạng contents:
        
        const result = await model.generateContent({
            contents: conversationHistory,
        });

        const response = await result.response;
        const text = response.text();

        // 6. Trả về kết quả
        return res.status(200).json({ text: text });

    } catch (error) {
        console.error('❌ Lỗi gọi Gemini API:', error);
        
        // Trả về JSON lỗi để Frontend hiển thị đẹp thay vì crash
        return res.status(500).json({ 
            error: 'Error processing request', 
            details: error.message || 'Unknown error' 
        });
    }
}
// Lưu ý: Hàm generateSuggestedQuestions đã được loại bỏ để tránh lỗi...
