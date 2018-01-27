import { Schema } from "../../../../lib/database";
import { CreatedAt, UpdatedAt } from "../../../../lib/database/plugins";

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
});

UserSchema.plugin(CreatedAt);
UserSchema.plugin(UpdatedAt);

export default UserSchema;