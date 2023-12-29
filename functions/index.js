const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');

// Retrieve your OpenAI API key from Firebase function config
const OPENAI_SECRET_KEY = functions.config().openai.key;

// Instantiate the OpenAI client with the API key
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
      console.log('Received message: ', message);

      // Use the OpenAI SDK to create chat completions
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 69,
      });

      console.log('Received response from OpenAI API: ', chatCompletion);

      if (!chatCompletion || !chatCompletion.choices) {
        console.error('Unexpected response from OpenAI API: ', chatCompletion);
        return response.status(500).send({ message: 'Unexpected response from OpenAI API.' });
      }

      const reply = chatCompletion.choices[0]?.message?.content.trim() || 'No reply';
      response.send({ message: reply });
    } catch (error) {
      console.error('Error: ', error);
      response.status(500).send({
        message: 'An error occurred while processing your request.', 
        error: error.message 
      });
    }
  });
});
