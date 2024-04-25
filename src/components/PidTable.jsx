import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const PidTable = (props) => {
    const { tableQueueData } = props;

    // "data" is the same structure as "tableQueueData."  It's just sample data.
    const data = [ // TODO remove this, use real-time tableQueueData.
        // {pid: , name: , status: , queue: , allotment: }
        {pid: 2, name: "Arc", status: "running", queue: 2, allotment: 1.2},
        {pid: 3, name: "Microsoft Word", status: "blocked", queue: 1, allotment: 3.4},
        {pid: 6, name: "Telegram", status: "ready", queue: 3, allotment: 3.1},
        {pid: 5, name: "Calendar", status: "ready", queue: 3, allotment: 0.9},
        {pid: 8, name: "Microsoft Teams", status: "running", queue: 1, allotment: 2.4},
        {pid: 10, name: "Messages", status: "running", queue: 3, allotment: 1.9},
    ]

    return (
        <Paper elevation={5} className="table-cols w-1/2 h-full overflow-hidden" sx={{backgroundColor: 'gray'}}>
            <TableContainer className="max-h-full">
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
                        { data.map(process => {
                            return (
                                <TableRow key={process.pid}>
                                    <TableCell>{process.pid}</TableCell>
                                    <TableCell>{process.name}</TableCell>
                                    <TableCell>{process.status}</TableCell>
                                    <TableCell>{process.queue}</TableCell>
                                    <TableCell>{process.allotment}</TableCell>
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