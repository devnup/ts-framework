import { Schema } from 'ts-framework';

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
},                            { 
  timestamps: { createdAt: true, updatedAt: true },
});

export default UserSchema;
