/*
    MLFQ.js
    Corbin Weiss
    2024-4-23
    Create the MLFQ scheduler
*/

import jobColors from "../services/colors.js";
import {States} from "./job.js";

class MLFQ {
    static intervalID;      // track the intervalID to manage the clock
    static queues;          // (Array<Queue>) queues that make up the MLFQ
    static jobs;            // (Array<Jobs>) jobs to run in the MLFQ
    static cycleTime;       // (int) time in ms for each clock cycle
    static boostCycles;     // (int) time between priority boosts
    static cyclesElapsed;   // (int) the elapsed clock cycle count
    static state;
    static avgTurnaroundTime;  // map<int, int> maps the jobID to its turnaround time
    static responseTime;    // map<jobID, cycle> maps the jobID to its arrival time for use in response time
    static avgResponseTime; // (number) the average response time for all jobs once MLFQ finishes
    static colors;          // array of colors for the jobs
    
    constructor(cycleTime, boostCycles) {
        this.queues = []; // queues with jobBlocks
        this.jobs = [];
        this.cycleTime = cycleTime;
        this.boostTime = boostCycles;
        this.cyclesElapsed = 0; 
        this.state = States.READY
        this.avgTurnaroundTime = 0;
        this.arriveCycles = new Map(null);
        this.avgResponseTime = 0;
        this.colors = jobColors.slice(1); // don't include first color from TimeChart.jsx in order to sync them
        this.idCounter = 0;
    }

    // The clock is owned by the MLFQ, which decides which queue should run, 
    // then calls cycle() on the currently active queue. 
    // This queue then handles the logic for its jobs, and may return a demoted job
    // When the currently active queue is totally blocked or done, go to the next queue.

    addQueue(queue) {
        queue.setup(this.queues.length, this.cycleTime);
        this.queues.push(queue);
    }

    addJob(job) {
        if(this.queues.length > 0) {
            const jobId = this.idCounter++;
            let color = this.colors[jobId];
            job.setup(jobId, color);
            this.queues[0].addJob(job);
            this.arriveCycles.set(job.id, this.cyclesElapsed);
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
        for(let i = 0; i < this.queues.length; i++) {
            if(this.queues[i].state == States.READY || this.queues[i].state == States.RUNNING) {
                return this.queues[i];
            }
        }
    }

    /*
        update io status of all queues, 
        by calling their function to check io status of all jobs
    */
    updateState() {
        let doneCount = 0;
        let blockedCount = 0;
        for(const queue of this.queues) {
            queue.updateState(this.cyclesElapsed);
            switch(queue.state) {
                case States.DONE:
                    doneCount++;
                    break;
                case States.BLOCKED:
                    blockedCount++;
                    break;

            }
        }
        if(doneCount + blockedCount < this.queues.length) {
            this.state = States.RUNNING;
        }
        else if(doneCount == this.queues.length) {
            this.state = States.DONE;
        }
        else {
            this.state = States.BLOCKED;
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
        // 1. UPDATE STATE
        this.updateState();
        if(this.state == States.DONE) {
            console.log(`${this.cyclesElapsed}: MLFQ done!`);
            this.stop();
            return;
        }
        else if(this.state == States.BLOCKED) {   
            console.log(`${this.cyclesElapsed}: MLFQ blocked!`);
        }

        // 2. If in a runnable state, RUN A QUEUE
        else {
            let queue = this.highestPriorityRunnableQueue();

            // 3. DEMOTE A JOB
            let demotedJob = queue.cycle(this.cyclesElapsed);
            if(demotedJob) {
                this.queueBelow(queue).addJob(demotedJob);
            }
        }

        this.cyclesElapsed++;

        // 4. PRIORITY BOOST
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
        this.calculateStats();
    }

    calculateStats() {
        let turnaroundTimes = 0;
        let responseTimes = 0;
        for(const queue of this.queues) {
            for(const job of queue.jobs) {
                let turnaroundTime = job.finishCycle - this.arriveCycles.get(job.id);
                console.log(`Turnaround time for job ${job.id}: ${turnaroundTime}`);
                turnaroundTimes += turnaroundTime;

                let responseTime = job.beginCycle - this.arriveCycles.get(job.id);
                console.log(`Response time for job ${job.id}: ${responseTime}`)
                responseTimes += responseTime;
            }
        }
        console.log(turnaroundTimes);
        console.log(responseTimes)

        this.avgResponseTime = responseTimes / this.jobs.length;
        this.avgTurnaroundTime = turnaroundTimes / this.jobs.length;
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

    // assumes the job exists
    removeJob(jobName) {
        const job = this.jobs.filter(j => j.name === jobName)[0];
        this.queues[0].removeJob(job);
        this.arriveCycles.delete(job.id)
        this.jobs = this.jobs.filter(job => job.name !== jobName)
    }
}

export {MLFQ};