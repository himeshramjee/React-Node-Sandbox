import React from 'react';
import axios from 'axios';

export default () => {
    const onClickClearDataset = async (event) => {
        event.preventDefault();

        await axios.post('http://localhost:4004/admin/reset-data')
        .then(response => {
            if (response.status === 200) {
                alert("Dataset cleared.");
            } else {
                alert("Dataset not cleared: " + response.statusText);
            }
        })
        .catch(error => {
            console.log("Failed to reset all data. Error: " + error);
        });
    };

    const onClickRebuildCache = async (event) => {
        event.preventDefault();

        await axios.post('http://localhost:4004/admin/rebuild-cache')
        .then(response => {
            console.log(response);
            console.log(response.status);
            if (response.status === 200) {
                alert("Cache rebuilt.");
            } else {
                alert("Cache rebuild failed: " + response.statusText);
            }
        })
        .catch(error => {
            console.log("Failed to rebuild cache. Error: " + error);
        });
    };

    return (
        <div id="adminActionsList">
            <div>
                <button id="btnClearAllData" href="#" className="btn btn-primary" style={{ margin: 20 }} onClick={onClickClearDataset}>Clear data</button>
                <button id="btnRebuildCache" href="#" className="btn btn-primary" onClick={onClickRebuildCache}>Rebuild query cache</button>
            </div>

            <div>
                
            </div>
        </div>
    );
};