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
    static elapsed;
    static cycleTime;
    static RRTime;
    static jobs = [];
    static currrentJob;     // the index of the current job

    /*
        cycleTime (int) number of milliseconds for each machine cycle
        RRTime (int) number of milliseconds between Round Robin job switches
    */
    constructor(cycleTime, RRTime, jobs) {
        this.cycleTime = cycleTime;
        this.RRTime = RRTime;
        this.elapsed = 0;
        this.jobs = jobs;
    }

    /*
        run a machine cycle
    */
    cycle() {
        console.log(`t = ${this.elapsed}: running ${this.jobs[this.currentJob].name}.`);
        if(!this.jobs[this.currentJob].run()) {
            console.log(`${this.jobs[this.currentJob].name} done! Switching jobs...`);
            if(this.currentJob == this.jobs.length - 1) {
                console.log("All done!");
                this.stop();
            }
            else {
                this.currentJob++;
            }
        }
        this.elapsed++;
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

module.exports = {
    Queue,
}