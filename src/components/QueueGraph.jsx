
const QueueGraph = (props) => {
    const { queueData } = props
    let count = 1;
    const data = { // TEMPORARY, delete this eventually
        currentTime: 50,
        queues: [
            [
                // {start: , length: , job: , name: , color: ,},
                {start: 0, length: 5, job: 1, name: "quicksand", color: "#2a2a2a",},
                {start: 5, length: 8, job: 2, name: "something", color: "#ffee4c",},
                {start: 20, length: 5, job: 1, name: "quicksand", color: "#2a2a2a",},
                {start: 27, length: 12, job: 2, name: "something", color: "#ffee4c",},
            ],
            [
                {start: 0, length: 6, job: 1, name: "quicksand", color: "#2a2a2a",},
                {start: 20, length: 5, job: 1, name: "quicksand", color: "#2a2a2a",},
                {start: 27, length: 12, job: 2, name: "something", color: "#ffee4c",},
            ],
            [
                {start: 6, length: 5, job: 1, name: "quicksand", color: "#2a2a2a",},
                {start: 14, length: 8, job: 2, name: "something", color: "#ffee4c",},
                {start: 22, length: 5, job: 1, name: "quicksand", color: "#2a2a2a",},
                {start: 30, length: 12, job: 2, name: "something", color: "#ffee4c",},
            ],
        ]
    }
    /*
        queueData format (tentative)
        {
            currentTime: int, // how long the scheduler has been running.
            data: [
                [ // first queue
                    jobBlock, jobBlock, jobBlock
                ],
                [ // second queue
                    jobBlock, jobBlock
                ],
                [ // third queue
                    jobBlock, jobBlock, jobBlock, jobBlock, jobBlock
                ],
            ]
        }

        jobBlock format: 
        {
            start: float, (job start time)
            length: float,
            job: int (job's id)
            name: string (job's name?)
            color: string (hex value)
        }
        
    */
    return (
        <div id="graph" className="flex flex-col">
            { data.queues.map((queue, index) => { // each queue
                return (
                    <div key={`${index}`} className="border border-gray-400 w-4/5">
                        { queue.map((jobRun, subIdx) => { // each jobBlock
                            return <span className="pl-5 border border-red-300" style={{width: `calc(100% - )`}} key={`${jobRun.name}-${index}-${subIdx}`}>{ jobRun.name }</span>
                        }) }
                        <br/>
                    </div>
                )
            }) }
            The queue graph
        </div>
    )
}

export default QueueGraph