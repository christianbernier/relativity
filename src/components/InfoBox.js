import React from "react"
import { css } from "@emotion/core";

export default ({ header, body }) => {
    return (
        <div
            css={css`
                width: calc(100% - 40px);
                height: fit-content;
                border-radius: 10px;
                background-color: #eee;
                padding: 20px;
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
                margin-bottom: 20px;
            `}
        >
            <p className="header">{header}</p>
            {body}
        </div>
    )
}