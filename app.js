const rx = require('rx')
const rxNode = require('rx-node')
const math = require('mathjs')
const _ = require('underscore')

const FIELD_SIZE = 10

const ctx = require('axel');

let getInitialState = () => {
  return {
    size: FIELD_SIZE,
    people: [
      { x: 0, y: 0 },
      { x: 9, y: 9 },
      { x: 5, y: 5 }
    ]
  }
}

var drawArena = (size) => {
  size = size + 2
  ctx.bg(0,255,0);
  ctx.line(1, 1, size, 1);
  ctx.line(size, 1, size, size);
  ctx.line(size, size, 1, size);
  ctx.line(1, size, 1, 1);
}

let drawPeople = (people) => {
  ctx.bg(255,0,0);
  _(people).forEach(
      ({x, y}) => ctx.point(x + 2, y + 2)
  )
}
var drawWorld = ({size, people}) => {
  ctx.clear();
  drawArena(size)
  drawPeople(people)
  ctx.bg(0, 0, 0)
  ctx.point(20, 20)
}


let getMove = (index)=> {
  let [xOffset, yOffset] = [[0,1], [1,0]][math.pickRandom([0, 1])]
  let direction = math.pickRandom([-1, 1])
  return (state) => {
    let {people} = state
    let p = people[index]
    people[index] = {
      x: math.max(
          0,
          math.min(p.x + xOffset * direction, FIELD_SIZE-1)),
      y: math.max(
          0,
          math.min(p.y + yOffset * direction, FIELD_SIZE-1))
    }
    return _.extend({}, state, {people})
  }
}

var POOL = []

var produceEvents = (state) => {
  _.range(state.people.length).forEach((i) => {
    POOL.push(getMove(i))
  })
}

var stateObservable = rx.Observable
  .interval(100)
  .timeInterval()
  .map(()=> {
    var x = POOL.slice()
    POOL.splice(0, POOL.length)
    return x
  })
  .scan(
      (state, ops) => ops.reduce(
        (st, o) => o(st),
        state
      ),
      getInitialState()
  )

stateObservable.subscribe(drawWorld)
stateObservable.tap(produceEvents).subscribe()
