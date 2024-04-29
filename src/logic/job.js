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
    static startCycle;  // time job was last started
    static stopCycle;   // time job has been running since last started
    static interactivity;   // set the interactivity for the frequency and length of i/o
    static ioUnblockCycle; // track the amount of i/o remaining on the current i/o session

    // length: Job length measured in clock cycles
    constructor(name, length, color, interactivity) {
        this.name = name;
        this.length = length;
        this.color = color;
        this.state = States.READY;
        this.interactivity = interactivity;
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
        if(!this.checkDone(cyclesElapsed + 1)) {
            this.decideNextCycleIO(cyclesElapsed);
        }  
    }

    checkIOStatus(cyclesElapsed) {
        if(this.state == States.BLOCKED) {
            if(this.ioUnblockCycle == cyclesElapsed) {
                console.log(`${cyclesElapsed}: job ${this.name} done with i/o!`);
                this.state = States.READY;
                return true;
            }
        }
        else {
            return false;
        }
    }

    /*
        Check if the job is done.
        This occurs at the end of the cycle, so the cycles
        that have passed will be one more than the cycle number.
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

    /*
        generate a random i/o length based on the interactivity level
        Lengths between 1 and 10 depending on interactivity level.
    */
    ioLength() {
        return 1 + Math.floor(Math.random() * 3 * this.interactivity);
    }

    decideNextCycleIOFixed(cyclesElapsed) {
        if(this.progress == 1) {  //
            console.log(`${cyclesElapsed}: job ${this.name} entering i/o!`);
            this.stopCycle = cyclesElapsed+1;   // the job will be blocked on the next cycle
            this.state = States.BLOCKED;
            this.ioUnblockCycle = cyclesElapsed + 3;
        }
    }


    /*
        randomly begin an IO event based on the interactivity level.
        TODO: make i/o random and based on interactivity level.
    */
    decideNextCycleIO(cyclesElapsed) {
        // decide whether to do i/o proportionally to the interactivity level
        // interactivity    chance of i/o
        //      0                   0
        //      1                   0.25
        //      2                   0.625
        //      3                   0.75
        if(Math.random() < 0.1*this.interactivity) {
            console.log(`${cyclesElapsed}: job ${this.name} entering i/o!`);
            this.stopCycle = cyclesElapsed+1;
            this.state = States.BLOCKED;
            let length = this.ioLength()
            this.ioUnblockCycle = cyclesElapsed + length + 1;
            console.log(`Starting i/o with length ${length}`)
        }
    }
}

export {States, Job};