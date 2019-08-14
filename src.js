import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import 'moment/locale/ru'

import 'babel-polyfill'

moment.locale('ru')

const channels = ['850', '977', '2060', '1173']
const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]
const mins = [0, 20, 40]

const baseUrl = 'https://tv.mail.ru/ajax/channel/?region_id=24&channel_type=&channel_id='
const urls = [...channels.map(channel => baseUrl + channel + '&date=')]

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            day: 0,
            date: moment(),
            program: []
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

            let programNew = []
            datas.map((tv, i) => {
                tv.schedule[0].event.current.map(cur => {
                    const time = cur.start
                    const title = [cur.name, cur.episode_title].join(" ")
                    const url = 'https://tv.mail.ru' + cur.url

                    const hour = parseInt(time.split(":")[0])
                    const min = parseInt(time.split(":")[1])

                    programNew.push({ channel: i, time, title, url, hour, min })
                })
            })
            let program = []
            const hour = moment().hour()
            const min = moment().minute()
            hours.map((h) =>
                mins.map((m) => {
                    const items = programNew.filter((item) => item.hour == h && Math.floor(item.min/20)*20 == m)
                    const now = this.state.day == 0 && hour == h && Math.floor(min/20)*20 == m
                    const style = { top: (min - m)/20 * 100 + '%' }
                    if (items.length > 0)
                        program.push([{ time: (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m, now, style }, ...items])
                })
            )
            // const program = programNew.sort((a, b) => {
            //     const h1 = a.hour < 5 ? a.hour + 24 : a.hour
            //     const m1 = a.min

            //     const h2 = b.hour < 5 ? b.hour + 24 : b.hour
            //     const m2 = b.min

            //     let results = h1 < h2 ? -1 : h1 > h2 ? 1 : 0

            //     if (results === 0) {
            //         results = m1 < m2 ? -1 : m1 > m2 ? 1 : 0
            //     }
               
            //     return results
            // })

            this.setState({ program })

        } catch (error) {
            console.log(error)
        }
    }
    setDate(i) {
        this.setState({ day: i, date: moment().add(i, 'd'), program: [] }, this.fetchData)
    }
    printSchedule() {
        const { program, day } = this.state

        return program.map((p, i) => 
            p.map((item, k) => {
                const style = { gridColumn: k == 0 ? 1 : item.channel+2, gridRow: i+1, position: 'relative' }

                return (
                    <div key={k} style={style}>
                        {k == 0 && <div className="timeline">{item.time}</div>}
                        {k == 0 && item.now && <div className="line" style={item.style}></div>}
                        {k > 0 && <a className="item" href={item.url} target="_blank" key={k}>
                            <span className="time">{item.time + ' '}</span>
                            <span className={day == 0 && i == 0 ? "title cur" : "title"}>{item.title}</span>
                        </a>}
                    </div>
                )
            })
        )
    }
    render() {
        const { day } = this.state

        const days = []
        for (let i = 0; i < 7; i++) {
            days.push(<div className={day == i ? " active" : "" } onClick={this.setDate.bind(this, i)} key={i}>
                {moment().add(i, 'd').format("ddd")}<br/>{moment().add(i, 'd').format("DD MMM")}
            </div>)
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
                    {this.printSchedule()}
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('tv'))