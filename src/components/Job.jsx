// import { useState, useEffect } from 'react'
import Button from '@mui/material/Button';

const Job = (props) => {
    const { value, onData} = props
    // const [deletionId, setDeletionId] = useState(0)

    const jobIdBtn = () => {
        const value = props.value.id
        console.log(value)
        // setDeletionId(value)
        onData(value)
    }

    // useEffect(() => {
    //     console.log("DeletionId as been update to ", deletionId)
    // }, [deletionId])

    return (
        <div className="job">
            <Button className="delete-btns" variant="contained" onClick={jobIdBtn}>X</Button>
            <p>Name: {props.value.name}</p>
            <p>Length: {props.value.length}</p>
        </div>
    )
}

export default Job