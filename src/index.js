import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'

import Days from './components/days'
import Channels from './components/channels'
import Timeline from './components/timeline'
import Schedule from './components/schedule'
import './style.css'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

const channels = ['850', '977', '2060', '1395', '1671']

const baseUrl = 'https://tv.mail.ru/ajax/channel/?region_id=24&channel_type=&channel_id='
const urls = [...channels.map(channel => baseUrl + channel + '&date=')]

const App = () => {
    const [day, setDay] = useState(0)
    const [program, setProgram] = useState([])
    const [date, setDate] = useState(dayjs())
    const [minHour, setMinHour] = useState(0)

    const schedule = useRef(null)
        
    useEffect(() => {
        fetchData()
    }, [day])
    
    const fetchData = async () => {
        try {
            const datas = await Promise.all(
                urls.map(url => fetch(url + date.format("YYYY-MM-DD")).then(response => response.json()))
            )

            let programNew = []
            for (let i = 0; i < channels.length; i++) {
                programNew.push([])                
            }
            datas.map((tv, i) => {
                tv.schedule[0].event.current.map(cur => {
                    const time = cur.start
                    const title = [cur.name, cur.episode_title].join(" ")
                    const url = "https://tv.mail.ru" + cur.url

                    let hour = parseInt(time.split(":")[0])
                    if (hour < 5) hour += 24
                    const min = parseInt(time.split(":")[1])

                    programNew[i].push({ time, title, url, hour, min })
                })
            })
            programNew.map(p => 
                p.map((item, i, program) => {
                    item.dur = program[i+1] ? (program[i+1].hour-item.hour)*60+(program[i+1].min-item.min) : (29-item.hour)*60-item.min
                })
            )
            
            setMinHour(Math.min(...programNew.map(p => p[0].hour)))

            setProgram(programNew)

            const scrollLeft = Math.min(...programNew.map(p => p[0].hour * 100 + p[0].min)) % 100 * 5
            schedule.current.scrollLeft = scrollLeft

        } catch (error) {
            console.log(error)
        }
    }

    const changeDate = (i) => {
        setDate(dayjs().add(i, "day"))
        setProgram([])
        setDay(i)
    }        
        
    return (
        <div>
            <Days day={day} changeDate={changeDate} />

            <div className='scheduleContainer'>
                <Channels />
                <div className='schedule' ref={schedule}>
                    <Timeline minHour={minHour} />
                    <Schedule program={program} day={day} minHour={minHour} />
                </div>
            </div>
        </div>
    )
    
}

ReactDOM.render(<App />, document.getElementById('tv'))