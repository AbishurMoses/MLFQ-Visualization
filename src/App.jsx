import { useEffect, useState } from 'react'
import './App.css'
import PidTable from './components/PidTable'
import QueueGraph from './components/QueueGraph'
import StatsTable from './components/StatsTable'
import TimeChart from './components/TimeChart'
import { MLFQ } from './logic/MLFQ'
import { Queue } from './logic/Queue'
import { Job } from './logic/job'

function App() {
    // let scheduler; // MLFQ
    let mlfq; // MLFQ
    let checker; // setTimeout that polls the mlfq
    let starter;
    // const [mlfq, setMlfq] = useState(null)
    const [clockCycleTime, setClockCycleTime] = useState(1); // MLFQ.cycleTime // TODO hook this up be reactive with the UI (speed), also it was a value of 50 initially - depends on job length
    const [allotPerQueue, setAllotPerQueue] = useState(4); // Queue.queueTimeout // TODO hook this up be reactive with the UI
    const [timePerRrSlice, setTimePerRrSlice] = useState(null); // Queue.RRcycles // TODO hook this up be reactive with the UI
    const [timeBetweenBoosts, setTimeBetweenBoosts] = useState(110); // MLFQ.boostCycles // TODO hook this up be reactive with the UI
    
    const [queueData, setQueueData] = useState({currentTime: 0, queues: [[], [], []]})
    const [jobs, setJobs] = useState([new Job('j1', 54, '#78c0e0', 1), new Job('j2', 54, '#bd1e1e', 0), new Job('j3', 64, '#3a5a40', 2), new Job('j4', 44, '#ff7f51', 0), new Job('j5', 34, '#fcf6b1', 0)])

    // TODO delete this after we have real data for the pie chart
    const tempPieChartData = { 
        contextSwitches: 1.9,
        jobs: {
            "Arc": 1.9,
            "Microsoft Word": 4.2,
            "Telegram": 0.92,
            "Calendar": 4.4,
            "Microsoft Teams": 4.2,
            "Messages": 18.1,
        }
   }
   // TODO delete these temp jobs with the dynamic ones
    // let j1 = new Job('j1', 5, 54, 0);
    // let j2 = new Job('j1', 5, 54, 0);   
    // const jobs = [j1, j2];
   // run the MLFQ 
   const startScheduler = () => {
        // TODO remove this eventually, just temporarily populating jobs

        mlfq.start();
        clearTimeout(starter) //TODO delete this once you're done with "starter"
        
        // setTimeOut poll for scheduler changes and update state accordingly
        checker = setInterval(pollAndUpdateState, clockCycleTime*10); // TODO clear this when the component unmounts
   }

   // polls the scheduler's state and updates app state accordingly to update the UI
   const pollAndUpdateState = () => {
        console.log('starting pollANdUpdateState()');
        
        // update queueData
        const currentTime = mlfq.cyclesElapsed * clockCycleTime;
        const queues = []
        for (let queue of mlfq.queues) {
            queues.push(queue.jobBlocks)
        }
        setQueueData({currentTime, queues});


        // update tableQueueData

        // update statsTableData // TODO maybe move this to once the scheduler's done

        // update pieChartData // TODO maybe move this to once the scheduler's done
        console.log('done with pollANdUpdateState()')
   }

   // setup scheduler and queues
   useEffect(() => {
        console.log('setting up')
        setTimePerRrSlice(timePerRrSlice * 3); // base time in queue off of number of cycles per queue
        // scheduler = new MLFQ(clockCycleTime, timeBetweenBoosts);
        mlfq = new MLFQ(clockCycleTime, timeBetweenBoosts);
        const queue1 = new Queue(timePerRrSlice, allotPerQueue);
        const queue2 = new Queue(timePerRrSlice, allotPerQueue*2); // allow jobs to run longer in lower-priority queues
        const queue3 = new Queue(timePerRrSlice, allotPerQueue*3);
        // scheduler.addQueue(queue1);
        // scheduler.addQueue(queue2);
        // scheduler.addQueue(queue3);
        mlfq.addQueue(queue1);
        mlfq.addQueue(queue2);
        mlfq.addQueue(queue3);
        // setMlfq(scheduler);
        // addJobs()

        starter = setTimeout(startScheduler, 1000); // TODO delete all this below when it's hooked up to "start" btn
        // populate queueData
        // setQueueData(prev => {return {...prev, queues: [queue1.jobBlocks, queue2.jobBlocks, queue3.jobBlocks]}});
        return () => { // TODO add me back!
            if (checker) clearInterval(checker); // clean up state polling timeout on unmount
        }
   }, [])

   useEffect(() => {
    // const addJobs = () => {
        // console.log('adding jobs')
        // console.log(`mlfq type: ${mlfq.constructor.name}`);
        // clear mlfq jobs

        // re-add them
        for (let job of jobs) {
            mlfq.addJob(job);
        }
    // }
   }, [jobs]) // TODO may need to hook this up to the right jobs state once it's merged in
   
   


	return (
		<div id="main">
			<div id="top">
				<div id="container-workloads">
					<div id="workload-cont">
						<div id="workload-custom-job-cont">
							<div id="workload">
								<h3>MLFQ</h3>
							</div>
							<div id="custom-job">
								<h3>Custom Job</h3>
							</div>
						</div>
						<div id="job-buttons">
							<div className="btns" id="seed-btn">Seed Jobs</div>
							<div className="btns" id="clear-btn">Clear</div>
						</div>
					</div>
				</div>
				<div id="MLFQ-container">
					<QueueGraph queueData={queueData}/>
					<p>Controls</p>
					<div id="controls">
						<div className="cols" id="col1">
							<p>Time Allotment per Queue</p>
							<p>Time per RR slice</p>
						</div>
						<div className="cols" id="col2">
							<div><input type="number" className="control-inp" id="allotment" min="1" max="10" step="1" value="3" />ms</div>
							<div><input type="number" className="control-inp" id="rr-slice" min="1" max="10" step="1" value="3" />ms</div>
						</div>
						<div className="cols" id="col3">
							<div>Queues: <input type="number" className="control-inp" id="queues" min="1" max="10" step="1" value="3" />ms</div>
							<div>Time for Priority Boost: <input type="number" className="control-inp" id="boost" min="1" max="10" step="1" value="3" />ms</div>
						</div>
					</div>
				</div>
			</div>
			<div id="bottom">
				<div id="table-container">
                    <PidTable></PidTable>
                    <StatsTable></StatsTable>
                    <TimeChart pieChartData={tempPieChartData}></TimeChart>
				</div>
			</div>
		</div>
	)
}

export default App