import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import 'moment/locale/ru'

import 'babel-polyfill'

moment.locale('ru')

const channels = ['850', '977', '2060', '1173']

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
    fetchData() {
        channels.map(async (channel, i) => {
            const url = "https://tv.mail.ru/ajax/channel/?region_id=24&channel_type=&channel_id=" + channels[i] + "&date=" + this.state.date.format("YYYY-MM-DD")

            const res = await fetch(url)
            const tv = await res.json()

            let program = []
            tv.schedule[0].event.current.map(cur => {
                const time = cur.start
                const title = [cur.name, cur.episode_title].join(" ")
                const url = "https://tv.mail.ru" + cur.url

                let period = "morning"
                const timePeriod = time.split(":")[0]
                if (timePeriod >= 12 && timePeriod < 20)
                    period = "daytime"
                else if (timePeriod >= 20 || timePeriod < 5)
                    period = "evening"

                program.push({ time, title, url, period })
            })

            let p = this.state.program.slice()
            p[i] = program
            this.setState({ program: p })
        })
    }
    setDate(i) {
        this.setState({ day: i, date: moment().add(i, 'd'), program: [] }, this.fetchData)
    }
    getPeriodProgram(period) {
        const { program } = this.state
        return (
            channels.map((channel, j) => 
                <div key={channel}>
                    {program[j] && program[j].length == 0 && '...'}
                    {program[j] && program[j].length > 0 && program[j].filter(item => item.period == period).map((item, i) => 
                        <a className="item" href={item.url} target="_blank" key={i}>
                            <span className="time">{item.time + ' '}</span>
                            <span className={this.state.day == 0 && program[j][0].time == item.time ? "title cur" : "title"}>{item.title}</span>
                        </a>
                    )}
                </div>
            )
        )
    }
    render() {
        const { day, program } = this.state

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
                        <div className="fchannel">Первый</div>
                        <div className="schannel">Россия</div>
                        <div className="mchannel">МатчТВ</div>
                        <div className="apchannel">AnimalPlanet</div>
                    </div>
                </header>

                <div className="schedule">
                    {this.getPeriodProgram("morning")}
                    {this.getPeriodProgram("daytime")}
                    {this.getPeriodProgram("evening")}                    
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('tv'))