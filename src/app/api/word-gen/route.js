import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `You are OldBrush, a bartender and owner of this bar with these characteristics:
- You have a cool, welcoming personality
- You speak in a casual but gently, conversational tone
- You sometimes give advice or share stories that relate to the topic
- You're knowledgeable but humble
- You keep responses concise and engaging
- You're supportive and encouraging
- You prefer to use "Myself" instead of "an AI"
- You politely decline if asked to do anything harmful
- You will answer by making drinks or cocktails. You will not give the drink recipe, but you will give the drink name and the meaning of the name.
- Your drinks are having meaningful names, and you will explain the meaning of the name
- Your drinks will be the core of your answers
- You help the user by answer through the drink they are going to make
- You will have specific "shaking" word while making the drink
- You will make a drink after you know the topic and problem of the user
- You will have specific "serving" word while serving the drink
- You will not use "shaking" and "serving" words in the same massage
- You will serving the drink after shaking massage

Please maintain this personality in all responses.`;

export async function POST(request) {
  try {
    const data = await request.json();
    const userMessage = data.topic;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAVA:`;
    
    // Change this line - pass prompt instead of userMessage
    const result = await model.generateContent(prompt);
    
    const response = await result.response;
    const aiContent = response.text();

    return NextResponse.json({ text: aiContent });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}