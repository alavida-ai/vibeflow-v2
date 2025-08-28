import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
} from "@google/genai";
import { schema } from '@brand-listener/database';

export const generateVisualDescription = async (media: schema.TweetMediaAnalyzer): Promise<string> => {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error("Google API key is not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    let prompt = '';
    let mimeType = '';

    if (media.type === 'video') {
        prompt = "Transcribe the audio from this video, giving timestamps for salient events in the video. Also provide visual descriptions.";
        mimeType = 'video/mp4';
    } else if (media.type === 'photo' || media.type === 'image') {
        prompt = "Detail this image in full";
        mimeType = 'image/jpeg';
    } else {
        prompt = "Describe this media in detail.";
        mimeType = '';
    }

    // Download the file to a temp location
    const tempFile = await downloadToTemp(media.url);
    try {
        const file = await ai.files.upload({
            file: tempFile,
            config: { mimeType },
        });
        console.log("Uploaded file:", file);

        if (!file.name) {
            throw new Error("File name is required");
        }

        // Always wait for Gemini to process the file, regardless of type
        const activeFile = await waitForFileActive(ai, file.name);

        const content = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: createUserContent([
                createPartFromUri(
                    activeFile.uri,
                    activeFile.mimeType
                ),
                prompt
            ]),
        });
        console.log("result.text=", content.text);
        if (!content.text) {
            throw new Error("No text returned from Gemini");
        }
        return content.text;
    } finally {
        // Clean up temp file
        await fs.unlink(tempFile).catch(() => { });
    }
};

async function downloadToTemp(url: string): Promise<string> {
    const ext = path.extname(url).split('?')[0] || '';
    const tempFile = path.join(os.tmpdir(), `media-${uuidv4()}${ext}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download file: ${url}`);
    const buffer = await res.arrayBuffer();
    await fs.writeFile(tempFile, Buffer.from(buffer));
    return tempFile;
}

async function waitForFileActive(ai: any, fileName: string, maxWaitMs = 60000): Promise<any> {
    const startTime = Date.now();
    let delay = 1000; // Start with 1 second
    const maxDelay = 10000; // Cap at 10 seconds

    while (Date.now() - startTime < maxWaitMs) {
        const file = await ai.files.get({ name: fileName });
        console.log(`File state: ${file.state}`);
        if (file.state === 'ACTIVE') {
            return file;
        }
        if (file.state === 'FAILED') {
            throw new Error(`File processing failed: ${fileName}`);
        }
        // Exponential backoff
        console.log(`Waiting ${delay}ms before next check...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, maxDelay);
    }
    throw new Error(`File processing timeout: ${fileName}`);
}