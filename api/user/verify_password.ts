import type { VercelRequest, VercelResponse } from '@vercel/node';
import {ComparePasswords} from "../../utils/user_crud";
import {GetUser} from "../../utils/user_crud";
import {User} from "../../utils/interfaces";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const email : string = req.body['email'];
    const password : string = req.body['password'];

    try {
        const authorized : boolean = await ComparePasswords(email, password);

        if (!authorized) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user : User | null = await GetUser(email);

        if (user === null) {
            return res.status(404).json({ error: 'User not found' });
        } else {
            return res.status(200).json(user);
        }

    } catch (err : unknown) {
        if (err instanceof Error) {
            res.status(500).json('Error creating user:' + err.message);
        } else {
            res.status(500).json('Error creating user:' + err);
        }
    }
}