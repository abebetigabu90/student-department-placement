export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

export const login = (token) => {
  localStorage.setItem('adminToken', token);
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/login';
};

export const getToken = () => {
  return localStorage.getItem('adminToken');
};