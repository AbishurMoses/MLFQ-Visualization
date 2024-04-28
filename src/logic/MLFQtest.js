/*
MLFQtest.js
Corbin Weiss
2024-4-23
Test the MLFQ
*/

import {MLFQ} from "./MLFQ.js";
import {Queue} from "./Queue.js";
import {Job} from "./job.js";

function test() {
    // MLFQ(cycleTime, queueCount, BoostCycles)
    let Scheduler = new MLFQ(0, 20);

    let Q1 = new Queue(2, 4);
    let Q2 = new Queue(2, 4);

    Scheduler.addQueue(Q1);
    Scheduler.addQueue(Q2);

    let jobs = []
    for(let i = 0; i<5; i++) {
        jobs.push(new Job(`j${i}`, 5, 0x20*i));
    }
    console.log(jobs);
    for(const job of jobs){
        Scheduler.addJob(job);
    }
    Scheduler.start();
    setTimeout(() => {
        for(const queue of Scheduler.queues) {
            console.log(queue.jobBlocks)
        }
    }, 60)
}

test();