import api, { TOKEN_KEY } from './api';

export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const fetchMe = async () => {
  const { data } = await api.get('/users/me');
  return data.user;
};

export const updateProfile = async (updates) => {
  const { data } = await api.put('/users/me', updates);
  return data.user;
};

export const hasToken = () => Boolean(localStorage.getItem(TOKEN_KEY));
