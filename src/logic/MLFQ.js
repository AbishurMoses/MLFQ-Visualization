/*
    MLFQ.js
    Corbin Weiss
    2024-4-23
    Create the MLFQ scheduler
*/

import Queue from "./Queue.js";

export default class MLFQ {
    static queues;          // Array<Queue>: queues that make up the MLFQ
    static jobs;            // Array<Jobs>:  jobs to run in the MLFQ
    static cycleTime;       // time in ms for each clock cycle
    static queueInterval;   // time each job gets in each queue before it is demoted
    static boostTime;       // time between priority boosts
    static currentQueue;    // the currently active queue
    static clock;           // the current clock cycle count
    
    constructor(cycleTime, queueCount, RRcycles, queueInterval, boostTime) {
        this.cycleTime = cycleTime;
        this.queues = [];
        for(let i = 0; i<queueCount; i++){
            this.queues.push(new Queue(cycleTime, RRcycles));
        }
        this.queueInterval = queueInterval;
        this.boostTime = boostTime;
    }

    // TODO: Figure out who owns the clock. Is it only running in the MLFQ?
    // Is the clock passed to the currently running queue?

    // I think the clock should be owned by the MLFQ, which calls run() for a single clock cycle on 
    // the currently active queue. This queue then handles the logic for its jobs, and may return a demoted job
    // When the currently active queue is totally blocked or done, go to the next queue.

    start() {}
    stop() {}
    addJob(job) {
        this.queues[0].addJob(job);
    }

    priorityBoost() {
        // starting with the second queue, add all the queues' jobs to the top queue.
        for(let i=1; i<this.queues.length; i++) {
            while(this.queues[i].length > 0) {
                this.queues[0].addJob(this.queues[i].jobs.shift())
            }
        }
    }
}