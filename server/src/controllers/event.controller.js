import Event from "../models/event.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    department,
    venue,
    startDate,
    endDate,
    registrationDeadline,
    capacity,
    bannerImage,
    brochureUrl,
    tags,
  } = req.body;

  if (!title || !description || !category || !venue || !startDate || !endDate || !capacity) {
    throw new ApiError(
      400,
      "Title, description, category, venue, start date, end date and capacity are required"
    );
  }

  const event = await Event.create({
    title,
    description,
    category,
    department,
    venue,
    startDate,
    endDate,
    registrationDeadline,
    capacity,
    bannerImage,
    brochureUrl,
    tags,
    createdBy: req.user._id,
    status: req.user.role === "admin" ? "approved" : "pending",
    approvedBy: req.user.role === "admin" ? req.user._id : undefined,
    approvedAt: req.user.role === "admin" ? new Date() : undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const { category, department, search, status } = req.query;

  const query = {};

  if (req.user?.role === "admin" || req.user?.role === "moderator") {
    if (status) {
      query.status = status;
    }
  } else {
    query.status = "approved";
  }

  if (category) {
    query.category = category;
  }

  if (department) {
    query.department = department;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const events = await Event.find(query)
    .populate("createdBy", "name email role department")
    .sort({ startDate: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});

export const getSingleEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "createdBy",
    "name email role department"
  );

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isOwner = event.createdBy._id.toString() === req.user?._id?.toString();
  const isAdminOrModerator =
    req.user?.role === "admin" || req.user?.role === "moderator";

  if (event.status !== "approved" && !isOwner && !isAdminOrModerator) {
    throw new ApiError(403, "You are not allowed to view this event");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event fetched successfully"));
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, events, "My events fetched successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to update this event");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      status: isAdmin ? req.body.status || event.status : "pending",
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isOwner = event.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to delete this event");
  }

  await event.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Event deleted successfully"));
});

export const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  event.status = "approved";
  event.rejectionReason = "";
  event.approvedBy = req.user._id;
  event.approvedAt = new Date();

  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event approved successfully"));
});

export const rejectEvent = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  event.status = "rejected";
  event.rejectionReason = rejectionReason || "Event rejected by admin";
  event.approvedBy = undefined;
  event.approvedAt = undefined;

  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event rejected successfully"));
});