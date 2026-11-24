// main ts

import { DB } from './db.js';
import { Users } from './users.js';

async function main() {
    // init
    await Users.initialize();
};


// start
main().catch(console.error);