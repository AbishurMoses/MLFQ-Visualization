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
