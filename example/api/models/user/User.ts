import { BaseModel } from "../../../../lib/database/model";
import { Model } from "../../../../lib/database/decorators";
import UserSchema from "./UserSchema";
import MainDatabase from "../../MainDatabase";

@Model("Users")
class UserModel extends BaseModel {
  static Schema = UserSchema;
}

export default MainDatabase.model(UserModel);