import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateTicketCode from "../utils/generateTicketCode.js";

export const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.status !== "approved") {
    throw new ApiError(400, "You can only register for approved events");
  }

  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can register for events");
  }

  const now = new Date();

  if (event.registrationDeadline && now > event.registrationDeadline) {
    throw new ApiError(400, "Registration deadline has passed");
  }

  if (event.registeredCount >= event.capacity) {
    throw new ApiError(400, "Event capacity is full");
  }

  const existingRegistration = await Registration.findOne({
    event: eventId,
    student: req.user._id,
  });

  if (existingRegistration && existingRegistration.status !== "cancelled") {
    throw new ApiError(409, "You are already registered for this event");
  }

  let registration;

  if (existingRegistration && existingRegistration.status === "cancelled") {
    existingRegistration.status = "registered";
    existingRegistration.ticketCode = generateTicketCode();
    existingRegistration.checkedInAt = undefined;
    existingRegistration.checkedInBy = undefined;

    registration = await existingRegistration.save();
  } else {
    registration = await Registration.create({
      event: eventId,
      student: req.user._id,
      ticketCode: generateTicketCode(),
    });
  }

  event.registeredCount += 1;
  await event.save();

  const populatedRegistration = await Registration.findById(registration._id)
    .populate("event", "title category venue startDate endDate")
    .populate("student", "name email department year");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedRegistration,
        "Registered for event successfully"
      )
    );
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id })
    .populate("event", "title category venue startDate endDate status")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        registrations,
        "My registrations fetched successfully"
      )
    );
});

export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    throw new ApiError(404, "Registration not found");
  }

  if (registration.student.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to cancel this registration");
  }

  if (registration.status === "cancelled") {
    throw new ApiError(400, "Registration is already cancelled");
  }

  if (registration.status === "attended") {
    throw new ApiError(400, "Cannot cancel after attendance is marked");
  }

  registration.status = "cancelled";
  await registration.save();

  const event = await Event.findById(registration.event);

  if (event && event.registeredCount > 0) {
    event.registeredCount -= 1;
    await event.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, registration, "Registration cancelled"));
});

export const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketCode } = req.body;

  if (!ticketCode) {
    throw new ApiError(400, "Ticket code is required");
  }

  const registration = await Registration.findOne({ ticketCode })
    .populate("event", "title venue startDate endDate")
    .populate("student", "name email department year");

  if (!registration) {
    throw new ApiError(404, "Invalid ticket code");
  }

  if (registration.status === "cancelled") {
    throw new ApiError(400, "This registration was cancelled");
  }

  if (registration.status === "attended") {
    throw new ApiError(400, "Ticket already checked in");
  }

  registration.status = "attended";
  registration.checkedInAt = new Date();
  registration.checkedInBy = req.user._id;

  await registration.save();

  return res
    .status(200)
    .json(new ApiResponse(200, registration, "Ticket verified successfully"));
});