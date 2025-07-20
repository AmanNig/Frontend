const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// POST /genrateresponse endpoint
app.post('/genrateresponse', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    // Placeholder for LLM integration
    // const response = await getLLMResponse(prompt);
    const response = `Received prompt: ${prompt}`;
    res.json({ response });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
