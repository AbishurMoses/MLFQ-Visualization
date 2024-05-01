/*
oneQueue.js
Corbin Weiss
2024-4-18
Create a single queue who runs jobs in round-robin
*/

import {JobBlock} from "./jobBlock.js";
import {States, Job} from "./job.js";

class Queue {
    // TODO: Add functionality for i/o. How do jobs move from blocked to running to ready?
    /*
    Define a Queue class to run tasks in round robin.
    */
    static id; 
    static jobRuntime;      // Map<id, time> time elapsed running each job in this queue, since the job last joined the queue
    static RRcycles;        // number of machine cycles between RR switches
    static jobs;            // Array<Job> Jobs in the queue
    static jobBlocks;       // Array<JobBlock> history of jobs run in this queue for graphing.
    static currentJobIndex;      // TODO: MAKE THIS AN ACTUAL JOB the index of the current job
    static queueTimeout;    // clock cycle limit for a job to run in the queue
    static state;           // is the queue ready to run?
    static cycleTime;     // length of each clock cycle in ms.

    /*
        RRcycles (int) number of cycles between Round Robin job switches
        queueTimeout (int) number of cycles before a job is demoted from this queue
    */
    constructor(RRcycles, queueTimeout) {
        this.RRcycles = RRcycles;
        this.queueTimeout = queueTimeout;
        this.jobRuntime = new Map();
        this.jobs = [];
        this.jobBlocks = [];
        this.currentJobIndex = 0;
        this.state = States.DONE;   // A new queue with no jobs is done by default
    }

    /*
        set the id of the queue
    */
    setup(id, cycleTime) {
        this.id = id;
        this.cycleTime = cycleTime;
    }

    /*
        get the current job
    */
    currentJob() {
        return this.jobs[this.currentJobIndex % this.jobs.length];
    }

    /*
        cycle the clock:
        1. Pick the next job to run (or find they are all complete)
        2. run it for one cycle
        cycleCount (int): clock cycles that have passed in the MLFQ.
    */
    cycle(cyclesElapsed) {
        this.state = States.RUNNING;
        let job = this.nextRRJob(cyclesElapsed);
        if(job) {   // A runnable job has been found in the queue.
            this.run(job, cyclesElapsed);
            return this.checkForDemotion(this.currentJob(), cyclesElapsed + 1);
        }

        console.log(`${cyclesElapsed}: queue ${this.id} ${this.state}.`)

        // at the end of the cycle, check if a job needs to be demoted.
        // NOTE: because it is at the end of the cycle, one more cycle has elapsed. 
    }

    /*
        check if the given job needs to be demoted
        cyclesElapsed (int) clock cycles elapsed in MLFQ
        >return: demoted job if any. otherwise nothing.
    */
    checkForDemotion(job, cyclesElapsed) {
        if(job.state == States.DONE) { return; }    // don't demote if the job is done or blocked.
        if(job.state == States.BLOCKED) { return; }
        if(this.jobRuntime.get(job.id) >= this.queueTimeout) {
            this.demote(job, cyclesElapsed);
            return job;
        }
        return null;
    }   

    /*
        demote a job
        > job (Job): job to demote
        return: none
    */
    demote(job, cyclesElapsed) {
        // https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript
        this.stopJob(job, cyclesElapsed);

        let index = this.jobs.indexOf(job);
        if(index > -1) {
            this.jobs.splice(index, 1); // remove the job from this queue
        }
        else {  // unreachable  
            console.log("Could not find job to demote.");
        }
        this.jobRuntime.delete(job.id); // remove its jobRuntime data.
        console.log("Job " + job.name + " successfully demoted.");
        if(this.jobs.length == 0) {
            this.state = States.DONE;
        }
    }

    /*
        run a job for one clock cycle
        job (Job): the job to run
        cycleCount (int): the current clock cycle of the scheduler
        >return: Job if job demoted or none.
    */
    run(job, cyclesElapsed) {
        console.log(`${cyclesElapsed}: running ${job.name}.`);
        this.state = States.RUNNING;
        job.run(cyclesElapsed);
        /***** After cycle has run *****/
        cyclesElapsed++;

        if(job.state == States.DONE || job.state == States.BLOCKED) {
            this.jobBlocks.push(new JobBlock(job, this.cycleTime));
        }

        // update the time this job has been running in the queue
        this.jobRuntime.set(job.id, this.jobRuntime.get(job.id) + 1);
    }
    
    /*
        Choose which job to run next.
        - Current job ready: run it.
        - Current job running: check if it has used up its RR cycles.
        - Current job blocked: check if it is done
        - Current job done: take a note of it.
        >return: State or Job.
    */
    nextRRJob(cyclesElapsed) {
        // 1. check the current job for runnability
        // 2. check if all jobs are done or blocked
        // 3. go the next job
        let doneJobs = 0;
        let blockedJobs = 0;
        for(this.currentJobIndex; doneJobs + blockedJobs != this.jobs.length; this.currentJobIndex++) {
            let job = this.currentJob();
            switch(job.state) {
                case States.READY:
                    if(job.lastStartCycle() == null) {
                        // the job will begin this cycle.
                        job.setBeginCycle(cyclesElapsed);
                    }
                    return job;
                case States.RUNNING:
                    if(this.RRcyclesDone(job, cyclesElapsed)) { this.stopJob(job, cyclesElapsed); }
                    else {return job; };
                    break;
                case States.DONE:
                    doneJobs++;
                    break;
                case States.BLOCKED: 
                    blockedJobs++;
                    break;
                default:
                    console.log(`job ${job.name} is in an invalid state.`); 
            }
        }
    }

    /*
        determine if the RR cycles are up for the given job.
    */
    RRcyclesDone(job, cyclesElapsed) {
        return cyclesElapsed - job.lastStartCycle() == this.RRcycles;
    }

    /*
        stop a job:
        1. call the job's stop method.
        2. push a new JobBlock
    */
    stopJob(job, cyclesElapsed) {
        job.stop(cyclesElapsed);
        this.jobBlocks.push(new JobBlock(job, this.cycleTime));
    }

    /*
        move current to point to the next job
    */
    nextJob() {
        if(this.currentJob >= this.jobs.length - 1) {
            this.currentJob = 0;
        }
        else {
            this.currentJob++;
        }
    }

    /*
        add a job to the queue
        job: an instance of Job
    */
    addJob(job) {
        this.jobs.push(job);
        this.jobRuntime.set(job.id, 0);
        this.state = States.READY;      // With a job, the queue is ready to run
        console.log(`Added job ${job.name}`);
    }

    removeJob(job) {
        this.jobs = this.jobs.filter(j => j.id !== job.id);
        this.jobRuntime.delete(job.id);
        console.log(`Deleted job ${job.name}`);
    }

    /*
        Update the state of the queue based on the state of the jobs.
        Provides a handle for the MLFQ to update the status of a blocked queue.
        >return: null
    */
    updateState(cyclesElapsed) {
        let doneCount = 0;
        let blockedCount = 0;
        for(const job of this.jobs) {
            job.updateState(cyclesElapsed);
            switch(job.state) {
                case States.DONE:
                    doneCount++;
                    break;
                case States.BLOCKED:
                    blockedCount++;
                    break;
            }
        }
        if(doneCount + blockedCount < this.jobs.length) {
            // at least one job is runnable.
            this.state = States.READY;
        }
        else if(doneCount == this.jobs.length) {
            this.state = States.DONE;
        }
        else {
            this.state = States.BLOCKED;
        }
    }
}

export {Queue}