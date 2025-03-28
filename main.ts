import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
import process from "node:process";
import * as clippy from "https://deno.land/x/clippy/mod.ts";
import { existsSync } from "node:fs";

// Load environment variables from .env file
dotenv.config();

const audioFilePath = Deno.args[0];

if (!existsSync(audioFilePath)) {
  console.error("Audio file not found");
  Deno.exit(1);
}


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const myfile = await ai.files.upload({
  file: audioFilePath,
  config: {
    mimeType: "audio/mpeg",
  },
});

console.log(audioFilePath + "のアップロードが完了しました。");
console.log("================================================");


async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      "この音声を文字に書き起こしてください。字間の空白などはなく、文章として自然になるようにお願いします。改行も適度に挟んでください。",
      createPartFromUri(myfile.uri, myfile.mimeType),
    ]),
  });
  console.log(response.text);
  clippy.writeText(response.text);
}

await main();
