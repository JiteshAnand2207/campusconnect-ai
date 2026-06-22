import api from "./axios";

export const registerForEvent = async (eventId) => {
  const response = await api.post(`/registrations/events/${eventId}/register`);
  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await api.get("/registrations/me");
  return response.data;
};

export const cancelRegistration = async (registrationId) => {
  const response = await api.patch(`/registrations/${registrationId}/cancel`);
  return response.data;
};

export const verifyTicket = async (ticketCode) => {
  const response = await api.post("/registrations/verify", { ticketCode });
  return response.data;
};