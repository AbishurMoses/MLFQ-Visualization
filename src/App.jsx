import './App.css'
import React from 'react'
import { useState } from 'react'
import QueueGraph from './components/QueueGraph'

function App() {
	const [massJobs, setMassJobs] = useState(true)
	var PD = []

	const addJobs = (numOfJobs) => {
		var i = 0;
		while (i < numOfJobs) {
			PD.push({
				key: i,
				length: "5",
				interactivity: "1",
			})
			i++
		}
	}

	const clearJobs = () => {
		PD = []
		setMassJobs(false)
		console.log(massJobs)
	}
	/*
		Calls addJobs and changes massJobs to true
	*/
	const seedJobs = () => {
		addJobs(3)
		console.log(PD)

		setMassJobs(false)
		console.log(massJobs)
	}

	return (
		<div id="main">
			<div id="top">
				<div id="container-workloads">
					<div id="workload-cont">
						<div id="workload-custom-job-cont">
							<div id="workload">
								{massJobs && (
									PD.map((obj) => {
										return <Job key={obj.key} value={obj} />
									})
								)}
							</div>
							<div id="custom-job">
								<h3>Custom Job</h3>
							</div>
						</div>
						<div id="job-buttons">
							<div className="btns" id="seed-btn" onClick={seedJobs}>Seed Jobs</div>
							<div className="btns" id="clear-btn" onClick={clearJobs}>Clear</div>
						</div>
					</div>
				</div>
				<div id="MLFQ-container">
					<QueueGraph />
					<p>Controls</p>
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
		</div>
	)
}

export default App