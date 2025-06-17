import { BACKEND_URL } from "../config";
import { z } from "zod/v4";
import { getCurrentPnAccessToken } from "@/contexts/AuthContext";

export class GameApi {
  async makeRequest(path: string, body: any, method: "GET" | "POST" = "POST") {
    const response = await this._makeRequestWithTokenNoException(
      path,
      body,
      getCurrentPnAccessToken(),
      method,
    );

    if (response.ok) {
      return response.json();
    }

    if (response.status === 401) {
      const errorData = await response.json();
      if (errorData.expired) {
        console.log("Token expired");
        throw new Error("Token expired");
      }
    }
    const responseBody = await response.json();
    throw new Error(
      `HTTP error ${response.status}: ${JSON.stringify(responseBody)}`,
    );
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
