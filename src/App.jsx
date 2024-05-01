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
import { Job, States } from './logic/job'
import { Paper, Typography } from '@mui/material';
import jobColors from './services/colors';
import { setSummaryData, setupMlfq, startScheduler, updatePidData, updatePieChartData, updateQueueData } from './services/scheduler';

/*	
	Names cannot be the same
*/
function App() {
	const mlfq = useRef(null);
	let  checker = useRef(null); // setTimeout that polls the mlfq
	const [clockCycleTime, setClockCycleTime] = useState(1); // MLFQ.cycleTime
	const [allotPerQueue, setAllotPerQueue] = useState(4); // Queue.queueTimeout
	const [timePerRrSlice, setTimePerRrSlice] = useState(3); // Queue.RRcycles
	const [timeBetweenBoosts, setTimeBetweenBoosts] = useState(110); // MLFQ.boostCycles
	const [contextSwitchLen, setContextSwitchLen] = useState(0.2);

	const [queueData, setQueueData] = useState({ currentTime: 0, queues: [[], [], []] })
	const [pidData, setPidData] = useState([]);
	const [statsTableData, setStatsTableData] = useState({ avgResponse: 0, avgTurnaround: 0, avgJobLength: 0, timeInContextSwitching: 0 });
	const [pieChartData, setPieChartData] = useState({ contextSwitches: 0, jobs: {} })
	const [massJobs, setMassJobs] = useState(false)
	const [seedBtn, setSeedBtn] = useState(false)
	const [jobName, setJobName] = useState("")
	const [jobLength, setJobLength] = useState(1)
	const [jobInteractivity, setJobInteractivity] = useState(0);
	// For generating pre-determined Jobs 
	const [PD, setPD] = useState([])
	const [jobs, setJobs] = useState([])
	const [seedIds, setSeedIds] = useState([])
	var jobId = useRef(0)

	const getRandomInt = (max) => {
		return Math.floor(Math.random() * max) + 1;
	}

	const increment = () => {
		jobId.current += 1
	}

	// Custom Job
	const addJob = () => {
		if (jobName == "") {
			alert("Add a name dommy")
		} else {
			const nameExists = PD.some(prev => prev.name === jobName)
			if (!nameExists) {
				let job = new Job(jobName, jobLength, jobInteractivity);
				console.log("length: ", jobLength)
				fnMassJobs(true);
				setPD(prev => [...prev, job]);
				setJobs(prev => [...prev, job]);
				increment()
			}
			else {
				alert("A job with the selected name already exists")
			}
		}
		console.log(jobs)
	}

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
			let len = getRandomInt(24);
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
		setJobLength(1)
		setJobInteractivity(0)
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

	// setup scheduler and queues on mount
	useEffect(() => {
		setupMlfq(mlfq, clockCycleTime, timeBetweenBoosts, timePerRrSlice, allotPerQueue);

		return () => {
			if (checker.current) clearInterval(checker); // clean up state polling timeout on unmount
		}
	}, [])

	// run the MLFQ 
	const runScheduler = () => {
        startScheduler(mlfq, jobs, checker, pollAndUpdateState, clockCycleTime);
    }

	// polls the scheduler's state and updates app state accordingly to update the UI
	const pollAndUpdateState = () => {
		console.log('starting pollANdUpdateState()');

        updateQueueData(mlfq, setQueueData, clockCycleTime);
		updatePidData(mlfq, setPidData, clockCycleTime);
        updatePieChartData(mlfq, setPieChartData, contextSwitchLen);

		if (mlfq.current.state === States.DONE) {
			setSummaryData(mlfq, setStatsTableData, clockCycleTime, contextSwitchLen);
			console.log('going to stop polling now')
			if (checker.current) clearInterval(checker.current); // stop polling
		}
		console.log('done with pollANdUpdateState()')
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
									<TextField id="job-name" value={jobName} onChange={handleJob} label="Name" variant="filled" sx={{ input: { color: 'white' } }}/>
									<div className="input-container">
										<p>Length</p>
										<Slider name="job-length" className="sliders" value={jobLength} onChange={handleJob} defaultValue={25} valueLabelDisplay="auto" min={1} max={25} />
									</div>
									<div className="input-container">
										<p>Interactivity</p>
										<Slider name="job-interactivity" className="sliders" value={jobInteractivity} onChange={handleJob} defaultValue={5} valueLabelDisplay="auto" max={3} />
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
					<QueueGraph queueData={queueData} />

					<Paper id="controls" elevation={3} className="mt-3">
						<div className="flex">
							<Typography component="h2" variant="h5" className="w-full text-center">Configurations</Typography>
							<Button variant="contained" className="cols" onClick={runScheduler} disabled={jobs.length === 0}>Start</Button>
						</div>
						<div className="flex ">

							<div className="cols" id="col1">
								<p>Time Allotment per Queue</p>
								<p>Time per RR slice</p>
							</div>
							<div className="cols" id="col2">
								<div><input type="number" className="control-inp text-black" id="allotment" min="1" max="25" step="1" disabled={jobs.length > 0} value={allotPerQueue} onChange={handleConfig} />ms</div>
								<div><input type="number" className="control-inp text-black" id="rr-slice" min="1" max="25" step="1" disabled={jobs.length > 0} value={timePerRrSlice} onChange={handleConfig} />ms</div>
							</div>
							<div className="cols" id="col3">
								{/* <div>Clock cycle length: <input type="number" className="control-inp" id="clock-cycle-length" min="1" max="10" step="1" disabled={true} value={clockCycleTime} onChange={handleConfig}/>ms</div> */}
								<div>Context Switch Length: <input type="number" className="control-inp text-black" id="context-switch-length" min="0.1" max="5" step="0.05" disabled={jobs.length > 0} value={contextSwitchLen} onChange={handleConfig} />ms</div>
								<div>Time for Priority Boost: <input type="number" className="control-inp text-black" id="boost" min="1" max="200" step="1" disabled={jobs.length > 0} value={timeBetweenBoosts} onChange={handleConfig} />ms</div>
							</div>
						</div>
					</Paper>
				</div>
			</div>
			<div id="bottom">
				<div id="table-container">
                    <PidTable pidData={pidData}></PidTable>
                    <StatsTable statsTableData={statsTableData}></StatsTable>
                    <TimeChart pieChartData={pieChartData} chartColors={jobColors}></TimeChart>
				</div>
			</div>
		</div >
	)
}

export default App