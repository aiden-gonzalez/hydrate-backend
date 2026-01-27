import * as picturesController from "./picturesController";
import express from "express";
import {authenticateRequest} from '../utils/auth';

const picturesRouter = express.Router();

// pictures
picturesRouter.get('/:id',
  authenticateRequest, // authenticate request
  picturesController.attachPictureToReq, // attach picture to request
  picturesController.getPictureUrl // return picture URL
); // get picture by id
picturesRouter.put('/:id',
  authenticateRequest, // authenticate request
  picturesController.attachPictureToReq, // attach picture to request
  picturesController.updatePictureStatus // update picture status
); // update picture status
picturesRouter.delete('/:id',
  authenticateRequest, // authenticate request
  picturesController.attachPictureToReq, // attach picture to request
  picturesController.deletePicture // delete picture
); // delete picture by id

export default picturesRouter;
