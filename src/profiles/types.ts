import {components, paths} from "../../schema";

export type IProfile = components["schemas"]["Profile"];
export type IUserContributions = components["schemas"]["UserContributions"];

export type IUserContributionQueryParams = paths["/api/profiles/{username}/contributions"]["get"]["parameters"]["query"];
