import response from '../helpers/response';

export default (req: any, res: any, next: Function) => {
  res.error = response.error(res);
  res.success = response.success(res);
  next();
};
