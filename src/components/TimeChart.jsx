import { Paper, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts";
import { useEffect, useState } from "react";

const TimeChart = (props) => {
    const { pieChartData, chartColors } = props;
    const [data, setData] = useState([]);
    
    // const chartColors = [
    //     '#af4d98', '#78c0e0', '#bd1e1e',
    //     '#3a5a40', '#ff7f51', '#fcf6b1',
    //     '#f7b32b', '#8447ff', '#7180ac',
    //     '#ff8cc6', '#d34e24', '#a2ad91',
    //     '#86cb92', '#694873', '#ffe3dc',
    //     '#f72c25', '#331e36', '#cd5d67',
    //     '#e9b872', '#c2efeb', '#d00000',
    //     '#686963', '#d6d1b1', '#ffb2e6'
    //   ];
    
    /*
        pieChartData format:

        {
            contextSwitches: 2.18, // time spent in context switches
            jobs: {
                job1Name: 1.9, // time the first job spent running
                job2Name: 4.11, // time the second job spent running
                job3Name: 0.91, // time the third job spent running
                ...
            }
        }

        "jobs" is an object that contains each of the jobs that have been run by the scheduler.
        For each job, the only data needed is the name of the job and then how long it spent
        running.
    */

    useEffect(() => {
        const tempData = [
            {value: pieChartData.contextSwitches, label: 'Context Switches'},
        ];

        Object.keys(pieChartData.jobs).map(jobName => {
            tempData.push({value: pieChartData.jobs[jobName], label: jobName})
        })
        console.log('chart colors')
        console.dir(chartColors)
        setData(prev => tempData);
    }, [pieChartData]);

    return (
        <Paper elevation={5} className="table-cols w-1/2 max-h-full h-max p-2 overflow-hidden" sx={{backgroundColor: 'gray'}}>
            <Typography component="h2" variant="h5" className="pb-2">
                Cumulative Job Lengths
            </Typography>
            <PieChart series={[{data}]} colors={chartColors} width={750} height={400} />
        </Paper>
    )
}

export default TimeChart;