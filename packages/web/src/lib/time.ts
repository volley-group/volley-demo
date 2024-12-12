export const getTimeAgo = (date: string) => {
  const now = new Date();
  const updatedAt = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);
  if (diffInSeconds < 60) {
    return `updated ${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `updated ${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `updated ${days} day${days !== 1 ? 's' : ''} ago`;
  }
};
