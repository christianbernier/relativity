import React from "react";
import { css, Global } from "@emotion/core";
import { Helmet } from "react-helmet-async";

import Favicon from "../../favicon.png";
import ShareImage from "../../shareimage.png";

export default () => {
  return (
    <>
      <Helmet>
        <title>Lissajous Curves</title>
        <link rel="shortcut icon" href={Favicon} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Lissajous Curves" />
        <meta property="og:title" content="Lissajous Curves" />
        <meta
          property="og:description"
          content="See a visualization of how Lissajous curves are formed!"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="og:image" content={ShareImage}/>
        <meta
          property="description"
          content="See a visualization of how Lissajous curves are formed!"
        />
      </Helmet>
      <Global
        styles={css`
          @import url("https://rsms.me/inter/inter.css");

          :root {
            --dark-background: #2d3748;
            --font-white: #f7fafc;
            font-family: "Inter", Arial, Helvetica, sans-serif;
          }

          body {
            padding: 0;
            margin: 0;
            background-color: rgb(43, 43, 43);
          }

          p {
            color: var(--font-white);
          }

          a {
            color: var(--font-white);
          }
        `}
      />
    </>
  );
};
