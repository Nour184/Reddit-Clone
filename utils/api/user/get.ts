import type { VercelRequest, VercelResponse } from '@vercel/node';
import {GetUser} from "../../crud/user_crud";
import {User} from "../../interfaces";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const email : string = req.body['email'];

    try {
        const user : User | null = await GetUser(email);

        if (user === null) {
            return res.status(404).json({ error: 'User not found' });
        } else {
            return res.status(200).json(user);
        }

    } catch (err : unknown) {
        if (err instanceof Error) {
            res.status(500).json('Error fetching user:' + err.message);
        } else {
            res.status(500).json('Error fetching user:' + err);
        }
    }
}