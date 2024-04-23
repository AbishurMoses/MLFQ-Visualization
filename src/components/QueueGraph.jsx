import { Card, Paper, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/system";

const QueueGraph = (props) => {
    const { queueData } = props;
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

    const LightTableCell = styled(TableCell)({
        color: 'white'
    })

    const buildTitle = (jobRun) => {
        return (<div>
                <Typography variant="body1" component="h3" className="text-center">{jobRun.name}</Typography>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <LightTableCell sx={{color: 'white'}}>ID</LightTableCell>
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
        <Paper id="graph" elevation={8} className="flex flex-col gap-4">
            { data.queues.map((queue, index) => { // each queue
                return (
                    <Paper key={`${index}`} elevation={3} className="border border-gray-400 w-4/5 relative h-8 flex items-center">
                        { 
                        queue.map((jobRun, subIdx) => {
                            const width = (jobRun.length / data.currentTime) * 100; // width of the job in the queue, expressed as a percentage
                            const left =  (jobRun.start / data.currentTime) * 100; // position item moves left
                            // const title = ;
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
                                        <Card className="pl-5 inline-block absolute h-4/5" style={{width: `${width}%`, left: `${left}%`, backgroundColor: `${jobRun.color}`}} key={`${jobRun.name}-${index}-${subIdx}`}></Card>
                                    </Tooltip>)
                        }) }
                    </Paper>
                )
            }) }
            The queue graph
        </Paper>
    )
}

/*
    TODO: 
    - Maybe make the spans MUI cards or some other surface
    - Add vertical/horizontal axes
*/
export default QueueGraph