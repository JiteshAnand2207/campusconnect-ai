import { Router } from "express";
import {
  cancelRegistration,
  getMyRegistrations,
  registerForEvent,
  verifyTicket,
} from "../controllers/registration.controller.js";
import { authorizeRoles, protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/events/:eventId/register",
  protect,
  authorizeRoles("student"),
  registerForEvent
);

router.get("/me", protect, authorizeRoles("student"), getMyRegistrations);

router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("student"),
  cancelRegistration
);

router.post(
  "/verify",
  protect,
  authorizeRoles("organizer", "admin"),
  verifyTicket
);

export default router;