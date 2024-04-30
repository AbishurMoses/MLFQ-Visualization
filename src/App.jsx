import './App.css'
import React from 'react'
import { useState, useEffect } from 'react'
import QueueGraph from './components/QueueGraph'
import Job from './components/Job'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

/*	Jobs need ids
		- Will need to find a way to create both seeded and custom job Ids
	Names should not be the same
		- Should the option be restricted or left to the user
	Job deletion
		- Seeded jobs might need to be deleted
			- However, this means that the user generated jobs can't be removed once added
*/
function App() {
	const [massJobs, setMassJobs] = useState(false)
	const [seedBtn, setSeedBtn] = useState(false)
	const [jobName, setJobName] = useState("")
	const [jobLength, setJobLength] = useState(0)
	const [jobInteractivity, setJobInteractivity] = useState(0)
	// Pre-determined Jobs
	const [PD, setPD] = useState([])
	// Jobs created by the user
	var custom_jobs = []

	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	// Custom Job
	const addJob = () => {
		if (jobName == "") {
			alert("Add a name dommy")
		} else {
			custom_jobs.push({
				name: jobName,
				length: jobLength,
				jobInteractivity: jobInteractivity
			})
			console.log(custom_jobs)
		}
	}

	// Seeded jobs
	const addJobs = (numOfJobs) => {
		var i = 0;
		while (i < numOfJobs) {
			setPD(prev => {
				prev.push({
				id: i,
				name: "Job " + (i + 1).toString(),
				length: getRandomInt(25),
				interactivity: getRandomInt(3)
			})
			return prev
		})
		i++
	}
}

const resetInput = () => {
	setJobName("")
	setJobLength(0)
	setJobInteractivity(0)
}

useEffect(() => {
	console.log('PD has been updated');
}, [PD]);


useEffect(() => {
	console.log('massJobs updated to ', massJobs);
}, [massJobs]);

const fnMassJobs = (bool) => {
	setMassJobs(bool)
}

const seedJobs = () => {
	if (seedBtn == false) {
		addJobs(3)
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
	if (event.target.name == "job-interactivity") {
		setJobInteractivity(event.target.value)
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
									return <Job key={index} value={obj} />
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
								<div className="input-container">
									<p>Inter</p>
									<Slider name="job-interactivity" className="sliders" value={jobInteractivity} onChange={handleJob} defaultValue={1} valueLabelDisplay="auto" max={2} />
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
				{/* <QueueGraph /> */}
				{/* <div id="controls">
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
					</div> */}
			</div>
		</div>
		<div id="bottom">
			<div id="table-container">
				{/* <div className="table-cols" id="pid-table">
						<p>Process Table</p>
						<div><h1>Graph!</h1></div>
					</div>
					<div className="table-cols" id="stats">
						<p>Stats</p>
						<div>
							<ul>
								<li>Average response time:</li>
								<li>Average turnaround time:</li>
								<li>Average job time:</li>
								<li>Time in Context Switch:</li>
							</ul>
						</div>
					</div>
					<div className="table-cols" id="time">
						<p>Time Usage</p>
						<div><h1>Graph!</h1></div>
					</div> */}
			</div>
		</div>
	</div >
)
}

export default App