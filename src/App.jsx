import './App.css'
import './styles/Job.css'
import React from 'react'
import { useState, useEffect } from 'react'
import Job from './components/Job'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

/*	
	Names cannot be the same
	Seeded jobs should be deleteable
	
	Job IDs
		- Will need to find a way to create both seeded and custom job Ids
		in such a way that they aren't the same
		- Use useRef to persiste state
*/
function App() {
	const [massJobs, setMassJobs] = useState(false)
	const [seedBtn, setSeedBtn] = useState(false)
	const [jobName, setJobName] = useState("")
	const [jobLength, setJobLength] = useState(0)
	// Pre-determined Jobs 
	const [PD, setPD] = useState([])
	// Jobs created by the user
	const [customJobs, setCustomJobs] = useState([])
	// const [jobId, setJobId] = useLocalStorage('jobId', [0])
	var jobId = 0

	const getRandomInt = (max) => {
		return Math.floor(Math.random() * max);
	}

	const increment = () => {
		setJobId(prev => {
			prev = prev + 1
			return prev
		})
	}

	// Custom Job
	const addJob = () => {
		if (jobName == "") {
			alert("Add a name dommy")
		} else {
			setCustomJobs(prev => {
				prev.push({
					id: jobId,
					name: jobName,
					length: jobLength,
				})
				return prev
			})
			// increment()
			jobId++
			console.log(customJobs)
		}
	}

	// Seeded jobs
	const addJobs = (numOfJobs) => {
		var i = 0;
		while (i < numOfJobs) {
			setPD(prev => {
				prev.push({
					id: jobId,
					name: "Job " + (jobId + 1).toString(),
					length: getRandomInt(25),
				})
				return prev
			})
			// increment()
			jobId++
			i++
		}
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
			addJobs(4)
			console.log(PD)

			setSeedBtn(true)
			fnMassJobs(true)
		} else {
			alert("Max jobs seeded")
		}
	}

	const clearJobs = async () => {
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
									<TextField id="job-name" value={jobName} onChange={handleJob} label="Name" variant="outlined" />
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

				</div>
			</div>
			<div id="bottom">
				<div id="table-container">

				</div>
			</div>
		</div >
	)
}

export default App