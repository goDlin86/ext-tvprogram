import React, { useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import Days from './components/days'
import Timeline from './components/timeline'
import Schedule from './components/schedule'
import './style.css'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'
dayjs.locale('ru')

import * as cheerio from 'cheerio'

const channels = ['850', '977', '2060', '1395', '1671', '3161', '3218', '1091', '3215', '3296', '1836', '919']

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
                urls.map(url => fetch(url + date.format('YYYY-MM-DD')).then(response => response.json()))
            )
            console.log(datas)

            let programNew = []
            for (let i = 0; i < channels.length; i++) {
                programNew.push([])                
            }
            datas.map((tv, i) => {
                tv.schedule[0].event.current.map(cur => {
                    const time = cur.start
                    const title = [cur.name, cur.episode_title].join(' ')
                    const url = 'https://tv.mail.ru' + cur.url

                    let hour = parseInt(time.split(":")[0])
                    if (hour < 5) hour += 24
                    const min = parseInt(time.split(":")[1])

                    programNew[i].push({ time, title, url, hour, min })
                })
            })

            setMinHour(Math.min(...programNew.map(p => p[0] ? p[0].hour : 29)))

            //add okko
            const okko = await fetch('https://okko.tv/tv_program/540281728/' + date.format('MMMM_DD'))
            const body = await okko.text()
            const $ = cheerio.load(body)

            const okkotv = $('ul.__2JxkwQL6 > li').toArray().map(li => {
                const div = $(li).children('div')
                const div1 = $(div[1]).children('div')
                const time = $(div[0]).text()
                let hour = parseInt(time.split(":")[0])
                if (hour < 5) hour += 24
                const min = parseInt(time.split(":")[1])
                return {
                    time,
                    title: $(div1[0]).text(),
                    url: $(div1[1]).children('div').children('a').attr('href'),
                    hour,
                    min
                }
            })
            programNew.push(okkotv)

            programNew.map(p => 
                p.map((item, i, program) => {
                    item.dur = program[i+1] ? (program[i+1].hour-item.hour)*60+(program[i+1].min-item.min) : (29-item.hour)*60-item.min
                })
            )

            setProgram(programNew)

            const scrollLeft = Math.min(...programNew.map(p => p[0] ? p[0].hour * 100 + p[0].min : 2900)) % 100 * 5
            schedule.current.scrollLeft = scrollLeft

        } catch (error) {
            console.log(error)
        }
    }

    const changeDate = (i) => {
        setDate(dayjs().add(i, 'day'))
        setProgram([])
        setDay(i)
    }        
        
    return (
        <div>
            <Days day={day} changeDate={changeDate} />

            <div className='scheduleContainer' ref={schedule}>
                <div style={{ display: 'inline-block' }}>
                    <div className='scheduleGrid'>
                        <Timeline minHour={minHour} />
                        <Schedule program={program} day={day} minHour={minHour} />
                    </div>
                </div>
            </div>
        </div>
    )
    
}

createRoot(document.getElementById('tv')).render(<App />)