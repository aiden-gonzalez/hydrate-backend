import {components} from "../../schema";

export type IHashedPassword = {
    hash_pass: string;
    hash_salt: string;
};
export type ILocation = components["schemas"]["Location"];
export type IUser = components["schemas"]["User"];
