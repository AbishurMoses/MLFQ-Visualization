import Button from '@mui/material/Button';

const Job = (props) => {
    const { onData } = props

    const jobIdBtn = () => {
        const value = props.value.id
        onData(value, props.value.name)
    }

    return (
        <div className="job">
            <div className="btn-container">
                <Button className="delete-btns" variant="contained" onClick={jobIdBtn}>X</Button>
            </div>
            <div className="job-content">
                <p>Name: {props.value.name}</p>
                <p>Length: {props.value.length}</p>
            </div>
        </div>
    )
}

export { Job }