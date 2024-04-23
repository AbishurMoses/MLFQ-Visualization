/*
    jobBlock.js
    Corbin Weiss
    2024-4-23
    Define a job block for the MLFQ graph
*/

export default class JobBlock {
    static jobID  = 0;  // (int) job ID
    static jobName;     // (str) name of job
    static color;       // (hex) color 
    static start  = 0;  // (int) start time in ms
    static length = 0;  // (int) length of block in ms

    /*
        initialize off of a Job object along with its 
        start time and running time
    */
    constructor(job, start, length) {
        this.start = start;
        this.length = length;
        this.jobID = job.id;
        this.color = job.color;
        this.jobName = job.name;
    }
}