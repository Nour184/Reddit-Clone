import { errorHandlerMiddleware } from "../../../services/middlewareHandlers/errorHandlerMiddleware";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GetPost } from "../../../utils/crud/post_crud";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

const rateLimitStore = new Map(); // for rate limiting (prevent abuse)


async function summarize_post(request) {
    const postID = request.nextUrl.searchParams.get("postID");

    const ip = request.headers.get("x-forwarded-for") || "local";

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 3; // 3 request/min

    if (!rateLimitStore.has(ip)) rateLimitStore.set(ip, []);

    const timestamps = rateLimitStore.get(ip).filter(ts => now - ts < windowMs);

    if (timestamps.length >= limit) {
        return NextResponse.json(
            { error: "Rate limit exceeded. Try again later." },
            { status: 429 }
        );
    }

    timestamps.push(now);
    rateLimitStore.set(ip, timestamps);

    if (!postID) {
        return NextResponse.json({ error: "postID is required" }, { status: 400 });
    }

    const post = await GetPost(postID);
    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let prompt;
    let summaryResult;

    if (!post.pictureLink) {

        prompt = `You are an expert technical summarizer.

        Write a **clear, concise summary (2–4 sentences)** of the following Reddit-style post.
        Do NOT add extra information. Do NOT invent solutions. Only summarize.

        Title: ${post.title ?? "(No title)"}

        Body:
        ${post.body ?? "(No content)"}        
        `;

        summaryResult = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
    }
    else {
        prompt = `You are an expert technical summarizer.

        Write a **clear, concise summary (2–4 sentences)** of the following Reddit-style post.
        Do NOT add extra information. Do NOT invent solutions. Only summarize.

        Title: ${post.title ?? "(No title)"}

        Body:
        ${post.body ?? "(No content)"}
        
        Image: attached below
        `;
        const imageResult = await fetch(post.pictureLink);
        const imageBlob = await imageResult.blob();
        const imageBase64 = Buffer.from(await imageBlob.arrayBuffer()).toString("base64");

        summaryResult = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64,
                    },
                },
                { text: prompt }
            ],
        });
    }

    const summaryText = summaryResult.text || "No summary generated.";

    return NextResponse.json(
        { summary: summaryText },
        { status: 200 }
    );
}

export const GET = errorHandlerMiddleware(summarize_post);
