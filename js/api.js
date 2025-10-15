// js/api.js

// Hàm gọi API để lấy phản hồi từ Gemini
export async function getGeminiResponse(apiKey, conversationHistory, systemPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`; // <-- THAY ĐỔI Ở ĐÂY
    const requestBody = {
        contents: conversationHistory,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
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
    return data.candidates[0].content.parts[0].text;
}

// Hàm gọi API để tạo câu hỏi gợi ý
export async function generateSuggestedQuestions(apiKey, conversationHistory, suggestionsPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`; // <-- THAY ĐỔI Ở ĐÂY
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
    return data.candidates[0].content.parts[0].text;
}