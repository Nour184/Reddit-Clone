import { errorHandlerMiddleware } from "@services/middlewareHandlers/errorHandlerMiddleware";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GetPost } from "@utils/crud/post_crud";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
});

function getClientIp(request) {
    const forwardedFor = request.headers.get("x-forwarded-for");

    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    if (request.ip) {
        return request.ip;
    }

    return "local";
}

async function summarize_post(request) {
    const postID = request.nextUrl.searchParams.get("postID");

    const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, "1 m"),
        analytics: true,
    });

    const { success, limit, reset } = await ratelimit.limit(
        `api:ai:${getClientIp(request)}`
    );

    if (!success) {
        const remaining = (reset - Date.now()) / 1000;
        return NextResponse.json(
            { error: `Rate limit ${limit} exceeded. Try again in ${remaining} seconds.` },
            { status: 429 }
        );
    }

    if (!postID) {
        return NextResponse.json({ error: "postID is required" }, { status: 400 });
    }

    const postIDInt = Number(postID);
    if (!Number.isInteger(postIDInt)) {
        return NextResponse.json({ error: "postID must be an integer" }, { status: 400 });
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
