function seed() {
    return Array.from(arguments);
}

function same([x, y], [j, k]) { return x===j && y===k; }

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) 
   { return this.some(function(x) { return same(x, cell); }); }
// { return this.includes(function(x) { return same(x, cell); }); }

const sum = ([x, y], [j, k]) => [x+j,y+k];

/*
const getNeighborsOf = ([x, y]) => [
        [x-1, y+1], [x, y+1], [x+1, y+1],
        [x-1, y  ]          , [x+1, y  ],
        [x-1, y-1], [x, y-1], [x+1, y-1]
    ];
*/

// should pass, but doesn't, currently need a "1-liner"
const getNeighborsOf = ([x, y]) => {

    return [
        [x-1, y+1], [x, y+1], [x+1, y+1],
        [x-1, y  ]          , [x+1, y  ],
        [x-1, y-1], [x, y-1], [x+1, y-1]
    ];
};

const getLivingNeighbors = (cell, state) => {
   //console.log(cell);
   //console.log('neighbors: ' + JSON.stringify(getNeighborsOf(cell)));
   //console.log(state);
   //console.log(printCells(state));

   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
   // const y = getNeighborsOf(cell).filter(x => contains.bind(state, x));

   const lns = getNeighborsOf(cell).filter(x => contains.bind(state)(x));

   // console.log(lns);
   return lns;
};

const willBeAlive = (cell, state) => {
    const x = getLivingNeighbors(cell, state);
    return x.length === 3 || contains.call(state, cell) && x.length === 2;
};

const corners = (state = []) => {
    if (state.length === 0) return {topRight: [0,0], bottomLeft: [0,0]};
    const firsts = [];
    const seconds = [];
    state.forEach ( ([a,b] ) => { /*console.log(a + ' ' + b);*/ firsts.push(a); seconds.push(b); });
    const x = {
        topRight: [Math.max(...firsts), Math.max(...seconds)],
        bottomLeft: [Math.min(...firsts), Math.min(...seconds)]
    };
    // console.log(x);
    return x;
    /*
    return {
        topRight: [Math.min(...firsts), Math.max(...seconds)],
        bottomLeft: [Math.max(...firsts), Math.min(...seconds)]
    };
    */

};

const calculateNext = state => {
    let [rowend,colstart,rowstart,colend] = getCornerCells(state);
    [colend, rowend,colstart,rowstart] = 
        [colend+1, rowend+1,                // new tr
         colstart-1, rowstart-1];           // new bl 

    /*
    console.log(state);
    console.log(JSON.stringify(corners(state)));
    console.log([rowend,colstart,rowstart,colend]);
    */

    let newstate = [];
    for (let row = rowend; row >= rowstart; row--) {
        for (let col = colstart; col <= colend; col++) {
           if (willBeAlive([col,row], state)) {
            newstate.push([col,row]);
           }
        }
    }
    return newstate;

};

// FIX: 2 commented lines below
//const iterate = (state, iterations) => {
    //const states = [state];
const iterate = (states, iterations) => {
    for(let i = 0; i < iterations; i++) {
        states.push(calculateNext(states[states.length-1]));
    }
    return states;
};

const printCell = (cell, state) => {

    return contains.call(state, cell) ?
        '\u25A3' :
        '\u25A2';

};

// my private function
// given a par. of state, return an array of
// [rowend,colstart,rowstart,colend]
// based on the object returned by corners(state)
// (maybe less coupled if I have user pass in a call istead??
// given topRight and bottomLeft, uncertain how to easily avoid
// any smells anyway. meh)
const getCornerCells = state => {
    let colend, colstart, rowend, rowstart;
    //({[rowend,colstart],[rowstart,colend]} = corners(state));
    const {topRight, bottomLeft} = corners(state);
    ([colend,rowend] = topRight);
    ([colstart,rowstart] = bottomLeft);
    return [rowend,colstart,rowstart,colend];
}

const printCells = state => {

    const [rowend,colstart,rowstart,colend] = getCornerCells(state);

    let string = '';

    for (let row = rowend; row >= rowstart; row--) {
        for (let col = colstart; col <= colend; col++) {
           //string += printCell([col, row], state) + ' '; 
           string += printCell([col, row], state) + ' '; 
        }
        //string += '\n';
        //string[string.length-1] = '\n';
        string = string.slice(0,-1) + '\n';
    }
    /*
    console.log(state);
    console.log(corners(state));
    console.log('_' + string + '_');
    */
    return string;
};

//const oldconsole = console.log;
const main = (pattern, iterations) => {
    //oldconsole(startPatterns[pattern]);
    //oldconsole(startPatterns['rpentomino']);
    // FIX: iterate(startPatterns[pattern], iterations)
    iterate([startPatterns[pattern]], iterations)
        .forEach(x  => console.log(printCells(x)));

};


const startPatterns = {
  rpentomino: [
    [3, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4]
  ],
  glider: [
    [-2, -2],
    [-1, -2],
    [-2, -1],
    [-1, -1],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [2, 3]
  ],
  square: [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2]
  ]
};

const [pattern, iterations] = process.argv.slice(2);
const runAsScript = require.main === module;

if (runAsScript) {
  if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
    main(pattern, parseInt(iterations));
  } else {
    console.log("Usage: node js/gameoflife.js rpentomino 50");
  }
}

exports.seed = seed;
exports.same = same;
exports.contains = contains;
exports.sum = sum;
exports.getNeighborsOf = getNeighborsOf;
exports.getLivingNeighbors = getLivingNeighbors;
exports.willBeAlive = willBeAlive;
exports.corners = corners;
exports.calculateNext = calculateNext;
exports.printCell = printCell;
exports.printCells = printCells;
exports.startPatterns = startPatterns;
exports.iterate = iterate;
exports.main = main;
