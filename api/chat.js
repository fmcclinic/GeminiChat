// api/chat.js - Serverless Function (Node.js Environment)

const { GoogleGenAI } = require('@google/genai');

// Key được đọc bảo mật từ Biến Môi Trường của Vercel (GEMINI_API_KEY)
const apiKey = process.env.GEMINI_API_KEY; 
const model = "gemini-2.5-flash"; 

// Khởi tạo client
const ai = apiKey ? new GoogleGenAI(apiKey) : null;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!ai) {
        console.error("Lỗi: GEMINI_API_KEY không được thiết lập trong biến môi trường Vercel.");
        return res.status(500).json({ error: 'Server configuration error: API Key not found.' });
    }

    try {
        const { conversationHistory, systemPrompt } = req.body;

        if (!conversationHistory || typeof systemPrompt !== 'string') {
            return res.status(400).json({ error: 'Missing conversationHistory or systemPrompt in request body.' });
        }

        const response = await ai.models.generateContent({
            model: model,
            contents: conversationHistory,
            config: {
                systemInstruction: systemPrompt
            }
        });

        res.status(200).json({ text: response.text });

    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        res.status(500).json({ error: 'Internal Server Error while communicating with Gemini.', details: error.message });
    }
}
