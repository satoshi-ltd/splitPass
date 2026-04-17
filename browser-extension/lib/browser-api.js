(function attachSplitPassBrowserApi(globalScope) {
  const browserApi = globalScope.browser || globalScope.chrome || {};

  async function callStorage(area, method, payload) {
    if (!area || typeof area[method] !== 'function') return undefined;

    try {
      const maybePromise = area[method](payload);
      if (maybePromise && typeof maybePromise.then === 'function') {
        return await maybePromise;
      }
    } catch (error) {
      if (!String(error?.message || '').includes('No matching signature')) {
        throw error;
      }
    }

    return await new Promise((resolve, reject) => {
      area[method](payload, (result) => {
        const runtimeError = browserApi?.runtime?.lastError;
        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve(result);
      });
    });
  }

  globalScope.SplitPassBrowserApi = { callStorage };
})(globalThis);
