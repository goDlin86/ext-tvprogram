import React from 'react'
import dayjs from 'dayjs'

const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]

const Schedule = ({ program, day, minHour }) => {
    let styleLine = {}
    if (day == 0) {
        let hour = dayjs().hour() 
        if (hour < 5) hour += 24
        const min = dayjs().minute()

        const top = ((hour-minHour)*12 + Math.floor(min/5) + min%5/5)*20
        styleLine.top = top + "px"
    }

    return (
        <div className='schedule'>
            {hours.slice(hours.findIndex(el => el == minHour)).map((h, i) => (
                <div style={{ gridColumn: 1, gridRow: i*12+1 }} key={i}>{h + " -"}</div>
            ))}

            <div className="line" style={styleLine}></div>

            {program.map((p, i) => 
                p.map((item, k) => {
                    const row = (item.hour - minHour)*12 + Math.floor(item.min/5) + 1
                    const span = row + Math.floor(item.dur/5)
                    const style = { gridColumn: i+2, gridRow: row + " / " + span }
                    let heightLine = {}
                    if (day == 0 && k == 0) {
                        let hour = dayjs().hour() 
                        if (hour < 5) hour += 24
                        const min = dayjs().minute()

                        const height = ((hour - item.hour)*60 + min - item.min)/item.dur*100

                        heightLine.height = height + "%"
                    }

                    return (
                        <div key={k*i} className="program" style={style}>
                            <a className="item" href={item.url} target="_blank">
                                <div className="time">{item.time}</div>
                                <div className={day == 0 && k == 0 ? "title cur" : "title"}>{item.title}</div>
                            </a>
                            {day == 0 && k == 0 && <div className="line" style={heightLine}></div>}
                    </div>
                    )
                })
            )}
        </div>
    )
}

export default Schedule