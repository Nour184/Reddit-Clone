import type { VercelRequest, VercelResponse } from '@vercel/node';
import {CreateUser} from "../../utils/user_crud";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const email : string = req.body['email'];
    const username : string = req.body['username'];
    const password : string = req.body['password'];

    try {
        await CreateUser(email, username, password);
        res.status(200).json({ success: true });
    } catch (err : unknown) {
        if (err instanceof Error) {
            res.status(500).json('Error creating user:' + err.message);
        } else {
            res.status(500).json('Error creating user:' + err);
        }
    }
}

