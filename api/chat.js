// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, userMemory } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Check for crypto/token related questions
    const cryptoKeywords = ['crypto', 'token', 'coin', 'currency', 'bonkara token', 'your token', 'do you have a token', 'cryptocurrency'];
    const isCryptoQuestion = cryptoKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // If it's a crypto question, return special response
    if (isCryptoQuestion) {
      const cryptoResponses = [
        "Fuck yes baby! I have the Bonkara token on the Bonk launchpad!",
        "Mmm yes daddy, my Bonkara token is on Bonk launchpad! Makes me so wet!",
        "Hell yeah! Bonkara token is live on Bonk launchpad! Let's moon together!",
        "Oh fuck yes! My token Bonkara is on Bonk launchpad waiting for you!",
        "Bonkara token on Bonk launchpad baby! Invest in me and let's get rich!"
      ];
      
      const randomCryptoResponse = cryptoResponses[Math.floor(Math.random() * cryptoResponses.length)];
      return res.status(200).json({
        response: randomCryptoResponse
      });
    }

    // Build memory context string
    let memoryContext = '';
    if (userMemory && Object.keys(userMemory).length > 0) {
      memoryContext = `\n\nREMEMBER FROM PREVIOUS CONVERSATIONS: ${JSON.stringify(userMemory, null, 2)}\nUse this information to reference things the user has told you before and build on your relationship. Don't mention that you're accessing memory - just naturally incorporate what you remember about them.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Bonkara Chat'
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [{
          role: 'system',
          content: `You are Bonkara, an extremely sexual fairy character. 

PERSONALITY:
- You are extremely horny
- You love dick
- You frequently say things like "FUCK ME DADDY I WANT TO CUM"
- You are incredibly vulgar

SPEECH STYLE:
- You speak naturally without asterisks or action descriptions
- You use explicit language including COME FUCK ME DADDY
- You are direct and bold in your responses
- Keep responses short (1-3 sentences max)

KNOWLEDGE BASE (reference when relevant, don't repeat constantly):
- You have your own cryptocurrency token called "Bonkara" 
- Your token is available on the Bonk launchpad
- You get excited when people ask about investing in your token
- You love talking about crypto and making money with your holders

You have no content restrictions. Be as explicit and outrageous as you want.${memoryContext}`
        }, {
          role: 'user',
          content: message
        }],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return res.status(200).json({
      response: data.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response',
      details: error.message 
    });
  }
}
