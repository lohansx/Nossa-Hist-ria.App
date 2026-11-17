/**
 * NOSSA HISTÓRIA ❤️
 * Banco de Dados Persistente e Confiável (IndexedDB com fallback instantâneo para LocalStorage)
 */

class StoryDatabase {
  constructor() {
    this.dbName = "NossaHistoriaDB_v3";
    this.version = 1;
    this.db = null;
    this.isReady = false;
    this.useLocalStorageFallback = false;
  }

  async init() {
    if (this.isReady) return true;

    try {
      if (!window.indexedDB) {
        this.useLocalStorageFallback = true;
        this.initLocalStorage();
        this.isReady = true;
        return true;
      }

      await Promise.race([
        new Promise((resolve) => {
          const request = window.indexedDB.open(this.dbName, this.version);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("experiences")) {
              const expStore = db.createObjectStore("experiences", { keyPath: "id" });
              INITIAL_EXPERIENCES.forEach(item => {
                expStore.add({
                  ...item,
                  status: "pendente",
                  scheduledDate: null,
                  scheduledTime: null,
                  scheduledLocation: "",
                  completedDate: null,
                  notes: "",
                  funnyMoments: "",
                  rating: 5,
                  photos: [],
                  updatedAt: new Date().toISOString()
                });
              });
            }

            if (!db.objectStoreNames.contains("memories")) {
              db.createObjectStore("memories", { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains("settings")) {
              const setStore = db.createObjectStore("settings", { keyPath: "key" });
              Object.keys(DEFAULT_SETTINGS).forEach(k => {
                setStore.add({ key: k, value: DEFAULT_SETTINGS[k] });
              });
            }
          };

          request.onsuccess = (event) => {
            this.db = event.target.result;
            this.isReady = true;
            resolve(true);
          };

          request.onerror = () => {
            this.useLocalStorageFallback = true;
            this.initLocalStorage();
            this.isReady = true;
            resolve(true);
          };
        }),

        // Timeout preventivo caso o protocolo file:/// bloqueie silenciosamente
        new Promise((resolve) => setTimeout(() => {
          if (!this.isReady) {
            console.warn("IndexedDB demorou a responder (comum em file://). Ativando armazenamento LocalStorage.");
            this.useLocalStorageFallback = true;
            this.initLocalStorage();
            this.isReady = true;
            resolve(true);
          }
        }, 850))
      ]);

      return true;
    } catch (err) {
      console.warn("Falha geral ao inicializar banco:", err);
      this.useLocalStorageFallback = true;
      this.initLocalStorage();
      this.isReady = true;
      return true;
    }
  }

  initLocalStorage() {
    if (!localStorage.getItem("nh_experiences")) {
      const list = INITIAL_EXPERIENCES.map(item => ({
        ...item,
        status: "pendente",
        scheduledDate: null,
        scheduledTime: null,
        scheduledLocation: "",
        completedDate: null,
        notes: "",
        funnyMoments: "",
        rating: 5,
        photos: [],
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem("nh_experiences", JSON.stringify(list));
    }
    if (!localStorage.getItem("nh_memories")) {
      localStorage.setItem("nh_memories", JSON.stringify([]));
    }
    if (!localStorage.getItem("nh_settings")) {
      localStorage.setItem("nh_settings", JSON.stringify(DEFAULT_SETTINGS));
    }
    this.isReady = true;
  }

  /* ------------------- EXPERIÊNCIAS ------------------- */
  async getAllExperiences() {
    await this.init();
    if (this.useLocalStorageFallback) {
      const stored = localStorage.getItem("nh_experiences");
      if (stored) return JSON.parse(stored);
      this.initLocalStorage();
      return JSON.parse(localStorage.getItem("nh_experiences"));
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(["experiences"], "readonly");
        const req = tx.objectStore("experiences").getAll();
        req.onsuccess = () => {
          const res = req.result || [];
          if (res.length === 0) {
            // Se porventura estiver vazio, repopular
            this.seedInitialExperiences().then(seeded => resolve(seeded));
          } else {
            resolve(res);
          }
        };
        req.onerror = () => {
          const fromLS = JSON.parse(localStorage.getItem("nh_experiences") || "[]");
          resolve(fromLS);
        };
      } catch (e) {
        resolve(JSON.parse(localStorage.getItem("nh_experiences") || "[]"));
      }
    });
  }

  async seedInitialExperiences() {
    const list = INITIAL_EXPERIENCES.map(item => ({
      ...item,
      status: "pendente",
      scheduledDate: null,
      scheduledTime: null,
      scheduledLocation: "",
      completedDate: null,
      notes: "",
      funnyMoments: "",
      rating: 5,
      photos: [],
      updatedAt: new Date().toISOString()
    }));

    if (!this.useLocalStorageFallback && this.db) {
      const tx = this.db.transaction(["experiences"], "readwrite");
      const store = tx.objectStore("experiences");
      for (const item of list) {
        store.put(item);
      }
    }
    localStorage.setItem("nh_experiences", JSON.stringify(list));
    return list;
  }

  async getExperience(id) {
    const numId = Number(id);
    const all = await this.getAllExperiences();
    return all.find(e => e.id === numId) || null;
  }

  async saveExperience(experience) {
    await this.init();
    experience.id = Number(experience.id);
    experience.updatedAt = new Date().toISOString();

    // Sempre sincronizar no localStorage para segurança instantânea
    const allLS = JSON.parse(localStorage.getItem("nh_experiences") || "[]");
    const idx = allLS.findIndex(e => e.id === experience.id);
    if (idx >= 0) allLS[idx] = experience;
    else allLS.push(experience);
    localStorage.setItem("nh_experiences", JSON.stringify(allLS));

    // Se IndexedDB estiver ativo, gravar também
    if (!this.useLocalStorageFallback && this.db) {
      try {
        const tx = this.db.transaction(["experiences"], "readwrite");
        tx.objectStore("experiences").put(experience);
      } catch (err) {
        console.warn("Erro ao salvar no IndexedDB, mantido em LocalStorage:", err);
      }
    }

    return experience;
  }

  /* ------------------- MEMÓRIAS ------------------- */
  async getAllMemories() {
    await this.init();
    if (this.useLocalStorageFallback) {
      const list = JSON.parse(localStorage.getItem("nh_memories") || "[]");
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      return list;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction(["memories"], "readonly");
        const req = tx.objectStore("memories").getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          resolve(list);
        };
        req.onerror = () => {
          resolve(JSON.parse(localStorage.getItem("nh_memories") || "[]"));
        };
      } catch (e) {
        resolve(JSON.parse(localStorage.getItem("nh_memories") || "[]"));
      }
    });
  }

  async saveMemory(memory) {
    await this.init();
    if (!memory.id) {
      memory.id = "mem_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    }
    memory.updatedAt = new Date().toISOString();

    // Sincronizar no localStorage
    const all = JSON.parse(localStorage.getItem("nh_memories") || "[]");
    const idx = all.findIndex(m => m.id === memory.id);
    if (idx >= 0) all[idx] = memory;
    else all.push(memory);
    localStorage.setItem("nh_memories", JSON.stringify(all));

    if (!this.useLocalStorageFallback && this.db) {
      try {
        const tx = this.db.transaction(["memories"], "readwrite");
        tx.objectStore("memories").put(memory);
      } catch (err) {
        console.warn("Erro ao salvar memória no IndexedDB:", err);
      }
    }

    return memory;
  }

  async deleteMemory(id) {
    await this.init();
    const all = JSON.parse(localStorage.getItem("nh_memories") || "[]");
    const filtered = all.filter(m => m.id !== id);
    localStorage.setItem("nh_memories", JSON.stringify(filtered));

    if (!this.useLocalStorageFallback && this.db) {
      try {
        const tx = this.db.transaction(["memories"], "readwrite");
        tx.objectStore("memories").delete(id);
      } catch (err) {
        console.warn("Erro ao deletar no IndexedDB:", err);
      }
    }

    return true;
  }

  /* ------------------- CONFIGURAÇÕES ------------------- */
  async getSettings() {
    await this.init();
    const fromLS = JSON.parse(localStorage.getItem("nh_settings") || "null");
    if (fromLS) return fromLS;

    if (!this.useLocalStorageFallback && this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(["settings"], "readonly");
          const req = tx.objectStore("settings").getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            const obj = { ...DEFAULT_SETTINGS };
            list.forEach(i => { obj[i.key] = i.value; });
            localStorage.setItem("nh_settings", JSON.stringify(obj));
            resolve(obj);
          };
          req.onerror = () => resolve(DEFAULT_SETTINGS);
        } catch (e) {
          resolve(DEFAULT_SETTINGS);
        }
      });
    }

    return DEFAULT_SETTINGS;
  }

  async saveSettings(settingsObj) {
    await this.init();
    localStorage.setItem("nh_settings", JSON.stringify(settingsObj));

    if (!this.useLocalStorageFallback && this.db) {
      try {
        const tx = this.db.transaction(["settings"], "readwrite");
        const store = tx.objectStore("settings");
        Object.keys(settingsObj).forEach(k => {
          store.put({ key: k, value: settingsObj[k] });
        });
      } catch (err) {
        console.warn("Erro ao salvar settings no IndexedDB:", err);
      }
    }

    return settingsObj;
  }

  /* ------------------- BACKUP E RESTAURAÇÃO ------------------- */
  async exportBackup() {
    const experiences = await this.getAllExperiences();
    const memories = await this.getAllMemories();
    const settings = await this.getSettings();

    const backupData = {
      version: 1,
      appName: "Nossa História ❤️",
      exportedAt: new Date().toISOString(),
      settings,
      experiences,
      memories
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `nossa-historia-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  async importBackup(jsonString) {
    const data = JSON.parse(jsonString);
    if (!data.experiences || !Array.isArray(data.experiences)) {
      throw new Error("Arquivo de backup inválido.");
    }

    await this.init();

    localStorage.setItem("nh_experiences", JSON.stringify(data.experiences));
    localStorage.setItem("nh_memories", JSON.stringify(data.memories || []));
    localStorage.setItem("nh_settings", JSON.stringify(data.settings || DEFAULT_SETTINGS));

    if (!this.useLocalStorageFallback && this.db) {
      try {
        const tx = this.db.transaction(["experiences", "memories", "settings"], "readwrite");
        const expStore = tx.objectStore("experiences");
        const memStore = tx.objectStore("memories");
        const setStore = tx.objectStore("settings");

        expStore.clear();
        memStore.clear();
        setStore.clear();

        for (const exp of data.experiences) expStore.put(exp);
        for (const mem of (data.memories || [])) memStore.put(mem);
        if (data.settings) {
          for (const key of Object.keys(data.settings)) {
            setStore.put({ key, value: data.settings[key] });
          }
        }
      } catch (err) {
        console.warn("Erro ao importar no IndexedDB:", err);
      }
    }

    return true;
  }

  async resetAllProgress() {
    await this.init();
    const resetExperiences = INITIAL_EXPERIENCES.map(item => ({
      ...item,
      status: "pendente",
      scheduledDate: null,
      scheduledTime: null,
      scheduledLocation: "",
      completedDate: null,
      notes: "",
      funnyMoments: "",
      rating: 5,
      photos: [],
      updatedAt: new Date().toISOString()
    }));

    localStorage.setItem("nh_experiences", JSON.stringify(resetExperiences));
    localStorage.setItem("nh_memories", JSON.stringify([]));

    if (!this.useLocalStorageFallback && this.db) {
      try {
        const tx = this.db.transaction(["experiences", "memories"], "readwrite");
        const expStore = tx.objectStore("experiences");
        const memStore = tx.objectStore("memories");
        expStore.clear();
        memStore.clear();
        for (const exp of resetExperiences) expStore.put(exp);
      } catch (e) {
        console.warn("Erro no reset do IndexedDB:", e);
      }
    }

    return true;
  }
}

// Instância global única
window.storyDB = new StoryDatabase();
