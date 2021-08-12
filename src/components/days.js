import React from 'react'
import dayjs from 'dayjs'

const Days = ({ day, changeDate }) => {
    return (
        <div className='days'>
            {[...Array(7).keys()].map((i) => (
                <div className={day == i ? ' active' : '' } onClick={() => changeDate(i)} key={i}>
                    {dayjs().add(i, 'day').format('dddd')}<br/>{dayjs().add(i, 'day').format('DD MMM')}
                </div>
            ))}
        </div>
    )
}

export default Days