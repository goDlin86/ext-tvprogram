import React from 'react'
import dayjs from 'dayjs'

const Schedule = ({ program, day, minHour }) => {
    const styleLine = {}

    if (day == 0) {
        let hour = dayjs().hour()
        if (hour < 5) hour += 24
        const min = dayjs().minute()
        styleLine.left = ((hour - minHour) * 60 + min) * 5 + 'px'
    }

    return (
        <>
            <div className="line" style={styleLine}></div>

            {program.map((p, i) => (
                <div className='row'>
                    {p.map((item, k) => {
                        const style = { width: item.dur * 5 + 'px' }
                        const styleLine = {}
                        if (k == 0) {
                            const marginLeft = ((item.hour - minHour) * 60 + item.min) * 5 + 'px'
                            style.marginLeft = marginLeft

                            if (day == 0) {
                                let hour = dayjs().hour()
                                if (hour < 5) hour += 24
                                const min = dayjs().minute()
                                styleLine.width = ((hour - item.hour) * 60 + min - item.min) * 5 + 'px'
                            }
                        }

                        return (
                            <div className='program' style={style} key={k + i*10}>
                                <a className='item' href={item.url} target='_blank'>
                                    <div className='time'>{item.time}</div>
                                    <div className={day == 0 && k == 0 ? 'title cur' : 'title'}>{item.title}</div>
                                </a>
                                {day == 0 && k == 0 && <div className='line' style={styleLine}></div>}
                            </div>
                        )
                    })}
                </div>
            ))}
        </>
    )
}

export default Schedule