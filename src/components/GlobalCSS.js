import React from "react";
import { css, Global } from "@emotion/core";
import { Helmet } from "react-helmet-async";

import Favicon from "../../favicon.png";
import ShareImage from "../../shareimage.png";

export default () => {
  return (
    <>
      <Helmet>
        <title>Special Relativity</title>
        <link rel="shortcut icon" href={Favicon} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Special Relativity" />
        <meta property="og:title" content="Special Relativity" />
        <meta
          property="og:description"
          content="Learn all about special relativity with an interactive spacetime diagram!"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="og:image" content={ShareImage} />
        <meta
          property="description"
          content="Learn all about special relativity with an interactive spacetime diagram!"
        />
      </Helmet>
      <Global
        styles={css`
          @import url("https://rsms.me/inter/inter.css");

          :root {
            --font: #222;
            font-family: "Inter", Arial, Helvetica, sans-serif;
          }

          body {
            padding: 0;
            margin: 0;
            background-color: #e2e1e0;
          }

          p, li, ol {
            color: var(--font);
            line-height: 140%;
          }

          .header {
            font-weight: 700;
            font-size: 1.6rem;
          }

          .subheader {
            font-weight: 600;
            font-size: 1.3rem;
          }

          .bold {
            font-weight: 700;
          }

          .spaceabove {
            margin-top: 30px;
          }

          input[type=radio] {
            margin-bottom: 10px;
          }

          a {
            color: var(--font);
          }

          button {
            padding: 0.75rem 1rem;
            margin: 5px;

            border-width: 0;
            outline: none;
            border-radius: 3px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.19), 0 4px 4px rgba(0,0,0,0.23);
            
            cursor: pointer;
            background-color: #007bff;
            color: #fff;
            
            transition: all 0.15s cubic-bezier(0.53, 0.01, 0.46, 1);
          }

          button:hover {
            background-color: #0b6cd4;
            box-shadow: 0 3px 6px rgba(0,0,0,0.19), 0 3px 3px rgba(0,0,0,0.23);
          }
        `}
      />
    </>
  );
};
