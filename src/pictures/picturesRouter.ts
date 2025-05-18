import * as picturesController from "./picturesController";
import express from "express";
import {authenticateRequest} from '../utils/auth';

const picturesRouter = express.Router();

// pictures
picturesRouter.get('/pictures/:id',
  authenticateRequest, // authenticate request
  picturesController.getPictureUrl // return picture URL
); // get picture by id
picturesRouter.put('/pictures/:id',
  authenticateRequest, // authenticate request
  picturesController.updatePictureStatus // update picture status
); // update picture status
picturesRouter.delete('/pictures/:id',
  authenticateRequest, // authenticate request
  picturesController.deletePicture // delete picture
); // delete picture by id

export default picturesRouter;
