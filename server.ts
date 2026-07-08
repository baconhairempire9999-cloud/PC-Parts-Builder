import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for PC Build Review and Q&A Assistant
  app.post("/api/ai/review", async (req, res) => {
    try {
      const { parts, budget, totalCost, messages } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          text: "⚠️ **Gemini API key is not configured in the environment variables.**\n\nPlease add `GEMINI_API_KEY` in the **Settings > Secrets** panel in the Google AI Studio interface to activate the live AI build reviews and full-stack Q&A consulting features!\n\n*(In the meantime, the offline hardware rules compatibility calculator is fully functional above!)*"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct a highly detailed textual summary of the current PC build
      let partsListText = "";
      if (parts) {
        Object.entries(parts).forEach(([category, part]: [string, any]) => {
          if (part) {
            partsListText += `- **${category.toUpperCase()}**: ${part.brand} ${part.name} ($${part.price}) [Power Draw: ${part.power}W] - Specs: ${JSON.stringify(part.specs)}\n`;
          } else {
            partsListText += `- **${category.toUpperCase()}**: (Not Selected yet - please recommend a good choice if appropriate!)\n`;
          }
        });
      } else {
        partsListText = "No parts selected yet. Offer some initial build suggestions based on their budget!";
      }

      const systemInstruction = `You are an expert PC Hardware Consultant and custom PC building assistant.
Your job is to analyze the user's custom PC parts list, check for physical and electronic compatibility, evaluate performance bottlenecks, and offer optimization or price-saving alternatives.

The user's setup environment:
- Target budget: $${budget || 1500}
- Current parts total cost: $${totalCost || 0}
- Selected parts specs and parameters:
${partsListText}

Please review the custom build list, check for issues, and guide the user. Your advice should be clear, detailed, and directly applicable. Cover:
1. **Critical Bottlenecks & Sizing**: E.g., pairing a massive high-end CPU with a tiny cooler, matching DDR4 RAM with a DDR5 motherboard, motherboard socket mismatches, or selecting a GPU that physically exceeds the case length limit.
2. **Power Headroom**: Review if their selected PSU wattage is enough. Suggest PSU headroom (system total wattage + 20% to 30%).
3. **Price-to-Performance Optimizations**: Identify parts that are too expensive or over-spec'd for the build's overall target budget.
4. **Answer questions contextually**: Answer any direct questions the user asks in the chat, keeping the context of their selected parts list in mind.

Respond in a highly knowledgeable, tech-savvy, polite, and encouraging tone. Use clean bullet points, bold headers, and structured tables if helpful. Avoid talking about raw JSON or system internals.`;

      // Convert conversation history into Gemini format
      // Note: we want the conversation structure to follow: { role: "user" | "model", parts: [{ text: "..." }] }
      const chatContents: any[] = [];
      
      if (messages && messages.length > 0) {
        messages.forEach((msg: any) => {
          chatContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });
      } else {
        // If no message history, construct a default prompt initiating the review
        chatContents.push({
          role: 'user',
          parts: [{ text: "Please review my current custom PC build list, check for all electronic and mechanical compatibility issues, and provide feedback on potential optimizations and bottleneck risks." }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate build review." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
