/*
test.js
Corbin Weiss
2024-4-18
Test a single Queue running Round Robin
*/

import Queue from "./Queue.js";
import Job from "./job.js";

import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function test() {
    const j1 = new Job("j1", 7, 0x200);
    j1.setID(1);
    const j2 = new Job("j2", 6, 0x100);
    j2.setID(2);
    const late = new Job("late", 3);
    const Q = new Queue(500, 2);
    Q.addJob(j1);
    Q.addJob(j2);
    Q.start();
    console.log(Q);

    rl.on('line', (input) => {
        Q.addJob(late);
        rl.close();
    })

    setTimeout(console.log, 10000, Q);
}

test();