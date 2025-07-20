const { OpenAI } = require("openai");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const mongoose = require("mongoose");


mongoose
  .connect(process.env.MONGO_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Is Successfully Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const StorySchema = new mongoose.Schema({
  prompt: String,
  story: String,
  likemetre: Number,
});
const storyDB = mongoose.model("shortstorydb", StorySchema);

const openai = new OpenAI({
  apiKey:process.env.API_KEY || "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",
});

app.use(express.json());
app.use(cors());

app.post("/generate-story", async (req, res) => {
  const userPrompt = req.body.prompt;
  const sliderValue = req.body.sliderValue;

  console.log(sliderValue);

  try {
    const gptResponse = await openai.completions.create({
      model: "text-davinci-003",
      prompt: `Write a short story about ${userPrompt}`,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    if (gptResponse.choices && gptResponse.choices.length > 0) {
      const generatedShortStory = gptResponse.choices[0].text;

      const story = new storyDB({
        prompt: userPrompt,
        story: generatedShortStory,
        likemetre: sliderValue,
      });
      story
        .save()
        .then((savedStory) => {
          console.log("Successfully inserted in database");
          console.log(generatedShortStory);
          res.json({ story: generatedShortStory, storyId: savedStory._id });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.error("No completions found in API response");
      res.status(500).json({ error: "No completions found in API response" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the story." });
  }
});

app.post("/updatelike", (req, res) => {
  const updatedlike = req.body.sliderValue;
  const storyId = req.body.storyId;

  // Construct ObjectId from the storyId

  storyDB
    .findByIdAndUpdate(
      storyId,
      { $set: { likemetre: updatedlike } },
      { new: true }
    )
    .then(() => {
      console.log("Update success");
      res.json({ message: "Update success" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Error updating likemetre" });
    });
});
app.get('/leaderboard', (req, res) => {
  storyDB
    .find({})
    .sort({ likemetre: -1 })
    .then(data => {
      console.log("Data sent to client:", data);
      res.json(data || []);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error fetching data from the database" });
    });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
