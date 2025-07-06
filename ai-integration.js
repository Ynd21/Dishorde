const axios = require('axios');

class AIIntegration {
    constructor(config) {
        this.config = config;
        this.enabled = config['ai-enabled'];
        this.apiKey = config['openrouter-api-key'];
        this.personality = config['ai-personality'];
        this.model = config['ai-llm'] || 'anthropic/claude-3.5-sonnet';
        
        // Message history for context
        this.messageHistory = [];
        this.maxHistoryLength = 10;
        
        // Cooldown to prevent spam
        this.lastResponse = 0;
        this.cooldownMs = 5000; // 5 seconds between responses
        
        // Track AI messages to prevent loops
        this.aiMessageIds = new Set();
    }

    isEnabled() {
        return this.enabled && this.apiKey && this.apiKey.trim() !== '';
    }

    addToHistory(author, content, isAI = false) {
        if (!this.isEnabled()) return;
        
        this.messageHistory.push({
            author,
            content,
            timestamp: Date.now(),
            isAI
        });
        
        // Keep only last 10 messages
        if (this.messageHistory.length > this.maxHistoryLength) {
            this.messageHistory.shift();
        }
    }

    isOnCooldown() {
        return Date.now() - this.lastResponse < this.cooldownMs;
    }

    buildContextMessages() {
        const messages = [
            {
                role: 'system',
                content: this.personality + "\n\nIMPORTANT: The following messages are RECENT CHAT HISTORY for context only. Do not respond to them directly unless the current user is asking about them. Only respond to the final message marked as 'CURRENT MESSAGE'."
            }
        ];

        // Add recent message history for context with clear labeling
        if (this.messageHistory.length > 0) {
            let historyContext = "--- RECENT CHAT HISTORY (for context only) ---\n";
            
            for (const msg of this.messageHistory) {
                const timeAgo = Math.floor((Date.now() - msg.timestamp) / 1000);
                const timeLabel = timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`;
                
                if (msg.isAI) {
                    historyContext += `[${timeLabel}] AI: ${msg.content}\n`;
                } else {
                    historyContext += `[${timeLabel}] ${msg.author}: ${msg.content}\n`;
                }
            }
            
            historyContext += "--- END HISTORY ---";
            
            messages.push({
                role: 'user',
                content: historyContext
            });
        }

        return messages;
    }

    async generateResponse(prompt, context = 'chat') {
        if (!this.isEnabled()) {
            console.log('[AI] AI integration is disabled');
            return null;
        }

        if (this.isOnCooldown()) {
            console.log('[AI] AI is on cooldown');
            return null;
        }

        try {
            const messages = this.buildContextMessages();
            
            // Add the current prompt with clear marking
            if (context === 'death') {
                messages.push({
                    role: 'user',
                    content: `--- CURRENT EVENT ---\nA player just died. Generate a short, funny roast about their death: ${prompt}`
                });
            } else {
                messages.push({
                    role: 'user',
                    content: `--- CURRENT MESSAGE ---\n${prompt}\n\nRespond ONLY to this current message. Do not reference or respond to the chat history above unless specifically asked about it.`
                });
            }

            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: this.model,
                messages: messages,
                max_tokens: context === 'death' ? 100 : 80, // Shorter responses for game
                temperature: 0.8,
                top_p: 0.9
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/Ynd21/Dishorde/',
                    'X-Title': '7DTD Discord Bot'
                }
            });

            // Check if response has the expected structure
            if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
                console.error('[AI] Invalid response structure:', response.data);
                return null;
            }
            
            const aiResponse = response.data.choices[0].message.content.trim();
            
            // Update cooldown
            this.lastResponse = Date.now();
            
            // Add AI response to history
            this.addToHistory('AI', aiResponse, true);
            
            console.log(`[AI] Generated response: ${aiResponse}`);
            return aiResponse;

        } catch (error) {
            console.error('[AI] Error generating response:', error.response?.data || error.message);
            return null;
        }
    }

    shouldRespond(message, author) {
        if (!this.isEnabled()) return false;
        if (this.isOnCooldown()) return false;
        
        // Don't respond to AI messages (prevent loops)
        if (author === 'AI' || author.includes('Bot')) return false;
        
        const lowerMessage = message.toLowerCase();
        
        // High priority triggers - always respond
        const highPriorityTriggers = [
            '?', 'help', 'ai', 'bot', 'server', 'how', 'what', 'why', 'when', 'where'
        ];
        
        if (highPriorityTriggers.some(trigger => lowerMessage.includes(trigger))) {
            return true;
        }
        
        // Medium priority triggers - greetings and common words
        const mediumPriorityTriggers = [
            'hello', 'hi', 'hey', 'sup', 'yo', 'howdy', 'greetings',
            'thanks', 'thank you', 'cool', 'nice', 'awesome', 'lol', 'haha'
        ];
        
        if (mediumPriorityTriggers.some(trigger => lowerMessage.includes(trigger))) {
            return true;
        }
        
        // Random chance for any other message (10% chance)
        if (Math.random() < 0.1) {
            console.log(`[AI] Random response triggered for: ${message}`);
            return true;
        }
        
        return false;
    }

    async handleChatMessage(author, message, sendToGame, sendToDiscord) {
        if (!this.shouldRespond(message, author)) {
            // Still add to history for context
            this.addToHistory(author, message);
            return;
        }

        console.log(`[AI] Processing message from ${author}: ${message}`);
        
        const response = await this.generateResponse(`${author}: ${message}`);
        if (response) {
            // Send via bridge system (both callbacks do the same thing now)
            if (sendToGame) {
                sendToGame(response);
            }
            if (sendToDiscord) {
                sendToDiscord(response);
            }
        }
    }

    async handlePlayerDeath(playerName, sendToGame, sendToDiscord) {
        if (!this.isEnabled()) return;

        console.log(`[AI] Generating death roast for ${playerName}`);
        
        const response = await this.generateResponse(playerName, 'death');
        if (response) {
            // Send via bridge system (emoji will be added by caller)
            if (sendToGame) {
                sendToGame(response);
            }
            if (sendToDiscord) {
                sendToDiscord(response);
            }
        }
    }
}

module.exports = AIIntegration; 