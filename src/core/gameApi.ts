import { getDiscordAccessToken } from './multiplayerState';
import { BACKEND_URL } from '../config';
import { z } from 'zod';

export class GameApi {
  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      const discordToken = await getDiscordAccessToken();
      const response = await this.makeRequestWithToken('/auth/exchange', null, discordToken);
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('discord_username', data.discord_username);
      return data.token;
    }
    return token;
  }

  async makeRequest(path: string, body: any) {
    const token = await this.getAuthToken();
    const response = await this._makeRequestWithTokenNoException(path, body, token);

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.expired) {
          localStorage.removeItem('token');
          const newToken = await this.getAuthToken();
          const retryResponse = await this._makeRequestWithTokenNoException(path, body, newToken);
          if (!retryResponse.ok) {
            throw new Error(`HTTP status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        }
      }
      throw new Error(`HTTP status: ${response.status}`);
    }

    return response.json();
  }

  async makeRequestWithToken(path: string, body: any, token: string) {
      const response = await this._makeRequestWithTokenNoException(path, body, token);

      if (!response.ok) {
        throw new Error(`HTTP status: ${response.status}`);
      }
      return response;
  }

  async _makeRequestWithTokenNoException(path: string, body: any, token: string) {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return response;
  }

  async makeTypedRequest<T extends z.ZodType>(path: string, body: any, schema: T): Promise<z.infer<T>> {
    const response = await this.makeRequest(path, body);
    return schema.parse(response);
  }
}
