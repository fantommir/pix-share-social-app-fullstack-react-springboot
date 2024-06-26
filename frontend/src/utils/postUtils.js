import { getElapsedTimeInSecondsUtc, getRelativeTime } from "./timeUtils";

export const getRelativePostTime = (postTimestamp) => {
  // Calculate the elapsed time between the post timestamp and the current time
  const elapsedTime = getElapsedTimeInSecondsUtc(postTimestamp);

  if (elapsedTime < 60) {
    return "just now";
  }

  if (elapsedTime < 3 * 60) {
    return "a few minutes ago";
  }

  return getRelativeTime(postTimestamp) + " ago";
};

export const isCurrUserPost = (currUserId, postUserId) => {
  return currUserId && postUserId && currUserId === postUserId ? true : false;
};
