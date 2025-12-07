import type { VercelRequest, VercelResponse } from '@vercel/node';
import {GetPost} from "../../utils/post_crud";
import {Post} from "../../utils/interfaces";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const id : number = req.body['ID'];

    try {
        const post : Post | null = await GetPost(id);

        if (post === null) {
            return res.status(404).json({ error: 'Post not found' });
        } else {
            return res.status(200).json(post);
        }

    } catch (err : unknown) {
        if (err instanceof Error) {
            res.status(500).json('Error  user:' + err.message);
        } else {
            res.status(500).json('Error creating user:' + err);
        }
    }
}