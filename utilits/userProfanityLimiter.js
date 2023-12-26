class UserProfanityLimiter {
  constructor(limit) {
    this.profanitiesByUser = new Map(); // Use the built-in JavaScript Map class
    this.limit = limit;
  }

  incrementCounter(user) {
    const lowerCaseUser = user.username.toLowerCase(); // Convert user to lowercase
    const profanityCount = (this.profanitiesByUser.get(lowerCaseUser) || 0) + 1;
    this.profanitiesByUser.set(lowerCaseUser, profanityCount);
  }

  resetCounter(user) {
    const lowerCaseUser = user.username.toLowerCase(); // Convert user to lowercase
    if (this.profanitiesByUser.has(lowerCaseUser)) {
      this.profanitiesByUser.set(lowerCaseUser, 0);
    }
  }

  isOverLimit(user) {
    const lowerCaseUser = user.username.toLowerCase(); // Convert user to lowercase
    return this.profanitiesByUser.get(lowerCaseUser) >= this.limit;
  }
}

module.exports = UserProfanityLimiter;