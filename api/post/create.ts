import type { VercelRequest, VercelResponse } from '@vercel/node';
import {CreatePost} from "../../utils/post_crud";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const email : string = req.body['email'];
    const communityName : string = req.body['community'];
    const title : string = req.body['title'];
    const body : string = req.body['body'];
    const pictureLink : string = req.body['picture_link'];

    try {
        await CreatePost(email, communityName, title, body, pictureLink);
        res.status(200).json({ success: true });
    } catch (err : unknown) {
        if (err instanceof Error) {
            res.status(500).json('Error creating post:' + err.message);
        } else {
            res.status(500).json('Error creating post:' + err);
        }
    }
}

