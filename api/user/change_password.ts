import type { VercelRequest, VercelResponse } from '@vercel/node';
import {SetPassword} from "../../utils/user_crud";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') {
        return res.status(400).json({ error: 'Bad Request' });
    }

    const email : string = req.body['email'];
    const newPassword : string = req.body['password'];

    try {
        await SetPassword(email, newPassword);
        res.status(200).json({ success: true });
    } catch (err : unknown) {
        if (err instanceof Error) {
            res.status(500).json('Error changed password:' + err.message);
        } else {
            res.status(500).json('Error changed password:' + err);
        }
    }
}

