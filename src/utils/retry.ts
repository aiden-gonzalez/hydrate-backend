export async function exponentialBackoff(fn, options = {}) {
  const {
    timeout = 10000, // 10 second timeout
    initialDelay = 200,
    shouldRetry = (error) => true,
    tryMessage = "Exponential Backoff: running function...",
    retryMessage = "Exponential Backoff: failed"
  } : any = options;

  let delay = initialDelay;
  const expiration = Date.now() + timeout;
  while (Date.now() < expiration) {
    try {
      console.log(tryMessage)
      return await fn();
    } catch (error) {
      if (!shouldRetry(error) || Date.now() >= expiration) {
        throw error;
      }

      console.log(retryMessage + " (waiting " + delay.toString() + " ms)");
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = delay * 2;
    }
  }
}
