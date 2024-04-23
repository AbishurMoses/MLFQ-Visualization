/*
test.js
Corbin Weiss
2024-4-18
Test a single Queue running Round Robin
*/

const { Queue } = require("./Queue.js");
const { Job } = require("./job.js");

function test() {
    const j1 = new Job("j1", 7);
    const j2 = new Job("j2", 5);
    const late = new Job("late", 3);
    const Q = new Queue(500, 2);
    Q.addJob(j1);
    Q.addJob(j2);
    Q.start();
    setTimeout(Q.addJob.bind(Q), 1000, late);
}

test();