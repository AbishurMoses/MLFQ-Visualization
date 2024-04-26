import './App.css'
import QueueGraph from './components/QueueGraph'
import Job from './components/Job';
import './styles/Job.css'
import { React, useState } from 'react';

function App() {
	// Marks on slider
	const marks = [
		{
			value: 0,
			label: "Low",
		},
		{
			value: 1,
			label: "Med",
		},
		{
			value: 2,
			label: "High",
		}
	]

	// Pre-determined jobs. Will be randomized later
	const PD = [
		{
			id: 0,
			length: 50,
			interactivity: 2,
		},
		{
			id: 1,
			length: 45,
			interactivity: 1,
		},
		{
			id: 2,
			length: 70,
			interactivity: 0,
		}
	]

	const [massJobs, setMassJobs] = useState(false)

	const seedJobs = () => {
		setMassJobs(true)
		console.log(massJobs)
	}


	return (
		<div id="main">
			<div id="top">
				<div id="container-workloads">
					<div id="workload-cont">
						<div id="workload-custom-job-cont">
							<div id="workload">
								<div id="job-container">
									{massJobs && (
										PD.map((value, index) => {
											return <Job key={index} value={value} />
										}))
									}
								</div>
							</div>
							<div id="custom-job">
								
							</div>
						</div>
						<div id="job-buttons">
							<div className="btns" id="seed-btn" onClick={seedJobs}>Seed Jobs</div>
							<div className="btns" id="clear-btn">Clear</div>
						</div>
					</div>
				</div>
				<div id="MLFQ-container">
					<QueueGraph />
					<p>Controls</p>
					<div id="controls">
						{/* <div className="cols" id="col1">
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
						</div> */}
					</div>
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