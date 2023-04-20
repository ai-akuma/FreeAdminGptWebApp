const express = require("express");
const router = express.Router();
const fs = require("fs");
const shortid = require('shortid');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  //   apiKey: process.env.OPENAI_API_KEY,
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

router.post("", async (req, res, next) => {
  console.log("🚀 ~ file: openai.js:12 ~ router.post ~ req:", req.body);

  let prompt = req.body.prompt;
  if (prompt === "") {
    // this needs to be another GPT prompt
    prompt = "How to make money using faceless youtube channels.";
  }

  const style = req.body.style;
  const duration = req.body.duration;

  let gptSummary = await summaryPromptCompletion(prompt);
  console.log("🚀 ~ file: ai.js:26 ~ router.post ~ gptSummary:", gptSummary)

  let gptTitle = await paramPromptCompletion("backend/routes/inputprompts/youtube_title.txt", gptSummary);
  console.log("🚀 ~ file: ai.js:28 ~ router.post ~ gptTitle:", gptTitle)

  let gptDescription = await paramPromptCompletion("backend/routes/inputprompts/youtube_description.txt", gptSummary);
  console.log("🚀 ~ file: ai.js:30 ~ router.post ~ gptDescription:", gptDescription)
  
  let gptTags = await paramPromptCompletion("backend/routes/inputprompts/youtube_tags.txt", gptSummary);
  gptTags = gptTags.split(",");
  console.log("🚀 ~ file: ai.js:32 ~ router.post ~ gptTags:", gptTags)

  let gptScript = await scriptPromptCompletion(gptSummary, style, duration);
  console.log("🚀 ~ file: ai.js:34 ~ router.post ~ gptScript:", gptScript)

  res.status(200).json({
    message: "Response sent successfully",
    result: {
        id: shortid.generate(),
        title: gptTitle,
        description: gptDescription,
        script: gptScript,
        tags: gptTags
    }
});
});

async function getCompletion(prompt) {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 1,
    });
    return completion.data.choices[0].text;
    
  } catch (error) {
    if (error.response) {
      console.log("🚀 ~ file: ai.js:56 ~ getCompletion ~ error")
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log("🚀 ~ file: ai.js:61 ~ getCompletion ~ else")
      console.log(error.message);
    }
  }
}

async function summaryPromptCompletion(inputParam) {
  summaryPrompt = readTextFileToPrompt("backend/routes/inputprompts/summary.txt"); 
  summaryPrompt = summaryPrompt.replace("<<FEED>>", inputParam);
  

  const completion = getCompletion(summaryPrompt);
  return completion;
}

function scriptPromptCompletion(inputParam, styleParam, durationParam) {
  scriptPrompt = readTextFileToPrompt("backend/routes/inputprompts/youtube_script.txt"); 
  scriptPrompt = scriptPrompt.replace("<<FEED>>", inputParam);
  scriptPrompt = scriptPrompt.replace("<<STYLE>>", styleParam);

  const completion = getCompletion(scriptPrompt);
  return completion;
}

function paramPromptCompletion(filename, inputParam) {
  rawPrompt = readTextFileToPrompt(filename);
  rawPrompt = rawPrompt.replace("<<FEED>>", inputParam);

  const completion = getCompletion(rawPrompt);
  return completion;
}

function readTextFileToPrompt(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return data;
  } catch (err) {
    console.log("🚀 ~ file: ai.js:80 ~ readTextFileToPrompt ~ err:", err)
  }
}

module.exports = router;

// https://cloud.google.com/text-to-speech/docs/voices
// French (Canada)	Neural2	fr-CA	fr-CA-Neural2-A	FEMALE
// French (Canada)	Neural2	fr-CA	fr-CA-Neural2-B	MALE
// French (Canada)	Neural2	fr-CA	fr-CA-Neural2-C	FEMALE
// French (Canada)	Neural2	fr-CA	fr-CA-Neural2-D	MALE
// French (Canada)	Standard	fr-CA	fr-CA-Standard-A	FEMALE
// French (Canada)	Standard	fr-CA	fr-CA-Standard-B	MALE
// French (Canada)	Standard	fr-CA	fr-CA-Standard-C	FEMALE
// French (Canada)	Standard	fr-CA	fr-CA-Standard-D	MALE
// French (Canada)	WaveNet	fr-CA	fr-CA-Wavenet-A	FEMALE
// French (Canada)	WaveNet	fr-CA	fr-CA-Wavenet-B	MALE
// French (Canada)	WaveNet	fr-CA	fr-CA-Wavenet-C	FEMALE
// French (Canada)	WaveNet	fr-CA	fr-CA-Wavenet-D	MALE

//Language	Voice type	Language code	Voice name	     SSML Gender
// French  Neural2	     fr-FR	      "fr-FR-Neural2-A",	 FEMALE
// French  Neural2	     fr-FR	      "fr-FR-Neural2-B",	 MALE
// French  Neural2	     fr-FR	      "fr-FR-Neural2-C",	 FEMALE
// French  Neural2	     fr-FR	      "fr-FR-Neural2-D",	 MALE
// French  Neural2	     fr-FR	      "fr-FR-Neural2-E",	 FEMALE
// French  Standard     	fr-FR      	"fr-FR-Standard-A",	FEMALE
// French  Standard     	fr-FR      	"fr-FR-Standard-B",	MALE
// French  Standard     	fr-FR      	"fr-FR-Standard-C",	FEMALE
// French  Standard     	fr-FR      	"fr-FR-Standard-D",	MALE
// French  Standard     	fr-FR      	"fr-FR-Standard-E",	FEMALE
// French  WaveNet	     fr-FR	      "fr-FR-Wavenet-A",	 FEMALE
// French  WaveNet	     fr-FR	      "fr-FR-Wavenet-B",	 MALE
// French  WaveNet	     fr-FR	      "fr-FR-Wavenet-C",	 FEMALE
// French  WaveNet	     fr-FR	      "fr-FR-Wavenet-D",	 MALE
// French  WaveNet	     fr-FR	      "fr-FR-Wavenet-E",	 FEMALE
