const fs = require('fs');
const path = require('path');

class User {
  constructor(username, password, id = null, refreshToken = null) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.refreshToken = refreshToken;
  }
}

class UserDatabase {
  constructor(dataDirectory) {
    this.dataDirectory = dataDirectory;
    this.userDataFilePath = path.join(dataDirectory, 'users.json');
    this.initializeDatabase();
  }

  initializeDatabase() {
    if (!fs.existsSync(this.dataDirectory)) {
      fs.mkdirSync(this.dataDirectory, { recursive: true });
    }
    if (!fs.existsSync(this.userDataFilePath)) {
      fs.writeFileSync(this.userDataFilePath, '[]');
    }
  }

  async addUser(user) {
    const userData = await this.loadUserData();
    user.id = userData.length > 0 ? userData[userData.length - 1].id + 1 : 1;
    userData.push(user);
    await this.saveUserData(userData);
  }

  async updateUser(updatedUser) {
    const userData = await this.loadUserData();
    const index = userData.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      userData[index] = updatedUser;
      await this.saveUserData(userData);
    }
  }

  async getUserById(userId) {
    const userData = await this.loadUserData();
    return userData.find(user => user.id === userId);
  }

  async getUserByUsername(username) {
    const userData = await this.loadUserData();
    return userData.find(user => user.username === username);
  }

  async verifyRefreshToken(refreshToken) {
    const userData = await this.loadUserData();
    const user = userData.find(user => user.refreshToken === refreshToken);
    return user ? user.id : null;
  }

  async updateRefreshToken(userId, newRefreshToken) {
    const userData = await this.loadUserData();
    const index = userData.findIndex(user => user.id === userId);
    if (index !== -1) {
      userData[index].refreshToken = newRefreshToken;
      await this.saveUserData(userData);
    }
  }

  async loadUserData() {
    const userData = await fs.promises.readFile(this.userDataFilePath, 'utf-8');
    return JSON.parse(userData);
  }

  async saveUserData(userData) {
    await fs.promises.writeFile(this.userDataFilePath, JSON.stringify(userData, null, 2));
  }
}

module.exports = { User, UserDatabase };
