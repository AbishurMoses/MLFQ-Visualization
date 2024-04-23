/*
oneQueue.js
Corbin Weiss
2024-4-18
Create a single queue who runs jobs in round-robin
*/

import JobBlock from "./jobBlock.js";

export default class Queue {
    // TODO: Add functionality for i/o. How do jobs move from blocked to running to ready?
    /*
    Define a Queue class to run tasks in round robin.
    */
    static intervalID;      // handle for managing setInterval
    static totalElapsed;    // total time elapsed
    static jobRuntime;      // Map<id, time> time elapsed running each job in this queue, since the job last joined the queue
    static RRStartTime;     // time when RR last started
    static cycleTime;       // time for each machine cycle
    static RRcycles;        // number of machine cycles between RR switches
    static jobs;            // Array<{Job, > Jobs in the queue
    static jobBlocks;       // Array<JobBlock> history of jobs run in this queue for graphing.
    static currentJob;      // the index of the current job

    /*
        cycleTime (int) number of milliseconds for each machine cycle
        RRcycles (int) number of cycles between Round Robin job switches
    */
    constructor(cycleTime, RRcycles) {
        this.cycleTime = cycleTime;
        this.RRcycles = RRcycles;
        this.totalElapsed = 0;
        this.jobRuntime = new Map();
        this.RRStartTime = 0;
        this.jobs = [];
        this.jobBlocks = [];
        this.currentJob = 0;
    }

    /*
        cycle the clock:
        1. Pick the next job to run (or find they are all complete)
        2. run it for one cycle
    */
    cycle() {
        let job = this.nextRRJob();
        if(job) {
            console.log(`${this.totalElapsed}: running ${job.name}`);
            job.run();
            // update the time this job has been running in the queue
            this.jobRuntime.set(job.id, this.jobRuntime.get(job.id) + 1);
        }
        else {
            console.log("All jobs complete!")
            this.stop();
        }
        this.totalElapsed++;
    }

    /*
        decide the next round robin job
    */
    nextRRJob() {
        // if the current job has been running longer than the RR time
        if(this.jobs[this.current].isDone() || this.totalElapsed % this.RRcycles == 0) {
            // add a job block for the just finished job.
            this.addJobBlock();
            this.RRStartTime = this.totalElapsed;
            return this.nextUnfinishedJob();
        } 
        else {
            return this.jobs[this.current];
        }
    }

    /*
        add a job block to the queue's state for graphing
    */
    addJobBlock() {
        this.jobBlocks.push(
            new JobBlock(this.jobs[this.current], this.RRStartTime, this.totalElapsed - this.RRStartTime));
    }

    /*
        move current to point to the next job
    */
    nextJob() {
        if(this.current == this.jobs.length - 1) {
            this.current = 0;
        }
        else {
            this.current++;
        }
    }

    /*
        find and return the next unfinished job in the array of jobs
    */
    nextUnfinishedJob() {
        // track startpoint to see when we loop back
        // console.log("Finding next unfinished job...");
        let startpoint = this.current;
        // console.log(`startpoint = ${startpoint}`);
        // find the next unfinished job
        this.nextJob();
        while(this.jobs[this.current].isDone()) {
            // console.log(`${this.jobs[this.current].name} is done.`)
            // If we made a complete cycle of the jobs and all are done, then we finished!
            if(this.current == startpoint) {
                return false;
            }
            this.nextJob();
        }
        return this.jobs[this.current];
    }

    /*
        add a job to the queue
        job: an instance of Job
    */
    addJob(job) {
        this.jobs.push(job);
        this.jobRuntime.set(job.id, 0);
        console.log(`Added job ${job.name}`);
    }

    start() {
        console.log("started.");
        this.current = 0;
        // the bind() is necessary to bring the this keyword into the scope
        // of the function passed to setInterval
        this.intervalID = setInterval(this.cycle.bind(this), this.cycleTime);
    }

    stop() {
        console.log("finished.");
        clearInterval(this.intervalID);
        this.intervalID = null;
        console.log(this.intervalID)
    }

}

function test() {
    console.log("running!");
    let test = new Queue(50);
    test.start();
    setTimeout(() => {
        test.stop();
    }, 1000);
}