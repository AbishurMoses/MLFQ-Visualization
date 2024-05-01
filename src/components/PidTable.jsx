import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const PidTable = (props) => {
    const { pidData } = props;

    /* pidData structure:
        [
            {pid: 2, name: "Arc", status: "running", queue: 2, allotment: 1.2},
            {pid: 3, name: "Microsoft Word", status: "blocked", queue: 1, allotment: 3.4},
            {pid: 6, name: "Telegram", status: "ready", queue: 3, allotment: 3.1},
        ]
    */

    return (
        <Paper elevation={5} className="table-cols w-1/2 max-h-full h-max p-2 overflow-hidden" sx={{backgroundColor: 'gray'}}>
            <Typography component="h2" variant="h5" className="pb-2">
                Process Control Block
            </Typography>
            <TableContainer className="max-h-full" sx={{backgroundColor: 'beige'}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>PID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Queue</TableCell>
                            <TableCell>Allotment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { pidData.sort((a, b) => a.pid - b.pid).map(process => {
                            return (
                                <TableRow key={process.pid}>
                                    <TableCell>{process.pid}</TableCell>
                                    <TableCell>{process.name}</TableCell>
                                    <TableCell>{process.status}</TableCell>
                                    <TableCell>{process.queue}</TableCell>
                                    <TableCell>{process.allotment} ms</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}

export default PidTable;