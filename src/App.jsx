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
import { Paper, Typography } from '@mui/material';

/*	
	Names cannot be the same
*/
function App() {
    const mlfq = useRef(null);
    let checker; // setTimeout that polls the mlfq
    const [clockCycleTime, setClockCycleTime] = useState(1); // MLFQ.cycleTime
    const [allotPerQueue, setAllotPerQueue] = useState(4); // Queue.queueTimeout
    const [timePerRrSlice, setTimePerRrSlice] = useState(3); // Queue.RRcycles
    const [timeBetweenBoosts, setTimeBetweenBoosts] = useState(110); // MLFQ.boostCycles
    const [contextSwitchLen, setContextSwitchLen] = useState(0.2);
    
    const [queueData, setQueueData] = useState({currentTime: 0, queues: [[], [], []]})
    const [pidData, setPidData] = useState([]);
    const [statsTableData, setStatsTableData] = useState({avgResponse: 0, avgTurnaround: 0, avgJobLength: 0, timeInContextSwitching: 0});
    const [pieChartData, setPieChartData] = useState({contextSwitches: 0, jobs: {}})
	const [massJobs, setMassJobs] = useState(false)
	const [seedBtn, setSeedBtn] = useState(false)
	const [jobName, setJobName] = useState("")
	const [jobLength, setJobLength] = useState(0)
    const [jobInteractivity, setJobInteractivity] = useState(0);
	// For generating pre-determined Jobs 
	const [PD, setPD] = useState([])
	const [jobs, setJobs] = useState([])
	const [seedIds, setSeedIds] = useState([])
    const [colors, setColors] = useState(['#af4d98'])
    const [chartColors, setChartColors] = useState([
            '#af4d98', '#78c0e0', '#bd1e1e',
            '#3a5a40', '#ff7f51', '#fcf6b1',
            '#f7b32b', '#8447ff', '#7180ac',
            '#ff8cc6', '#d34e24', '#a2ad91',
            '#86cb92', '#694873', '#ffe3dc',
            '#f72c25', '#331e36', '#cd5d67',
            '#e9b872', '#c2efeb', '#d00000',
            '#686963', '#d6d1b1', '#ffb2e6'
        ])
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
            let job = new Job(jobName, jobLength, jobInteractivity);
            fnMassJobs(true);
            setPD(prev => [...prev, job]);
			setJobs(prev => [...prev, job]);
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
            let len = getRandomInt(25);
            let interactivity = getRandomInt(3);
            let job = new Job("Job " + (jobId.current + 1).toString(), len, interactivity);
            setPD(prev => [...prev, job])
            setJobs(prev => [...prev, job])
			increment();
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
        if (event.target.name == "job-interactivity") {
			setJobInteractivity(event.target.value)
		}
	}

    const handleConfig = (event) => {
        const { value } = event.target;
        switch (event.target.id) {
            case 'allotment': 
                setAllotPerQueue(value);
                break;
            case 'rr-slice':
                setTimePerRrSlice(value);
                break;
            case 'clock-cycle-length':
                setClockCycleTime(value);
                break;
            case 'boost':
                setTimeBetweenBoosts(value);
                break;
            case 'context-switch-length':
                setContextSwitchLen(value)
                break;
            default:
                break;
        }
        setupMlfq();
    }

	const jobDeletion = (data, jobName) => {
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
        mlfq.current.removeJob(jobName);
		console.log("PD: ", PD)
		console.log("here: ", jobs)
	}

    // setup scheduler and queues
   useEffect(() => {
        setupMlfq();

        return () => {
            if (checker) clearInterval(checker); // clean up state polling timeout on unmount
        }
    }, [])

    const setupMlfq = () => {
        mlfq.current = new MLFQ(clockCycleTime, timeBetweenBoosts);
        console.log('set mlfq')
        console.dir(mlfq)
        const queue1 = new Queue(timePerRrSlice, allotPerQueue);
        const queue2 = new Queue(timePerRrSlice, allotPerQueue*2); // allow jobs to run longer in lower-priority queues
        const queue3 = new Queue(timePerRrSlice, allotPerQueue*3);

        mlfq.current.addQueue(queue1);
        mlfq.current.addQueue(queue2);
        mlfq.current.addQueue(queue3);
    }

    useEffect(() => {
        for (let job of jobs) {
            mlfq.current.addJob(job);
        }
    }, [jobs])

   // run the MLFQ 
   const startScheduler = () => {
        MLFQ.avgResponseTime = 0;
        MLFQ.avgTurnaroundTime = 0;

        console.log('about to call start()')
        console.dir(mlfq)
        mlfq.current.start();
        
        // setTimeOut poll for scheduler changes and update state accordingly
        checker = setInterval(pollAndUpdateState, clockCycleTime*10);
   }

   // polls the scheduler's state and updates app state accordingly to update the UI
   const pollAndUpdateState = () => {
        console.log('starting pollANdUpdateState()');
        
        // update queueData
        const currentTime = mlfq.current.cyclesElapsed * clockCycleTime;
        const queues = []
        for (let queue of mlfq.current.queues) {
            queues.push(queue.jobBlocks)
        }
        setQueueData({currentTime, queues});


        // update pidData
        // {pid: 2, name: "Arc", status: "running", queue: 2, allotment: 1.2},
        let data = [];
        for (let [idx, queue] of mlfq.current.queues.entries()) {
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
        for (let job of mlfq.current.jobs) {
            jobData[job.name] = job.length;
        }
        const contextSwitchCount = mlfq.current.queues.reduce((total, queue) => total + queue.jobBlocks.length, 0);
        setPieChartData({
            contextSwitches: contextSwitchCount * contextSwitchLen,
            jobs: jobData,
        })

        if (mlfq.current.state === States.DONE) {
            setSummaryData();
            console.log('going to stop polling now')
            if (checker) clearInterval(checker); // stop polling
        }
        

        
        console.log('done with pollANdUpdateState()')
   }

   // TODO move some of these out to a service and pass them updater funcs they need?
   const setSummaryData = () => {
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
                                    <div className="input-container">
										<p>Interactivity</p>
										<Slider name="job-interactivity" className="sliders" value={jobInteractivity} onChange={handleJob} defaultValue={5} valueLabelDisplay="auto" max={10} />
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
					
					<Paper id="controls" elevation={3} className="mt-3">
                        <div className="flex">
                            <Typography component="h2" variant="h5" className="w-full text-center">Configurations</Typography>
                            <Button variant="contained" className="cols" onClick={startScheduler} disabled={jobs.length === 0}>Start</Button>
                        </div>
                        <div className="flex ">
                            
                            <div className="cols" id="col1">
                                <p>Time Allotment per Queue</p>
                                <p>Time per RR slice</p>
                            </div>
                            <div className="cols" id="col2">
                                <div><input type="number" className="control-inp text-white" id="allotment" min="1" max="10" step="1" disabled={jobs.length > 0} value={allotPerQueue} onChange={handleConfig}/>ms</div>
                                <div><input type="number" className="control-inp text-white" id="rr-slice" min="1" max="10" step="1" disabled={jobs.length > 0} value={timePerRrSlice} onChange={handleConfig}/>ms</div>
                            </div>
                            <div className="cols" id="col3">
                                {/* <div>Clock cycle length: <input type="number" className="control-inp" id="clock-cycle-length" min="1" max="10" step="1" disabled={true} value={clockCycleTime} onChange={handleConfig}/>ms</div> */}
                                <div>Context Switch Length: <input type="number" className="control-inp text-white" id="context-switch-length" min="0.1" max="10" step="0.05" disabled={jobs.length > 0} value={contextSwitchLen} onChange={handleConfig}/>ms</div>
                                <div>Time for Priority Boost: <input type="number" className="control-inp text-white" id="boost" min="1" max="10" step="1" disabled={jobs.length > 0} value={timeBetweenBoosts} onChange={handleConfig}/>ms</div>
                            </div>
                        </div>
					</Paper>
				</div>
			</div>
			<div id="bottom">
				<div id="table-container">
                    <PidTable pidData={pidData}></PidTable>
                    <StatsTable statsTableData={statsTableData}></StatsTable>
                    <TimeChart pieChartData={pieChartData} chartColors={chartColors}></TimeChart>
				</div>
			</div>
		</div >
	)
}

export default App