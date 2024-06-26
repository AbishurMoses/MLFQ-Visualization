/*
    jobBlock.js
    Corbin Weiss
    2024-4-23
    Define a job block for the MLFQ graph
*/

class JobBlock {
    static jobID  = 0;  // (int) job ID
    static jobName;     // (str) name of job
    static color;       // (hex) color 
    static start  = 0;  // (int) start time in clock cycles
    static length = 0;  // (int) length of block in clock cycles


    /*
        initialize off of a Job object along with its 
        start time and running time
        job: the job to make a jobBlock for
        cycleLength: the length of each clock cycle in ms
    */
    constructor(job, cycleLength) {
        this.start = job.startCycle;
        this.length = cycleLength * (job.stopCycle - job.startCycle);
        this.jobID = job.id;
        this.color = job.color;
        this.jobName = job.name;
    }
}

export {JobBlock};