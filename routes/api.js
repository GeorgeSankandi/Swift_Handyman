const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Service = require('../models/Service');

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Handle chat messages
// @route   POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const userQuery = req.body.query;
    if (!userQuery) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    // --- 1. Get Context from the Database ---
    // Search for services that match keywords in the user's query
    const matchingServices = await Service.find(
        { $text: { $search: userQuery } },
        { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(3) // Get the top 3 most relevant services
    .lean();

    let context = "No specific services found matching the query.";
    if (matchingServices.length > 0) {
        context = "Here are some services that might be relevant to the user's query: \n" +
            matchingServices.map(s => `- Title: "${s.title}", Category: ${s.category}, Price: N$${s.price}, Description: "${s.description.substring(0, 100)}..."`).join("\n");
    }

    // --- 2. Construct the Prompt for Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});
    const prompt = `You are a friendly and helpful customer service assistant for "Swift Handyman", a digital marketplace for technical services in Namibia. Your tone should be professional yet welcoming.

    Based on the following context from our database and the user's question, provide a helpful and concise answer. Do not mention that you are an AI. If the context helps you answer, use it. If the query is a general greeting or unrelated to finding a service, just have a normal, friendly conversation.

    Context from Database:
    ---
    ${context}
    ---

    User's Question: "${userQuery}"

    Your Answer:`;

    // --- 3. Call the Gemini API ---
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    res.json({ reply: aiText });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: 'Something went wrong with the AI assistant.' });
  }
});

module.exports = router;