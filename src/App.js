import React, { Component, Fragment /*, useRef */ } from 'react';
import './App.css';

const eventsOberverConfig = {
  root: null, // avoiding 'root' or setting it to 'null' sets it to default value: viewport
  rootMargin: '0px 0px -50% 0px',
  // threshold: 0.5
};
const eventsObserver = new window.IntersectionObserver(entries => {
  // console.log(entries)
  if (entries.length === 1 && entries[0].isIntersecting === true) {
    Object.keys(eventRefs).forEach(k => {
      const el = eventRefs[k]
      el.classList.toggle('selected', false)
    })
    const el = entries[0].target
    // const intersecting = entries[0].isIntersecting
    el.classList.toggle('selected', true)
  }
}, eventsOberverConfig);
const eventRefs = {}

const detailsObserverConfig = {
  threshold: Array.from(Array(100).keys()).map(i => i/100)
}
console.log(detailsObserverConfig)
const detailsObserver = new window.IntersectionObserver(entries => {
  console.log(entries[0].intersectionRatio  )
}, detailsObserverConfig)
let detailsRef;


class App extends Component {
  componentDidMount() {
    console.log('mount')
    console.log(eventRefs)
    Object.keys(eventRefs).forEach(k => {
      const el = eventRefs[k]
      eventsObserver.observe(el)
    })
    detailsObserver.observe(detailsRef)
  }

  render() {
// function App() {
//   // const refContainer = useRef(null);

  const events = Array.from(Array(50).keys())

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
          vessel profile
          <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        </div>
        <div className="timeline">
          tmln
          <div className="now"></div>
        </div>
        <div className="detail" ref={(ref) => { detailsRef = ref }}>
          {events.map((event, i) => (
            <div ref={(ref) => { eventRefs[i] = ref }} className="event" key={i}>Event</div>
          ))}
        </div>
      </div>
    </Fragment>
  );
  }
}

export default App;
