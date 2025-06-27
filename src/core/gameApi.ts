import { z } from "zod/v4";
import { getCurrentPnAccessToken } from "@/contexts/AuthContext";
import { permaConsoleLog } from "@/util/logger";

export class GameApi {
  private backendUrl: string;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  async makeRequest(path: string, body: any, method: "GET" | "POST" = "POST") {
    const response = await this._makeRequestNoException(path, body, method);

    if (response.ok) {
      return response.json();
    }

    if (response.status === 401) {
      const errorData = await response.json();
      if (errorData.expired) {
        permaConsoleLog("Token expired");
      }
      localStorage.removeItem("pn_access_token");
      localStorage.removeItem("backend_url");
      window.location.href = "/";
    }
    const responseBody = await response.json();
    throw new Error(
      `HTTP error ${response.status}: ${JSON.stringify(responseBody)}`,
    );
  }

  async _makeRequestNoException(
    path: string,
    body: any,
    method: "GET" | "POST" = "POST",
  ) {
    const token = getCurrentPnAccessToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = token;
    }

    const response = await fetch(`${this.backendUrl}${path}`, {
      method,
      headers,
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
      } else {
        permaConsoleLog("makeTypedRequest error", error);
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
