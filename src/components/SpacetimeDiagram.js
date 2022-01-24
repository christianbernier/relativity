import React from "react"

import { Stage, Layer, Rect, Line, Circle, Text } from "react-konva"

const SpacetimeDiagram = ({ width, height, velocity, worldlines, points, classical }) => {

    const NUM_TIME_LINES = 8;
    const H_PADDING = 10;

    // Special relativity transformation matrix
    const TIME_LINE_SPACING = height / (NUM_TIME_LINES + 1);
    const GAMMA = 1 / Math.sqrt(1 - velocity * velocity);
    const TRANSFORMATION_MATRIX = [GAMMA, -GAMMA * velocity, -GAMMA * velocity, GAMMA];

    // multiplies a 2x2 matrix by a 1x2 matrix inputted as such:
    // transformation = [ a, b, c, d ], representing:
    // [ a  b ]
    // [ c  d ]
    // input = [ x, y ], representing:
    // [ x ]
    // [ y ]
    const multiplyMatrices = (transformation, input) => [
        transformation[0] * input[0] + transformation[1] * input[1],
        transformation[2] * input[0] + transformation[3] * input[1],
    ]

    // Translates a point using the transformation matrix
    const translatePoint = (x, y) => {
        const pointOffsetX = width / 2;
        const pointOffsetY = height - TIME_LINE_SPACING;

        if(classical) {
            return [x + (y - pointOffsetY) * -velocity, y]
        }

        const rotatedPoint = multiplyMatrices(TRANSFORMATION_MATRIX, [x - pointOffsetX, y - pointOffsetY]);
        return [rotatedPoint[0] + pointOffsetX, rotatedPoint[1] + pointOffsetY];
    }

    // Generates the time line for a given index (starting from index 0 on the bottom)
    const generateTimeLine = (i, isStatic) => {
        const x1 = H_PADDING;
        const y1 = height - TIME_LINE_SPACING * (i + 1);
        const x2 = width - H_PADDING;
        const y2 = height - TIME_LINE_SPACING * (i + 1);

        if (isStatic) {
            return <Line
                key={`spacetime-time-static-line-${i}`}
                points={[x1, y1, x2, y2]}
                stroke="black"
            />
        }

        const point1 = translatePoint(x1, y1);
        const point2 = translatePoint(x2, y2);

        return <Line
            key={`spacetime-time-line-${i}`}
            points={[point1[0], point1[1], point2[0], point2[1]]}
            stroke="#ddd"
        />
    }

    // Generates the displacement line for a given index
    const generateDisplacementLine = (i, isStatic) => {
        const x1 = width / 2 + TIME_LINE_SPACING * i;
        const y1 = height - TIME_LINE_SPACING;
        const x2 = width / 2 + TIME_LINE_SPACING * i;
        const y2 = TIME_LINE_SPACING;

        if (isStatic) {
            return <Line
                key={`spacetime-displacement-static-line-${i}`}
                points={[x1, y1, x2, y2]}
                stroke="black"
            />
        }

        const point1 = translatePoint(x1, y1);
        const point2 = translatePoint(x2, y2);

        return <Line
            key={`spacetime-time-line-${i}`}
            points={[point1[0], point1[1], point2[0], point2[1]]}
            stroke="#ddd"
        />
    }

    // Generates the "t = _ s" labels
    const generateTimeLabel = i => <Text
        key={`time-label-${i}`}
        text={`t = ${i} s`}
        fill="black"
        x={H_PADDING}
        y={height - TIME_LINE_SPACING * (i + 1) + 2}
    />

    // draws a line at a particular velocity, within a time range
    const drawLineAtVelocity = (v, fromTime, toTime, displaceX, color) => {
        const deltaTime = toTime - fromTime;
        const deltaY1 = TIME_LINE_SPACING * fromTime;
        const x1 = width / 2 + deltaY1 * v + displaceX * TIME_LINE_SPACING;
        const y1 = height - TIME_LINE_SPACING - deltaY1;
        const x2 = x1 + deltaTime * TIME_LINE_SPACING * v;
        const y2 = y1 - deltaTime * TIME_LINE_SPACING;

        const point1 = translatePoint(x1, y1);
        const point2 = translatePoint(x2, y2);

        return <Line
            key={`line-v-${v}`}
            points={[point1[0], point1[1], point2[0], point2[1]]}
            stroke={color}
        />
    }

    // Draws a point at a particular t and x point
    const drawPointAt = (t, x, color) => {
        const initialX = width / 2 + x * TIME_LINE_SPACING;
        const initialY = height - TIME_LINE_SPACING * (t + 1);

        const point = translatePoint(initialX, initialY)

        return <Circle
            key={`point-at-${t}-${x}`}
            fill={color}
            x={point[0]}
            y={point[1]}
            radius={5}
        />;
    }

    return (
        <Stage
            width={width}
            height={height}
        >
            <Layer>
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill="#eee"
                />

                {/* {[...Array(NUM_TIME_LINES).keys()].map(i => generateTimeLine(i, false))} */}
                {[...Array(NUM_TIME_LINES).keys()].map(i => generateTimeLine(i, true))}
                {[...Array(NUM_TIME_LINES * 1.5).keys()].map(i => generateDisplacementLine(i - (NUM_TIME_LINES / 2).toFixed(0) - 1, true))}
                {[...Array(NUM_TIME_LINES).keys()].map(i => generateTimeLabel(i))}

                {/* speed of light lines */}
                {drawLineAtVelocity(1, 0, 999, 0, "orange")}
                {drawLineAtVelocity(-1, 0, 999, 0, "orange")}

                {worldlines.map(wl => drawLineAtVelocity(wl.v, wl.fromTime, wl.toTime, wl.displaceX, wl.color))}
                {points.map(p => drawPointAt(p.t, p.x, p.color))}
            </Layer>
        </Stage>
    )
}

export default SpacetimeDiagram;