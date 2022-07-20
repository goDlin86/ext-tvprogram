import React from 'react'

const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]

const Days = ({ minHour }) => {
    return (
        <div className='row timeline'>
            {hours.slice(hours.findIndex(el => el == minHour)).map(h => (
                <>
                    <div>{h + ':00'}</div>
                    <div>{h + ':30'}</div>
                </>
            ))}
        </div>
    )
}

export default Days