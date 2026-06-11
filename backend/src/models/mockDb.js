import bcrypt from 'bcryptjs';

// Global In-Memory Collections Store
const db = {
  users: [],
  quests: [],
  badges: [],
  leaderboards: [],
  rewards: []
};

const generateId = () => Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);

class MockQuery {
  constructor(resultPromise, collectionName) {
    this.resultPromise = Promise.resolve(resultPromise);
    this.collectionName = collectionName;
    this.populates = [];
    this.sortQuery = null;
    this.limitCount = null;
    this.selectStr = null;
  }

  populate(field) {
    this.populates.push(field);
    return this;
  }

  select(selectStr) {
    this.selectStr = selectStr;
    return this;
  }

  sort(sortQuery) {
    this.sortQuery = sortQuery;
    return this;
  }

  limit(limitCount) {
    this.limitCount = limitCount;
    return this;
  }

  async exec() {
    let result = await this.resultPromise;
    if (!result) return null;

    // Apply sorting/limit if it is an array
    if (Array.isArray(result)) {
      if (this.sortQuery) {
        const sortKey = Object.keys(this.sortQuery)[0];
        const dir = this.sortQuery[sortKey];
        result.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return dir === 1 ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return dir === 1 ? 1 : -1;
          return 0;
        });
      }
      if (this.limitCount !== null) {
        result = result.slice(0, this.limitCount);
      }
    }

    // Apply select field exclusions
    if (this.selectStr && this.selectStr.startsWith('-')) {
      const exclude = this.selectStr.substring(1);
      const stripField = (item) => {
        if (item && typeof item === 'object') {
          const copy = { ...item };
          delete copy[exclude];
          return copy;
        }
        return item;
      };
      result = Array.isArray(result) ? result.map(stripField) : stripField(result);
    }

    // Apply populates
    if (this.populates.length > 0) {
      const docs = Array.isArray(result) ? result : [result];
      for (const doc of docs) {
        if (!doc) continue;
        for (const field of this.populates) {
          if (field === 'badges' && doc.badges) {
            doc.badges = doc.badges.map(badgeId => {
              if (typeof badgeId === 'string') {
                return db.badges.find(b => b._id === badgeId || b.code === badgeId) || badgeId;
              }
              return badgeId;
            }).filter(Boolean);
          }
        }
      }
    }

    return result;
  }

  // Thenable protocol compatibility
  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

export function createMockModelClass(collectionName) {
  return class MockDocument {
    constructor(properties) {
      Object.assign(this, properties);
      if (!this._id) {
        this._id = generateId();
      }
      if (!this.createdAt) {
        this.createdAt = new Date();
      }
      if (collectionName === 'users') {
        if (this.level === undefined) this.level = 1;
        if (this.xp === undefined) this.xp = 0;
        if (this.streak === undefined) this.streak = 0;
        if (this.badges === undefined) this.badges = [];
        if (this.isOnboarded === undefined) this.isOnboarded = false;
        if (this.characterClass === undefined) this.characterClass = '';
        if (this.gold === undefined) this.gold = 100;
        if (this.streakShields === undefined) this.streakShields = 0;
        if (this.xpBoostsActive === undefined) this.xpBoostsActive = 0;
        if (this.combatLogs === undefined) this.combatLogs = [];
        if (this.stats === undefined) {
          this.stats = { str: 10, int: 10, wis: 10, cha: 10, agi: 10, luk: 10 };
        }
        
        this.comparePassword = async function(enteredPassword) {
          return await bcrypt.compare(enteredPassword, this.password);
        };
      }
      if (collectionName === 'quests') {
        if (this.category === undefined) this.category = 'General';
        if (this.subTasks === undefined) this.subTasks = [];
      }
    }

    static get data() {
      return db[collectionName];
    }

    static set data(val) {
      db[collectionName] = val;
    }

    static find(query = {}) {
      const results = this.data.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
      // Clone array and items
      const cloned = results.map(item => Object.assign(Object.create(Object.getPrototypeOf(item)), item));
      return new MockQuery(cloned, collectionName);
    }

    static findOne(query = {}) {
      const found = this.data.find(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
      const cloned = found ? Object.assign(Object.create(Object.getPrototypeOf(found)), found) : null;
      return new MockQuery(cloned, collectionName);
    }

    static findById(id) {
      const found = this.data.find(item => item._id === id || item.id === id);
      const cloned = found ? Object.assign(Object.create(Object.getPrototypeOf(found)), found) : null;
      return new MockQuery(cloned, collectionName);
    }

    static async findByIdAndDelete(id) {
      const idx = this.data.findIndex(item => item._id === id);
      if (idx !== -1) {
        return this.data.splice(idx, 1)[0];
      }
      return null;
    }

    static findOneAndUpdate(query, update, options = {}) {
      let item = this.data.find(i => {
        for (let key in query) {
          if (i[key] !== query[key]) return false;
        }
        return true;
      });

      if (!item && options.upsert) {
        item = { _id: generateId(), ...query };
        this.data.push(item);
      }

      if (item) {
        const actualUpdate = update.$set || update;
        Object.assign(item, actualUpdate);
        const cloned = Object.assign(Object.create(Object.getPrototypeOf(item)), item);
        return new MockQuery(cloned, collectionName);
      }
      return new MockQuery(null, collectionName);
    }

    static async create(doc) {
      const instance = new this(doc);
      await instance.save();
      return instance;
    }

    static async countDocuments(query = {}) {
      const res = this.data.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) return false;
        }
        return true;
      });
      return res.length;
    }

    static async insertMany(docs) {
      const added = docs.map(d => new this(d));
      for (const inst of added) {
        await inst.save();
      }
      return added;
    }

    static async deleteMany(query = {}) {
      this.data = this.data.filter(item => {
        for (let key in query) {
          if (item[key] === query[key]) return false;
        }
        return true;
      });
      return { deletedCount: 1 };
    }

    async save() {
      // Hashing passwords
      if (collectionName === 'users' && this.password && !this.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }

      if (collectionName === 'users') {
        this.comparePassword = async function(enteredPassword) {
          return await bcrypt.compare(enteredPassword, this.password);
        };
      }

      const existingIndex = db[collectionName].findIndex(item => item._id === this._id);
      if (existingIndex !== -1) {
        db[collectionName][existingIndex] = this;
      } else {
        db[collectionName].push(this);
      }
      return this;
    }
  };
}
