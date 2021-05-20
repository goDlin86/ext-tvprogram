import React from 'react'
import img1 from '../img/1.png'
import img2 from '../img/2.jpeg'
import img3 from '../img/3.png'
import img4 from '../img/4.png'
import img5 from '../img/5.png'

const Channels = () => {
    return (
        <div className="channels">
            <div></div>
            <div><img src={img1} /></div>
            <div><img src={img2} /></div>
            <div><img src={img3} /></div>
            <div><img src={img4} /></div>
            <div><img src={img5} /></div>
        </div>
    )
}

export default Channels