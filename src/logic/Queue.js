/*
oneQueue.js
Corbin Weiss
2024-4-18
Create a single queue who runs jobs in round-robin
*/

import {JobBlock} from "./jobBlock.js";
import {States} from "./job.js";

class Queue {
    // TODO: Add functionality for i/o. How do jobs move from blocked to running to ready?
    /*
    Define a Queue class to run tasks in round robin.
    */
    static intervalID;      // ! PHASING OUT handle for managing setInterval
    static totalElapsed;    // !UNUSED total clock cycles elapsed  
    static id; 
    static jobRuntime;      // Map<id, time> time elapsed running each job in this queue, since the job last joined the queue
    static RRStartTime;     // !Unused time when RR last started
    static cycleTime;       // !UNUSED time for each machine cycle
    static RRcycles;        // number of machine cycles between RR switches
    static jobs;            // Array<Job> Jobs in the queue
    static jobBlocks;       // Array<JobBlock> history of jobs run in this queue for graphing.
    static currentJob;      // TODO: MAKE THIS AN ACTUAL JOB the index of the current job
    static queueTimeout;    // clock cycle limit for a job to run in the queue
    static state;           // is the queue ready to run?

    /*
        RRcycles (int) number of cycles between Round Robin job switches
        queueTimeout (int) number of cycles before a job is demoted from this queue
    */
    constructor(RRcycles, queueTimeout) {
        this.RRcycles = RRcycles;
        this.queueTimeout = queueTimeout;
        this.cycleCount = 0;
        this.jobRuntime = new Map();
        this.RRStartTime = 0;
        this.jobs = [];
        this.jobBlocks = [];
        this.currentJob = 0;
        this.state = States.DONE;   // A new queue with no jobs is done by default
    }

    /*
        set the id of the queue
    */
    setID(id) {
        this.id = id;
    }

    /*
        cycle the clock:
        1. Pick the next job to run (or find they are all complete)
        2. run it for one cycle
        cycleCount (int): clock cycles that have passed in the MLFQ.
    */
    cycle(cyclesElapsed) {
        this.state = States.RUNNING;
        let job = this.nextRRJob2(cyclesElapsed);
        if(job) {   // A runnable job has been found in the queue.
            this.run(job, cyclesElapsed);
        }
        // at the end of the cycle, check if a job needs to be demoted.
        // NOTE: because it is at the end of the cycle, one more cycle has elapsed. 
        return this.checkForDemotion(this.jobs[this.currentJob], cyclesElapsed + 1);
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
        // check if the job is done or blocked. If so then add a job block for it
        if(job.state == States.DONE) {
            this.jobBlocks.push(new JobBlock(job));
        }
        // update the time this job has been running in the queue
        this.jobRuntime.set(job.id, this.jobRuntime.get(job.id) + 1);
    }

    /*
        Choose which job to run next.
        - If the current job has finished its RR cycles, stop it
        TODO: if there is one job and it has a RR switch, then cycle back around to it once more. 
    */

    nextRRJob2(cyclesElapsed) {
        let doneJobs = 0;
        let blockedJobs = 0;
        // 1. check the current job for runnability
        // 2. check if all jobs are done or blocked
        // 3. go the next job
        for(this.currentJob; doneJobs + blockedJobs != this.jobs.length; this.nextJob()) {
            let job = this.jobs[this.currentJob];
            switch(job.state) {
                case States.READY:
                    return job;
                case States.RUNNING:
                    if(this.RRcyclesDone(job, cyclesElapsed)) { this.stopJob(job, cyclesElapsed); }
                    else {return job; };
                    break;
                case States.DONE:
                    doneJobs++;
                    break;
                case States.BLOCKED:
                    blockedJobs++
                    break;
                default:
                    console.log(`job ${job.name} is in an invalid state.`); 
            }
        }
        
        if(doneJobs == this.jobs.length) {
            this.state = States.DONE;
        }
        else {
            this.state = States.BLOCKED;
        }
    }

    /*
        check the runnability of a job
    */
    checkRunnability(job) {
        switch(job.state) {
            case States.READY:
                return job;
            case States.RUNNING:
                if(this.RRcyclesDone(job, cyclesElapsed)) { this.stopJob(job, cyclesElapsed); }
                else {return job; };
                break;
            case States.DONE:
                doneJobs++;
                break;
            case States.BLOCKED:
                break;
            default:
                console.log(`job ${job.name} is in an invalid state.`); 
        }
    }


    /*
        determine if the RR cycles are up for the given job.
    */
    RRcyclesDone(job, cyclesElapsed) {
        return cyclesElapsed - job.lastStartCycle() == this.RRcycles;
    }

    /*
        decide the next round robin job
        cyclesElapsed (int): the current clock cycle of the scheduler
    */
    nextRRJob(cyclesElapsed) {
        switch(this.jobs[this.currentJob].state) {
            case States.BLOCKED:
                console.log(`Job ${this.jobs[this.currentJob].name} is blocked.`);
                return this.nextRunnableJob();
            case States.DONE:
                console.log(`Job ${this.jobs[this.currentJob].name} is done.`);
                return this.nextRunnableJob();
            case States.RUNNING:    // job has been running, but is now out of RR cycles
                if(cyclesElapsed - this.jobs[this.currentJob].lastStartCycle() == this.RRcycles){
                    console.log("Round Robin time is up!");
                    this.stopJob(this.jobs[this.currentJob], cyclesElapsed);
                    return this.nextRunnableJob();
                }
            default:    // job either running and not out of RR cycles, or is ready.
                return this.jobs[this.currentJob]
        }

        // if the current job is blocked or done, or the round robin time is up, then move to the next job.
        if(this.jobs[this.currentJob].state == States.BLOCKED) {
            console.log(`Job ${this.jobs[this.currentJob].name} is blocked.`);
            return this.nextRunnableJob();
        }
        else if(this.jobs[this.currentJob].state == States.DONE) {
            console.log(`Job ${this.jobs[this.currentJob].name} is done.`);
            return this.nextRunnableJob();
        }

        // if the current job has run a full round robin cycle, then switch jobs.
        if(cyclesElapsed - this.jobs[this.currentJob].lastStartCycle() == this.RRcycles){
            console.log("Round Robin time is up!");
            this.stopJob(this.jobs[this.currentJob]);
            return this.nextRunnableJob();
        }
        else {
            return this.jobs[this.currentJob];
        }
    }

    /*
        stop a job:
        1. call the job's stop method.
        2. push a new JobBlock
    */
    stopJob(job, cyclesElapsed) {
        job.stop(cyclesElapsed);
        this.jobBlocks.push(new JobBlock(job));
    }

    /*
        move current to point to the next job
    */
    nextJob() {
        if(this.currentJob == this.jobs.length - 1) {
            this.currentJob = 0;
        }
        else {
            this.currentJob++;
        }
    }

    /*
        find and return the next unfinished job in the array of jobs
    */
    nextRunnableJob() {
        // track startpoint to see when we loop back through the job list
        let startpoint = this.currentJob;
        let doneJobs = 0;
        do {
            this.nextJob();
            switch(this.jobs[this.currentJob].state) {
                case States.READY:
                    return this.jobs[this.currentJob];
                case States.BLOCKED:
                    break;
                case States.DONE:
                    doneJobs++;
                    break;
                default:
                    console.log("job " + this.jobs[this.currentJob].name + " is in unknown state!");
            }
        } while(this.currentJob != startpoint) 
        if(doneJobs == this.jobs.length) {  // all jobs in queue are done
            console.log("All jobs are done!");
            this.state = States.DONE;
            return;
        }
        else {  // No jobs are ready to run, but not all jobs are done, so at least one is blocked.
            console.log("Queue is blocked...");
            this.state = States.BLOCKED;
            return;
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

    // ! Phasing out the following: start, stop

    start() {
        console.log("started.");
        this.currentJob = 0;
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

export {Queue}