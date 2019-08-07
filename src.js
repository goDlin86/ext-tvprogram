import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import 'moment/locale/ru'

import 'babel-polyfill'

moment.locale('ru')

const channels = ['850', '977', '2060', '1173']
const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]
const mins = [0, 10, 20, 30, 40, 50]

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

            let programTV = [[],[],[],[]]
            datas.map((tv, i) => {
                tv.schedule[0].event.current.map(cur => {
                    const time = cur.start
                    const title = [cur.name, cur.episode_title].join(" ")
                    const url = 'https://tv.mail.ru' + cur.url

                    const hour = parseInt(time.split(":")[0])
                    const min = parseInt(time.split(":")[1])

                    programTV[i].push({ time, title, url, hour, min })
                })
            })
            const program = hours.map((hour) => {
                return { hour, programs: programTV.map((tv) => tv.filter((item) => item.hour == hour)) }
            })

            this.setState({ program })

        } catch (error) {
            console.log(error)
        }
    }
    setDate(i) {
        this.setState({ day: i, date: moment().add(i, 'd'), program: [] }, this.fetchData)
    }
    printTimeline() {
        const { program, day } = this.state

        const h = day == 0 ? moment().hour() : 5
        const m = day == 0 ? moment().minute() : 0
        const lineStyle = { top: m/60 * 100 + '%' }
        
        return program.map(({ hour, programs }) => {
            if (programs.reduce((acc, cur) => acc + cur.length, 0) > 0) {
                const minPrograms = mins.map((m) => 
                    programs.map((p) => 
                        p.filter((item) => Math.floor(item.min/10)*10 == m)
                    )
                )

                return (
                    <div className="hour" key={hour}>
                        {hour == h && <div className="line" style={lineStyle}>{hour + ":" + (m < 10 ? "0" : "") + m}</div>}
                        <div className="timeline">{(hour < 10 && "0") + hour + ":00"}</div>
                        <div className="programs">
                            {minPrograms.map((p) =>
                                p.map((tv, j) => 
                                    <div key={channels[j]}>
                                        {tv && tv.length > 0 && tv.map((item, i) => 
                                            <a className="item" href={item.url} target="_blank" key={i}>
                                                <span className="time">{item.time + ' '}</span>
                                                <span className={day == 0 && i == 0 ? "title cur" : "title"}>{item.title}</span>
                                            </a>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )
            }
        })     
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
                    {this.printTimeline()}
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('tv'))