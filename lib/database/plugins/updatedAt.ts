export default function UpdatedAtPlugin(schema, options) {
  schema.add({
    updated_at: {
      type: Date,
      defaults: Date.now,
    },
  });

  schema.pre('save', function (next) {
    const self = this;

    self.updated_at = new Date();

    next();
  });

  schema.pre('update', function () {
    const self = this;

    self.update({}, {
      $set: {
        updated_at: new Date(),
      },
    });
  });

  schema.pre('findOneAndUpdate', function () {
    const self = this;

    self.update({}, {
      $set: {
        updated_at: new Date(),
      },
    });
  });

  if (options && options.index) {
    schema.path('updated_at').index(options.index);
  }
};
