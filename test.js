/*
test.js
Corbin Weiss
2024-4-18
Test a single Queue running Round Robin
*/

const { Queue } = require("./Queue.js");
const { Job } = require("./Job.js");

function test() {
    const j1 = new Job("j1", 7);
    const j2 = new Job("j2", 2);
    const Q = new Queue(500, 1000, [j1, j2]);
    Q.start();
}

test();