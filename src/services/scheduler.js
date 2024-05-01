import { MLFQ } from "../logic/MLFQ";
import { Queue } from "../logic/Queue";

/*
    mlfq: useRef() instance
    clockCycleTime: number
    timeBetweenBoosts: number
    timePerRrSlice: number
    allotPerQueue: number
*/
const setupMlfq = (mlfq, clockCycleTime, timeBetweenBoosts, timePerRrSlice, allotPerQueue) => {
    mlfq.current = new MLFQ(clockCycleTime, timeBetweenBoosts);
    console.log('set mlfq')
    console.dir(mlfq)
    const queue1 = new Queue(timePerRrSlice, allotPerQueue);
    const queue2 = new Queue(timePerRrSlice, allotPerQueue * 2); // allow jobs to run longer in lower-priority queues
    const queue3 = new Queue(timePerRrSlice, allotPerQueue * 3);

    mlfq.current.addQueue(queue1);
    mlfq.current.addQueue(queue2);
    mlfq.current.addQueue(queue3);
}

/*
    mlfq: useRef() instance
    jobs: useState() instance
    checker: useRef() instance
    pollAndUpdateState: <function>
    clockCycleTime: number
*/
const startScheduler = (mlfq, jobs, checker, pollAndUpdateState, clockCycleTime) => {
    MLFQ.avgResponseTime = 0;
    MLFQ.avgTurnaroundTime = 0;

    for (let job of jobs) {
        mlfq.current.addJob(job)
    }

    console.log('about to call start()')
    console.dir(mlfq)
    mlfq.current.start();

    // setTimeOut poll for scheduler changes and update state accordingly
    checker.current = setInterval(pollAndUpdateState, clockCycleTime * 10);
}

/*
    mlfq: useRef() instance
    setStatsTableData: setter for useState()
    clockCycleTime: number
    contextSwitchLen: number
*/
const setSummaryData = (mlfq, setStatsTableData, clockCycleTime, contextSwitchLen) => {
    // update statsTableData
    let totalJobLen = mlfq.current.jobs.reduce((total, job) => total + job.length, 0);
    let avgJobLength = totalJobLen / mlfq.current.jobs.length;
    const contextSwitchCount = mlfq.current.queues.reduce((total, queue) => total + queue.jobBlocks.length, 0);

    setStatsTableData({
        avgResponse: mlfq.current.avgResponseTime * clockCycleTime,
        avgTurnaround: mlfq.current.avgTurnaroundTime * clockCycleTime,
        avgJobLength,
        timeInContextSwitching: contextSwitchCount * contextSwitchLen,
    })
}

/*
    mlfq: useRef() instance
    setQueueData: setter for useState()
    clockCycleTime: number
*/
const updateQueueData = (mlfq, setQueueData, clockCycleTime) => {
    const currentTime = mlfq.current.cyclesElapsed * clockCycleTime;
		const queues = []
		for (let queue of mlfq.current.queues) {
			queues.push(queue.jobBlocks)
		}
    setQueueData({ currentTime, queues });
}

/*
    mlfq: useRef() instance
    setPidData: setter for useState()
    clockCycleTime: number
*/
const updatePidData = (mlfq, setPidData, clockCycleTime) => {
    let data = [];
		for (let [idx, queue] of mlfq.current.queues.entries()) {
			for (let job of queue.jobs) {
				let allotment = (queue.queueTimeout * clockCycleTime) - (queue.jobRuntime.get(job.id) * clockCycleTime) // total time the job's run  - total allowed time
				data.push({
					pid: job.id,
					name: job.name,
					status: job.state,
					queue: idx + 1,
					allotment
				})
			}
		}
		setPidData(data);
}

/*
    mlfq: useRef() instance
    setPieChartData: setter for useState()
    contextSwitchLen: number
*/
const updatePieChartData = (mlfq, setPieChartData, contextSwitchLen) => {
    const jobData = {};
    for (let job of mlfq.current.jobs) {
        jobData[job.name] = job.length;
    }
    const contextSwitchCount = mlfq.current.queues.reduce((total, queue) => total + queue.jobBlocks.length, 0);
    setPieChartData({
        contextSwitches: contextSwitchCount * contextSwitchLen,
        jobs: jobData,
    })
}

export { setupMlfq, startScheduler, setSummaryData, updateQueueData, updatePidData, updatePieChartData }