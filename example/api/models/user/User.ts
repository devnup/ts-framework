import { BaseModel } from "../../../../lib/database";
import { Model } from "../../../../lib/database";
import UserSchema from "./UserSchema";
import MainDatabase from "../../MainDatabase";

@Model("Users")
class UserModel extends BaseModel {
  static Schema = UserSchema;
}

export default MainDatabase.model(UserModel);