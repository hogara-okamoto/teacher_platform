import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';// For actual API calls

dotenv.config(); // Load environment variables from.env file

const app = express();
const port = process.env.PORT || 3000;

// CORSを有効にする（開発用。本番環境では特定のオリジンに制限することを推奨）
app.use(cors());
app.use(express.json()); // JSON形式のリクエストボディをパースする

// 静的ファイル（index.htmlなど）を配信
app.use(express.static('public'));

// 教材生成のエンドポイント
app.post('/generate-material', async (req, res) => {
    const { topic, level } = req.body;

    if (!topic || !level) {
        return res.status(400).json({ error: 'Topic and level are required.' });
    }

    // ここに実際の生成AIモデルAPI呼び出しロジックを記述します
    // 例: OpenAI, Google Gemini, Anthropic など

    let generatedContent = '';

    try {
        // --- 実際のAI API呼び出しの例（OpenAIの場合） ---
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set in.env');
        }

        const prompt = `Generate a simple English reading material for a ${level} student about "${topic}". The material should be around 100-150 words.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // または "gpt-4o" など
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300
            })
        });

        const data = await response.json();
        // console.log("OpenAI API raw response:", JSON.stringify(data, null, 2));
        if (
            data.choices &&
            data.choices.length > 0 &&
            data.choices[0].message &&
            data.choices[0].message.content
        ) {
            generatedContent = data.choices[0].message.content;
        } else {
            generatedContent = "Failed to generate content from AI.";
        }

        // --- テスト用のモック応答 ---
        // generatedContent = `
        //     <h3>Reading Material: ${topic} for ${level} Students</h3>
        //     <p>This is a sample reading material about ${topic}. It is designed for ${level} students to practice their English reading skills. The content focuses on basic vocabulary and simple sentence structures related to ${topic}.</p>
        //     <p>For example, if the topic is "Daily Routines," a ${level} student might read about "waking up," "eating breakfast," and "going to school." If the topic is "Space Exploration," a ${level} student might learn about "planets" and "rockets."</p>
        //     <p>This material aims to be engaging and easy to understand, helping students build confidence in their English comprehension.</p>
        // `;

    } catch (error) {
        console.error('Error generating content:', error);
        generatedContent = `Error: Could not generate material. Please check server logs. (${error.message})`;
    }

    res.json({ material: generatedContent });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});