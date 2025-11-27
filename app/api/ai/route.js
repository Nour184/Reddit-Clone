import { errorHandlerMiddleware } from "../../../services/middlewareHandlers/errorHandlerMiddleware";
import { NextResponse } from "next/server";
import { mockData } from "../../../services/mockData.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: "Removed for security reasons"
});

const rateLimitStore = new Map(); // for rate limiting (prevent abuse)


async function summarize_post(request) {
    const data = await request.json();
    const postID = data?.postID;

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

    const post = mockData.Posts.find(p => p.postID === postID);
    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const prompt = `
        You are an expert technical summarizer.

        Write a **clear, concise summary (2–4 sentences)** of the following Reddit-style post.
        Do NOT add extra information. Do NOT invent solutions. Only summarize.

        Title: ${post.title ?? "(No title)"}

        Body:
        ${post.body ?? "(No content)"}        
        `;

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    const summaryText = result.text || "No summary generated.";

    return NextResponse.json(
        { summary: summaryText },
        { status: 200 }
    );
}

export const POST = errorHandlerMiddleware(summarize_post);
