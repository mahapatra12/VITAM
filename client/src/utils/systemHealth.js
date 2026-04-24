export const loadSystemHealth = async (apiClient, timeout = 5000) => {
  try {
    const { data } = await apiClient.get('/health', { timeout });
    return data || null;
  } catch (error) {
    return error?.response?.data || null;
  }
};
