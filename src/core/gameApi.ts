import { BACKEND_URL } from "../config";
import { AuthMode } from "@/types/auth";
import { z } from "zod/v4";
import { envConfig } from "@/envConfig";
import { getDiscordAccessToken } from "./multiplayerState";
import {
  discordLoginButtonAccessToken,
  pnAccessToken,
  setPnAccessToken,
} from "@/contexts/DiscordAuthFunctions";

export class GameApi {
  /* This exchanges a Discord access token for a PN access token.
   */
  private async maybeExchangeDiscordTokenForPNToken(): Promise<string> {
    // TODO if localstorage has client token, and room code matches up, then use that, or
    // otherwise delete it

    if (!pnAccessToken) {
      let discordToken: string;
      if (envConfig.authMode == AuthMode.DiscordEmbedded) {
        discordToken = getDiscordAccessToken();
      } else if (envConfig.authMode == AuthMode.DiscordLoginButton) {
        discordToken = discordLoginButtonAccessToken;
        if (!discordToken) {
          throw new Error("No Discord access token found");
        }
      } else {
        discordToken = null;
      }

      const response = await this.makeRequestWithToken(
        "/auth/exchange",
        null,
        discordToken,
      );
      // TODO handle error response from backend due to the Discord access token having
      // expired. This could definitely happen with DiscordLoginButton mode.
      // Not sure about the DiscordEmbedded mode, maybe playroomkit will refresh the
      // Discord token when you call getDiscordAccessToken(), not sure, plus anyway if it's
      // not stored in local storage, then it shouldn't be an issue
      // wait, hang on, in embedded mode, is the call to getDiscordAccessToken() the thing
      // that triggers the auth dialog? if so, it should be called when entering the game,
      // not when first making a request to the API server
      const data = await response.json();
      setPnAccessToken(data.token);
      localStorage.setItem("discord_username", data.discord_username);
      return data.token;
    }
    return pnAccessToken;
  }


  async oldMakeRequestWithExpireHandling(path: string, body: any) {
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

  async makeRequest(path: string, body: any, method: "GET" | "POST" = "POST") {
    const token = await this.maybeExchangeDiscordTokenForPNToken();
    const response = await this._makeRequestWithTokenNoException(
      path,
      body,
      token,
      method,
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized 401");
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
