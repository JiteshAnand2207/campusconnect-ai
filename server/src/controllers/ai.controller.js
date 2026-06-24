import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { askCampusAI } from "../services/ai.service.js";

const getMockAIResponse = (question, user) => {
  return {
    answer: `CampusConnect AI mock response:

You asked: "${question}"

I am currently running in mock mode, so the AI route, authentication, frontend connection, and dashboard flow are working.

Current user:
Name: ${user?.name}
Role: ${user?.role}

To use real AI, set AI_MODE=gemini and add GEMINI_API_KEY.`,
    sources: [],
  };
};

export const askAI = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim().length < 3) {
    throw new ApiError(400, "Question must be at least 3 characters long");
  }

  if (process.env.AI_MODE !== "gemini") {
    const mockResult = getMockAIResponse(question, req.user);

    return res
      .status(200)
      .json(new ApiResponse(200, mockResult, "Mock AI response generated"));
  }

  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
    throw new ApiError(
      500,
      "AI service is not configured. Please add GEMINI_API_KEY and GEMINI_MODEL."
    );
  }

  const result = await askCampusAI({
    question,
    user: req.user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "AI response generated"));
});