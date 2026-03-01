import express from "express"
import upload from "../middleware/multerSetup"
import { Router } from "express"
import { uploadFile } from "../controller/fileUpload.controller"
import { isAuthenticated } from "../middleware/jwt.middleware";

const router = Router();

//File upload route
router.post("/upload", isAuthenticated, upload.single("file"), uploadFile);

export default router;