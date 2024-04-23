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
    static length;      // job length measured in clock cycles
    static progress;    // cycles completed on job
    static state;       // RUNNING, READY, or BLOCKED
    static name;

    // length: Job length measured in clock cycles
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.progress = 0;
    }

    // run the job for one clock cycle
    run() {
        this.progress++;
    }

    isDone() {
        return this.progress >= this.length;
    }

}

module.exports = {
    Job,
}