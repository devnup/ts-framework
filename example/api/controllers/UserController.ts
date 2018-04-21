import { Controller, Post } from 'ts-framework';
import User from '../models/user/User';

@Controller('/users')
export default class UserController {

  @Post('/')
  static async create(req, res) {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    return res.success(user);
  }

  @Post('/:id')
  static async findAndUpdate(req, res) {
    const user = await User.findOneAndUpdate({
      email: req.body.email,
    },                                       {
      $set: { name: req.body.name },
    });

    return res.success(user);
  }
}
