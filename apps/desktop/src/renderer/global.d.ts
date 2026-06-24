declare global {
  interface Window {
    icoXai: {
      getDevice: () => Promise<unknown>;
      requestControl: () => Promise<unknown>;
    };
  }
}

export {};
