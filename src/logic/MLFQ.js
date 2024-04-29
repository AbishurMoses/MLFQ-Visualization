/*
    MLFQ.js
    Corbin Weiss
    2024-4-23
    Create the MLFQ scheduler
*/

import {States} from "./job.js";

class MLFQ {
    static intervalID;      // track the intervalID to manage the clock
    static queues;          // (Array<Queue>) queues that make up the MLFQ
    static jobs;            // (Array<Jobs>) jobs to run in the MLFQ
    static cycleTime;       // (int) time in ms for each clock cycle
    static boostCycles;     // (int) time between priority boosts
    static cyclesElapsed;   // (int) the elapsed clock cycle count
    
    constructor(cycleTime, boostCycles) {
        this.queues = [];
        this.jobs = [];
        this.cycleTime = cycleTime;
        this.boostTime = boostCycles;
        this.cyclesElapsed = 0; 
    }

    // The clock is owned by the MLFQ, which decides which queue should run, 
    // then calls cycle() on the currently active queue. 
    // This queue then handles the logic for its jobs, and may return a demoted job
    // When the currently active queue is totally blocked or done, go to the next queue.

    addQueue(queue) {
        queue.setID(this.queues.length);
        this.queues.push(queue);
        
    }

    addJob(job) {
        if(this.queues.length > 0) {
            job.setID(this.jobs.length);     // set the id of the job in the MLFQ
            this.queues[0].addJob(job);
        }
        else {
            console.log("You need some queues to add jobs to.");
        }
        this.jobs.push(job);

    }

    /*
        Find the highest priority runnable queue:
        start from the first and iterate until you find one that is runnable
    */
    highestPriorityRunnableQueue() {
        let doneQueues = 0;
        for(let i = 0; i < this.queues.length; i++) {
            switch(this.queues[i].state) {
                case States.READY:
                    return this.queues[i];
                case States.RUNNING:
                    return this.queues[i];
                case States.DONE:
                    doneQueues++;
                    break;
                case States.BLOCKED:
                    break;
                default:
                    console.log("queue is in an invalid state.");
            }
        }
        if(doneQueues == this.queues.length) {
            return States.DONE;
        }
        else {
            return States.BLOCKED;
        }
    }

    /*
        update io status of all queues, 
        by calling their function to check io status of all jobs
    */
    updateIOStatus() {
        for(const queue of this.queues) {
            queue.checkJobIOStatus(this.cyclesElapsed);
        }
    }

    /*
        Get the queue below the current queue.
        Return the current queue if it's the bottom one.
    */
    queueBelow(queue) {
        let queueIndex = this.queues.indexOf(queue);
        if(queueIndex + 1 < this.queues.length) {
            return this.queues[queueIndex + 1]
        }
        else {
            return queue;
        }
    }

    // Run a single clock cycle
    cycle() {
        this.updateIOStatus();
        let queue = this.highestPriorityRunnableQueue();
        // console.log(queue);
        if(queue == States.DONE) {   // all queues are done
            console.log(`${this.cyclesElapsed}: MLFQ done!`);
            this.stop();
            return;
        }
        else if(queue == States.BLOCKED) {   
            console.log(`${this.cyclesElapsed}: MLFQ blocked!`);
        }
        else {
            // queue is a valid queue, so cycle it. 
            let demotedJob = queue.cycle(this.cyclesElapsed);
            if(demotedJob) {
                this.queueBelow(queue).addJob(demotedJob);
            }
        }

        this.cyclesElapsed++;

        if(this.cyclesElapsed % this.boostTime == 0) {
            this.priorityBoost();
        }
    }

    start() {
        console.log("Starting the MLFQ!");
        this.intervalID = setInterval(this.cycle.bind(this), this.cycleTime);
    }

    stop() {
        console.log("Stopping the MLFQ");
        clearInterval(this.intervalID);
        this.intervalID = null;
    }

    priorityBoost() {
        // starting with the second queue, add all the queues' jobs to the top queue.
        console.log(`${this.cyclesElapsed}: Priority boosting!`);
        for(let i=1; i<this.queues.length; i++) {
            while(this.queues[i].jobs.length > 0) {
                this.queues[0].addJob(this.queues[i].jobs.shift())
            }
            this.queues[i].state = States.DONE; 
            // after all jobs are removed from queues, their state should be reset to default of DONE
        }
    }
}

export {MLFQ};