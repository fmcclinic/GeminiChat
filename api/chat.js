// api/chat.js
import { GoogleGenAI } from '@google/genai';

// 1. Cấu hình Model & Key
// Lưu ý: Đổi tên model về gemini-1.5-flash hoặc gemini-2.0-flash-exp
const MODEL_NAME = "gemini-1.5-flash"; 

export default async function handler(req, res) {
    // 2. Chỉ chấp nhận phương thức POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 3. Lấy API Key từ biến môi trường
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is missing in Vercel Environment Variables.");
        return res.status(500).json({ 
            error: 'Server configuration error.', 
            details: 'API Key not found. Please check Vercel Settings.' 
        });
    }

    try {
        // 4. Khởi tạo Client (Sử dụng cú pháp đúng cho SDK @google/genai)
        // SDK mới yêu cầu truyền object { apiKey: ... }
        const ai = new GoogleGenAI({ apiKey: apiKey });

        const { conversationHistory, systemPrompt } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!conversationHistory || !systemPrompt) {
            return res.status(400).json({ error: 'Missing conversationHistory or systemPrompt' });
        }

        // 5. Gọi Gemini API
        // Lưu ý: SDK @google/genai có cấu trúc gọi hàm khác một chút so với SDK cũ
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: conversationHistory,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        // 6. Trả về kết quả
        // SDK mới trả về text trực tiếp trong response.text() hoặc property text tuỳ version, 
        // nhưng thường là response.text
        return res.status(200).json({ text: response.text });

    } catch (error) {
        console.error('Gemini API Error:', error);
        
        // Trả về lỗi chi tiết để dễ debug (có thể ẩn chi tiết khi production nếu cần)
        return res.status(500).json({ 
            error: 'Error processing request', 
            details: error.message || 'Unknown error' 
        });
    }
}