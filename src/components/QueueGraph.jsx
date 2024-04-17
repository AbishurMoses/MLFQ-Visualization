
const QueueGraph = (props) => {
    const { queueData } = props
    /*
        queueData format (tentative)
        [
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

        jobBlock format: 
        {
            "length": int,
            "job": int (job's id)
            "name": string (job's name?)
            "color": string (hex value)
        }
        Note: jobBlocks can be empty space, meaning nothing is going on in that queue. 
        In those cases, we can just use a special id like -1 to indicate it's empty space. 
        
    */
    return (
        <div id="graph">
            The queue graph
        </div>
    )
}

export default QueueGraph