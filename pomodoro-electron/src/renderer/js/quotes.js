/* ====== Quotes Engine — Rotation logic, merge built-in + user quotes ====== */

const QuotesEngine = {
  allQuotes: [],
  currentQuote: null,
  config: { rotationStrategy: 'per-session' },

  async init() {
    // Load config from store
    const config = await window.pomodoroAPI.getQuotes();
    this.config = config;

    // Load built-in + user quotes
    const builtIn = await window.pomodoroAPI.getDefaultQuotes();
    const userQuotes = config.userQuotes || [];
    this.allQuotes = [...builtIn, ...userQuotes];

    // Pick initial quote
    this.pickRandom();
  },

  pickRandom() {
    if (this.allQuotes.length === 0) {
      this.currentQuote = { text: '添加你的第一条名言吧 ✨', author: '', lang: 'zh' };
      return this.currentQuote;
    }

    // Avoid repeating the same quote if more than 1 available
    let pool = this.allQuotes;
    if (this.allQuotes.length > 1 && this.currentQuote) {
      pool = this.allQuotes.filter(q => q.id !== this.currentQuote.id);
      if (pool.length === 0) pool = this.allQuotes;
    }

    const idx = Math.floor(Math.random() * pool.length);
    this.currentQuote = pool[idx];
    return this.currentQuote;
  },

  onSessionComplete() {
    if (this.config.rotationStrategy === 'per-session') {
      return this.pickRandom();
    }
    return this.currentQuote;
  },

  getCurrent() {
    return this.currentQuote;
  },

  // User quote CRUD
  async addUserQuote(text, author, lang) {
    const quote = {
      id: 'u_' + Date.now(),
      text,
      author: author || '',
      lang: lang || 'zh',
      source: 'user',
    };
    await window.pomodoroAPI.addQuote(quote);
    this.allQuotes.push(quote);
    // Refresh config
    this.config = await window.pomodoroAPI.getQuotes();
    return quote;
  },

  async removeUserQuote(id) {
    await window.pomodoroAPI.removeQuote(id);
    this.allQuotes = this.allQuotes.filter(q => q.id !== id);
    this.config = await window.pomodoroAPI.getQuotes();
  },

  async setRotationStrategy(strategy) {
    this.config.rotationStrategy = strategy;
    await window.pomodoroAPI.setQuotes(this.config);
  },

  getUserQuotes() {
    return this.allQuotes.filter(q => q.source === 'user');
  },

  getBuiltInCount() {
    return this.allQuotes.filter(q => q.source !== 'user').length;
  },
};
