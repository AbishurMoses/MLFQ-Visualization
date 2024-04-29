const Job = (props) => {
    const interactivity_values = {
        0: 'Low',
        1: 'Med',
        2: 'High'
    }

    console.log(props.id)

    return (
        <div className="job">
            <p>Length: {props.value.length}</p>
            <p>Interactivity: {props.value.interactivity}</p>
        </div>
    )
}

export default Job