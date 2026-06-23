import Event from "../models/event.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteCacheByPattern,
  getCache,
  setCache,
} from "../utils/cache.js";
import { enqueueNotification } from "../utils/notificationQueue.js";

const normalizeTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const isEventOwner = (event, userId) => {
  return event.createdBy?.toString() === userId?.toString();
};

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

  if (
    !title ||
    !description ||
    !category ||
    !venue ||
    !startDate ||
    !endDate ||
    !capacity
  ) {
    throw new ApiError(
      400,
      "Title, description, category, venue, dates, and capacity are required"
    );
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new ApiError(400, "End date must be after start date");
  }

  if (
    registrationDeadline &&
    new Date(registrationDeadline) > new Date(startDate)
  ) {
    throw new ApiError(
      400,
      "Registration deadline must be before event start date"
    );
  }

  const event = await Event.create({
    title,
    description,
    category,
    department: department || "All",
    venue,
    startDate,
    endDate,
    registrationDeadline,
    capacity: Number(capacity),
    bannerImage: bannerImage || "",
    brochureUrl: brochureUrl || "",
    tags: normalizeTags(tags),
    createdBy: req.user._id,
  });

  await deleteCacheByPattern("events:public:*");

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const { category, search, status } = req.query;

  const userRole = req.user?.role || "guest";

  const cacheKey = `events:public:${JSON.stringify(req.query)}:${userRole}`;

  const cachedEvents = await getCache(cacheKey);

  if (cachedEvents) {
    return res
      .status(200)
      .json(new ApiResponse(200, cachedEvents, "Events fetched from cache"));
  }

  const query = {};

  const isAdminOrModerator =
    req.user?.role === "admin" || req.user?.role === "moderator";

  if (isAdminOrModerator && status) {
    query.status = status;
  } else if (isAdminOrModerator && !status) {
    query.status = { $in: ["pending", "approved", "rejected"] };
  } else {
    query.status = "approved";
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { venue: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const events = await Event.find(query)
    .populate("createdBy", "name email role department year")
    .populate("approvedBy", "name email role")
    .sort({ startDate: 1 });

  await setCache(cacheKey, events);

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});

export const getSingleEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("createdBy", "name email role department year")
    .populate("approvedBy", "name email role");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isAdminOrModerator =
    req.user?.role === "admin" || req.user?.role === "moderator";

  const isOwner =
    req.user && event.createdBy?._id?.toString() === req.user._id.toString();

  if (event.status !== "approved" && !isOwner && !isAdminOrModerator) {
    throw new ApiError(403, "You are not allowed to view this event");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event fetched successfully"));
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id })
    .populate("createdBy", "name email role department year")
    .populate("approvedBy", "name email role")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, events, "My events fetched successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isOwner = isEventOwner(event, req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to update this event");
  }

  const allowedFields = [
    "title",
    "description",
    "category",
    "department",
    "venue",
    "startDate",
    "endDate",
    "registrationDeadline",
    "capacity",
    "bannerImage",
    "brochureUrl",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
  });

  if (req.body.tags !== undefined) {
    event.tags = normalizeTags(req.body.tags);
  }

  if (event.startDate && event.endDate) {
    if (new Date(event.startDate) >= new Date(event.endDate)) {
      throw new ApiError(400, "End date must be after start date");
    }
  }

  if (event.registrationDeadline && event.startDate) {
    if (new Date(event.registrationDeadline) > new Date(event.startDate)) {
      throw new ApiError(
        400,
        "Registration deadline must be before event start date"
      );
    }
  }

  if (!isAdmin) {
    event.status = "pending";
    event.rejectionReason = "";
    event.approvedBy = undefined;
    event.approvedAt = undefined;
  }

  await event.save();

  await deleteCacheByPattern("events:public:*");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isOwner = isEventOwner(event, req.user._id);
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not allowed to delete this event");
  }

  await Event.findByIdAndDelete(req.params.id);

  await deleteCacheByPattern("events:public:*");

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

  await deleteCacheByPattern("events:public:*");

  await enqueueNotification({
    recipient: event.createdBy,
    sender: req.user._id,
    title: "Event approved",
    message: `Your event "${event.title}" has been approved and is now public.`,
    type: "event",
    link: `/events/${event._id}`,
  });

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

  if (!rejectionReason) {
    throw new ApiError(400, "Rejection reason is required");
  }

  event.status = "rejected";
  event.rejectionReason = rejectionReason;
  event.approvedBy = undefined;
  event.approvedAt = undefined;

  await event.save();

  await deleteCacheByPattern("events:public:*");

  await enqueueNotification({
    recipient: event.createdBy,
    sender: req.user._id,
    title: "Event rejected",
    message: `Your event "${event.title}" was rejected. Reason: ${event.rejectionReason}`,
    type: "event",
    link: "/dashboard/events",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event rejected successfully"));
});