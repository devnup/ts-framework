import * as mongoose from 'mongoose';

export abstract class BaseModel extends mongoose.Model {

  toJSON() {
    let json = super.toObject();
    if(json._id) {
      json.id = json._id;
      delete json._id;
    }
    if(json.hasOwnProperty('__v')) {
      delete json.__v;
    }
    return json;
  }
}

export abstract class BaseDAO extends BaseModel {
}