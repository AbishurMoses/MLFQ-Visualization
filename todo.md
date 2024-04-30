# Data Structures:
We need to represent a MLFQ scheduler, consisting of a number of queues who run tasks in round robin. This requires us to represent:
- Machine Cycles (perhaps using `setInterval()`?)
- Jobs
    - Progress
    - Blocked/Ready/Running
    - I/O
- Queue
etc...

## A single queue running round-robin
I will begin with a single queue running round-robin

```
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
            "start": int,
            "length": int,
            "job": int (job's id)
            "name": string (job's name?)
            "color": string (hex value)
        }
        Note: jobBlocks can be empty space, meaning nothing is going on in that queue. 
        In those cases, we can just use a special id like -1 to indicate it's empty space. 
        
    */
```

## A MLFQ containing an array of queues
- Time between priority boosts
- Number of queues
- Track how long job has been in current queue
- Track time since last priority_boost
- 

## Job block:
- Start time
- Run time
- Job color
- 

## Jobs (Abishur):
- demote()
- Start
