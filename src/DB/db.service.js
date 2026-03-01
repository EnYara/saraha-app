export const create = async ({ model, data } = {}) => {
  return await model.create(data);
};

export const findOne = async ({
  model,
  filter = {},
  populate = [],
  select = "",
} = {}) => {
  return await model.findOne(filter).populate(populate).select(select);
};

export const updateOne = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  const doc = model.updateOne(filter, update, {
    runValidators: true,
    ...options,
  });

  return await doc.exec();
};

export const updateOneAndUpdate = async ({
  model,
  filter = {},
  update = {},
  options = {},
} = {}) => {
  const doc = model.updateOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
    ...options,
  });

  return await doc.exec();
};

export const deleteOne = async ({ model, filter = {}, options = {} } = {}) => {
  const doc = model.deleteOne(filter, options);
  return await doc.exec();
};

export const find = async ({ model, filter = {}, options = {} } = {}) => {
  const doc = model.find(filter);
  if (options.populate) {
    options.populate.forEach((populateOption) => {
      doc.populate(populateOption);
    });
  }
  if (options.skip) {
    doc.skip(options.skip);
  }
  if (options.limit) {
    doc.limit(options.limit);
  }
  return await doc.exec();
};

export const findById = async ({ model, id, select = "" } = {}) => {  
  return await model.findById(id).select(select);
}
