import React from 'react'

const Channels = () => {
    return (
        <div className='channels'>
            {[...Array(7).keys()].map(d => <div></div>)}
        </div>
    )
}

export default Channels