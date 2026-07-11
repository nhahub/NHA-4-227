const logger = (req, res, next) => {
  const start = Date.now();

  console.log('\n==============================');
  console.log(`\u{1F4E5} ${req.method} ${req.originalUrl}`);

  if (Object.keys(req.body || {}).length) {
    console.log('\u{1F4E6} Body:', JSON.stringify(req.body, null, 2));
  }

  if (Object.keys(req.query || {}).length) {
    console.log('\u{1F50E} Query:', req.query);
  }

  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;

    console.log(`\u{1F4E4} Status: ${res.statusCode}`);
    console.log(`\u23F1\uFE0F Time: ${duration}ms`);
    console.log('==============================\n');

    return originalSend.call(this, data);
  };

  next();
};

module.exports = logger;
