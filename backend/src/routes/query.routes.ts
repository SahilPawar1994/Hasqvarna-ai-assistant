
import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { generateAnswer } from "../services/llm.service.js";

const router = Router();

const querySchema = z.object({
  query: z.string().trim().min(1).max(2000),
});

function getProviderErrorStatus(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  if (
    error instanceof OpenAI.APIError &&
    error.code === "credit_balance_exhausted"
  ) {
    return {
      status: 429,
      code: "LLM_QUOTA_EXHAUSTED",
      message: "The AI provider has no credits available.",
    };
  }

  if (
    error instanceof OpenAI.APIConnectionTimeoutError ||
    (error instanceof Error &&
      error.name === "APIConnectionTimeoutError")
  ) {
    return {
      status: 504,
      code: "LLM_TIMEOUT",
      message: "The AI service took too long to respond.",
    };
  }

  if (
    error instanceof OpenAI.APIError &&
    error.status === 429
  ) {
    return {
      status: 429,
      code: "LLM_RATE_LIMITED",
      message: "The AI service is receiving too many requests. Please retry later.",
    };
  }

  return {
    status: 502,
    code: "LLM_REQUEST_FAILED",
    message: "Unable to generate an answer right now.",
  };
}

router.post("/", authenticateToken, async (req, res) => {
  const validation = querySchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "Provide a query between 1 and 2000 characters.",
      },
    });
    return;
  }

  try {
    const answer = await generateAnswer(validation.data.query);
    res.status(200).json({ answer });
  } catch (error: unknown) {
    const providerError = getProviderErrorStatus(error);

    // Log diagnostic metadata only; do not expose provider details to clients.
    console.error("LLM request failed:", {
      status:
        error instanceof OpenAI.APIError ? error.status : undefined,
      code:
        error instanceof OpenAI.APIError ? error.code : undefined,
      requestId:
        error instanceof OpenAI.APIError ? error.requestID : undefined,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    res.status(providerError.status).json({
      error: {
        code: providerError.code,
        message: providerError.message,
      },
    });
  }
});

export default router;
