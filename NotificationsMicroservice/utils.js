function prepareNotificationMessage(notificationMessage) {
    try {
      const parsedNotification = JSON.parse(JSON.parse(notificationMessage));
      const { authorId, ...rest } = parsedNotification;
      if (parsedNotification.senderId == authorId){return null}
      return rest;
    } catch (error) {
      console.error("Error parsing notification message:", error);
      return null;
    }
  }

  function getAuthorIdFromNotification(notificationMessage) {
    try {
      const parsedNotification = JSON.parse(JSON.parse(notificationMessage));
      const authorId = parsedNotification.authorId;
      return authorId;
    } catch (error) {
      console.error("Error parsing notification message:", error);
      return null;
    }
  }
  
  module.exports = {
    prepareNotificationMessage,
    getAuthorIdFromNotification,
  };