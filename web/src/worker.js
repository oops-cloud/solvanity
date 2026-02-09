import init, { grind } from './grinder/grinder.js';

let initialized = false;

self.onmessage = async (e) => {
  const { prefix, suffix, caseSensitive } = e.data;

  if (!initialized) {
    await init();
    initialized = true;
  }

  let totalAttempts = 0;
  const batchSize = 5000;

  while (true) {
    const result = grind(prefix, suffix, caseSensitive, batchSize);
    totalAttempts += batchSize;

    if (result) {
      self.postMessage({
        type: 'found',
        address: result.public_key,
        privateKey: Array.from(result.private_key),
        attempts: totalAttempts,
      });
      return;
    }

    self.postMessage({
      type: 'progress',
      attempts: totalAttempts,
    });

    // Yield to avoid freezing
    await new Promise(r => setTimeout(r, 0));
  }
};
