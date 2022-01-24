import React, { useState, useEffect } from "react"
import { css } from "@emotion/core";

import GlobalCSS from "../components/GlobalCSS";
import SpacetimeDiagram from "../components/SpacetimeDiagram";
import InfoBox from "../components/InfoBox";

import TwinParadox from "../../examples/twin-paradox.json";
import Motorcycle from "../../examples/motorcycle.json";
import Simultaneity from "../../examples/simultaneity.json";
import DefaultExample from "../../examples/default.json";

let WIDTH = 800;
let HEIGHT = 500;

if (typeof window !== "undefined" && typeof document !== "undefined") {
  WIDTH = window.innerWidth / 2.5;
  HEIGHT = WIDTH * 0.7;
}

const Index = () => {
  // State variables
  const [velocity, setVelocity] = useState(0);
  const [classical, setClassical] = useState(false);
  const [worldlines, setWorldlines] = useState([]);
  const [points, setPoints] = useState([]);

  // When the page is loaded, set the spacetime diagram to the default example
  useEffect(() => {
    loadExample(DefaultExample);
  }, []);

  // Gets the relative velocity for an observer
  // v    float   relative velocity of the observer
  const getRelativeVelocity = v => (classical) ? (v - velocity) : (- (-v + velocity) / (1 + -v * velocity));

  // Updates the velocity slider and velocity state variable
  // v    float   velocity to update the slider and variable to
  const updateWorldVelocity = v => {
    setVelocity(v);
    document.getElementById("velocity").value = v;
  }

  // Loads a set of worldlines and points from a JSON file
  // example    JSON    data including the worldlines and points
  const loadExample = example => {
    setWorldlines(example.worldlines);
    setPoints(example.points);
    updateWorldVelocity(0);
  }

  return (
    <>
      <GlobalCSS />
      <div
        css={css`
          display: flex;
          flex-direction: column;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: center;
          `}
        >
          <p
            css={css`
              font-weight: 700;
              font-size: 2rem;
            `}
          >
            The Special Theory of Relativity
          </p>
        </div>
        <div
          css={css`
                display: flex;
                flex-direction: row;
                justify-content: space-around;
            `}
        >
          <div
            css={css`
                    max-width: 22vw;
                `}
          >
            <InfoBox
              header="What is special relativity?"
              body={
                <>
                  <p>The special theory of relativity is a theory about how space and time relate to one another, based on the following two postulates:</p>
                  <ol>
                    <li>The laws of physics are identical in all inertial frames of reference.</li>
                    <li>The speed of light in a vacuum is measured to be the same (c = 299,792,458 m/s) for all observers.</li>
                  </ol>
                </>
              }
            />
            <InfoBox
              header="What is the Lorentz transformation?"
              body={
                <p>The Lorentz transformation is a linear transformation that relates spacetime (x, y, z, t) for two observers moving relative to one another that is consistent with the special theory of relativity. This interactive site shows a version of the Lorentz transformation for a spacetime with one space dimension (x) and one time dimension (t).</p>
              }
            />
            <InfoBox
              header="What's wrong with classical relativity?"
              body={
                <>
                  <p>In classical physics, relativity relates two observers moving relative to one another by simply adding their velocities. This approach, called classical relativity, works well enough for low velocities but encounters issues for velocities approaching the speed of light.</p>
                  <p>For example, an observer moving at 80% the speed of light with respect to another observer could throw a ball at 70% the speed of light with respect to themself. The stationary observer, according to classical relativity, would see the ball move at 150% the speed of light, which is not possible. Special relativity accounts for this properly, predicting the observer would see the ball moving at 96% the speed of light (try the "Motorcycle" example to see the spacetime diagram).</p>
                </>
              }
            />
            <InfoBox
              header="About this site"
              body={
                <>
                  <p>This site was created for fun in January 2022 by Christian Bernier. Please feel free to <a href="https://github.com/christianbernier/relativity">view the source code</a>, or <a href="https://cbernier.com">learn more about me</a>.</p>
                </>
              }
            />
          </div>
          <div
            css={css`
            width: 40vw;
          `}
          >
            <div
              css={css`
                  width: 40vw;
                  padding: 20px;
                  background-color: #eee;
                  overflow-x: hidden;
                  border-radius: 10px;
                  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                  margin-bottom: 20px;
                `}
            >
              <p className="header">Spacetime Diagram</p>
              <SpacetimeDiagram width={WIDTH} height={HEIGHT} velocity={-velocity} worldlines={worldlines} points={points} classical={classical} />
              <p className="subheader">Key:</p>
              <div
                css={css`
                  display: flex;
                  flex-direction: row;

                  p {
                    margin-right: 40px;
                  }
                `}
              >
                <p>Horizonal axis: Displacement</p>
                <p>Vertical axis: Time</p>
              </div>
              <div
                css={css`
                  display: flex;
                  flex-direction: row;

                  p {
                    margin-right: 40px;
                  }
                `}
              >
                <p>Gray Grid: your spacetime</p>
                <p css={css`color: #dd0000;`}>Red grid: Red Observer's spacetime</p>
              </div>
              <div
                css={css`
                  display: flex;
                  flex-direction: row;

                  p {
                    margin-right: 40px;
                  }
                `}
              >
                <p css={css`color: orange;`}>Orange lines: Speed of Light (c)</p>
                <p>Δx = 299,792,458 m</p>
                <p>Δt = 1 s</p>
              </div>
            </div>
            <InfoBox
              header="What is a spacetime diagram?"
              body={
                <>
                  <p>A spacetime diagram relates a particle's position versus time. Time is typically represented on the vertical axis, and position is typically represented on the horizontal axis.</p>
                  <p>By using segments of 1 second on the vertical axis and segments of exactly 299,792,458 meters on the horizontal axis, the speed of light will make a 45 degree angle with the axes.</p>
                  <p>The different lines you see above are called worldlines, and they each represent a different particle's movement. Straight lines represent particles with constant velocity, with the velocity being proportional to the tangent of the angle the worldline makes with the vertical axis.</p>
                  <p>Two worldlines on the spacetime diagram, the two orange ones above, never move under special relativity. They represent particles traveling at the speed of light (in accordance with the second postulate of special relativity).</p>
                </>
              }
            />
          </div>

          <div
            css={css`
            width: 22vw;
          `}
          >
            <InfoBox
              header="Parameters"
              body={
                <>
                  <p className="bold">Velocity relative to the Red Observer</p>
                  <p>{velocity.toFixed(4)} c ≈ {(velocity * 299792.458).toFixed(0)} km/s</p>
                  <input
                    type="range"
                    id="velocity"
                    min={-1}
                    max={1}
                    step={0.00001}
                    defaultValue={0}
                    onChange={e => setVelocity(e.target.valueAsNumber)}
                    css={css`
                      width: 80%;
                    `} />

                  <p className="bold spaceabove">Type of relativity</p>
                  <input type="radio" id="special" name="relativity" value="special" defaultChecked onClick={() => setClassical(false)} />
                  <label htmlFor="special">Special Relativity</label>
                  <br />
                  <input type="radio" id="classical" name="relativity" value="classical" onClick={() => setClassical(true)} />
                  <label htmlFor="classical">Classical Relativity</label>

                  <p className="bold spaceabove">Examples</p>
                  <button onClick={() => loadExample(DefaultExample)}>Default</button>
                  <button onClick={() => loadExample(Motorcycle)}>Motorcycle</button>
                  <button onClick={() => loadExample(Simultaneity)}>Simultaneity</button>
                  <button onClick={() => loadExample(TwinParadox)}>Twin Paradox</button>

                  <div
                    css={css`
                        p {
                          margin: 0;
                        }

                        margin: 30px 0;
                      `}
                  >
                    <p className="bold">You</p>
                    <p>Apparent velocity: 0.0000 c</p>
                  </div>
                  {worldlines.map(wl => <span key={`wl-${wl.name}`}>
                    <div
                      css={css`
                        p {
                          margin: 0;
                        }

                        margin-bottom: 30px;
                      `}
                    >
                      <p className="bold">{wl.name}</p>
                      <p>Apparent velocity: {getRelativeVelocity(wl.v).toFixed(4)} c</p>
                      <button onClick={() => updateWorldVelocity(wl.v)}>See perspective</button>
                    </div>
                  </span>)}
                </>
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Index;