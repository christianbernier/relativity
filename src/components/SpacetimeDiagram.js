import React from "react"
import { Stage, Layer, Rect, Line, Circle, Text } from "react-konva"

// Draws a spacetime diagram with any number of worldlines and points, at any velocity
// width        int             width of the canvas, in pixels
// height       int             height of the canvas, in pixels
// velocity     float           velocity of the current perspective (with respect to the red observer) in the range [-1, 1]
// worldlines   [Worldline]     all the worldlines to be drawn onto the spacetime diagram
// points       [Point]         all the points to be drawn onto the spacetime diagram, relative to the red observer
// classical    boolean         whether the type of relativity is classical (false = special relativity)
const SpacetimeDiagram = ({ width, height, velocity, worldlines, points, classical }) => {

    // Spacing constants, useful in converting plot points (t, x) to graphics points (x, y)
    const NUM_TIME_LINES = 8;
    const H_PADDING = 10;
    const GRAPH_SPACING = height / (NUM_TIME_LINES + 1);

    // Generates the time line for a given index (starting from index 0 on the bottom)
    // i            int         index of the time line to be drawn
    // isStatic     boolean     whether the time line is one of the static time lines (false = moves when velocity changes)
    const generateTimeLine = (i, isStatic) => {
        let point1, point2;

        if (isStatic) {
            // If the line is static, draw the time line at set coordinates
            point1 = {
                x: H_PADDING,
                t: height - GRAPH_SPACING * (i + 1)
            };

            point2 = {
                x: width - H_PADDING,
                t: height - GRAPH_SPACING * (i + 1)
            }
        } else {
            // If the line is not static, adjust the coordinates for the velocity
            point1 = getPointCoordinates(i, 1 - NUM_TIME_LINES * 0.75);
            point2 = getPointCoordinates(i, NUM_TIME_LINES * 0.75);
        }

        return <Line
            key={`spacetime-time-${(isStatic) ? "static" : "dynamic"}-line-${i}`}
            points={[point1.x, point1.t, point2.x, point2.t]}
            stroke={(isStatic) ? "#777" : "#dd000030"}
        />
    }

    // Generates the displacement line for a given index
    // i            int         index of the displacement line to be drawn
    // isStatic     boolean     whether the displacement line is one of the static time lines (false = moves when velocity changes)
    const generateDisplacementLine = (i, isStatic) => {
        let point1, point2;

        if (isStatic) {
            // If the line is static, draw the displacement line at set coordinates
            point1 = {
                x: width / 2 + GRAPH_SPACING * i,
                t: height - GRAPH_SPACING
            };

            point2 = {
                x: width / 2 + GRAPH_SPACING * i,
                t: GRAPH_SPACING
            }
        } else {
            // If the line is not static, adjust the coordinates for the velocity
            point1 = getPointCoordinates(0, i);
            point2 = getPointCoordinates(NUM_TIME_LINES - 1, i);
        }

        return <Line
            key={`spacetime-displacement-${(isStatic) ? "static" : "dynamic"}-line-${i}`}
            points={[point1.x, point1.t, point2.x, point2.t]}
            stroke={(isStatic) ? "#777" : "#dd000030"}
        />
    }

    // Generates time label "t = _ s" for a given index
    // i    int     the index of the time label to be drawn
    const generateTimeLabel = i => <Text
        key={`time-label-${i}`}
        text={`t = ${i} s`}
        fill="black"
        x={H_PADDING}
        y={height - GRAPH_SPACING * (i + 1) + 2}
    />

    // Adjusts given (t, x) coordinates for the velocity of the spacetime diagram
    // t            float       the t coordinate for the graph point
    // x            float       the x coordinate for the graph point
    // displaceX    float       (optional) how much the line should be shifted in the x direction
    const getPointCoordinates = (t, x, displaceX) => {
        // If displaceX is not provided, use 0
        if(!displaceX) displaceX = 0;
        x = x + displaceX;
        
        // For classical transformations, use the following equations:
        // x' = x + vt
        // t' = t
        if(classical) return {
            x: width / 2 + (x + velocity * t) * GRAPH_SPACING, 
            t: height - GRAPH_SPACING * (t + 1)
        };

        // For relative velocities, use the following equations:
        // x' = (x - vt) / sqrt(1 - v^2)
        // t' = (t - vx) / sqrt(1 - v^2)
        const relativeV = -velocity;
        const relativeX = (x - relativeV * t) / (Math.sqrt(1 - relativeV * relativeV));
        const relativeT = (t - relativeV * x) / (Math.sqrt(1 - relativeV * relativeV));

        const plotX = width / 2 + relativeX * GRAPH_SPACING;
        const plotT = height - GRAPH_SPACING * (relativeT + 1);
        return {x: plotX, t: plotT};
    }

    // Draws a line on the spacetime diagram at a particular velocity
    // v            float       velocity of the line to be drawn
    // fromTime     float       the first time coordinate the line should be drawn
    // toTime       float       the last time coordinate the line should be drawn
    // displaceX    float       how much the line should be shifted in the x direction
    // color        string      what color the line should be drawn (as hex or color name)
    const drawLineAtVelocity = (v, fromTime, toTime, displaceX, color) => {
        // Calculates the graphical coordinates for both ends of the line to be drawn
        const point1 = getPointCoordinates(fromTime, fromTime * v, displaceX);
        const point2 = getPointCoordinates(toTime, toTime * v, displaceX);

        return <Line
            key={`line-v-${v}`}
            points={[point1.x, point1.t, point2.x, point2.t]}
            stroke={color}
        />
    }

    // Draws a point at a particular (t, x) point on the graph
    // t        float       the t coordinate of the point to be drawn
    // x        float       the x coordinate of the point to be drawn
    // color    string      what color the point should be drawn (as hex or color name)
    const drawPointAt = (t, x, color) => {
        const point = getPointCoordinates(t, x);

        return <Circle
            key={`point-at-${t}-${x}`}
            fill={color}
            x={point.x}
            y={point.t}
            radius={5}
        />;
    }

    return (
        <Stage width={width} height={height}>
            <Layer>
                {/* Background */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="#eee"
                />

                {/* Time and displacement lines */}
                {[...Array(NUM_TIME_LINES * 1.5).keys()].map(i => generateDisplacementLine(i - (NUM_TIME_LINES / 2).toFixed(0) - 1, false))}
                {[...Array(NUM_TIME_LINES).keys()].map(i => generateTimeLine(i, false))}
                {[...Array(NUM_TIME_LINES * 1.5).keys()].map(i => generateDisplacementLine(i - (NUM_TIME_LINES / 2).toFixed(0) - 1, true))}
                {[...Array(NUM_TIME_LINES).keys()].map(i => generateTimeLine(i, true))}
                {[...Array(NUM_TIME_LINES).keys()].map(i => generateTimeLabel(i))}

                {/* Speed of light lines */}
                {drawLineAtVelocity(1, 0, 999, 0, "orange")}
                {drawLineAtVelocity(-1, 0, 999, 0, "orange")}

                {/* Other graph features */}
                {worldlines.map(wl => drawLineAtVelocity(wl.v, wl.fromTime, wl.toTime, wl.displaceX, wl.color))}
                {points.map(p => drawPointAt(p.t, p.x, p.color))}
            </Layer>
        </Stage>
    )
}

export default SpacetimeDiagram;