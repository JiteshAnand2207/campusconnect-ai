import api from "./axios";

export const askCampusAI = async (question) => {
  const response = await api.post("/ai/ask", { question });
  return response.data;
};