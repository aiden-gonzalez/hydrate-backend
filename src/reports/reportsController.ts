import {IReportRequest} from "./types";
import * as db from "../db/queries";
import {
  HTTP_CREATED,
  HTTP_INTERNAL_ERROR,
  HTTP_INTERNAL_ERROR_MESSAGE,
  HTTP_NOT_FOUND,
  REPORT_HIDE_PICTURE_THRESHOLD
} from "../utils/constants";

// Look up the reported content, returning the id it is stored under (usernames are resolved to user ids)
async function findReportedContentId(report: IReportRequest) : Promise<string | undefined> {
  switch (report.content_type) {
  case "fob":
    return (await db.getFob(report.content_id))?.id;
  case "picture":
    return (await db.getPictureById(report.content_id))?.id;
  case "user":
    return (await db.getUserByUsername(report.content_id))?.id;
  }
}

export async function createReport(req, res) {
  const reportRequest : IReportRequest = req.body;

  try {
    const contentId = await findReportedContentId(reportRequest);
    if (contentId === undefined) {
      return res.sendStatus(HTTP_NOT_FOUND);
    }

    await db.createReport({
      reporter_id: req.user.id,
      content_type: reportRequest.content_type,
      content_id: contentId,
      reason: reportRequest.reason,
      details: reportRequest.details ?? null
    });

    // Hide pictures automatically once enough different users report them, pending manual review
    if (reportRequest.content_type === "picture") {
      const reporters = await db.countReportersForContent("picture", contentId);
      if (reporters >= REPORT_HIDE_PICTURE_THRESHOLD) {
        await db.setPictureHidden(contentId, true);
      }
    }

    return res.sendStatus(HTTP_CREATED);
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(HTTP_INTERNAL_ERROR).send(HTTP_INTERNAL_ERROR_MESSAGE);
  }
}
