export default function CreatedAtPlugin(schema, options) {
  schema.add({ created_at: { type: Date, defaults: Date.now } });

  schema.pre('save', function (next) {
    const self = this;

    if (!self.created_at) {
      self.created_at = new Date();
    }

    next();
  });

  if (options && options.index) {
    schema.path('created_at').index(options.index);
  }
};
