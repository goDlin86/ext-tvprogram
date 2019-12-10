import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import 'moment/locale/ru'

import 'babel-polyfill'

moment.locale('ru')

const channels = ['850', '977', '2060', '1173']
const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]

const baseUrl = 'https://tv.mail.ru/ajax/channel/?region_id=24&channel_type=&channel_id='
const urls = [...channels.map(channel => baseUrl + channel + '&date=')]

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            day: 0,
            date: moment(),
            program: [],
            minHour: 0
        }
    }
    componentDidMount() {
        this.fetchData()
    }
    async fetchData() {
        try {
            const datas = await Promise.all(
                urls.map(url => fetch(url + this.state.date.format("YYYY-MM-DD")).then(response => response.json()))
            )

            let programNew = [[],[],[],[]]
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
            const minHour = Math.min(...programNew.map(p => p[0].hour))

            let program = programNew

            this.setState({ program, minHour })

        } catch (error) {
            console.log(error)
        }
    }
    setDate(i) {
        this.setState({ day: i, date: moment().add(i, "d"), program: [] }, this.fetchData)
    }
    printSchedule() {
        const { program, day, minHour } = this.state

        return program.map((p, i) => 
            p.map((item, k) => {
                const row = (item.hour - minHour)*12 + Math.floor(item.min/5) + 1
                const span = row + Math.floor(item.dur/5)
                const style = { gridColumn: i+2, gridRow: row + " / " + span }
                let heightLine = {}
                if (day == 0 && k == 0) {
                    let hour = moment().hour() 
                    if (hour < 5) hour += 24
                    const min = moment().minute()

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
        )
    }
    render() {
        const { day, minHour } = this.state

        const days = []
        for (let i = 0; i < 7; i++) {
            days.push(<div className={day == i ? " active" : "" } onClick={this.setDate.bind(this, i)} key={i}>
                {moment().add(i, "d").format("ddd")}<br/>{moment().add(i, "d").format("DD MMM")}
            </div>)
        }

        let styleLine = {}
        if (day == 0) {
            let hour = moment().hour() 
            if (hour < 5) hour += 24
            const min = moment().minute()

            const top = ((hour - minHour)*12 + Math.floor(min/5) + min%5/5)*20

            styleLine.top = top + "px"
        }
        
        
        return (
            <div>
                <header>
                    <div className="days">
                        {days}
                    </div>

                    <div className="channels">
                        <div></div>
                        <div className="fchannel">Первый</div>
                        <div className="schannel">Россия</div>
                        <div className="mchannel">МатчТВ</div>
                        <div className="apchannel">AnimalPlanet</div>
                    </div>
                </header>

                <div className="schedule">
                    {hours.slice(hours.findIndex(el => el == minHour)).map((h, i) => {
                        const style = { gridColumn: 1, gridRow: i*12+1 }
                        return <div style={style}>{h + " -"}</div>
                    })}
                    <div className="line" style={styleLine}></div>
                    {this.printSchedule()}
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('tv'))