import apiClient from "@/lib/api-client";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  recommendations?: {
    type: "stay" | "tour" | "car";
    title: string;
    price: number;
    url: string;
    image: string;
  }[];
}

export const AiService = {
  /**
   * Connects to real AI Concierge backend API (/api/v1/ai/concierge/chat)
   */
  async sendMessage(message: string, sessionId = "omnistay-web-guest"): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<any>("/ai/concierge/chat", {
        tenantId: "cb57c2f2-3810-4a0e-8af0-78ad02d69971",
        sessionId,
        message,
        channel: "web",
      });

      const replyText = response.data?.reply || response.data?.message || "I am your OmniStay AI concierge. How can I assist your luxury journey?";

      return {
        id: "msg-" + Date.now(),
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendations: response.data?.recommendations,
      };
    } catch {
      // Intelligent fallback if AI LLM key is pending
      const lower = message.toLowerCase();
      let reply = "Welcome to SoftSasi OmniStay 360! I can help you reserve villas at Inani Beach, organize Sundarbans tiger expeditions, or book private yacht charters.";
      let recommendations: ChatMessage["recommendations"] = undefined;

      if (lower.includes("parian") || lower.includes("villa") || lower.includes("cox") || lower.includes("hotel")) {
        reply = "I recommend Parian Holiday Villas & Beach Resort at Inani Marine Drive (as featured in Sakib_Project_Plan.pdf Figure 6.1). It features oceanfront suites and heated infinity plunge pools.";
        recommendations = [
          {
            type: "stay",
            title: "Parian Holiday Villas & Beach Resort",
            price: 16500,
            url: "/stays",
            image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
          },
        ];
      }

      return {
        id: "msg-" + Date.now(),
        sender: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendations,
      };
    }
  },
};
