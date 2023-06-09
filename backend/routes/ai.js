const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const { OPEN_AI_API_KEY } = require("../appsecrets");
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

var serviceAccount = require("../freeadmingptwebapp-384207-firebase-adminsdk-7qlgk-6a26b8eae6.json");
const { storage } = require("firebase-functions/v1");
const { raw } = require("body-parser");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "gs://freeadmingptwebapp-384207.appspot.com",
});
const bucket = getStorage().bucket();

const configuration = new Configuration({
  apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

////////////////////
// TOPIC ///////////
///////////////////

router.get("/topic/:language", async (req, res, next) => {
  let language = req.params.language;

  // Validate language input
  const validLanguages = ["en", "fr"];
  if (!validLanguages.includes(language)) {
    res.status(400).json({
      message: "Invalid language. Please provide a valid language.",
    });
    return; // Return early to avoid further processing
  }
  inputFile = `inputprompts/${language}/youtube_topic.txt`;

  rawPrompt = await readTextFileToPrompt(inputFile);

  try {
    const response = await generateTopic(language);

    res.status(200).json({
      message: "success",
      result: { topic: response },
    });
  } catch (error) {
    if (error.response) {
      res.status(500).json({
        message: "API call failed",
        result: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        result: error.message,
      });
    }
  }
});

async function generateTopic(language) {
  const inputFile = `inputprompts/${language}/youtube_topic.txt`;
  const rawPrompt = await readTextFileToPrompt(inputFile);

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: rawPrompt,
      temperature: 1.2,
      max_tokens: 500,
      top_p: 1,
      presence_penalty: 0.7,
      frequency_penalty: 0.7,
    });

    const response = completion.data.choices[0].text;
    return response;
  } catch (error) {
    throw error;
  }
}

////////////////////
// SUMMARY /////////
///////////////////

router.post("/summary/:language", async (req, res, next) => {
  let language = req.params.language;
  let prompt = req.body.prompt;

  // Validate language input
  const validLanguages = ["en", "fr"];
  if (!validLanguages.includes(language)) {
    res.status(400).json({
      message: "Invalid language. Please provide a valid language.",
    });
    return; // Return early to avoid further processing
  }

  // Validate prompt input
  if (prompt === undefined || prompt.trim() === "") {
    res.status(400).json({
      message: "Invalid prompt. Please provide a valid prompt.",
    });
    return;
  }

  try {
    const gptSummary = await generateSummary(language, prompt);

    if (gptSummary === undefined || gptSummary === "") {
      res.status(400).json({
        message: "Invalid prompt. Please provide a valid prompt.",
      });
      return;
    }

    const gptKeyPoints = await generateKeyPoints(language, gptSummary);
    const gptScriptVoice = await generateScriptVoice(language, gptSummary);

    res.status(200).json({
      message: "success",
      result: {
        summary: gptSummary,
        key_points: gptKeyPoints,
        script_voice: gptScriptVoice,
      },
    });
  } catch (error) {
    if (error.response) {
      res.status(500).json({
        message: "API call failed",
        result: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        result: error.message,
      });
    }
  }
});

async function generateSummary(language, prompt) {
  const inputFile = `inputprompts/${language}/summary.txt`;

  try {
    let gptSummary = await simplePromptCompletion(inputFile, prompt);
    return gptSummary;
  } catch (error) {
    throw error;
  }
}

////////////////////
// SCRIPT HELPERS //
///////////////////

/**
 * Returns the key points in a list format seperated by commas
 * @param {*} language
 * @param {*} summary
 * @returns
 */
async function generateKeyPoints(language, summary) {
  const inputFile = `inputprompts/${language}/youtube_key_points.txt`;

  try {
    let gptKeyPoints = await simplePromptCompletion(inputFile, summary);
    return gptKeyPoints;
  } catch (error) {
    throw error;
  }
}

async function generateScriptVoice(language, summary) {
  const inputFile = `inputprompts/${language}/youtube_script_voice.txt`;

  try {
    let gptScriptVoice = await simplePromptCompletion(inputFile, summary);
    return gptScriptVoice;
  } catch (error) {
    throw error;
  }
}

router.post("/points/:language", async (req, res, next) => {
  let language = req.params.language;
  let key_points = req.body.key_points;
  let script_points = req.body.script_points;

  // Validate language input
  const validLanguages = ["en", "fr"];
  if (!validLanguages.includes(language)) {
    res.status(400).json({
      message: "Invalid language. Please provide a valid language.",
    });
    return; // Return early to avoid further processing
  }

  // Validate key_points input
  if (!key_points) {
    res.status(400).json({
      message: "Key points are required.",
    });
    return; // Return early to avoid further processing
  }

  // Validate script_points input
  if (!script_points) {
    res.status(400).json({
      message: "Script points are required.",
    });
    return; // Return early to avoid further processing
  }

  try {
    const rawMatching = await generatePointKeyMatching(
      language,
      key_points,
      script_points
    );
    const gptPointKeyMatching = "{" + rawMatching;
    res.status(200).json({
      message: "success",
      result: { point_key_matching: gptPointKeyMatching },
    });
  } catch (error) {
    if (error.response) {
      res.status(500).json({
        message: "API call failed",
        result: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        result: error.message,
      });
    }
  }
});

/**
 * Takes a list of key points and returns a list of script points. They must be compared as string literals.
 * @param {*} language
 * @param {*} key_points
 * @param {*} script_points
 * @returns
 */
async function generatePointKeyMatching(language, key_points, script_points) {
  const inputFile = `inputprompts/${language}/youtube_point_key_matching.txt`;

  if (!language) {
    throw new Error("Invalid language file.");
  }

  if (!script_points || !key_points) {
    throw new Error("Input parameter.");
  }

  try {
    rawPrompt = await readTextFileToPrompt(inputFile);
    matchingPrompt = rawPrompt
      .replace("<<KEYS>>", key_points)
      .replace("<<POINTS>>", script_points);
    return getNewOutputCompletion(matchingPrompt);
  } catch (error) {
    throw error;
  }
}

////////////////////
// TITLE //////////
///////////////////

router.post("/new/title/:language", async (req, res, next) => {
  let language = req.params.language;
  let summary = req.body.summary;
  let style = req.body.style;

  // Validate language input
  const validLanguages = ["en", "fr"];
  if (!validLanguages.includes(language)) {
    res.status(400).json({
      message: "Invalid language. Please provide a valid language.",
    });
    return; // Return early to avoid further processing
  }

  // Validate summary input
  if (!summary) {
    res.status(400).json({
      message: "Summary is required.",
    });
    return; // Return early to avoid further processing
  }

  // Validate style input (if required)
  if (!style) {
    res.status(400).json({
      message: "Empty style. Please provide a valid style.",
    });
    return; // Return early to avoid further processing
  }

  try {
    const gptTitle = await generateTitle(language, summary, style);

    res.status(200).json({
      message: "success",
      result: { title: gptTitle },
    });
  } catch (error) {
    if (error.response) {
      res.status(400).json({
        message: "API call failed",
        result: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        result: error.message,
      });
    }
  }
});

async function generateTitle(language, summary, style) {
  const inputFile = `inputprompts/${language}/youtube_title.txt`;

  try {
    let gptTitle = await newPromptCompletion(inputFile, summary, style);
    return gptTitle;
  } catch (error) {
    throw error;
  }
}

router.post("/improve/title/:language", async (req, res, next) => {
  let language = req.params.language;
  let current = req.body.current;
  let prompt = req.body.prompt;

  // Validate language input
  const validLanguages = ["en", "fr"];
  if (!validLanguages.includes(language)) {
    res.status(400).json({
      message: "Invalid language. Please provide a valid language.",
    });
    return; // Return early to avoid further processing
  }

  if (current === undefined || current === "") {
    res.status(400).json({
      message: "current is required",
    });
    return;
  }

  if (prompt === undefined || prompt.trim() === "") {
    res.status(400).json({
      message: "Invalid prompt. Please provide a valid prompt.",
    });
    return;
  }

  try {
    const gptTitle = await getImprovedCompletion(language, current, prompt);

    res.status(200).json({
      message: "success",
      result: { title: gptTitle },
    });
  } catch (error) {
    if (error.response) {
      res.status(500).json({
        message: "API call failed",
        result: error.response.data,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        result: error.message,
      });
    }
  }
});

async function getImprovedCompletion(language, current, prompt) {
  let inputFile = getImproveFileName(language, prompt);
  if (inputFile === "") {
    res.status(400).json({
      message: "Something is missing in the request body.",
    });
    return; // Stop further execution
  }

  try {
    let gptTitle = await improvePromptCompletion(inputFile, current);
    return gptTitle;
  } catch (error) {
    throw error;
  }
}

////////////////////
// DESCRIPTION /////
///////////////////

router.post("/new/description/:language", async (req, res, next) => {
  let language = req.params.language;
  let summary = req.body.summary;
  let style = req.body.style;

  if (!language || !["en", "fr"].includes(language)) {
    res.status(400).json({
      message: "Invalid language. Language must be 'en' or 'fr'.",
    });
    return; // Stop further execution
  }
  inputFile = `inputprompts/${language}/youtube_description.txt`;

  if (!summary) {
    res.status(400).json({
      message: "Summary is required.",
    });
    return; // Stop further execution
  }

  try {
    let gptDescription = await newPromptCompletion(inputFile, summary, style);
    res.status(200).json({
      message: "success",
      result: { description: gptDescription },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while generating the description.",
      result: error.message,
    });
  }
});

router.post("/improve/description/:language", async (req, res, next) => {
  let language = req.params.language;
  let current = req.body.current;
  let prompt = req.body.prompt;

  if (!language || !["en", "fr"].includes(language)) {
    res.status(400).json({
      message: "Invalid language. Language must be 'en' or 'fr'.",
    });
    return; // Stop further execution
  }

  if (!current) {
    res.status(400).json({
      message: "Current is required.",
    });
    return; // Stop further execution
  }

  let inputFile = getImproveFileName(language, prompt);
  if (inputFile === "") {
    res.status(400).json({
      message: "Something is missing in the request body.",
    });
    return; // Stop further execution
  }

  try {
    let gptDescription = await improvePromptCompletion(inputFile, current);
    res.status(200).json({
      message: "success",
      result: { description: gptDescription },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while improving the description.",
      result: error.message,
    });
  }
});

////////////////////
// SCRIPT //////////
///////////////////

/**
 * By the time we get the user has already made a reqeust to get the point & key matching json
 * Now they are submitting the match point and key for a generated section
 */
router.post("/new/script/:language", async (req, res, next) => {
  let language = req.params.language;
  let title = req.body.title;
  let voice = req.body.voice;
  let point = req.body.point;
  let key = req.body.key;

  if (!language || !["en", "fr"].includes(language)) {
    res.status(400).json({
      message: "Invalid language. Language must be 'en' or 'fr'.",
    });
    return; // Stop further execution
  }

  inputFile = `inputprompts/${language}/youtube_script_section.txt`;

  try {
    let gptScript = await newScriptPromptCompletion(
      inputFile,
      title,
      voice,
      point,
      key
    );
    res.status(200).json({
      message: "success",
      result: { script: gptScript },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while generating the script.",
      result: error.message,
    });
  }
});

router.post("/improve/script/:language", async (req, res, next) => {
  let language = req.params.language;
  let current = req.body.current;
  let prompt = req.body.prompt;

  if (!language || !["en", "fr"].includes(language)) {
    res.status(400).json({
      message: "Invalid language. Language must be 'en' or 'fr'.",
    });
    return; // Stop further execution
  }

  if (!current) {
    res.status(400).json({
      message: "Current is required.",
    });
    return; // Stop further execution
  }

  if (prompt === undefined || prompt === "") {
    res.status(400).json({
      message: "Prompt is required.",
    });
    return; // Stop further execution
  }

  let inputFile = getImproveFileName(language, prompt);
  if (inputFile === "") {
    res.status(400).json({
      message: "Something is missing in the request body.",
    });
    return; // Stop further execution
  }

  try {
    let gptScript = await improvePromptCompletion(inputFile, current);
    res.status(200).json({
      message: "success",
      result: { script: gptScript },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while improving the script.",
      result: error.message,
    });
  }
});

////////////////////
// TAGS ///////////
///////////////////

router.post("/new/tags/:language", async (req, res, next) => {
  let language = req.params.language;
  let summary = req.body.summary;
  let style = req.body.style;

  if (!language || !["en", "fr"].includes(language)) {
    res.status(400).json({
      message: "Invalid language. Language must be 'en' or 'fr'.",
    });
    return; // Stop further execution
  }
  inputFile = `inputprompts/${language}/youtube_tags.txt`;

  if (!summary) {
    res.status(400).json({
      message: "Summary is required.",
    });
    return; // Stop further execution
  }

  try {
    let gptTags = await newPromptCompletion(inputFile, summary, style);
    res.status(200).json({
      message: "success",
      result: { tags: gptTags },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while generating new tags.",
      result: error.message,
    });
  }
});

router.post("/improve/tags/:language", async (req, res, next) => {
  let language = req.params.language;
  let current = req.body.current;
  let prompt = req.body.prompt;

  if (!language || !["en", "fr"].includes(language)) {
    res.status(400).json({
      message: "Invalid language. Language must be 'en' or 'fr'.",
    });
    return; // Stop further execution
  }

  if (current === "") {
    res.status(500).json({
      message: "current is required",
    });
    return;
  }

  let inputFile = getImproveFileName(language, prompt);
  if (inputFile === "") {
    res.status(400).json({
      message: "Something is missing in the request body.",
    });
    return; // Stop further execution
  }

  try {
    let gptTags = await improvePromptCompletion(inputFile, current);
    res.status(200).json({
      message: "success",
      result: { tags: gptTags },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred while improving tags.",
      result: error.message,
    });
  }
});

////////////////////
// FUNCTIONS //////
////////////////////

function getImproveFileName(language, prompt) {
  inputFolder = `inputprompts/${language}`;

  switch (prompt) {
    case "funnier":
      return `${inputFolder}/optimizer_funnier.txt`;
    case "formal":
      return `${inputFolder}/optimizer_formal.txt`;
    case "simpler":
      return `${inputFolder}/optimizer_simpler.txt`;
    case "expand":
      return `${inputFolder}/optimizer_expand.txt`;
    case "shorten":
      return `${inputFolder}/optimizer_shorten.txt`;
    default: {
      console.log("🔥 Invalid prompt:", prompt);
      return "";
    }
  }
}

async function getNewOutputCompletion(prompt, maxRetries = 3) {
  let retryCount = 0; //implement retry mechanism
  let innerError = "";

  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  while (retryCount < maxRetries) {
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 1,
      });
      return completion.data.choices[0].text;
    } catch (error) {
      if (error.response) {
        console.log(
          "API Error:",
          error.response.status + ", " + error.response.data
        );
        innerError = error.response.data;
      } else {
        console.log("Request Error:", error.message);
        innerError = error.message;
      }
    }
    retryCount++;
  }
  throw new Error("Max retries exceeded for error:", innerError);
}

async function getOptimizedOutputCompletion(prompt, maxRetries = 3) {
  let retryCount = 0; //implement retry mechanism
  let innerError = "";

  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  while (retryCount < maxRetries) {
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 1,
        max_tokens: 2500,
        top_p: 1,
        presence_penalty: 0.6,
        frequency_penalty: 0.6,
      });
      return completion.data.choices[0].text;
    } catch (error) {
      if (error.response) {
        console.log(
          "API Error:",
          error.response.status + ", " + error.response.data
        );
        innerError = error.response.data;
      } else {
        console.log("Request Error:", error.message);
        innerError = error.message;
      }
    }
    retryCount++;
  }
  throw new Error("Max retries exceeded for error:", innerError);
}

async function simplePromptCompletion(inputFile, inputParam) {
  if (!inputFile) {
    throw new Error("Invalid input file.");
  }

  if (!inputParam) {
    throw new Error("Invalid input parameter.");
  }

  rawPrompt = await readTextFileToPrompt(inputFile);
  reformattedPrompt = rawPrompt.replace("<<FEED>>", inputParam);

  return getNewOutputCompletion(reformattedPrompt);
}

async function newScriptPromptCompletion(inputFile, title, voice, point, key) {
  if (!inputFile || !title || !voice || !point || !key) {
    throw new Error(
      "Invalid input parameters. Please provide all required parameters."
    );
  }

  rawPrompt = await readTextFileToPrompt(inputFile);
  scriptPrompt = rawPrompt
    .replace("<<TITLE>>", title)
    .replace("<<AUTHOR>>", voice)
    .replace("<<POINT>>", point)
    .replace("<<KEY>>", key);

  return getNewOutputCompletion(scriptPrompt);
}

async function newPromptCompletion(filename, inputParam, styleParam) {
  if (!filename || !inputParam || !styleParam) {
    throw new Error(
      "Invalid input parameters. Please provide all required parameters."
    );
  }

  rawPrompt = await readTextFileToPrompt(filename, inputParam);
  if (inputParam === "") {
    return;
  }
  properPrompt = rawPrompt
    .replace("<<FEED>>", inputParam)
    .replace("<<STYLE>>", styleParam);
  return getNewOutputCompletion(properPrompt);
}

async function improvePromptCompletion(filename, inputParam) {
  if (!filename || !inputParam) {
    throw new Error(
      "Invalid input parameters. Please provide all required parameters."
    );
  }

  if (inputParam === "") {
    throw new Error(
      "Invalid input parameter. Please provide a valid input parameter."
    );
  }

  rawPrompt = await readTextFileToPrompt(filename);
  properPrompt = rawPrompt.replace("<<SOURCE>>", inputParam);
  return getOptimizedOutputCompletion(properPrompt);
}

async function readTextFileToPrompt(filename) {
  try {
    const data = await readFile(filename);
    return data;
  } catch (err) {
    console.log(`🔥 Error reading file:` + filename);
    console.log(err.message);
  }
}

async function readFile(fileName) {
  const file = bucket.file(fileName);

  const data = await file.download();
  const contents = data.toString("utf8");

  return contents;
}

module.exports = router;
