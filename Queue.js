/*
oneQueue.js
Corbin Weiss
2024-4-18
Create a single queue who runs jobs in round-robin
*/

class Queue {
    /*
    Define a Queue class to run tasks in round robin.
    */
    static intervalID;
    static elapsed = 0;
    static cycleTime;
    static RRcycles;
    static jobs = [];
    static current = 0;    // the index of the current job

    /*
        cycleTime (int) number of milliseconds for each machine cycle
        RRcycles (int) number of cycles between Round Robin job switches
    */
    constructor(cycleTime, RRcycles) {
        this.cycleTime = cycleTime;
        this.RRcycles = RRcycles;
        this.elapsed = 0;
        this.jobs = [];
    }

    /*
        cycle the clock:
        1. Pick the next job to run (or find they are all complete)
        2. run it for one cycle
    */
    cycle() {
        let job = this.nextRRJob();
        if(job) {
            console.log(`${this.elapsed}: running ${job.name}`);
            job.run();
        }
        else {
            console.log("All jobs complete!")
            this.stop();
        }
        this.elapsed++;
    }

    /*
        decide the next round robin job
    */
    nextRRJob() {
        // if the current job is done or the RRcycles are up
        if(this.jobs[this.current].isDone()) {
            console.log(`Job ${this.jobs[this.current].name} done. Moving to next job.`);
            return this.nextUnfinishedJob();
        } 
        if(this.elapsed % this.RRcycles == 0) {
            console.log("Round Robin interrupt. Moving to next job.");
            return this.nextUnfinishedJob();
        }
        else {
            return this.jobs[this.current];
        }
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
        console.log("Finding next unfinished job...");
        let startpoint = this.current;
        console.log(`startpoint = ${startpoint}`);
        // find the next unfinished job
        this.nextJob();
        while(this.jobs[this.current].isDone()) {
            console.log(`${this.jobs[this.current].name} is done.`)
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

module.exports = {
    Queue,
}