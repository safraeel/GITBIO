import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { winstonLogger } from '../utils/logger';

export const githubOAuthURL = (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=read:user user:email public_repo`;
  res.redirect(githubAuthUrl);
};

export const githubOAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    // Exchange code for generic token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });

    // Fetch user's emails (since they might be private)
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${accessToken}` },
    });
    
    const primaryEmail = emailResponse.data.find((e: any) => e.primary)?.email || userResponse.data.email;
    const githubData = userResponse.data;

    let user = await User.findOne({ githubId: githubData.id.toString() });

    if (!user) {
      user = await User.create({
        githubId: githubData.id.toString(),
        email: primaryEmail,
        name: githubData.name || githubData.login,
        avatar: githubData.avatar_url,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwtToken}`);
  } catch (error) {
    winstonLogger.error('GitHub authentication error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
};

export const getMe = async (req: any, res: Response) => {
  res.status(200).json({ success: true, user: req.user });
};
