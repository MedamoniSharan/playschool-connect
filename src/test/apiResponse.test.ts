import { describe, it, expect } from "vitest";
import { parseApiResponse } from "@/lib/apiResponse";

describe("parseApiResponse", () => {
  it("returns empty object for non-objects", () => {
    expect(parseApiResponse(null)).toEqual({});
    expect(parseApiResponse(undefined)).toEqual({});
    expect(parseApiResponse("x")).toEqual({});
  });

  it("passes through a plain JSON body", () => {
    expect(parseApiResponse({ user: { id: "1" }, token: "abc" })).toEqual({
      user: { id: "1" },
      token: "abc",
    });
  });

  it("parses API Gateway string body", () => {
    const wrapped = {
      statusCode: 200,
      body: JSON.stringify({ students: [{ id: "s1" }] }),
    };
    expect(parseApiResponse(wrapped)).toEqual({ students: [{ id: "s1" }] });
  });

  it("parses nested object body", () => {
    const wrapped = {
      statusCode: 200,
      body: { classes: [{ id: "c1" }] },
    };
    expect(parseApiResponse(wrapped)).toEqual({ classes: [{ id: "c1" }] });
  });
});
