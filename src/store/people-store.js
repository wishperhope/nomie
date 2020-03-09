/**
 * People Store
 
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";
import math from "../utils/math/math";

// Vendors
import Storage from "../modules/storage/storage";

// Get Config
import config from "../../config/global";

import { LedgerStore } from "./ledger";
import dayjs from "dayjs";

const console = new Logger("🗺 $PeopleStore");

const getPeopleLogs = async () => {
  const logs = await LedgerStore.query({
    start: dayjs().subtract(6, "month"),
    end: new Date()
  });
  return logs.filter(log => log.note.search("@") > -1);
};

const mapToUser = logs => {
  const users = {};
  logs.forEach(log => {
    const meta = log.getMeta();
    meta.people.forEach(username => {
      users[username] = users[username] || [];
      users[username].push(log);
    });
  });
  return users;
};

const normalizeUserMap = userMap => {
  const final = {};
  Object.keys(userMap).forEach(username => {
    let logs = userMap[username];
    final[username] = final[username] || {};
    final[username].logs = logs;
    final[username].score = 0;
    final[username].last = null;
    if (logs.length) {
      final[username].last = new Date(logs.sort((a, b) => (a.end < b.end ? 1 : -1))[0].end);
      final[username].score = math.sum(logs.map(log => log.score));
    } else {
    }
  });
  return final;
};

const getRecentPeopleStats = async () => {
  let logs = await getPeopleLogs();
  return normalizeUserMap(mapToUser(logs));
};

/**
 * PEOPLE STORE
 * Used for global people things!
 * March 8 2020 - the Coronavirus COVID-19 is getting crazy.
 */

const PeopleInit = () => {
  const PeopleState = {};
  const { update, subscribe, set } = writable(PeopleState);

  const methods = {
    async init() {
      Storage.get(`${config.data_root}/people.json`).then(people => {
        update(d => people || {});
      });
    },
    async save(peopleArray) {
      update(people => {
        let changed = false;
        peopleArray.forEach(username => {
          if (!people.hasOwnProperty(username)) {
            changed = true;
            people[username] = username;
          }
        });
        if (changed) {
          this.write(people);
        }
        return people;
      });
    },
    async write(payload) {
      return Storage.put(`${config.data_root}/people.json`, payload);
    },
    async stats(options = {}) {
      return await getRecentPeopleStats();
    }
  };

  return {
    update,
    subscribe,
    set,
    ...methods
  };
};

export const PeopleStore = PeopleInit();