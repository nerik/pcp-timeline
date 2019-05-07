import React, { Component, Fragment, useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
import { scaleTime } from 'd3-scale'
import cx from 'classnames'
import './App.css';

const START = dayjs(new Date(2017, 0, 1))
const END = dayjs(new Date(2017, 11, 31))
const COLUMN_WIDTH = 10

// const eventsOberverConfig = {
//   root: null, // avoiding 'root' or setting it to 'null' sets it to default value: viewport
//   // rootMargin: '-40% 0px -40% 0px',
//   // threshold: 0.5
// };
// const eventsObserver = new window.IntersectionObserver(entries => {
//   console.log(entries.map(e => [entries[0].target.getAttribute('data-id'), entries[0].isIntersecting]))
//   if (entries.length === 1 && entries[0].isIntersecting === true) {
//     Object.keys(eventRefs).forEach(k => {
//       const el = eventRefs[k]
//       el.classList.toggle('selected', false)
//     })
//     const el = entries[0].target
//     // const intersecting = entries[0].isIntersecting
//     el.classList.toggle('selected', true)
//     const index = parseInt(el.getAttribute('data-id'))
//     const r = index / 50
//     // console.log(r)
//   }
// }, eventsOberverConfig);


// const detailsObserverConfig = {
//   threshold: Array.from(Array(100).keys()).map(i => i/100)
// }
// console.log(detailsObserverConfig)
// const detailsObserver = new window.IntersectionObserver(entries => {
//   console.log(entries[0].intersectionRatio  )
// }, detailsObserverConfig)
// let detailsRef;


const Timeline = ({ events, rfmos }) => {
  /*
  componentDidMount() {
    console.log('mount')
    // console.log(eventRefs)
    // Object.keys(eventRefs).forEach(k => {
    //   const el = eventRefs[k]
    //   eventsObserver.observe(el)
    // })
    // detailsObserver.observe(detailsRef)

    const boundScroll = this.onScroll.bind(this)
    this.boundUpdateScroll = this.updateScroll.bind(this)
    window.addEventListener('scroll', boundScroll, true);
  }

  ticking = false

  updateScroll() {
    this.ticking = false;
    const cH = document.documentElement.clientHeight;
    const wH = window.innerHeight || 0;
    const middle = 60 + Math.max(cH, wH) / 2;
    
    let selectedEl;
    let minDelta = Number.POSITIVE_INFINITY
    Object.keys(eventRefs).forEach(k => {
      const el = eventRefs[k]
      el.classList.toggle('selected', false)
      const { top, bottom, height } = el.getBoundingClientRect()
      // console.log(top, bottom, height)
      const delta = Math.abs(middle - top)
      if (delta < minDelta) {
        selectedEl = el
      }
      minDelta = delta
      // console.log(delta)
    })

    if (selectedEl) {
      selectedEl.classList.toggle('selected', true)
    }
    // console.log
    
  }

  onScroll() {
    if (this.ticking === false) {
      this.ticking = true;
      window.requestAnimationFrame(this.boundUpdateScroll);
    }
  }

  render() {
// function App() {
//   // const refContainer = useRef(null);
*/
  // const eventRefs = {}
  // for (let i = 0; i < events.length; i++) {
  //   eventRefs[i] = useRef(null)
  // }
  // events.forEach((event, i) => {
  //   eventRefs[i] = useRef(null)
  // })

  const computeCoordinates = (events, rfmos) => {
    const scale = scaleTime()
      .domain([START.toDate(), END.toDate()])
      .range([0, 1])

    const toNormalized = date => scale(date)
    const toCoord = normalized => `${normalized * 100}%`
    const computeCoordsForType = items => {
      return items.map(item => {
        const startDate = item.start.toDate()
        const endDate = item.end.toDate()
        const startNormalized = toNormalized(startDate)
        const endNormalized = toNormalized(endDate)
        const heightNormalized = endNormalized - startNormalized
        const middleNormalized = startNormalized + heightNormalized / 2
        return {
          ...item,
          startNormalized,
          endNormalized,
          startCoord: toCoord(startNormalized),
          endCoord: toCoord(endNormalized),
          middleNormalized,
          middleCoord: toCoord(middleNormalized),
          height: toCoord(heightNormalized)
        }
      })
    }
    return {
      events: computeCoordsForType(events),
      rfmos: computeCoordsForType(rfmos),
    }
  }

  const computeScrollCoords = (timelineCoords, selected) => {
    const event = timelineCoords.events.find(e => e.id === selected)
    const y = (event) ? event.middleCoord : 0
    const currentRfmo = (event === undefined) ? null : timelineCoords.rfmos.find(rfmo => {
      if (event.middleNormalized > rfmo.startNormalized && event.middleNormalized < rfmo.endNormalized) {
        return true
      }
    })
    const currentRfmoId = (currentRfmo) ? currentRfmo.id : null
    return {
      y,
      currentRfmoId
    }
  }

  let refs = useRef(new Map()).current;

  const [selected, setSelected] = useState(null)

  const onScroll = () => {
    const cH = document.documentElement.clientHeight;
    const wH = window.innerHeight || 0;
    const middle = 60 + Math.max(cH, wH) / 2;
    let minDelta = Number.POSITIVE_INFINITY
    let selectedEvent;
    refs.forEach((el, key) => {
      el.classList.toggle('selected', false)
      const { top, bottom, height } = el.getBoundingClientRect()
      // console.log(top)
      const delta = Math.abs(middle - top)
      if (delta < minDelta) {
        selectedEvent = key
        minDelta = delta
      }
    })
    // selectedEl.classList.toggle('selected', true)
    setSelected(selectedEvent)
  }

  useEffect(() => {
    console.log('using effect')
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
    }
  }, [])

  const timelineCoords = useMemo(() => computeCoordinates(events, rfmos), [events, rfmos])
  const scrollCoords = useMemo(() => computeScrollCoords(timelineCoords, selected), [timelineCoords, selected])
  
  return (
    <Fragment>
      <div className="top">
        top
      </div>
      <div className="map">
        map
      </div>
      <div className="page">
        <div className="profile">
          <img alt="dummy" src={`http://placekitten.com/${Math.floor(100+Math.random()*200)}/${Math.floor(100+Math.random()*200)}`} />
          vessel profile
          <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        </div>
        <div className="timeline">
          <svg>
            <g className="eventsColumn">
              {timelineCoords.events.map(event => (
                <rect 
                  x={0} 
                  y={event.startCoord} 
                  width={COLUMN_WIDTH} 
                  height={event.height}
                  className={cx({ highlighted: event.id === selected } )}
                />
              ))}
            </g>
            <g className="rfmosColumn">
              {timelineCoords.rfmos.map(rfmo => (
                <rect 
                  x={0} 
                  y={rfmo.startCoord} 
                  width={COLUMN_WIDTH} 
                  height={rfmo.height}
                  className={cx({ highlighted: rfmo.id === scrollCoords.currentRfmoId } )}
                />
              ))}
            </g>
            <line
              x1="0%"
              x2="100%"
              style={{
                transform: `translateY(${scrollCoords.y})`

              }}
            />
          </svg>
        </div>
        <div className="detail" /* ref={(ref) => { detailsRef = ref }} */>
          {timelineCoords.events.map(event => {
            const c = cx('event', { highlighted: event.id === selected } )
            return (
            <div
              // ref={someRef}
              ref={inst => inst === null ? refs.delete(event.id) : refs.set(event.id, inst)}
              className={c} key={event.id}
            >
              Event {event.id}<br />
              {event.start.format('DD/MM/YYYY HH:mm')}<br />
              {event.end.format('DD/MM/YYYY HH:mm')}<br />
              {(event.id === selected) && <b>selected</b>}
            </div>
          )})}
        </div>
      </div>
    </Fragment>
  );
}

const generateMock = () => {
  const CONFIG = {
    rfmo: {
      duration: [1, 100, 'day']
    },
    event: {
      duration: [10, 300, 'hour'],
      interval: [0, 25, 'day']
    }
  }
  const allData = {}
  Object.keys(CONFIG).forEach(key => {
    const conf = CONFIG[key]
    const durationRange = conf.duration[1] - conf.duration[0]
    const intervalRange = (conf.interval) ? conf.interval[1] - conf.interval[0] : null
    const data = []
    let id = 0
    while (true) {
      const last = (data.length) ? data[data.length - 1] : null
      const duration = conf.duration[0] + Math.random() * durationRange
      const init = (last) ? last.end.clone() : START.clone()
      let start = init
      if (conf.interval) {
        const interval = conf.interval[0] + Math.random() * intervalRange
        start = start.add(interval, conf.interval[2])
      }
      let end = start.add(duration, conf.duration[2])
      const event = {
        id,
        start,
        end
      }
      if (end.isAfter(END)) {
        event.end = END.clone()
        data.push(event)
        break
      }
      data.push(event)
      id++
    }
    allData[key] = data
  })

  return allData
}

const App = () => {
  const [visible, setVisible] = useState(true)
  const allData = generateMock()
  console.log(allData)
  return <Fragment>
    {/* <button className="button" onClick={() => setVisible(visible => !visible)}>Set visible</button> */}
    {/* {visible && <Timeline />} */}
    <Timeline
      events={allData.event}
      rfmos={allData.rfmo}
      visible={visible}
    />
  </Fragment>
}

export default App;
