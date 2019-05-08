import React, { Component, Fragment, useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
import { scaleTime } from 'd3-scale'
import { debounce } from 'lodash'
import cx from 'classnames'
import './App.css';

const START = dayjs(new Date(2017, 0, 1))
const END = dayjs(new Date(2017, 11, 31))
const COLUMN_WIDTH = 10

let isRAFTicking = false 

const Timeline = ({ events, rfmos }) => {
 
  // prepare coordinates (only be events prop changes, so that should mean only at mount)
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

  // Compute derived data when a new event is highlighted
  const computeScrollCoords = (timelineCoords, selected) => {
    const currentEvent = timelineCoords.events.find(e => e.id === selected)
    const y = (currentEvent) ? currentEvent.middleCoord : 0
    const currentRfmo = (currentEvent === undefined) ? null : timelineCoords.rfmos.find(rfmo => {
      if (currentEvent.middleNormalized > rfmo.startNormalized && currentEvent.middleNormalized < rfmo.endNormalized) {
        return true
      }
      return false
    })
    const currentRfmoId = (currentRfmo) ? currentRfmo.id : null
    return {
      y,
      currentRfmoId,
      currentEvent
    }
  }

  // this stores DOM elements for events
  let eventRefs = useRef(new Map()).current;

  // store currently highlighted/selected event in state
  const [selected, setSelected] = useState(null)

  // selects an event depending on scroll position
  const checkScroll = () => {
    isRAFTicking = false
    const cH = document.documentElement.clientHeight;
    const wH = window.innerHeight || 0;
    const middle = 60 + Math.max(cH, wH) / 2;
    let minDelta = Number.POSITIVE_INFINITY
    let selectedEvent;
    eventRefs.forEach((el, key) => {
      el.classList.toggle('selected', false)
      const { top } = el.getBoundingClientRect()

      const delta = Math.abs(middle - top)
      if (delta < minDelta) {
        selectedEvent = key
        minDelta = delta
      }
    })
    setSelected(selectedEvent)
  }

  const onScroll = () => {
    if (isRAFTicking === false) {
      isRAFTicking = true
      // avoid scroll jank by throttling to frame
      window.requestAnimationFrame(checkScroll);
    }
  }

  useEffect(() => {
    console.log('useEffect:adding scroll listener on mount')
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
    }
  }, [])
  


  const timelineCoords = useMemo(() => computeCoordinates(events, rfmos), [events, rfmos])
  const scrollCoords = useMemo(() => computeScrollCoords(timelineCoords, selected), [timelineCoords, selected])
  

  const [encounteredVessel, setEncounteredVessel] = useState(null)
  const loadEncounteredVessel = (currentEvent) => {
    console.log(currentEvent.encounteredVessel)
    // simulate fetch - should also cancel pending, if it exists
    setTimeout(() => setEncounteredVessel(currentEvent.encounteredVessel), 200)
  }
  const debouncedLoadEncounteredVessel = useRef(debounce(loadEncounteredVessel, 1000))
  useEffect(() => {
    console.log('useEffect:selected event changed - load encountered vessel on debounce')
    setEncounteredVessel(null)
    debouncedLoadEncounteredVessel.current.cancel()
    console.log(scrollCoords.currentEvent)
    if (selected !== null && scrollCoords.currentEvent.encounteredVessel !== null) {
      debouncedLoadEncounteredVessel.current(scrollCoords.currentEvent)
    }
  }, [selected, scrollCoords])

  console.log(encounteredVessel)



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
            return (
            <div
              // ref={someRef}
              ref={inst => inst === null ? eventRefs.delete(event.id) : eventRefs.set(event.id, inst)}
              className={cx('event', { highlighted: event.id === selected } )} key={event.id}
            >
              Event {event.id}<br />
              {event.encounteredVessel !== null && <div>I'm an encounter!</div>}
              {event.start.format('DD/MM/YYYY HH:mm')}<br />
              {event.end.format('DD/MM/YYYY HH:mm')}<br />
              {event.id === selected && encounteredVessel !== null && (
                <div className="encounteredVessel">
                  {encounteredVessel}
                </div>
              )}
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

  allData.event = allData.event.map(event => ({
    ...event,
    encounteredVessel: (Math.random() > .5) ? null : `other:${event.id}`
  }))

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
