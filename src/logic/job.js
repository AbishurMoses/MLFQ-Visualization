/*
job.js
Corbin Weiss 
2024-4-18
Define a job with all its state
*/

const States = {
    RUNNING: "Running",
    READY: "Ready",
    BLOCKED: "Blocked",
    DONE: "Done",
};


class Job {
    static name;        // name of the job
    static id;          // id of the job for the MLFQ scheduler
    static length;      // job length measured in clock cycles
    static state;       // RUNNING, READY, or BLOCKED
    static color;       // color of the job
    static progress;    // cycles completed on job
    static startCycle;   // time job was last started
    static stopCycle;     // time job has been running since last started

    // length: Job length measured in clock cycles
    constructor(name, length, color) {
        this.name = name;
        this.length = length;
        this.color = color;
        this.state = States.READY;
        this.progress = 0;
        this.startCycle = 0;
        this.stopCycle = 0;
    }

    // handle for MLFQ scheduler to set its ID for this job. 
    setID(id) {
        this.id = id;
    }

    // run the job for one clock cycle
    // keep track of when the job started and stopped
    run(cyclesElapsed) {
        if(this.state == States.READY) {    // if we are starting the job anew
            this.startCycle = cyclesElapsed; // set the startCycle to now.
            this.state = States.RUNNING;
        }
        else if(this.state != States.RUNNING) {
            console.log(`Error when running job ${this.name}: job not runnable.`);
        }
        this.progress++;
        this.checkDone(cyclesElapsed + 1);  // done at end of cycle, so one more cycle has run.

    }

    /*
        Check if the job is done.
    */
    checkDone(cyclesElapsed) {
        if(this.progress >= this.length) {
            this.state = States.DONE;
            this.stopCycle = cyclesElapsed;
            console.log(`${cyclesElapsed}: job ${this.name} done!`);
        }
    }

    /*
        Get the last start cycle of the job
        for Round Robin scheduling

    */
    lastStartCycle() {
        return this.startCycle;
    }

    // stop a running job
    stop(cyclesElapsed) {
        if(this.state == States.RUNNING) {
            this.state = States.READY;
            this.stopCycle = cyclesElapsed;
        }
        else {
            console.log(`Error when stopping job ${this.name}: job not running.`);
        }
    }
}

export {States, Job};