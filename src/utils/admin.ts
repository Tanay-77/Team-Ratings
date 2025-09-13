// Admin utility functions
export const ADMIN_EMAILS = ['siddharthfarkade12@gmail.com', 'tanaymahajan7@gmail.com'];

export const isAdmin = (userEmail: string | null | undefined): boolean => {
  return userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
};