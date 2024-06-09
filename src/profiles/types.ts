import {components, paths} from "../../schema";

export type IUserProfile = components["schemas"]["UserProfile"];
export type IUserContributions = components["schemas"]["UserContributions"];

export type IUserContributionQueryParams = paths["/api/profiles/{username}/contributions"]["get"]["parameters"]["query"];
