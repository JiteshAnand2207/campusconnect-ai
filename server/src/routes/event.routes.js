import { Router } from "express";
import {
  approveEvent,
  createEvent,
  deleteEvent,
  getAllEvents,
  getMyEvents,
  getSingleEvent,
  rejectEvent,
  updateEvent,
} from "../controllers/event.controller.js";
import { authorizeRoles, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAllEvents);

router.post(
  "/",
  protect,
  authorizeRoles("organizer", "admin"),
  createEvent
);

router.get("/my", protect, authorizeRoles("organizer", "admin"), getMyEvents);

router.get("/:id", getSingleEvent);

router.patch("/:id", protect, updateEvent);

router.delete("/:id", protect, deleteEvent);

router.patch(
  "/:id/approve",
  protect,
  authorizeRoles("admin"),
  approveEvent
);

router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("admin"),
  rejectEvent
);

export default router;