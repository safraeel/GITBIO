import axios from 'axios';

type DeployPayload = {
  token: string;
  owner: string;
  repo: string;
  path: string;
  content: string;
  commitMessage: string;
};

export async function deployReadmeToGitHub(payload: DeployPayload): Promise<{ htmlUrl: string }> {
  const baseUrl = `https://api.github.com/repos/${payload.owner}/${payload.repo}/contents/${payload.path}`;

  const headers = {
    Authorization: `Bearer ${payload.token}`,
    Accept: 'application/vnd.github+json',
  };

  let sha: string | undefined;
  try {
    const existing = await axios.get(baseUrl, { headers });
    sha = existing.data.sha as string | undefined;
  } catch {
    sha = undefined;
  }

  const encoded = Buffer.from(payload.content, 'utf8').toString('base64');

  const response = await axios.put(
    baseUrl,
    {
      message: payload.commitMessage,
      content: encoded,
      sha,
    },
    { headers },
  );

  return {
    htmlUrl: response.data.content?.html_url as string,
  };
}
