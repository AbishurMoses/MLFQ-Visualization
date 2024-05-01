import './App.css'
import './styles/Job.css'
import React, { useEffect } from 'react'
import { useState, useRef } from 'react'
import Job from './components/Job'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import PidTable from './components/PidTable'
import QueueGraph from './components/QueueGraph'
import StatsTable from './components/StatsTable'
import TimeChart from './components/TimeChart'

/*	
	Names cannot be the same
*/
function App() {
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

	return (
		<div id="main">
			<div id="top">
				<div id="container-workloads">
					<div id="workload-cont">
						<div id="workload-custom-job-cont">
							<div id="workload">
								{massJobs && (
									PD.map((obj, index) => {
										return <Job key={index} value={obj} onData={jobDeletion} />
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
					<QueueGraph />
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
		</div >
	)
}

export default App