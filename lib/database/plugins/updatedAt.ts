export default function UpdatedAtPlugin(schema, options) {
  schema.add({ updated_at: { type: Date, defaults: Date.now } });

  schema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
  });

  schema.pre('update', function () {
    this.update({}, {
      $set: { updated_at: new Date() },
    });
  });

  schema.pre('findOneAndUpdate', function () {
    this.update({}, { $set: { updated_at: new Date() } });
  });

  if (options && options.index) {
    schema.path('updated_at').index(options.index);
  }
};
