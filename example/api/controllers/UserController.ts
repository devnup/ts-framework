import User from '../models/user/User';
import { Controller, Post } from "../../../lib/server";

@Controller('/users')
export default class UserController {

  @Post('/')
  static async create(req, res) {
    // TODO: const user = await User.create({name: req.body.name, email: req.body.email});
    throw new Error('Not implemented: "POST users/"');
  }
}