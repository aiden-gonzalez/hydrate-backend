import 'dotenv/config';
import * as db from "../db/queries";
import {deletePictureObjects} from "../utils/aws";
import {db as kysely} from "../db/database";

// Command line moderation tool for reviewing reports. Run with NODE_ENV set to the target environment:
//   NODE_ENV=cloud npm run moderate -- list
const usage = `Usage: npm run moderate -- <command> [args]

  list                          Show unresolved reports, grouped by content
  dismiss <type> <id>           Mark reports for content as resolved without action
  hide-picture <pictureId>      Hide a picture (and resolve its reports)
  unhide-picture <pictureId>    Un-hide a picture (and resolve its reports)
  delete-picture <pictureId>    Delete a picture permanently
  delete-fob <fobId>            Delete a fob and its ratings / pictures
  delete-user <username>        Delete a user account and their ratings / pictures
`;

async function list() {
  const reports = await db.getUnresolvedReports();
  if (reports.length === 0) {
    console.log("No unresolved reports.");
    return;
  }
  const grouped = new Map<string, typeof reports>();
  for (const report of reports) {
    const key = `${report.content_type} ${report.content_id}`;
    grouped.set(key, [...(grouped.get(key) ?? []), report]);
  }
  for (const [key, contentReports] of grouped) {
    console.log(`\n${key}  (${contentReports.length} report${contentReports.length === 1 ? "" : "s"})`);
    for (const report of contentReports) {
      const when = new Date(Number(report.created_at)).toISOString();
      console.log(`  - ${when} ${report.reason}${report.details ? `: ${report.details}` : ""}`);
    }
  }
}

async function run(command: string, arg1?: string, arg2?: string) {
  switch (command) {
  case "list":
    return list();
  case "dismiss":
    await db.resolveReportsForContent(arg1, arg2);
    return console.log(`Dismissed reports for ${arg1} ${arg2}`);
  case "hide-picture":
  case "unhide-picture":
    await db.setPictureHidden(arg1, command === "hide-picture");
    await db.resolveReportsForContent("picture", arg1);
    return console.log(`${command === "hide-picture" ? "Hid" : "Un-hid"} picture ${arg1}`);
  case "delete-picture": {
    const picture = await db.getPictureById(arg1);
    if (!picture) return console.log("Picture not found");
    await deletePictureObjects([picture]);
    await db.deletePicture(picture.id);
    await db.resolveReportsForContent("picture", picture.id);
    return console.log(`Deleted picture ${picture.id}`);
  }
  case "delete-fob": {
    const fob = await db.getFob(arg1);
    if (!fob) return console.log("Fob not found");
    await deletePictureObjects(await db.getPicturesForFob(fob.id));
    await db.deleteFob(fob.id);
    await db.resolveReportsForContent("fob", fob.id);
    return console.log(`Deleted fob ${fob.id}`);
  }
  case "delete-user": {
    const user = await db.getUserByUsername(arg1);
    if (!user) return console.log("User not found");
    await deletePictureObjects(await db.getPicturesByUser(user.id));
    await db.deleteUserAndContent(user.id);
    await db.resolveReportsForContent("user", user.id);
    return console.log(`Deleted user ${user.username}`);
  }
  default:
    console.log(usage);
  }
}

const [command, arg1, arg2] = process.argv.slice(2);
run(command, arg1, arg2)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => kysely.destroy());
