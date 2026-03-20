import { z } from "zod";

export function validate(schema) {
  return (req, _res, next) => {
    const payload = {
      body: req.body,
      params: req.params,
      query: req.query
    };
    const result = schema.safeParse(payload);
    if (!result.success) {
      return next(result.error);
    }
    req.validated = result.data;
    return next();
  };
}