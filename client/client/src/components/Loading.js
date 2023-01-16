import React from "react";
import loading from './loading.gif';

function Loading () {
    return (
        <div>
                <img src={loading} alt= 'loading'
                    style={{display: 'block', marginLeft: 'auto',
                marginRight: 'auto'
            }} />
        </div>
    )
}
export default Loading;