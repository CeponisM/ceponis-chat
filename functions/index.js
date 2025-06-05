const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');

// Get the OpenAI API key from Firebase functions config
const OPENAI_SECRET_KEY = functions.config().openai.key;

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_SECRET_KEY,
});

exports.chat = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    if (request.method !== "POST") {
      return response.status(405).send({ message: 'Only POST requests are allowed' });
    }

    try {
      const { message } = request.body;
      if (!message) {
        return response.status(400).send({ message: 'No message provided' });
      }

      console.log('Received message:', message);

      // Use OpenAI SDK v5.1.0 with gpt-4.1-nano
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [{ role: 'user', content: message }],
        max_tokens: 69,
      });

      const reply = chatCompletion.choices?.[0]?.message?.content?.trim() || 'No reply';
      console.log('AI reply:', reply);

      response.send({ message: reply });

    } catch (error) {
      console.error('Error while calling OpenAI:', error);
      response.status(500).send({
        message: 'An error occurred while processing your request.',
        error: error.message,
      });
    }
  });
});
