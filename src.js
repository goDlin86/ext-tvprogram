import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import 'moment/locale/ru'

import 'babel-polyfill'

moment.locale('ru')

const channels = ['0', '850', '977', '2060', '1173']
const hours = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4]

const baseUrl = 'https://tv.mail.ru/ajax/channel/?region_id=24&channel_type=&channel_id='
const urls = [...channels.slice(1).map(channel => baseUrl + channel + '&date=')]

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

            let program = [[],[],[],[]]
            datas.map((tv, i) => {
                tv.schedule[0].event.current.map(cur => {
                    const time = cur.start
                    const title = [cur.name, cur.episode_title].join(" ")
                    const url = 'https://tv.mail.ru' + cur.url

                    const hour = time.split(":")[0]

                    program[i].push({ time, title, url, hour })
                })
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
        const { program } = this.state
        
        return hours.map((hour) => 
            channels.map((channel, j) => 
                <div key={channel}>
                    {j == 0 && <div className='timeline' key={hour}></div>}
                    {j > 0 && program[j-1] && program[j-1].length > 0 && program[j-1].filter(item => item.hour == hour).map((item, i) => 
                        <a className="item" href={item.url} target="_blank" key={i}>
                            <span className="time">{item.time + ' '}</span>
                            <span className={this.state.day == 0 && program[j-1][0].time == item.time ? "title cur" : "title"}>{item.title}</span>
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