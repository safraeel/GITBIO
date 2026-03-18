import { Request, Response } from 'express';
import { getUserStats, getTopLanguages } from '../services/github.service';

export const getStats = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const stats = await getUserStats(username);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch GitHub stats' });
  }
};

export const getLanguages = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const languages = await getTopLanguages(username);
    res.json({ success: true, data: languages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch GitHub languages' });
  }
};
