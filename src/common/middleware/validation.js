


export const validation = (schema) => {
  return (req, res, next) => {
    
    let error_result = [];

    for (const key of Object.keys(schema)) {
      const { error } = schema[key].validate(req[key], { abortEarly: false });
      console.log(error?.details);

      if (error) {
        error.details.forEach((element) => {
          error_result.push({
            key,
            path: element.path[0],
            message: element.message,
          });
        });
      }
    }

    if (error_result.length) {
      return res
        .status(400)
        .json({ message: "validation error", error: error_result });
    }

    next();
  };
};
