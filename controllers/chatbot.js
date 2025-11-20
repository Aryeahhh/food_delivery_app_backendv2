import { GoogleGenerativeAI } from "@google/generative-ai";
import Restaurant from "../models/restaurant.model.js";
import MenuItem from "../models/menuItem.model.js";
import { Op } from "sequelize";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Load ALL restaurants from database
    const allRestaurants = await Restaurant.findAll({
      include: [{
        model: MenuItem,
        as: 'menuItems',
        required: false
      }],
      order: [['restaurant_id', 'ASC']]
    });

    // Build context with all available data
    let contextParts = ["Available Restaurants:\n"];
    allRestaurants.forEach(r => {
      contextParts.push(`${r.name} - ${r.cuisineType} cuisine at ${r.address}`);
      if (r.menuItems && r.menuItems.length > 0) {
        const items = r.menuItems.slice(0, 3).map(m => `${m.item_name} ($${m.item_price})`).join(', ');
        contextParts.push(`  Popular items: ${items}`);
      }
    });

    const context = contextParts.join('\n');

    // Build conversation with context
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const systemPrompt = `You are GourmAI, a food recommendation bot. Here are ALL available restaurants:

${context}

CRITICAL RULES - FOLLOW EXACTLY:
1. NEVER ask for location, address, or zip code
2. NEVER ask follow-up questions
3. User asks for cuisine → YOU pick a restaurant from the list and recommend it with specific menu items and prices
4. Format: "I recommend [Restaurant Name]! Try their [item 1] ($X), [item 2] ($Y), and [item 3] ($Z)."
5. Be direct and confident - NO questions, just recommendations with menu items
6. If they say "Mexican", pick a Mexican restaurant from the list above and recommend 2-3 menu items with prices NOW
7. If they greet you, greet them back briefly then ask what cuisine they're interested in
8. Always include specific menu items from the restaurant's menu with their prices

Example:
User: "I want Mexican food"
You: "I recommend El Jalisco! Try their Beef Tacos ($8.99), Chicken Enchiladas ($10.49), and Guacamole ($4.99)."

DO NOT deviate from this format. Give recommendations with menu items and prices, not questions.`;

    // Build full conversation
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    res.json({
      message: response
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ 
      error: "Failed to process message",
      details: error.message 
    });
  }
};
