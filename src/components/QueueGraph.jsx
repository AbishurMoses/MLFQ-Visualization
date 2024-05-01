import { Card, Paper, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";

const QueueGraph = (props) => {
    const { queueData } = props;

    useEffect(() => { // TODO delete me
        console.log('queueData:')
        console.dir(queueData)
    }, [queueData])
    // console.log('data')
    // console.dir(queueData)
    const data = { // TEMPORARY, delete this eventually
        currentTime: 50,
        queues: [
            [
                // {start: , length: , job: , name: , color: ,},
                { start: 0, length: 5, job: 1, name: "quicksand", color: "#2a2a2a", },
                { start: 5, length: 8, job: 2, name: "something", color: "#ffee4c", },
                { start: 20, length: 5, job: 1, name: "quicksand", color: "#2a2a2a", },
                { start: 27, length: 12, job: 2, name: "something", color: "#ffee4c", },
            ],
            [
                { start: 0, length: 6, job: 1, name: "quicksand", color: "#2a2a2a", },
                { start: 20, length: 5, job: 1, name: "quicksand", color: "#2a2a2a", },
                { start: 27, length: 12, job: 2, name: "something", color: "#ffee4c", },
            ],
            [
                { start: 6, length: 5, job: 1, name: "quicksand", color: "#2a2a2a", },
                { start: 14, length: 8, job: 2, name: "something", color: "#ffee4c", },
                { start: 22, length: 5, job: 1, name: "quicksand", color: "#2a2a2a", },
                { start: 30, length: 12, job: 2, name: "something", color: "#ffee4c", },
            ],
        ]
    }
    const queueGap = 15;
    const queueHeight = 32;
    const queueContainerPL = 16;
    const queueContainerPB = 16;

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

    const LightTableCell = styled(TableCell)({
        color: 'white'
    })

    const buildTitle = (jobRun) => {
        return (<div>
            <Typography variant="body1" component="h3" className="text-center">{jobRun.name}</Typography>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <LightTableCell sx={{ color: 'white' }}>ID</LightTableCell>
                        <LightTableCell align="right">{jobRun.job}</LightTableCell>
                    </TableRow>
                    <TableRow>
                        <LightTableCell>Start</LightTableCell>
                        <LightTableCell align="right">{jobRun.start}</LightTableCell>
                    </TableRow>
                    <TableRow>
                        <LightTableCell>Stop</LightTableCell>
                        <LightTableCell align="right">{jobRun.start + jobRun.length}</LightTableCell>
                    </TableRow>
                    <TableRow>
                        <LightTableCell>Length</LightTableCell>
                        <LightTableCell align="right">{jobRun.length}</LightTableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>);
    }

    return (
        <Paper id="graph" elevation={8} sx={{backgroundColor: '#2a2a2a'}} className="flex">
            <div className="w-4/5 h-max pb-4 pl-4 flex flex-col justify-center items-center relative font-semibold" style={{gap: `${queueGap}px`, padding: `0 0 ${queueContainerPB}px ${queueContainerPL}px`}}>
                { queueData.queues.map((_, idx) => { // y-axis labels
                    let topPosition = (idx * queueGap) + (idx * queueHeight); 
                    return <p key={`queue-label-${idx+1}`} className="absolute flex items-center -left-4 text-white" style={{top: `${topPosition}px`, height: `${queueHeight}px`}}>Q{idx + 1}</p>
                })}
                { queueData.queues.map((queue, index) => { // each queue
                    
                    return (
                        <Paper key={`${index}`} elevation={3} className="w-full relative flex items-center" style={{height: `${queueHeight}px`}}>
                            { queue.length !== 0 &&
                            queue.map((jobRun, subIdx) => {
                                const width = (jobRun.length / queueData.currentTime) * 100; // width of the job in the queue, expressed as a percentage
                                const left =  (jobRun.start / queueData.currentTime) * 100; // position item moves left
                                return (<Tooltip 
                                            arrow title={buildTitle(jobRun)} 
                                            key={`${jobRun.name}-${index}-${subIdx}`}
                                            componentsProps={{
                                                tooltip: {
                                                sx: {
                                                    bgcolor: '#2a2a2a',
                                                    '& .MuiTooltip-arrow': {
                                                        color: '#2a2a2a',
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        <Card className="inline-block absolute h-4/5" style={{ width: `${width}%`, left: `${left}%`, backgroundColor: `${jobRun.color}` }} key={`${jobRun.name}-${index}-${subIdx}`}></Card>
                                    </Tooltip>)
                                })}
                        </Paper>
                    )
                })}
                {/* x-axis */}
                <div className="absolute flex justify-between -bottom-4 font-semibold text-white" style={{ width: `calc(100% - ${queueContainerPL}px)` }}>
                    <p>{0}</p>
                    <p>{(queueData.currentTime / 3).toFixed(1)} ms</p>
                    <p>{(queueData.currentTime * 2 / 3).toFixed(1)} ms</p>
                    <p>{(queueData.currentTime).toFixed(1)} ms</p>
                </div>
            </div>
        </Paper>
    )
}

export default QueueGraph