import { getDiscordAccessToken } from "./multiplayerState";
import { BACKEND_URL } from "../config";
import { z } from "zod/v4";

export class GameApi {
  private async getAuthToken(): Promise<string> {
    const token = localStorage.getItem("token");
    if (!token) {
      const discordToken = await getDiscordAccessToken();
      const response = await this.makeRequestWithToken(
        "/auth/exchange",
        null,
        discordToken,
      );
      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("discord_username", data.discord_username);
      return data.token;
    }
    return token;
  }

  async makeRequest(path: string, body: any, method: "GET" | "POST" = "POST") {
    const token = await this.getAuthToken();
    const response = await this._makeRequestWithTokenNoException(
      path,
      body,
      token,
      method,
    );

    if (!response.ok) {
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.expired) {
          localStorage.removeItem("token");
          const newToken = await this.getAuthToken();
          const retryResponse = await this._makeRequestWithTokenNoException(
            path,
            body,
            newToken,
            method,
          );
          if (!retryResponse.ok) {
            const responseBody = await retryResponse.json();
            throw new Error(
              `HTTP error ${retryResponse.status}: ${JSON.stringify(responseBody)}`,
            );
          }
          return retryResponse.json();
        }
      }
      const responseBody = await response.json();
      throw new Error(
        `HTTP error ${response.status}: ${JSON.stringify(responseBody)}`,
      );
    }

    return response.json();
  }

  async makeRequestWithToken(
    path: string,
    body: any,
    token: string,
    method: "GET" | "POST" = "POST",
  ) {
    const response = await this._makeRequestWithTokenNoException(
      path,
      body,
      token,
      method,
    );

    if (!response.ok) {
      const responseBody = await response.json();
      throw new Error(
        `HTTP error ${response.status}: ${JSON.stringify(responseBody)}`,
      );
    }
    return response;
  }

  async _makeRequestWithTokenNoException(
    path: string,
    body: any,
    token: string,
    method: "GET" | "POST" = "POST",
  ) {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: method === "POST" && body ? JSON.stringify(body) : undefined,
    });
    return response;
  }

  async makeTypedRequest<T extends z.ZodType>(
    path: string,
    body: any,
    schema: T,
    method: "GET" | "POST" = "POST",
  ): Promise<z.infer<T>> {
    const response = await this.makeRequest(path, body, method);
    try {
      return schema.parse(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${JSON.stringify(error.issues)}`);
      }
      throw error;
    }
  }

  async getTyped<T extends z.ZodType>(
    path: string,
    schema: T,
  ): Promise<z.infer<T>> {
    return this.makeTypedRequest(path, null, schema, "GET");
  }

  async postTyped<T extends z.ZodType>(
    path: string,
    body: any,
    schema: T,
  ): Promise<z.infer<T>> {
    return this.makeTypedRequest(path, body, schema, "POST");
  }
}
