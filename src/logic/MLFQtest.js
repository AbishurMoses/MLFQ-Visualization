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
    let Scheduler = new MLFQ(0, 7);

    let Q1 = new Queue(2, 4);
    let Q2 = new Queue(2, 4);

    Scheduler.addQueue(Q1);
    Scheduler.addQueue(Q2);

    let jobs = []
    // for(let i = 0; i<2; i++) {
        // jobs.push(new Job(`j${i}`, 5, 0x20*i));
    // }
    jobs.push(new Job('j1', 554, '#78c0e0', 0));
    jobs.push(new Job('j2', 554, '#bd1e1e', 0))
    jobs.push(new Job('j3', 654, '#3a5a40', 0))
    jobs.push(new Job('j4', 454, '#ff7f51', 0))
    jobs.push(new Job('j5', 354, '#fcf6b1', 0))
    // jobs.push(new Job('j3', 6, 64, 1))
    // jobs.push(new Job('j4', 7, 54, 0), )
    // jobs.push(new Job('j5', 7, 34, 1))
    
    console.log(jobs);
    for(const job of jobs){
        Scheduler.addJob(job);
    }
    Scheduler.start();
    // setTimeout(() => {
    //     for(const queue of Scheduler.queues) {
    //         console.log(queue.jobBlocks)
    //     }
    // }, 60)
}

test();