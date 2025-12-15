// api/chat.js - Serverless Function (Node.js Environment)

<<<<<<< HEAD
// SỬ DỤNG CÚ PHÁP REQUIRE THAY VÌ IMPORT để tránh lỗi module trên Vercel
=======
>>>>>>> d10921e462c7d3f0ccb3d561f5abd2308d0d1cdd
const { GoogleGenAI } = require('@google/genai');

// Key được đọc bảo mật từ Biến Môi Trường của Vercel
const apiKey = process.env.GEMINI_API_KEY; 
const model = "gemini-2.5-flash"; 

// Khởi tạo client
const ai = apiKey ? new GoogleGenAI(apiKey) : null;

/**
 * Handler chính cho Serverless Function.
 * Xử lý yêu cầu POST chứa lịch sử trò chuyện và system prompt.
 */
export default async function handler(req, res) {
    // 1. Kiểm tra phương thức HTTP
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Kiểm tra API Key
    if (!ai) {
        console.error("Lỗi: GEMINI_API_KEY không được thiết lập trong biến môi trường Vercel.");
        // Trả về lỗi 500 nếu key không được tìm thấy
        return res.status(500).json({ error: 'Server configuration error: API Key not found.', details: 'Please check your Vercel Environment Variables.' });
    }

    try {
        const { conversationHistory, systemPrompt } = req.body;

        // 3. Kiểm tra dữ liệu đầu vào
        if (!conversationHistory || typeof systemPrompt !== 'string') {
            return res.status(400).json({ error: 'Missing required parameters.', details: 'Missing conversationHistory or systemPrompt in request body.' });
        }

        // 4. Gọi API Gemini
        const response = await ai.models.generateContent({
            model: model,
            contents: conversationHistory,
            config: {
                systemInstruction: systemPrompt
            }
        });

        // 5. Trả về kết quả thành công
        res.status(200).json({ text: response.text });

    } catch (error) {
        // 6. Xử lý lỗi từ Google API hoặc lỗi Server khác
        console.error('Lỗi khi gọi Gemini API:', error);
        res.status(500).json({ 
            error: 'Internal Server Error while communicating with Gemini.', 
            details: error.message || 'Unknown API error.'
        });
    }
}
