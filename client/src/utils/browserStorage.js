const createSafeStorage = (storageType) => {
  const getStorage = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return window[storageType] || null;
    } catch {
      return null;
    }
  };

  return {
    getItem(key) {
      const storage = getStorage();
      if (!storage) {
        return null;
      }

      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },

    setItem(key, value) {
      const storage = getStorage();
      if (!storage) {
        return false;
      }

      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },

    removeItem(key) {
      const storage = getStorage();
      if (!storage) {
        return false;
      }

      try {
        storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
};

export const safeLocalStorage = createSafeStorage('localStorage');
export const safeSessionStorage = createSafeStorage('sessionStorage');
