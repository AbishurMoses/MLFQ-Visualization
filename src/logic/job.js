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


export default class Job {
    static name;        // name of the job
    static id;          // id of the job for the MLFQ scheduler
    static length;      // job length measured in clock cycles
    static progress;    // cycles completed on job
    static state;       // RUNNING, READY, or BLOCKED
    static color;       // color of the job

    // length: Job length measured in clock cycles
    constructor(name, length, color) {
        this.name = name;
        this.length = length;
        this.color = color;
        this.progress = 0;
    }

    // handle for MLFQ scheduler to set its ID for this job. 
    setID(id) {
        this.id = id;
    }

    // run the job for one clock cycle
    run() {
        this.progress++;
    }

    isDone() {
        return this.progress >= this.length;
    }

}
