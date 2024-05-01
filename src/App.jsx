import './App.css'
import './styles/Job.css'
import React, { useState, useRef, useEffect } from 'react'
import { Job as JobComponent } from './components/Job'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import PidTable from './components/PidTable'
import QueueGraph from './components/QueueGraph'
import StatsTable from './components/StatsTable'
import TimeChart from './components/TimeChart'
import { MLFQ } from './logic/MLFQ'
import { Queue } from './logic/Queue'
import { Job, States } from './logic/job'

/*	
	Names cannot be the same
*/
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
    const [contextSwitchLen, setContextSwitchLen] = useState(0.1);
    
    const [queueData, setQueueData] = useState({currentTime: 0, queues: [[], [], []]})
    const [pidData, setPidData] = useState([]);
    const [statsTableData, setStatsTableData] = useState({avgResponse: '_', avgTurnaround: '_', avgJobLength: '_', timeInContextSwitching: '_'});
    const [pieChartData, setPieChartData] = useState({contextSwitches: 0, jobs: {}})
    // const [jobs, setJobs] = useState([new Job('j1', 54, '#78c0e0', 1), new Job('j2', 54, '#bd1e1e', 0), new Job('j3', 64, '#3a5a40', 2), new Job('j4', 44, '#ff7f51', 0), new Job('j5', 34, '#fcf6b1', 0)])
	const [massJobs, setMassJobs] = useState(false)
	const [seedBtn, setSeedBtn] = useState(false)
	const [jobName, setJobName] = useState("")
	const [jobLength, setJobLength] = useState(0)
	// For generating pre-determined Jobs 
	const [PD, setPD] = useState([])
	const [jobs, setJobs] = useState([])
	const [seedIds, setSeedIds] = useState([])
	var jobId = useRef(0)

	const getRandomInt = (max) => {
		return Math.floor(Math.random() * max);
	}

	const increment = () => {
		jobId.current += 1
	}

	// Custom Job
	const addJob = () => {
		if (jobName == "") {
			alert("Add a name dommy")
		} else {
			setJobs(prev => {
				prev.push({
					id: jobId.current,
					name: jobName,
					length: jobLength,
				})
				return prev
			})
			increment()
		}
		console.log(jobs)
	}

	useEffect(() => {
		console.log("seedIds has been changed", seedIds)
	}, [seedIds])

	useEffect(() => {
		console.log("PD has been changed", PD)
	}, [PD])

	const seedJobIds = (num) => {
		for (var i = num - 1; i >= 0; i--) {
			const currentJobId = (jobId.current - 1) - i;
			setSeedIds(prev => [...prev, currentJobId]);
		}
	}

	// Seeded jobs
	const addJobs = (numOfJobs) => {
		var i = 0;
		while (i < numOfJobs) {
			setPD(prev => {
				prev.push({
					id: jobId.current,
					name: "Job " + (jobId.current + 1).toString(),
					length: getRandomInt(25),
				})
				return prev
			})
			setJobs(prev => {
				prev.push({
					id: jobId.current,
					name: "Job " + (jobId.current + 1).toString(),
					length: getRandomInt(25),
				})
				return prev
			})
			increment()
			i++
		}

		seedJobIds(3)
	}

	const resetInput = () => {
		setJobName("")
		setJobLength(0)
	}

	const fnMassJobs = (bool) => {
		setMassJobs(bool)
	}

	const seedJobs = () => {
		if (seedBtn == false) {
			addJobs(3)

			setSeedBtn(true)
			fnMassJobs(true)
		} else {
			alert("Max jobs seeded")
		}
	}

	const clearMainJobs = () => {
		setJobs(prev => {
			prev = jobs.filter(item => !seedIds.includes(item.id))
			return prev
		})
		setSeedIds([])
		console.log(jobs)
	}

	const clearJobs = async () => {
		clearMainJobs()

		setPD([])
		setSeedBtn(false)
		fnMassJobs(false)
	}

	const handleJob = (event) => {
		if (event.target.id == "job-name") {
			setJobName(event.target.value)
		}
		if (event.target.name == "job-length") {
			setJobLength(event.target.value)
		}
	}

	const jobDeletion = (data) => {
		setPD(prev => {
			prev = PD.filter(item => item.id !== data)
			return prev
		})

		setSeedIds(prev => {
			prev = seedIds.filter(item => item !== data)
			return prev
		})

		setJobs(prev => {
			prev = jobs.filter(item => item.id !== data)
			return prev
		})
		console.log("PD: ", PD)
		console.log("here: ", jobs)
	}

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
        MLFQ.avgResponseTime = 0;
        MLFQ.avgTurnaroundTime = 0;

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


        // update pidData
        // {pid: 2, name: "Arc", status: "running", queue: 2, allotment: 1.2},
        let data = [];
        for (let [idx, queue] of mlfq.queues.entries()) {
            for (let job of queue.jobs) {
                let allotment = (queue.queueTimeout * clockCycleTime) - (queue.jobRuntime.get(job.id) * clockCycleTime) // total time the job's run  - total allowed time
                data.push({
                    pid: job.id,
                    name: job.name,
                    status: job.state,
                    queue: idx+1,
                    allotment
                })
            }
        }
        setPidData(data);

        // update pieChartData
        const jobData = {};
        for (let job of mlfq.jobs) {
            jobData[job.name] = job.length;
        }
        const contextSwitchCount = mlfq.queues.reduce((total, queue) => total + queue.jobBlocks.length, 0);
        setPieChartData({
            contextSwitches: contextSwitchCount,
            jobs: jobData,
        })

        if (mlfq.state === States.DONE) {
            setSummaryData();
            console.log('going to stop polling now')
            if (checker) clearInterval(checker); // stop polling
        }
        

        
        console.log('done with pollANdUpdateState()')
   }

   // TODO move some of these out to a service and pass them updater funcs they need?
   const setSummaryData = () => {
        // update statsTableData
        let totalJobLen = mlfq.jobs.reduce((total, job) => total + job.length, 0);
        let avgJobLength = totalJobLen / mlfq.jobs.length;
        const contextSwitchCount = mlfq.queues.reduce((total, queue) => total + queue.jobBlocks.length, 0);
        
        setStatsTableData({
            avgResponse: mlfq.avgResponseTime * clockCycleTime,
            avgTurnaround: mlfq.avgTurnaroundTime * clockCycleTime,
            avgJobLength,
            timeInContextSwitching: contextSwitchCount * contextSwitchLen,
        })
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
								{massJobs && (
									PD.map((obj, index) => {
										return <JobComponent key={index} value={obj} onData={jobDeletion} />
									})
								)}
							</div>
							<div id="custom-job">
								<Box
									component="form"
									id="job-input"
									noValidate
									autoComplete="off"
								>
									<TextField id="job-name" value={jobName} onChange={handleJob} label="Name" variant="filled" sx={{ input: {color: 'white' }}}/>
									<div className="input-container">
										<p>Length</p>
										<Slider name="job-length" className="sliders" value={jobLength} onChange={handleJob} defaultValue={25} valueLabelDisplay="auto" max={50} />
									</div>
								</Box>
								<Stack id="job-btn-container">
									<Button className="custom-btns" variant="contained" onClick={addJob}>Add</Button>
									<Button className="custom-btns" variant="contained" onClick={resetInput}>Reset</Button>
								</Stack>
							</div>
						</div>
						<div id="job-buttons">
							<Button className="noncustom-btns" variant="contained" style={{ cursor: seedBtn ? "not-allowed" : "default" }} onClick={seedJobs}>Seed</Button>
							<Button className="noncustom-btns" variant="contained" onClick={clearJobs}>Clear</Button>
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
                    <PidTable pidData={pidData}></PidTable>
                    <StatsTable statsTableData={statsTableData}></StatsTable>
                    <TimeChart pieChartData={pieChartData}></TimeChart>
				</div>
			</div>
		</div >
	)
}

export default App