import { Paper, Table, TableCell, TableContainer, TableRow, Typography } from "@mui/material";

const StatsTable = (props) => {
    const { statsTableData } = props

    // "data" is the same structure as "statsQueueData."  It's just sample data.
    /* statsTableData structure:
        {
            avgResponse: 0.014,
            avgTurnaround: 0.8,
            avgJobLength: 1.2,
            timeInContextSwitching: 4.5,
        }
    */

    return (
        // Scheduler Run Stats
        <Paper elevation={5} className="table-cols w-1/3 max-h-full h-max p-2 overflow-hidden" sx={{backgroundColor: 'gray'}}>
            <Typography component="h2" variant="h5" className="pb-2">
                Job Run Stats
            </Typography>
            <TableContainer className="max-h-full" sx={{backgroundColor: 'beige'}}>
                <Table stickyHeader>
                    <TableRow>
                        <TableCell>Avg Response Time:</TableCell>
                        <TableCell align="right">{statsTableData.avgResponse.toFixed(2)} ms</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Avg Turnaround Time:</TableCell>
                        <TableCell align="right">{statsTableData.avgTurnaround.toFixed(2)} ms</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Avg Job Length:</TableCell>
                        <TableCell align="right">{statsTableData.avgJobLength.toFixed(2)} ms</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Total Time in Context Switching:</TableCell>
                        <TableCell align="right">{statsTableData.timeInContextSwitching.toFixed(2)} ms</TableCell>
                    </TableRow>
                </Table>
            </TableContainer>
        </Paper>
    )
}

export default StatsTable;